/**
 * Admin Reservation Service
 * Handles admin-specific reservation actions with proper email management
 */

import type { Reservation } from "@/components/models/reservations";
import {
    getReservationById,
    getClientById,
    mapReservationRow,
    getServiceById,
    getVehicleTypeById,
} from "./supabaseService";
import { supabase } from "./supabase";
import { notifyClient, bufferToBase64 } from "./brevoService";
import {
    generateQuoteSentEmail,
    generateConfirmedEmail,
    generateCompletedEmail,
} from "./emailTemplates";
import {
    generateReservationPDFBuffer,
    type ReservationPDFData,
} from "./pdfUtils";
import { updateReservationStatus } from "./supabaseService";

// PDF generation removed - PDFs are only sent when reservation is confirmed
// This function is no longer needed for quote emails

/**
 * Send a quote to a customer - single atomic operation
 * Updates price, sends email, and updates status all in one go
 * Note: PDFs are only sent when reservation is confirmed, not for quotes
 */
export async function sendQuoteToCustomer(
    reservationId: string,
    quotePrice: number,
    attachPdf: boolean = false // PDFs are only for confirmed reservations
): Promise<Reservation> {
    if (!quotePrice || quotePrice <= 0) {
        throw new Error("Quote price must be greater than 0");
    }

    // Get all required data
    const reservation = await getReservationById(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const client = await getClientById(reservation.clientId);
    if (!client) throw new Error("Client not found");

    const [service, vehicleType] = await Promise.all([
        getServiceById(reservation.serviceId),
        getVehicleTypeById(reservation.vehicleTypeId),
    ]);
    if (!service || !vehicleType)
        throw new Error("Service or vehicle type not found");

    // PDFs are only sent when reservation is confirmed by admin, not for quotes
    // No PDF attachment for quote emails

    // Generate email template
    const reservationData = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        pickupLocation: reservation.pickupLocation,
        destinationLocation: reservation.destinationLocation,
        passengers: reservation.passengers,
        totalPrice: quotePrice,
        serviceName: service.name,
        vehicleTypeName: vehicleType.name,
        status: reservation.status,
    };

    const emailTemplate = generateQuoteSentEmail(
        reservationData,
        `${client.firstName} ${client.lastName}`,
        quotePrice
    );

    // Single atomic update: price + status + send email
    const { data, error } = await supabase
        .from("reservations")
        .update({
            total_price: quotePrice,
            status: "quote_sent" as any,
        })
        .eq("id", reservationId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update reservation: ${error.message}`);
    }

    // Send email (don't fail if email fails)
    // No PDF attachments for quotes - PDFs are only sent when reservation is confirmed
    try {
        await notifyClient({
            to: client.email,
            toName: `${client.firstName} ${client.lastName}`,
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.html,
            textContent: emailTemplate.text,
            attachments: undefined, // No PDFs for quotes
        });
    } catch (error) {
        console.error("Failed to send quote email:", error);
        // Don't throw - reservation is already updated
    }

    return mapReservationRow(data);
}

/**
 * Generate PDF buffer for reservation (server-side)
 * This function generates the PDF directly without calling an API route
 */
async function generateReservationPDF(reservationId: string): Promise<Buffer> {
    // Get all required data
    const reservation = await getReservationById(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const client = await getClientById(reservation.clientId);
    if (!client) throw new Error("Client not found");

    const [service, vehicleType] = await Promise.all([
        getServiceById(reservation.serviceId),
        getVehicleTypeById(reservation.vehicleTypeId),
    ]);
    if (!service || !vehicleType)
        throw new Error("Service or vehicle type not found");

    // Prepare PDF data
    const pdfData: ReservationPDFData = {
        reservationId: reservation.id,
        customerName: `${client.firstName} ${client.lastName}`,
        customerEmail: client.email,
        customerPhone: client.phone,
        vehicleTypeName: vehicleType.name,
        vehicleTypeDescription: vehicleType.description || "",
        serviceName: service.name,
        serviceDescription: service.description || "",
        pickupDate: reservation.date,
        pickupTime: reservation.time,
        pickupLocation: reservation.pickupLocation,
        destinationLocation: reservation.destinationLocation || null,
        passengers: reservation.passengers,
        babySeats: reservation.babySeats,
        boosterSeats: reservation.boosterSeats,
        meetAndGreet: reservation.meetAndGreet,
        totalPrice: reservation.totalPrice,
        notes: reservation.notes,
        status: reservation.status,
        createdAt: reservation.createdAt || new Date().toISOString(),
    };

    // Generate PDF buffer directly
    return generateReservationPDFBuffer(pdfData);
}

/**
 * Confirm a reservation - single atomic operation
 * Updates status to confirmed, sends confirmation email with PDF attachment
 */
export async function confirmReservation(
    reservationId: string
): Promise<Reservation> {
    // Get all required data
    const reservation = await getReservationById(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const client = await getClientById(reservation.clientId);
    if (!client) throw new Error("Client not found");

    const [service, vehicleType] = await Promise.all([
        getServiceById(reservation.serviceId),
        getVehicleTypeById(reservation.vehicleTypeId),
    ]);
    if (!service || !vehicleType)
        throw new Error("Service or vehicle type not found");

    // Generate email template
    const reservationData = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        pickupLocation: reservation.pickupLocation,
        destinationLocation: reservation.destinationLocation,
        passengers: reservation.passengers,
        totalPrice: reservation.totalPrice,
        serviceName: service.name,
        vehicleTypeName: vehicleType.name,
        status: reservation.status,
    };

    // Update status to confirmed with skipEmail to avoid duplicate emails
    const updatedReservation = await updateReservationStatus(
        reservationId,
        "confirmed" as any
    );

    const emailTemplate = generateConfirmedEmail(
        reservationData,
        `${client.firstName} ${client.lastName}`
    );

    // Generate PDF attachment for confirmed reservations
    let pdfAttachment;
    try {
        const pdfBuffer = await generateReservationPDF(reservationId);
        if (pdfBuffer && pdfBuffer.length > 0) {
            pdfAttachment = {
                name: `reservation-${reservationId}.pdf`,
                content: bufferToBase64(pdfBuffer),
            };
        }
    } catch (error) {
        console.error("Failed to generate PDF attachment:", error);
        // Continue without PDF if generation fails
    }

    // Send confirmation email with PDF attachment
    try {
        await notifyClient({
            to: client.email,
            toName: `${client.firstName} ${client.lastName}`,
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.html,
            textContent: emailTemplate.text,
            attachments: pdfAttachment ? [pdfAttachment] : undefined,
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
        // Don't throw - reservation is already confirmed
    }

    return updatedReservation;
}

/**
 * Mark a reservation as completed - single atomic operation
 * Updates status to completed, sends completion email with review link
 * Note: Completed emails do NOT include PDF attachments
 */
export async function markReservationComplete(
    reservationId: string
): Promise<Reservation> {
    // Get all required data
    const reservation = await getReservationById(reservationId);
    if (!reservation) throw new Error("Reservation not found");

    const client = await getClientById(reservation.clientId);
    if (!client) throw new Error("Client not found");

    const [service, vehicleType] = await Promise.all([
        getServiceById(reservation.serviceId),
        getVehicleTypeById(reservation.vehicleTypeId),
    ]);
    if (!service || !vehicleType)
        throw new Error("Service or vehicle type not found");

    // Generate email template
    const reservationData = {
        id: reservation.id,
        date: reservation.date,
        time: reservation.time,
        pickupLocation: reservation.pickupLocation,
        destinationLocation: reservation.destinationLocation,
        passengers: reservation.passengers,
        totalPrice: reservation.totalPrice,
        serviceName: service.name,
        vehicleTypeName: vehicleType.name,
        status: reservation.status,
    };

    const emailTemplate = generateCompletedEmail(
        reservationData,
        `${client.firstName} ${client.lastName}`
    );

    // Single atomic update: status to completed
    // We'll send the email manually to avoid duplicate emails
    const { data, error } = await supabase
        .from("reservations")
        .update({ status: "completed" as any })
        .eq("id", reservationId)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update reservation: ${error.message}`);
    }

    const updatedReservation = mapReservationRow(data);

    // Send completion email (no PDF attachment for completed reservations)
    try {
        await notifyClient({
            to: client.email,
            toName: `${client.firstName} ${client.lastName}`,
            subject: emailTemplate.subject,
            htmlContent: emailTemplate.html,
            textContent: emailTemplate.text,
            attachments: undefined, // No PDFs for completed reservations
        });
    } catch (error) {
        console.error("Failed to send completion email:", error);
        // Don't throw - reservation is already marked as completed
    }

    return updatedReservation;
}

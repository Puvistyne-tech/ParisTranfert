/**
 * Reservation Email Service
 * Handles sending reservation-related emails with PDF attachments
 */

import type { Reservation, ReservationStatus } from "@/components/models/reservations";
import { notifyClient, notifyAdmin, bufferToBase64 } from "./brevoService";
import {
  generateQuoteRequestedEmail,
  generateQuoteSentEmail,
  generateQuoteAcceptedEmail,
  generatePendingEmail,
  generateConfirmedEmail,
  generateCancelledEmail,
  generateCompletedEmail,
  generateAdminNotificationEmail,
  generateAdminQuoteAcceptedEmail,
  generateAdminQuoteDeclinedEmail,
} from "./emailTemplates";
import { 
  getReservationById, 
  getClientById, 
  getServiceById,
  getVehicleTypeById,
  getLocationById,
} from "./supabaseService";
import { generateReservationPDFBuffer, type ReservationPDFData } from "./pdfUtils";

/**
 * Fetch complete reservation data with all relations
 */
async function getCompleteReservationData(reservationId: string) {
  const reservation = await getReservationById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  const client = await getClientById(reservation.clientId);
  if (!client) {
    throw new Error("Client not found");
  }

  const [service, vehicleType] = await Promise.all([
    getServiceById(reservation.serviceId),
    getVehicleTypeById(reservation.vehicleTypeId),
  ]);

  if (!service || !vehicleType) {
    throw new Error("Service or vehicle type not found");
  }

  return {
    reservation,
    client,
    service,
    vehicleType,
  };
}

/**
 * Generate PDF buffer for reservation (server-side)
 * This function generates the PDF directly without calling an API route
 */
async function generateReservationPDF(reservationId: string): Promise<Buffer> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, client, service, vehicleType } = data;

  // Convert location IDs to full names if needed
  let pickupLocationName = reservation.pickupLocation;
  let destinationLocationName = reservation.destinationLocation || null;
  
  // Check if pickup location is an ID (short string like 'paris', 'cdg', 'orly')
  if (pickupLocationName && pickupLocationName.length < 20 && /^[a-z0-9_-]+$/.test(pickupLocationName.toLowerCase())) {
    const location = await getLocationById(pickupLocationName);
    if (location) {
      pickupLocationName = location.name;
    }
  }
  
  // Check if destination location is an ID
  if (destinationLocationName && destinationLocationName.length < 20 && /^[a-z0-9_-]+$/.test(destinationLocationName.toLowerCase())) {
    const location = await getLocationById(destinationLocationName);
    if (location) {
      destinationLocationName = location.name;
    }
  }

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
    pickupLocation: pickupLocationName,
    destinationLocation: destinationLocationName,
    passengers: reservation.passengers,
    babySeats: reservation.babySeats,
    boosterSeats: reservation.boosterSeats,
    meetAndGreet: reservation.meetAndGreet,
    totalPrice: reservation.totalPrice,
    notes: reservation.notes,
    status: reservation.status,
    createdAt: reservation.createdAt || new Date().toISOString(),
    serviceSubData: reservation.serviceSubData || undefined,
  };

  // Generate PDF buffer directly
  return generateReservationPDFBuffer(pdfData);
}

/**
 * Send email for reservation status change
 */
export async function sendReservationStatusEmail(
  reservationId: string,
  status: ReservationStatus,
  customerEmail: string,
  customerName: string,
  locale: string = "en",
): Promise<void> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, service, vehicleType } = data;

  // Prepare reservation data for email template
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
    serviceSubData: reservation.serviceSubData || undefined,
  };

  // Generate email template based on status
  let emailTemplate;
  switch (status) {
    case "quote_requested":
      emailTemplate = generateQuoteRequestedEmail(reservationData, customerName, locale);
      break;
    case "quote_sent":
      emailTemplate = generateQuoteSentEmail(
        reservationData,
        customerName,
        reservation.totalPrice,
        locale,
      );
      break;
    case "quote_accepted":
      emailTemplate = generateQuoteAcceptedEmail(reservationData, customerName, locale);
      break;
    case "pending":
      emailTemplate = generatePendingEmail(reservationData, customerName, locale);
      break;
    case "confirmed":
      emailTemplate = generateConfirmedEmail(reservationData, customerName, locale);
      break;
    case "cancelled":
      emailTemplate = generateCancelledEmail(reservationData, customerName, locale);
      break;
    case "completed":
      emailTemplate = generateCompletedEmail(reservationData, customerName);
      break;
    default:
      console.warn(`No email template for status: ${status}`);
      return;
  }

  // Generate PDF attachment ONLY for confirmed reservations
  // PDFs are only sent when admin confirms the reservation
  let pdfAttachment;
  if (status === "confirmed") {
    try {
      const pdfBuffer = await generateReservationPDF(reservationId);
      if (pdfBuffer && pdfBuffer.length > 0) {
        pdfAttachment = {
          name: `reservation-${reservationId}.pdf`,
          content: bufferToBase64(pdfBuffer),
        };
      }
    } catch (error) {
      console.error("Failed to generate PDF attachment (continuing without PDF):", error);
      // Continue without PDF if generation fails - this is not critical
      pdfAttachment = undefined;
    }
  }

  // Send email to client via Brevo
  // Note: If BREVO_API_KEY is not configured, this will throw an error
  // but we catch it and log it, so it doesn't break the reservation flow
  try {
    await notifyClient({
      to: customerEmail,
      toName: customerName,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
      attachments: pdfAttachment ? [pdfAttachment] : undefined,
    });
  } catch (error) {
    // Log the error but don't throw - email failure shouldn't break the reservation flow
    console.error("Failed to send email to client via Brevo (email not sent, but reservation is still valid):", error);
    if (error instanceof Error && error.message.includes("BREVO_API_KEY")) {
      console.warn("BREVO_API_KEY is not configured. Emails will not be sent until the API key is set in environment variables.");
    }
    // Don't throw - email failure shouldn't break the flow
  }
}

/**
 * Send admin notification email when new reservation is created
 * Admin email is automatically retrieved from environment variables
 */
export async function sendAdminNotificationEmail(
  reservationId: string,
): Promise<void> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, client, service, vehicleType } = data;

  // Prepare reservation data for admin email
  const reservationData = {
    id: reservation.id,
    reservationId: reservation.id,
    customerFirstName: client.firstName,
    customerLastName: client.lastName,
    customerEmail: client.email,
    customerPhone: client.phone,
    pickupDate: reservation.date,
    pickupTime: reservation.time,
    pickupLocation: reservation.pickupLocation,
    destinationLocation: reservation.destinationLocation,
    passengers: reservation.passengers,
    babySeats: reservation.babySeats,
    boosterSeats: reservation.boosterSeats,
    meetAndGreet: reservation.meetAndGreet,
    totalPrice: reservation.totalPrice,
    serviceName: service.name,
    vehicleTypeName: vehicleType.name,
    status: reservation.status,
    notes: reservation.notes,
    serviceSubData: reservation.serviceSubData || undefined,
  };

  const emailTemplate = generateAdminNotificationEmail(reservationData);

  // Admin emails do NOT include PDF attachments - only client confirmation emails do
  // Send email to admin via Brevo (will gracefully handle missing API key)
  try {
    await notifyAdmin({
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });
  } catch (error) {
    console.error("Failed to send admin notification email via Brevo:", error);
    // Don't throw - email failure shouldn't break the flow
  }
}

/**
 * Send quote email (when admin sends quote to customer)
 */
export async function sendQuoteEmail(
  reservationId: string,
  customerEmail: string,
  customerName: string,
  quotePrice: number,
  locale: string = "en",
): Promise<void> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, service, vehicleType } = data;

  // Note: The caller should update the reservation price before calling this function
  // We use the quotePrice parameter for the email, which should match the updated reservation price

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
    serviceSubData: reservation.serviceSubData || undefined,
  };

  const emailTemplate = generateQuoteSentEmail(reservationData, customerName, quotePrice, locale);

  // PDFs are only sent when reservation is confirmed by admin, not for quotes
  // No PDF attachment for quote emails

  // Send quote email to client via Brevo
  // Note: If BREVO_API_KEY is not configured, this will throw an error
  // but we catch it and log it, so it doesn't break the quote sending flow
  try {
    await notifyClient({
      to: customerEmail,
      toName: customerName,
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
      attachments: undefined, // No PDFs for quotes
    });
  } catch (error) {
    // Log the error but don't throw - email failure shouldn't break the quote flow
    console.error("Failed to send quote email to client via Brevo (email not sent, but quote is still valid):", error);
    if (error instanceof Error && error.message.includes("BREVO_API_KEY")) {
      console.warn("BREVO_API_KEY is not configured. Emails will not be sent until the API key is set in environment variables.");
    }
    // Don't throw - email failure shouldn't break the flow
  }
}

/**
 * Send admin notification when client accepts a quote
 */
export async function sendAdminQuoteAcceptedNotification(
  reservationId: string,
): Promise<void> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, client, service, vehicleType } = data;

  // Prepare reservation data for admin email
  const reservationData = {
    id: reservation.id,
    reservationId: reservation.id,
    customerFirstName: client.firstName,
    customerLastName: client.lastName,
    customerEmail: client.email,
    customerPhone: client.phone,
    pickupDate: reservation.date,
    pickupTime: reservation.time,
    pickupLocation: reservation.pickupLocation,
    destinationLocation: reservation.destinationLocation,
    passengers: reservation.passengers,
    babySeats: reservation.babySeats,
    boosterSeats: reservation.boosterSeats,
    meetAndGreet: reservation.meetAndGreet,
    totalPrice: reservation.totalPrice,
    serviceName: service.name,
    vehicleTypeName: vehicleType.name,
    status: reservation.status,
    notes: reservation.notes,
    serviceSubData: reservation.serviceSubData || undefined,
  };

  const emailTemplate = generateAdminQuoteAcceptedEmail(reservationData);

  // Send email to admin via Brevo
  try {
    await notifyAdmin({
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });
  } catch (error) {
    console.error("Failed to send admin quote accepted notification via Brevo:", error);
    // Don't throw - email failure shouldn't break the flow
  }
}

/**
 * Send admin notification when client declines a quote
 */
export async function sendAdminQuoteDeclinedNotification(
  reservationId: string,
): Promise<void> {
  const data = await getCompleteReservationData(reservationId);
  const { reservation, client, service, vehicleType } = data;

  // Prepare reservation data for admin email
  const reservationData = {
    id: reservation.id,
    reservationId: reservation.id,
    customerFirstName: client.firstName,
    customerLastName: client.lastName,
    customerEmail: client.email,
    customerPhone: client.phone,
    pickupDate: reservation.date,
    pickupTime: reservation.time,
    pickupLocation: reservation.pickupLocation,
    destinationLocation: reservation.destinationLocation,
    passengers: reservation.passengers,
    babySeats: reservation.babySeats,
    boosterSeats: reservation.boosterSeats,
    meetAndGreet: reservation.meetAndGreet,
    totalPrice: reservation.totalPrice,
    serviceName: service.name,
    vehicleTypeName: vehicleType.name,
    status: reservation.status,
    notes: reservation.notes,
    serviceSubData: reservation.serviceSubData || undefined,
  };

  const emailTemplate = generateAdminQuoteDeclinedEmail(reservationData);

  // Send email to admin via Brevo
  try {
    await notifyAdmin({
      subject: emailTemplate.subject,
      htmlContent: emailTemplate.html,
      textContent: emailTemplate.text,
    });
  } catch (error) {
    console.error("Failed to send admin quote declined notification via Brevo:", error);
    // Don't throw - email failure shouldn't break the flow
  }
}


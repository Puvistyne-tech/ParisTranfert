import { NextRequest, NextResponse } from "next/server";
import type { ReservationPDFData } from "@/lib/pdfUtils";
import { generateReservationPDFBuffer } from "@/lib/pdfUtils";
import { 
  getReservationById, 
  getClientById, 
  getServiceById, 
  getVehicleTypeById 
} from "@/lib/supabaseService";

/**
 * Server-side PDF generation for email attachments
 * GET /api/reservations/[id]/pdf
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: reservationId } = await params;

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 },
      );
    }

    // Fetch reservation with all related data
    const reservation = await getReservationById(reservationId);
    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 },
      );
    }

    // Fetch client
    const client = await getClientById(reservation.clientId);
    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 },
      );
    }

    // Fetch service and vehicle type
    const [service, vehicleType] = await Promise.all([
      getServiceById(reservation.serviceId),
      getVehicleTypeById(reservation.vehicleTypeId),
    ]);

    if (!service || !vehicleType) {
      return NextResponse.json(
        { error: "Service or vehicle type not found" },
        { status: 404 },
      );
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

    // Generate PDF buffer using the shared utility function
    const pdfBuffer = await generateReservationPDFBuffer(pdfData);

    // Convert Buffer to Uint8Array for NextResponse
    const pdfArray = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="reservation-${reservationId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}


import { pdf } from "@react-pdf/renderer";
import React from "react";
import {
  type PDFTranslations,
  ReservationPDF,
} from "../components/pdf/ReservationPDF";

export interface ReservationPDFData {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleTypeName: string;
  vehicleTypeDescription?: string;
  serviceName: string;
  serviceDescription: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  destinationLocation: string | null;
  passengers: number;
  babySeats: number;
  boosterSeats: number;
  meetAndGreet: boolean;
  totalPrice: number;
  notes?: string;
  status: string;
  createdAt: string;
}

/**
 * Default PDF translations (can be overridden)
 */
const defaultTranslations: PDFTranslations = {
  companyName: "Paris Transfer",
  companySubtitle: "Premium Transfer Services",
  reservationStatus: "Reservation Status",
  tripDetails: "Trip Details",
  date: "Date",
  time: "Time",
  from: "From",
  to: "To",
  vehicleTypeService: "Vehicle & Service",
  vehicleType: "Vehicle Type",
  service: "Service",
  passengers: "Passengers",
  customer: "Customer",
  name: "Name",
  email: "Email",
  phone: "Phone",
  description: "Description",
  additionalServices: "Additional Services",
  babySeats: "Baby Seats",
  boosters: "Booster Seats",
  meetAndGreet: "Meet & Greet",
  free: "Free",
  pricing: "Pricing",
  basePrice: "Base Price",
  total: "Total",
  notes: "Notes",
  importantInformation: "Important Information",
  importantNote1: "Please arrive 10 minutes before your scheduled pickup time",
  importantNote2: "Our driver will contact you 30 minutes before pickup",
  importantNote3: "Keep this confirmation as proof of booking",
  importantNote4: "Contact us immediately if you need to make changes",
  importantNote5: "Thank you for choosing Paris Transfer",
  referenceNumber: "Reference Number",
  created: "Created",
  contactInformation: "Contact Information",
  thankYou: "Thank You",
  thankYouMessage: "We look forward to serving you!",
  generated: "Generated",
  quoteMessage: "This is a quote. Price may vary.",
};

/**
 * Generate PDF buffer for reservation (server-side)
 * This is the shared function that can be called directly from server-side code
 * without needing to make HTTP requests to API routes
 */
export async function generateReservationPDFBuffer(
  data: ReservationPDFData,
  translations?: PDFTranslations,
): Promise<Buffer> {
  try {
    const pdfTranslations = translations || defaultTranslations;

    // Generate PDF buffer
    const pdfDoc = pdf(
      React.createElement(ReservationPDF, {
        data,
        translations: pdfTranslations,
      }) as any,
    );

    // Use toBlob for server-side, then convert to buffer
    const blob = await pdfDoc.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error generating PDF buffer:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Client-side PDF download function
 */
export async function downloadReservationPDF(
  data: ReservationPDFData,
  translations: PDFTranslations,
  filename?: string,
) {
  try {
    // Generate PDF blob using react-pdf
    const blob = await pdf(
      <ReservationPDF data={data} translations={translations} />,
    ).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `reservation-${data.reservationId}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

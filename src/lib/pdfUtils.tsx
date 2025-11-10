import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { ReservationPDF, type PDFTranslations } from '../components/pdf/ReservationPDF';

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

export async function downloadReservationPDF(
  data: ReservationPDFData, 
  translations: PDFTranslations,
  filename?: string
) {
  try {
    // Generate PDF blob using react-pdf
    const blob = await pdf(<ReservationPDF data={data} translations={translations} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `reservation-${data.reservationId}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

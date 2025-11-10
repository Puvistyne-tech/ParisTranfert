"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useReservationStore } from "@/store/reservationStore";
import { downloadReservationPDF, type ReservationPDFData } from "@/lib/pdfUtils";
import type { PDFTranslations } from "@/components/pdf/ReservationPDF";
import { createClient, createReservation, getLocationById } from "@/lib/supabaseService";
import { usePricing } from "@/hooks/usePricing";
import { useServiceFields } from "@/hooks/useServiceFields";
import { ReservationStatus } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Clock, 
  CheckCircle, 
  Download, 
  Mail, 
  Share2, 
  Home, 
  Plus,
  ArrowLeft,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { ReservationPDF } from "@/components/pdf/ReservationPDF";

export default function SubmitReservationPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("confirmation");
  
  const {
    reservationId,
    isCompleted,
    selectedVehicleType,
    selectedService,
    additionalServices,
    serviceSubData,
    formData,
    setCompleted,
    clearSelections,
    resetForm,
    setReservationId,
  } = useReservationStore();

  const [isSubmitting, setIsSubmitting] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ReservationPDFData | null>(null);

  // Redirect if no valid reservation data - check first before doing anything
  useEffect(() => {
    if (!selectedService || !selectedVehicleType || !formData.firstName || !formData.email) {
      // No valid data - redirect to reservation page immediately
      setIsSubmitting(false);
      router.push(`/${locale}/reservation`);
      return;
    }
  }, [selectedService, selectedVehicleType, formData, locale, router]);

  // Extract only location fields that affect pricing
  // This ensures price only refetches when locations change, not when other fields change
  const pickupLocation = serviceSubData?.pickup_location;
  const destinationLocation = serviceSubData?.destination_location;

  // Use TanStack Query to fetch pricing with caching - prevents unnecessary refetches
  const isAirportTransfer = selectedService?.id === 'airport-transfers';
  const { data: pricingData } = usePricing(
    isAirportTransfer ? selectedService?.id : null,
    isAirportTransfer ? selectedVehicleType?.id : null,
    isAirportTransfer ? pickupLocation : null,
    isAirportTransfer ? destinationLocation : null,
    isAirportTransfer
  );

  const basePrice = pricingData?.price ?? null;

  // Use TanStack Query hook for service fields
  const { data: serviceFields = [] } = useServiceFields(selectedService?.id);

  // Prepare PDF data - separate from pricing fetch
  // This can depend on all form data since it doesn't trigger API calls
  useEffect(() => {
    // Don't prepare if we don't have valid data
    if (!selectedService || !selectedVehicleType || !formData.firstName || !formData.email) {
      return;
    }

    // Prepare PDF data (will be updated when basePrice changes)
    const pdfData: ReservationPDFData = {
      reservationId: reservationId || 'unknown',
      customerName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      customerEmail: formData.email || '',
      customerPhone: formData.phone || '',
      vehicleTypeName: selectedVehicleType?.name || '',
      vehicleTypeDescription: selectedVehicleType?.description || '',
      serviceName: selectedService.name,
      serviceDescription: selectedService.description,
      pickupDate: formData.date || '',
      pickupTime: formData.time || '',
      pickupLocation: serviceSubData?.pickup_location || formData.pickup || '',
      destinationLocation: serviceSubData?.destination_location || formData.destination || '',
      passengers: formData.passengers || 1,
      babySeats: additionalServices.babySeats,
      boosterSeats: additionalServices.boosters,
      meetAndGreet: additionalServices.meetAndGreet,
      totalPrice: basePrice || 0,
      notes: formData.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setPdfData(pdfData);
  }, [selectedService, selectedVehicleType, serviceSubData, formData, additionalServices, reservationId, basePrice]);

  // Update PDF data when basePrice changes
  useEffect(() => {
    if (pdfData && basePrice !== null) {
      setPdfData({
        ...pdfData,
        totalPrice: basePrice,
      });
    }
  }, [basePrice]);

  // Submit reservation - only if we have valid data and haven't submitted yet
  useEffect(() => {
    // Don't submit if already submitted or if there's an error
    if (isSubmitted || submissionError) {
      return;
    }

    // Don't submit if we don't have valid data
    if (!selectedService || !selectedVehicleType || !formData.firstName || !formData.email) {
      setIsSubmitting(false);
      return;
    }

    async function submitReservation() {
      if (!selectedService || !selectedVehicleType || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.date || !formData.time) {
        throw new Error('Missing required reservation data');
      }

      try {
        // Create or find client
        const client = await createClient({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        });

        // Use service fields from hook (already loaded with caching)
        const pickupField = serviceFields.find(f => f.isPickup);
        const destinationField = serviceFields.find(f => f.isDestination);
        
        // Get location names from location IDs if they exist
        // Priority: serviceSubData (from service fields) > formData (mapped values)
        let locationName = '';
        let destinationName = '';
        
        // Get pickup location
        if (pickupField) {
          const pickupValue = serviceSubData?.[pickupField.fieldKey] || formData.pickup || '';
          if (pickupValue) {
            // Convert location ID to name if it's a location_select field
            if (pickupField.fieldType === 'location_select') {
              const pickupLocation = await getLocationById(pickupValue);
              if (pickupLocation) {
                locationName = pickupLocation.name;
              } else {
                locationName = pickupValue; // Fallback to ID if not found
              }
            } else {
              // For other field types (address_autocomplete, text), use value directly
              locationName = pickupValue;
            }
          }
        } else {
          // Fallback to formData if no pickup field defined
          locationName = formData.pickup || '';
        }
        
        // Get destination location (if field exists)
        if (destinationField) {
          const destinationValue = serviceSubData?.[destinationField.fieldKey] || formData.destination || '';
          if (destinationValue) {
            // Convert location ID to name if it's a location_select field
            if (destinationField.fieldType === 'location_select') {
              const destinationLocation = await getLocationById(destinationValue);
              if (destinationLocation) {
                destinationName = destinationLocation.name;
              } else {
                destinationName = destinationValue; // Fallback to ID if not found
              }
            } else {
              // For other field types (address_autocomplete, text), use value directly
              destinationName = destinationValue;
            }
          }
        } else {
          // Fallback to formData if no destination field defined
          destinationName = formData.destination || '';
        }
        
        // Validate that we have pickup location (required)
        if (!locationName) {
          throw new Error('Missing required pickup location');
        }
        
        // Validate destination only if the service requires it
        if (destinationField && destinationField.required && !destinationName) {
          throw new Error(`Missing required ${destinationField.label}`);
        }

        // Create reservation directly using Supabase
        const reservation = await createReservation({
          clientId: client.id,
          serviceId: selectedService.id,
          vehicleTypeId: selectedVehicleType.id,
          date: formData.date,
          time: formData.time,
          pickupLocation: locationName,
          destinationLocation: destinationName,
          passengers: formData.passengers || 1,
          babySeats: additionalServices?.babySeats || 0,
          boosterSeats: additionalServices?.boosters || 0,
          meetAndGreet: additionalServices?.meetAndGreet || false,
          serviceSubData: serviceSubData || undefined,
          notes: formData.notes || undefined,
          totalPrice: basePrice || 0,
          status: ReservationStatus.PENDING,
        });

        console.log('Reservation submitted successfully:', reservation);
        
        // Update reservation ID in store
        setReservationId(reservation.id);
        
        // Mark as completed
        setCompleted(true);
        if (reservationId) {
          localStorage.removeItem(`reservation-${reservationId}`);
        }
        
        setIsSubmitted(true);
      } catch (error) {
        console.error('Error submitting reservation:', error);
        setSubmissionError(error instanceof Error ? error.message : t("unknownError") || 'Unknown error');
      } finally {
        setIsSubmitting(false);
      }
    }

    // Only submit once when component mounts with valid data
    const timeoutId = setTimeout(() => {
      submitReservation();
    }, 100); // Small delay to ensure all state is ready

    return () => clearTimeout(timeoutId);
  }, []); // Only run once on mount

  const getPDFTranslations = (): PDFTranslations => {
    return {
      companyName: t("pdf.companyName"),
      companySubtitle: t("pdf.companySubtitle"),
      reservationStatus: t("pdf.reservationStatus"),
      tripDetails: t("pdf.tripDetails"),
      date: t("pdf.date"),
      time: t("pdf.time"),
      from: t("pdf.from"),
      to: t("pdf.to"),
      vehicleTypeService: t("pdf.vehicleTypeService"),
      vehicleType: t("pdf.vehicleType"),
      service: t("pdf.service"),
      passengers: t("pdf.passengers"),
      customer: t("pdf.customer"),
      name: t("pdf.name"),
      email: t("pdf.email"),
      phone: t("pdf.phone"),
      description: t("pdf.description"),
      additionalServices: t("pdf.additionalServices"),
      babySeats: t("pdf.babySeats"),
      boosters: t("pdf.boosters"),
      meetAndGreet: t("pdf.meetAndGreet"),
      free: t("pdf.free"),
      pricing: t("pdf.pricing"),
      basePrice: t("pdf.basePrice"),
      total: t("pdf.total"),
      notes: t("pdf.notes"),
      importantInformation: t("pdf.importantInformation"),
      importantNote1: t("pdf.importantNote1"),
      importantNote2: t("pdf.importantNote2"),
      importantNote3: t("pdf.importantNote3"),
      importantNote4: t("pdf.importantNote4"),
      importantNote5: t("pdf.importantNote5"),
      referenceNumber: t("pdf.referenceNumber"),
      created: t("pdf.created"),
      contactInformation: t("pdf.contactInformation"),
      thankYou: t("pdf.thankYou"),
      thankYouMessage: t("pdf.thankYouMessage"),
      generated: t("pdf.generated"),
      quoteMessage: t("pdf.quoteMessage"),
    };
  };

  const handleDownloadPDF = async () => {
    if (!pdfData) return;
    try {
      const pdfTranslations = getPDFTranslations();
      await downloadReservationPDF(pdfData, pdfTranslations);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t("failedToDownloadPDF"));
    }
  };

  const handleEmailPDF = async () => {
    if (!pdfData) return;
    const subject = encodeURIComponent(t("emailSubject", { reservationId: pdfData.reservationId }) || `Reservation Confirmation #${pdfData.reservationId}`);
    const body = encodeURIComponent(t("emailBody", { customerName: pdfData.customerName }) || `Please find attached the reservation confirmation for ${pdfData.customerName}.`);
    window.location.href = `mailto:${pdfData.customerEmail}?subject=${subject}&body=${body}`;
  };

  const handleSharePDF = async () => {
    if (!pdfData) return;
    try {
      // Generate PDF blob
      const { pdf } = await import('@react-pdf/renderer');
      const pdfTranslations = getPDFTranslations();
      const blob = await pdf(<ReservationPDF data={pdfData} translations={pdfTranslations} />).toBlob();
      
      // Create shareable file
      const file = new File([blob], `reservation-${pdfData.reservationId}.pdf`, { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: t("shareTitle", { reservationId: pdfData.reservationId }) || `Reservation #${pdfData.reservationId}`,
          text: t("shareText", { customerName: pdfData.customerName }) || `Reservation confirmation for ${pdfData.customerName}`,
          files: [file],
        });
      } else {
        // Fallback: copy link or show share options
        alert(t("sharingNotAvailable") || 'Sharing is not available on this device. Please use the download button instead.');
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      alert(t("failedToSharePDF") || 'Failed to share PDF. Please use the download button instead.');
    }
  };

  const handleNewReservation = () => {
    resetForm();
    if (reservationId) {
      localStorage.removeItem(`reservation-${reservationId}`);
    }
    setReservationId(crypto.randomUUID());
    router.push(`/${locale}/reservation`);
  };

  const handleGoHome = () => {
    // Clear all reservation-related localStorage first
    if (reservationId) {
      localStorage.removeItem(`reservation-${reservationId}`);
    }
    // Clear the persisted Zustand store
    localStorage.removeItem('reservation-store');
    // Reset the form state
    resetForm();
    // Use replace instead of push to avoid back button issues
    // Navigate to home page with full reload to ensure clean state
    window.location.href = `/${locale}`;
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <Clock className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Submitting Reservation...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your reservation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submissionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative z-50">
        <Card className="max-w-md w-full mx-4 shadow-xl dark:bg-gray-800">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 dark:text-red-400 text-2xl">✕</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Submission Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {submissionError}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  // Navigate to reservation page, which will show the exit confirmation popup
                  router.push(`/${locale}/reservation`);
                }} 
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSubmitted || !pdfData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reservation Confirmation</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Reservation ID: {reservationId}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-1">
                    Reservation Submitted Successfully!
                  </h1>
                  <p className="text-green-700 dark:text-green-400">
                    Your reservation #{pdfData.reservationId} has been received and is pending approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PDF Preview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Reservation Confirmation
                </h2>
              </div>
              
              {/* PDF Content Preview */}
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
                <div className="border-b dark:border-gray-700 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">PARIS TRANSFER</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Premium Transportation Services</p>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium">
                      #{pdfData.reservationId}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Trip Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.pickupDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.pickupTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">From:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.pickupLocation}</span>
                      </div>
                      {pdfData.destinationLocation && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">To:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.destinationLocation}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Passengers:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.passengers}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Vehicle:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.vehicleTypeName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Service:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.serviceName}</span>
                      </div>
                      {(pdfData.babySeats > 0 || pdfData.boosterSeats > 0 || pdfData.meetAndGreet) && (
                        <div className="mt-3 pt-3 border-t dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400 text-xs">Additional Services:</span>
                          <div className="mt-1 space-y-1">
                            {pdfData.babySeats > 0 && (
                              <div className="text-xs text-gray-900 dark:text-gray-100">Baby Seats: {pdfData.babySeats} × Free</div>
                            )}
                            {pdfData.boosterSeats > 0 && (
                              <div className="text-xs text-gray-900 dark:text-gray-100">Boosters: {pdfData.boosterSeats} × Free</div>
                            )}
                            {pdfData.meetAndGreet && (
                              <div className="text-xs text-gray-900 dark:text-gray-100">Meet & Greet: Free</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Customer Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Name: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Phone: </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{pdfData.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Status: </span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">Pending Approval</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadPDF}
                  className="w-full"
                  variant="primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                
                <Button
                  onClick={handleEmailPDF}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email PDF
                </Button>
                
                <Button
                  onClick={handleSharePDF}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share PDF
                </Button>
                
                <Button
                  onClick={handleNewReservation}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Reservation
                </Button>
                
                <Button
                  onClick={handleGoHome}
                  variant="outline"
                  className="w-full sm:col-span-2"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useLocale,
  useTranslations as useNextIntlTranslations,
  useTranslations,
} from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { usePricing } from "@/hooks/usePricing";
import {
  downloadReservationPDF,
  type ReservationPDFData,
} from "@/lib/pdfUtils";
import {
  getTranslatedServiceName,
  getTranslatedVehicleDescription,
} from "@/lib/translations";
import { getLocationById } from "@/lib/supabaseService";
import { useReservationStore } from "@/store/reservationStore";

export default function ConfirmationPage() {
  const t = useTranslations("confirmation");
  const tFleet = useNextIntlTranslations("fleet");
  const tServices = useNextIntlTranslations("services");
  const router = useRouter();
  const locale = useLocale();

  const {
    reservationId: storeReservationId,
    submittedReservationId,
    isCompleted,
    selectedVehicleType,
    selectedService,
    additionalServices,
    serviceSubData,
    formData,
    setCompleted,
    clearSelections,
  } = useReservationStore();

  // Redirect if reservation is completed (should be on submit page)
  useEffect(() => {
    if (isCompleted) {
      router.push(`/${locale}/reservation/submit`);
    }
  }, [isCompleted, locale, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pickupLocationName, setPickupLocationName] = useState<string | null>(null);
  const [destinationLocationName, setDestinationLocationName] = useState<string | null>(null);

  // Use submitted reservation ID from server if available, otherwise use local tracking ID
  const reservationId = submittedReservationId || storeReservationId || "";

  // Extract only location fields that affect pricing
  // This ensures price only refetches when locations change, not when other fields change
  // Check both serviceSubData (for services with location fields) and formData (for airport transfers)
  const pickupLocation = serviceSubData?.pickup_location || formData.pickup || null;
  const destinationLocation = serviceSubData?.destination_location || formData.destination || null;

  // Use TanStack Query to fetch pricing with caching - prevents unnecessary refetches
  // Pricing now works for all services that have pickup and destination locations
  const hasLocationFields = Boolean(pickupLocation && destinationLocation);
  const { data: pricingData, isLoading: priceLoading } = usePricing(
    selectedService?.id ?? null,
    selectedVehicleType?.id ?? null,
    pickupLocation ?? null,
    destinationLocation ?? null,
    hasLocationFields,
  );

  // Calculate base price - double for Disneyland return trips
  let basePrice = pricingData?.price ?? null;
  if (
    basePrice !== null &&
    selectedService?.id === "disneyland" &&
    serviceSubData?.return_trip === true
  ) {
    basePrice = basePrice * 2;
  }

  // Debug logging
  useEffect(() => {
    console.log("Confirmation Page Pricing Debug:", {
      selectedService: selectedService?.id,
      selectedVehicleType: selectedVehicleType?.id,
      pickupLocation,
      destinationLocation,
      hasLocationFields,
      priceLoading,
      pricingData,
      basePrice,
    });
  }, [selectedService?.id, selectedVehicleType?.id, pickupLocation, destinationLocation, hasLocationFields, priceLoading, pricingData, basePrice]);

  // Reset image error when vehicle type changes
  useEffect(() => {
    setImageError(false);
  }, [selectedVehicleType?.id]);

  // Convert location IDs to full names for display
  useEffect(() => {
    async function convertLocations() {
      if (pickupLocation) {
        // Check if it's a location ID (short string like 'paris', 'cdg', 'orly')
        if (pickupLocation.length < 20 && /^[a-z0-9_-]+$/.test(pickupLocation.toLowerCase())) {
          try {
            const location = await getLocationById(pickupLocation);
            if (location) {
              setPickupLocationName(location.name);
            } else {
              setPickupLocationName(pickupLocation);
            }
          } catch {
            setPickupLocationName(pickupLocation);
          }
        } else {
          setPickupLocationName(pickupLocation);
        }
      } else {
        setPickupLocationName(null);
      }

      if (destinationLocation) {
        // Check if it's a location ID
        if (destinationLocation.length < 20 && /^[a-z0-9_-]+$/.test(destinationLocation.toLowerCase())) {
          try {
            const location = await getLocationById(destinationLocation);
            if (location) {
              setDestinationLocationName(location.name);
            } else {
              setDestinationLocationName(destinationLocation);
            }
          } catch {
            setDestinationLocationName(destinationLocation);
          }
        } else {
          setDestinationLocationName(destinationLocation);
        }
      } else {
        setDestinationLocationName(null);
      }
    }

    convertLocations();
  }, [pickupLocation, destinationLocation]);

  const handleSubmitReservation = () => {
    // Navigate to submit page instead of submitting here
    router.push(`/${locale}/reservation/submit`);
  };

  const calculateTotalPrice = () => {
    // Return base price if available (for all services)
    return basePrice ?? 0;
  };

  const handleDownloadPDF = async () => {
    if (!selectedVehicleType || !selectedService) return;

    try {
      const pdfData: ReservationPDFData = {
        reservationId,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email || "",
        customerPhone: formData.phone || "",
        vehicleTypeName: selectedVehicleType?.name || "",
        vehicleTypeDescription: selectedVehicleType?.description || "",
        serviceName: selectedService.name,
        serviceDescription: selectedService.description,
        pickupDate: formData.date || "",
        pickupTime: formData.time || "",
        pickupLocation: formData.pickup || "",
        destinationLocation: formData.destination || "",
        passengers: formData.passengers || 1,
        babySeats: additionalServices.babySeats,
        boosterSeats: additionalServices.boosters,
        meetAndGreet: additionalServices.meetAndGreet,
        totalPrice: calculateTotalPrice(),
        notes: formData.notes,
        status: "pending",
        createdAt: new Date().toISOString(),
        serviceSubData: serviceSubData || undefined,
      };

      // Get PDF translations
      const pdfTranslations = {
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

      await downloadReservationPDF(pdfData, pdfTranslations);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(t("failedToDownloadPDF"));
    }
  };

  const handleBackToHome = () => {
    // Show exit confirmation popup (same as reservation page)
    setShowExitConfirmation(true);
  };

  const handleSaveAndExit = () => {
    // State is already saved via useEffect in reservation page, just navigate
    setShowExitConfirmation(false);
    window.location.href = `/${locale}`;
  };

  const handleConfirmExit = () => {
    // Delete and start over - clear everything including localStorage
    if (storeReservationId) {
      localStorage.removeItem(`reservation-${storeReservationId}`);
    }
    // Explicitly clear the Zustand persisted store BEFORE resetForm
    localStorage.removeItem("reservation-store");
    // Use resetForm to completely clear everything
    const { resetForm } = useReservationStore.getState();
    resetForm();
    setShowExitConfirmation(false);
    window.location.href = `/${locale}`;
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  const handleNewReservation = () => {
    // Clear selections and localStorage when user explicitly starts a new reservation
    clearSelections();
    localStorage.removeItem("savedReservation");
    router.push(`/${locale}`);
  };

  if (!selectedVehicleType || !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t("noReservationFound")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("pleaseCompleteReservation")}
            </p>
            <Button onClick={handleBackToHome}>
              <Home className="w-4 h-4 mr-2" />
              {t("backToHome")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-xl relative dark:bg-gray-800">
            <CardContent className="p-4 sm:p-6">
              {/* Close button in top right */}
              <button
                onClick={handleCancelExit}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t("cancel")}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pr-8">
                {t("saveYourReservation")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("unsavedSelections")}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveAndExit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {t("saveAndExit")}
                </Button>
                <Button
                  onClick={handleConfirmExit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {t("deleteAndStartOver")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToHome}
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t("backToHome")}</span>
              </Button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {t("title")}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Reservation Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Category Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        {t("vehicleCategory")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/reservation`)}
                        className="w-full sm:w-auto"
                      >
                        {t("modify")}
                      </Button>
                    </div>
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      {/* Vehicle Image */}
                      <div className="relative w-16 h-12 sm:w-24 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                        {!imageError && selectedVehicleType.image ? (
                          <img
                            src={selectedVehicleType.image}
                            alt={selectedVehicleType.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : !imageError ? (
                          <img
                            src={
                              selectedVehicleType.id === "car"
                                ? "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                : "https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                            }
                            alt={selectedVehicleType.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Car className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Vehicle Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
                          {selectedVehicleType?.name}
                        </h4>
                        {selectedVehicleType?.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {getTranslatedVehicleDescription(
                              selectedVehicleType.id,
                              selectedVehicleType.description,
                              (key: string) => {
                                try {
                                  return tFleet(key) || undefined;
                                } catch {
                                  return undefined;
                                }
                              },
                            )}
                          </p>
                        )}

                        {/* Passenger Limit with Icon */}
                        {(selectedVehicleType.minPassengers ||
                          selectedVehicleType.maxPassengers) && (
                          <div className="flex items-center space-x-1.5 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md w-fit">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className="font-medium">
                              {selectedVehicleType.minPassengers || 1} -{" "}
                              {selectedVehicleType.maxPassengers || 8}{" "}
                              {t("passengers")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Service Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                        {t("serviceDetails")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/reservation`)}
                        className="w-full sm:w-auto"
                      >
                        {t("modify")}
                      </Button>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {getTranslatedServiceName(
                          selectedService.id,
                          selectedService.name,
                          (key: string) => {
                            try {
                              return tServices(key) || undefined;
                            } catch {
                              return undefined;
                            }
                          },
                        )}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {selectedService.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {selectedService.duration && (
                          <span>
                            {t("duration")}: {selectedService.duration}
                          </span>
                        )}
                        {selectedService.priceRange && (
                          <span>
                            {t("priceRange")}: {selectedService.priceRange}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Trip Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                        {t("tripDetails")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/reservation`)}
                        className="w-full sm:w-auto"
                      >
                        {t("modify")}
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {t("date")}
                          </p>
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {formData.date || t("notAvailable")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {t("time")}
                          </p>
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {formData.time || t("notAvailable")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {t("passengers")}
                          </p>
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                            {formData.passengers || t("notAvailable")}
                          </p>
                        </div>
                      </div>
                      {pickupLocationName && (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {t("pdf.from") || "From"}
                            </p>
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                              {pickupLocationName}
                            </p>
                          </div>
                        </div>
                      )}
                      {destinationLocationName && (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {t("pdf.to") || "To"}
                            </p>
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                              {destinationLocationName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Service Details - Show service-specific fields */}
              {selectedService && Object.keys(serviceSubData).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                          {t("serviceDetails")}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${locale}/reservation`)}
                          className="w-full sm:w-auto"
                        >
                          {t("modify")}
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(serviceSubData).map(([key, value]) => {
                          // Skip null, undefined, or empty string values
                          if (value === null || value === undefined || value === "") {
                            return null;
                          }
                          
                          const fieldLabel = key
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1),
                            )
                            .join(" ");
                          
                          // Format value based on type
                          let displayValue = String(value);
                          if (key === "return_trip") {
                            displayValue = value === true ? "Yes" : "No";
                          } else if (typeof value === "boolean") {
                            displayValue = value ? "Yes" : "No";
                          }
                          
                          return (
                            <div
                              key={key}
                              className="flex items-center space-x-3"
                            >
                              <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {fieldLabel}
                                </p>
                                <p className="font-medium text-gray-900 dark:text-gray-100 break-words">
                                  {displayValue}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600 dark:text-orange-400" />
                        {t("contactInfo")}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/reservation`)}
                        className="w-full sm:w-auto"
                      >
                        {t("modify")}
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("name")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formData.firstName} {formData.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("email")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formData.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("phone")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formData.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("passengers")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formData.passengers}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Additional Services - Always show if any are selected */}
              {(additionalServices.babySeats > 0 ||
                additionalServices.boosters > 0 ||
                additionalServices.meetAndGreet) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {t("additionalServices")}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/${locale}/reservation`)}
                          className="w-full sm:w-auto"
                        >
                          {t("modify")}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {additionalServices.babySeats > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-900 dark:text-gray-100">
                              {t("babySeats")} ({additionalServices.babySeats})
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                        {additionalServices.boosters > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-900 dark:text-gray-100">
                              {t("boosterSeats")} ({additionalServices.boosters}
                              )
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                        {additionalServices.meetAndGreet && (
                          <div className="flex justify-between">
                            <span className="text-gray-900 dark:text-gray-100">
                              {t("meetAndGreet")}
                            </span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Notes */}
              {formData.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                        {t("specialRequests")}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {formData.notes}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Summary and Actions */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-8 space-y-6"
              >
                {/* Price Summary - Always show for all services */}
                {selectedService && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                        {t("priceSummary")}
                      </h3>
                      {priceLoading ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t("loadingPrice")}
                        </div>
                      ) : basePrice !== null && basePrice > 0 ? (
                        <div className="space-y-2">
                          {selectedService.id === "disneyland" && serviceSubData?.return_trip === true && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {t("basePrice")}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  €{(basePrice / 2).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {t("returnTrip")}
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  €{(basePrice / 2).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                          {(!selectedService.id || selectedService.id !== "disneyland" || !serviceSubData?.return_trip) && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t("basePrice")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                €{basePrice.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="border-t dark:border-gray-700 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-900 dark:text-gray-100">
                                {t("total")}
                              </span>
                              <span className="text-gray-900 dark:text-gray-100">
                                €{basePrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {pickupLocation && destinationLocation
                            ? t("quoteRequest") || "Quote Request"
                            : t("selectPickupDestination")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Additional Services Info - Always free */}
                {(additionalServices.babySeats > 0 ||
                  additionalServices.boosters > 0 ||
                  additionalServices.meetAndGreet) && (
                  <Card>
                    <CardContent className="p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                        {t("additionalServicesFree")}
                      </h3>
                      <div className="space-y-2">
                        {additionalServices.babySeats > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("babySeats")} ({additionalServices.babySeats})
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                        {additionalServices.boosters > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("boosterSeats")} ({additionalServices.boosters}
                              )
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                        {additionalServices.meetAndGreet && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t("meetAndGreet")}
                            </span>
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {t("free")}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        onClick={handleSubmitReservation}
                        disabled={isSubmitting || isSubmitted}
                        className={`w-full ${
                          selectedService?.id !== "airport-transfers" &&
                          basePrice === null
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : ""
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            {t("submitting")}
                          </>
                        ) : isSubmitted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {t("submittedSuccessfullyButton")}
                          </>
                        ) : selectedService?.id !== "airport-transfers" &&
                          basePrice === null ? (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            {t("askForQuote")}
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            {t("submitReservation")}
                          </>
                        )}
                      </Button>

                      {isSubmitted && (
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleDownloadPDF}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t("downloadPDF")}
                        </Button>
                      )}

                      {isSubmitted && (
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={handleNewReservation}
                          className="w-full"
                        >
                          {t("makeNewReservation")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

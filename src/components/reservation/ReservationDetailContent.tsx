"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  FileText,
  Lock,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Send,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Client } from "@/components/models/clients";
import type { Reservation, ReservationStatus } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  downloadReservationPDF,
  type ReservationPDFData,
} from "@/lib/pdfUtils";
import {
  getClientById,
  updateReservation,
  updateReservationStatus,
} from "@/lib/supabaseService";
import {
  getTranslatedServiceName,
  getTranslatedVehicleDescription,
  getTranslatedFieldLabel,
} from "@/lib/translations";
import { useServiceFields } from "@/hooks/useServiceFields";

interface ReservationDetailContentProps {
  reservation: Reservation;
  client: Client | null;
  service: any;
  vehicleType: any;
  isAdminUser: boolean;
  onRefetch: () => void;
  onClose?: () => void; // For modal close
  disableAnimations?: boolean; // Disable animations when in modal
}

export function ReservationDetailContent({
  reservation,
  client,
  service,
  vehicleType,
  isAdminUser,
  onRefetch,
  onClose,
  disableAnimations = false,
}: ReservationDetailContentProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("confirmation");
  const tServices = useTranslations("services");
  const tFleet = useTranslations("fleet");
  const tStatus = useTranslations("reservationStatus");
  const tStep2 = useTranslations("reservation.step2");
  
  // Fetch service fields to get labels for serviceSubData
  const { data: serviceFields = [] } = useServiceFields(service?.id);

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState(reservation.totalPrice.toString());
  const [loading, setLoading] = useState(false);
  const [showSecretLogin, setShowSecretLogin] = useState(false);
  const [secretLoginClicks, setSecretLoginClicks] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Initialize edited price when reservation changes
  useEffect(() => {
    setEditedPrice(reservation.totalPrice.toString());
  }, [reservation.totalPrice]);

  // Copy address to clipboard
  const handleCopyAddress = async (address: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(identifier);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Open address in maps
  const handleOpenInMaps = (address: string) => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use device-specific map apps
      const encodedAddress = encodeURIComponent(address);
      // Try Google Maps first (works on both iOS and Android)
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    } else {
      // Desktop: open in new tab with Google Maps
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    }
  };

  // Check if a field is an address field
  const isAddressField = (field: any, fieldKey: string): boolean => {
    if (!field) {
      // Check by field key name
      return fieldKey.toLowerCase().includes("address") || 
             fieldKey.toLowerCase().includes("location");
    }
    // Check by field type
    return field.fieldType === "address_autocomplete" || 
           field.fieldType === "location_select" ||
           fieldKey.toLowerCase().includes("address");
  };

  const handleSecretLoginClick = () => {
    setSecretLoginClicks((prev) => prev + 1);
    if (secretLoginClicks >= 4) {
      setShowSecretLogin(true);
    }
  };

  const handleSavePrice = async () => {
    if (!reservation || !editedPrice) return;
    
    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Please enter a valid price");
      return;
    }
    
    setLoading(true);
    try {
      await updateReservation(reservation.id, {
        totalPrice: newPrice,
      });
      setIsEditingPrice(false);
      onRefetch();
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    if (!reservation || !client) return;
    
    const newPrice = parseFloat(editedPrice);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Please enter a valid price greater than 0");
      return;
    }
    
    setLoading(true);
    try {
      const { sendQuoteToCustomer } = await import("@/lib/adminReservationService");
      await sendQuoteToCustomer(reservation.id, newPrice);
      setIsEditingPrice(false);
      onRefetch();
      alert("Quote sent successfully!");
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Failed to send quote");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async () => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "quote_accepted" as ReservationStatus);
      
      import("@/lib/reservationEmailService")
        .then(({ sendAdminQuoteAcceptedNotification }) => {
          sendAdminQuoteAcceptedNotification(reservation.id).catch((err: Error) => {
            console.error("Failed to send admin notification:", err);
          });
        })
        .catch((err: Error) => {
          console.error("Failed to load email service:", err);
        });
      
      onRefetch();
      alert("Quote accepted! The admin will confirm your reservation shortly.");
    } catch (error) {
      console.error("Error accepting quote:", error);
      alert("Failed to accept quote");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineQuote = async () => {
    if (!reservation) return;
    
    if (!confirm("Are you sure you want to decline this quote?")) return;
    
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "cancelled" as ReservationStatus);
      
      import("@/lib/reservationEmailService")
        .then(({ sendAdminQuoteDeclinedNotification }) => {
          sendAdminQuoteDeclinedNotification(reservation.id).catch((err: Error) => {
            console.error("Failed to send admin notification:", err);
          });
        })
        .catch((err: Error) => {
          console.error("Failed to load email service:", err);
        });
      
      onRefetch();
      alert("Quote declined. Reservation cancelled.");
    } catch (error) {
      console.error("Error declining quote:", error);
      alert("Failed to decline quote");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      const { confirmReservation } = await import("@/lib/adminReservationService");
      await confirmReservation(reservation.id);
      onRefetch();
      alert("Reservation confirmed! Confirmation email with PDF has been sent to the client.");
    } catch (error) {
      console.error("Error confirming reservation:", error);
      alert("Failed to confirm reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!reservation) return;
    
    if (!confirm("Are you sure you want to cancel this reservation?")) return;
    
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "cancelled" as ReservationStatus);
      onRefetch();
      alert("Reservation cancelled.");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Failed to cancel reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!reservation) return;
    
    setLoading(true);
    try {
      const { markReservationComplete } = await import("@/lib/adminReservationService");
      await markReservationComplete(reservation.id);
      onRefetch();
      alert("Reservation marked as completed! Completion email with review link has been sent to the client.");
    } catch (error) {
      console.error("Error marking complete:", error);
      alert("Failed to mark as complete");
    } finally {
      setLoading(false);
    }
  };

  const getPDFData = (): ReservationPDFData | null => {
    if (!reservation || !client || !service || !vehicleType) return null;

    return {
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
      serviceSubData: reservation.serviceSubData || undefined,
    };
  };

  const getPDFTranslations = () => {
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
    const pdfData = getPDFData();
    if (!pdfData) {
      alert(t("failedToDownloadPDF") || "Failed to prepare PDF data");
      return;
    }

    try {
      const pdfTranslations = getPDFTranslations();
      await downloadReservationPDF(pdfData, pdfTranslations);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(
        t("failedToDownloadPDF") || "Failed to download PDF. Please try again.",
      );
    }
  };

  // Use regular div if animations are disabled, otherwise use motion.div
  const AnimatedDiv = disableAnimations ? "div" : motion.div;
  const animationProps = disableAnimations
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      };

  return (
    <div className="space-y-6">
      {/* Status Badge - Prominent */}
      <AnimatedDiv
        {...(disableAnimations ? {} : { transition: { delay: 0.1 } })}
        {...animationProps}
      >
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t("reservationStatus") || "Reservation Status"}
                </h2>
                <div onClick={handleSecretLoginClick} className="cursor-pointer inline-block">
                  <StatusBadge status={reservation.status as any} className="text-lg px-4 py-2" />
                </div>
              </div>
              {showSecretLogin && !isAdminUser && (
                <Button
                  onClick={() => router.push(`/${locale}/admin/login`)}
                  variant="outline"
                  size="sm"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </Button>
              )}
            </div>
            </CardContent>
          </Card>
      </AnimatedDiv>

      {/* Price Summary - Top for Clients */}
      {!isAdminUser && (
        <AnimatedDiv
          {...(disableAnimations ? {} : { transition: { delay: 0.12 } })}
          {...animationProps}
        >
          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                {t("priceSummary") || "Price Summary"}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {t("total") || "Total"}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  €{reservation.totalPrice.toFixed(2)}
                </span>
              </div>
              </CardContent>
            </Card>
        </AnimatedDiv>
      )}

      {/* Admin Actions - Contextual Buttons */}
      {isAdminUser && (
        <AnimatedDiv
          {...(disableAnimations ? {} : { transition: { delay: 0.15 } })}
          {...animationProps}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {reservation.status === "quote_requested" && (
                  <>
                    {isEditingPrice ? (
                      <>
                        <div className="flex-1 min-w-[200px]">
                          <Input
                            type="number"
                            step="0.01"
                            value={editedPrice}
                            onChange={(e) => setEditedPrice(e.target.value)}
                            placeholder="Enter price"
                            className="w-full"
                          />
                        </div>
                        <Button
                          onClick={handleSavePrice}
                          disabled={loading}
                          variant="primary"
                        >
                          {loading ? "Saving..." : "Save Price"}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditingPrice(false);
                            setEditedPrice(reservation.totalPrice.toString());
                          }}
                          variant="outline"
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => setIsEditingPrice(true)}
                          variant="outline"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Price
                        </Button>
                        {parseFloat(editedPrice) > 0 && (
                          <Button
                            onClick={handleSendQuote}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {loading ? "Sending..." : "Send Quote"}
                          </Button>
                        )}
                      </>
                    )}
                  </>
                )}
                {reservation.status === "quote_accepted" && (
                  <>
                    <Button
                      onClick={handleConfirmReservation}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {loading ? "Confirming..." : "Confirm Reservation"}
                    </Button>
                    <Button
                      onClick={handleCancelReservation}
                      disabled={loading}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {reservation.status === "pending" && (
                  <>
                    <Button
                      onClick={handleConfirmReservation}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {loading ? "Confirming..." : "Confirm"}
                    </Button>
                    <Button
                      onClick={handleCancelReservation}
                      disabled={loading}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {reservation.status === "confirmed" && (
                  <>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {loading ? "Updating..." : "Mark Complete"}
                    </Button>
                    <Button
                      onClick={handleCancelReservation}
                      disabled={loading}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
              </CardContent>
            </Card>
        </AnimatedDiv>
      )}

      {/* User Actions for Quotes */}
      {!isAdminUser && reservation.status === "quote_sent" && (
        <AnimatedDiv
          {...(disableAnimations ? {} : { transition: { delay: 0.15 } })}
          {...animationProps}
        >
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Quote Response
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleAcceptQuote}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[150px]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? "Processing..." : "Accept Quote"}
                </Button>
                <Button
                  onClick={handleDeclineQuote}
                  disabled={loading}
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50 flex-1 min-w-[150px]"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedDiv>
      )}

      {/* All Information in One View - Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Vehicle Category */}
          {vehicleType && (
            <AnimatedDiv
              {...(disableAnimations ? {} : { transition: { delay: 0.2 } })}
              {...animationProps}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <Car className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    {t("vehicleCategory") || "Vehicle Category"}
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {vehicleType.image && (
                      <div className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={vehicleType.image}
                          alt={vehicleType.name}
                          fill
                          className="object-cover"
                          onError={() => {}}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {vehicleType.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getTranslatedVehicleDescription(
                          vehicleType.id,
                          vehicleType.description || "",
                          (key: string) => {
                            try {
                              return tFleet(key) || undefined;
                            } catch {
                              return undefined;
                            }
                          },
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {vehicleType.minPassengers}-{vehicleType.maxPassengers}{" "}
                        {t("passengers") || "passengers"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          )}

          {/* Service Details */}
          {service && (
            <AnimatedDiv
              {...(disableAnimations ? {} : { transition: { delay: 0.25 } })}
              {...animationProps}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                    {t("serviceDetails") || "Service Details"}
                  </h3>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {getTranslatedServiceName(
                        service.id,
                        service.name,
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
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          )}

          {/* Trip Details */}
          <AnimatedDiv
            {...(disableAnimations ? {} : { transition: { delay: 0.3 } })}
            {...animationProps}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {t("tripDetails") || "Trip Details"}
                </h3>
                <div className="space-y-4">
                  {/* Basic Trip Information */}
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("date")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {reservation.date || t("notAvailable")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("time")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {reservation.time || t("notAvailable")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {t("pickup") || "Pickup"}
                        </p>
                        <div className="flex items-start gap-2">
                          <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words flex-1">
                            {reservation.pickupLocation || t("notAvailable")}
                          </p>
                          {reservation.pickupLocation && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAddress(reservation.pickupLocation, "pickup-location");
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Copy address"
                              >
                                <Copy className={`w-4 h-4 ${copiedAddress === "pickup-location" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInMaps(reservation.pickupLocation);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Open in maps"
                              >
                                <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {reservation.destinationLocation && (
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {t("destination") || "Destination"}
                          </p>
                          <div className="flex items-start gap-2">
                            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words flex-1">
                              {reservation.destinationLocation}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyAddress(reservation.destinationLocation!, "destination-location");
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Copy address"
                              >
                                <Copy className={`w-4 h-4 ${copiedAddress === "destination-location" ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInMaps(reservation.destinationLocation!);
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Open in maps"
                              >
                                <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("passengers")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {reservation.passengers || t("notAvailable")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Service-Specific Fields */}
                  {reservation.serviceSubData && Object.keys(reservation.serviceSubData).length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        {tStep2("serviceDetails") || "Service Details"}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                        {Object.entries(reservation.serviceSubData)
                          .filter(([key, value]) => {
                            // Filter out hidden fields and empty values
                            if (!value || value === "" || value === null || value === undefined) return false;
                            const field = serviceFields.find((f) => f.fieldKey === key);
                            if (field && (field.isPickup || field.isDestination)) return false; // Skip pickup/destination as they're already shown
                            return true;
                          })
                          .map(([key, value]) => {
                            const field = serviceFields.find((f) => f.fieldKey === key);
                            const label = field 
                              ? getTranslatedFieldLabel(field.label, (k: string) => tStep2(k))
                              : key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                            
                            // Format value based on type
                            let displayValue = String(value);
                            if (typeof value === "boolean") {
                              displayValue = value ? "Yes" : "No";
                            } else if (typeof value === "object") {
                              displayValue = JSON.stringify(value);
                            }
                            
                            const isAddress = isAddressField(field, key);
                            const fieldIdentifier = `service-field-${key}`;
                            
                            return (
                              <div key={key} className="flex items-start space-x-2 sm:space-x-3">
                                {isAddress ? (
                                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                                ) : (
                                  <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    {label}
                                  </p>
                                  <div className="flex items-start gap-2">
                                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words flex-1">
                                      {displayValue}
                                    </p>
                                    {isAddress && displayValue && displayValue !== "Yes" && displayValue !== "No" && (
                                      <div className="flex gap-1 flex-shrink-0">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyAddress(displayValue, fieldIdentifier);
                                          }}
                                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                          title="Copy address"
                                        >
                                          <Copy className={`w-4 h-4 ${copiedAddress === fieldIdentifier ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`} />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenInMaps(displayValue);
                                          }}
                                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                          title="Open in maps"
                                        >
                                          <Navigation className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Additional Services */}
                  {(reservation.babySeats > 0 ||
                    reservation.boosterSeats > 0 ||
                    reservation.meetAndGreet) && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        {t("additionalServices") || "Additional Services"}
                      </h4>
                      <div className="space-y-2">
                        {reservation.babySeats > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t("babySeats") || "Baby Seats"}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {reservation.babySeats}
                            </span>
                          </div>
                        )}
                        {reservation.boosterSeats > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t("boosterSeats") || "Booster Seats"}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {reservation.boosterSeats}
                            </span>
                          </div>
                        )}
                        {reservation.meetAndGreet && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {t("meetAndGreet") || "Meet & Greet"}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {t("included") || "Included"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {reservation.notes && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {t("specialRequests") || "Special Requests / Notes"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reservation.notes}
                      </p>
                    </div>
                  )}
                </div>
                </CardContent>
              </Card>
          </AnimatedDiv>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          {client && (
            <AnimatedDiv
              {...(disableAnimations ? {} : { transition: { delay: 0.35 } })}
              {...animationProps}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    {t("contactInfo") || "Contact Information"}
                  </h3>
                  <div className="grid sm:grid-cols-1 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("name")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {client.firstName} {client.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("email")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {t("phone")}
                        </p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 break-words">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          )}

          {/* Price Summary - For Admin */}
          {isAdminUser && (
            <AnimatedDiv
              {...(disableAnimations ? {} : { transition: { delay: 0.4 } })}
              {...animationProps}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                    {t("priceSummary") || "Price Summary"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("total") || "Total"}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      €{reservation.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </AnimatedDiv>
          )}
        </div>
      </div>
    </div>
  );
}


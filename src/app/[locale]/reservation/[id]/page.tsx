"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Download, 
  Home, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  FileText,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useReservation } from "@/hooks/useReservation";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { getClientById } from "@/lib/supabaseService";
import { downloadReservationPDF, type ReservationPDFData } from "@/lib/pdfUtils";
import { getTranslatedServiceName, getTranslatedVehicleDescription } from "@/lib/translations";
import type { Client } from "@/components/models/clients";
import { StatusBadge } from "@/components/admin/StatusBadge";
import Image from "next/image";

export default function ReservationStatusPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("confirmation");
  const tServices = useTranslations("services");
  const tFleet = useTranslations("fleet");
  const tStatus = useTranslations("reservationStatus");

  const reservationId = params.id as string;
  const { data: reservation, isLoading, error } = useReservation(reservationId);
  const { data: services = [] } = useServices();
  const { data: vehicleTypes = [] } = useVehicleTypes();
  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);

  // Fetch client data when reservation is loaded
  useEffect(() => {
    if (reservation?.clientId) {
      setLoadingClient(true);
      getClientById(reservation.clientId)
        .then(setClient)
        .catch(console.error)
        .finally(() => setLoadingClient(false));
    }
  }, [reservation?.clientId]);

  // Get related service and vehicle type
  const service = reservation ? services.find(s => s.id === reservation.serviceId) : null;
  const vehicleType = reservation ? vehicleTypes.find(v => v.id === reservation.vehicleTypeId) : null;

  // Prepare PDF data
  const getPDFData = (): ReservationPDFData | null => {
    if (!reservation || !service || !vehicleType || !client) return null;

    return {
      reservationId: reservation.id,
      customerName: `${client.firstName} ${client.lastName}`,
      customerEmail: client.email,
      customerPhone: client.phone,
      vehicleTypeName: vehicleType.name,
      vehicleTypeDescription: vehicleType.description || '',
      serviceName: service.name,
      serviceDescription: service.description,
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
      console.error('Error downloading PDF:', error);
      alert(t("failedToDownloadPDF") || "Failed to download PDF. Please try again.");
    }
  };

  // Loading state
  if (isLoading || loadingClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {tStatus("loading") || "Loading reservation..."}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we fetch your reservation details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error or not found state
  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {tStatus("notFound") || "Reservation not found"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error 
                ? (tStatus("error") || "Error loading reservation")
                : "The reservation you're looking for doesn't exist or has been removed."
              }
            </p>
            <Button onClick={() => router.push(`/${locale}`)} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              {t("backToHome") || "Back to Home"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tStatus("title") || "Reservation Status"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("reservationId")}: <span className="font-mono text-xs">{reservation.id.slice(0, 8)}...</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("downloadPDF") || "Download PDF"}
              </Button>
              <Button
                onClick={() => router.push(`/${locale}`)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("backToHome") || "Back to Home"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {t("reservationStatus") || "Reservation Status"}
                    </h2>
                    <StatusBadge status={reservation.status as any} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vehicle Category */}
          {vehicleType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
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
                        {getTranslatedVehicleDescription(vehicleType.id, vehicleType.description || '', (key: string) => {
                          try {
                            return tFleet(key) || undefined;
                          } catch {
                            return undefined;
                          }
                        })}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {vehicleType.minPassengers}-{vehicleType.maxPassengers} {t("passengers") || "passengers"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Service Details */}
          {service && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                    {t("serviceDetails") || "Service Details"}
                  </h3>
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {getTranslatedServiceName(service.id, service.name, (key: string) => {
                        try {
                          return tServices(key) || undefined;
                        } catch {
                          return undefined;
                        }
                      })}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {service.duration && <span>{t("duration")}: {service.duration}</span>}
                      {service.priceRange && <span>{t("priceRange")}: {service.priceRange}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Trip Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {t("tripDetails") || "Trip Details"}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("date")}</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {reservation.date || t("notAvailable")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("time")}</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {reservation.time || t("notAvailable")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("pickup") || "Pickup"}</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {reservation.pickupLocation || t("notAvailable")}
                      </p>
                    </div>
                  </div>
                  {reservation.destinationLocation && (
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("destination") || "Destination"}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {reservation.destinationLocation}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Users className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("passengers")}</p>
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                        {reservation.passengers || t("notAvailable")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          {client && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    {t("contactInfo") || "Contact Information"}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("name")}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {client.firstName} {client.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("email")}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {client.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("phone")}</p>
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {client.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Additional Services */}
          {(reservation.babySeats > 0 || reservation.boosterSeats > 0 || reservation.meetAndGreet) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600 dark:text-orange-400" />
                    {t("additionalServices") || "Additional Services"}
                  </h3>
                  <div className="space-y-2">
                    {reservation.babySeats > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t("babySeats")}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {reservation.babySeats} {t("free") || "Free"}
                        </span>
                      </div>
                    )}
                    {reservation.boosterSeats > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t("boosterSeats")}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {reservation.boosterSeats} {t("free") || "Free"}
                        </span>
                      </div>
                    )}
                    {reservation.meetAndGreet && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t("meetAndGreet")}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{t("free") || "Free"}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Price Summary */}
          {reservation.totalPrice > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                    {t("priceSummary") || "Price Summary"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("total") || "Total"}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      €{reservation.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Notes */}
          {reservation.notes && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    {t("specialRequests") || "Special Requests"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {reservation.notes}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}


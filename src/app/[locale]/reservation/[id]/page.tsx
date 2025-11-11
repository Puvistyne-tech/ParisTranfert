"use client";

import {
  AlertCircle,
  Download,
  Home,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ReservationDetailContent } from "@/components/reservation/ReservationDetailContent";
import type { Client } from "@/components/models/clients";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useReservation } from "@/hooks/useReservation";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getClientById } from "@/lib/supabaseService";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("confirmation");
  const tServices = useTranslations("services");
  const tFleet = useTranslations("fleet");
  const tStatus = useTranslations("reservationStatus");

  const reservationId = params.id as string;
  const { data: reservation, isLoading, error, refetch } = useReservation(reservationId);
  const { data: services = [] } = useServices();
  const { data: vehicleTypes = [] } = useVehicleTypes();
  
  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check admin status on page load
  useEffect(() => {
    const checkAdminStatus = async () => {
      setCheckingAdmin(true);
      try {
        const user = await getCurrentUser();
        const admin = await isAdmin();
        setIsAdminUser(admin && !!user);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdminUser(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

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
  const service = reservation
    ? services.find((s) => s.id === reservation.serviceId)
    : null;
  const vehicleType = reservation
    ? vehicleTypes.find((v) => v.id === reservation.vehicleTypeId)
    : null;

  // If admin, redirect to admin panel (they should use modal instead)
  useEffect(() => {
    if (!checkingAdmin && isAdminUser) {
      // Admin should use modal in admin panel, but allow viewing as page too
      // Just log for now - we'll handle this in admin pages
    }
  }, [isAdminUser, checkingAdmin]);

  // Loading state
  if (isLoading || loadingClient || checkingAdmin) {
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
                ? tStatus("error") || "Error loading reservation"
                : "The reservation you're looking for doesn't exist or has been removed."}
            </p>
            <Button
              onClick={() => router.push(`/${locale}`)}
              className="w-full"
            >
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
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {tStatus("title") || "Reservation Status"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("reservationId")}:{" "}
                <span className="font-mono text-xs">{reservation.id}</span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => router.push(`/${locale}`)}
                variant="outline"
                size="sm"
              >
                <Home className="w-4 h-4 mr-2" />
                {t("backToHome") || "Back to Home"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ReservationDetailContent
          reservation={reservation}
          client={client}
          service={service || undefined}
          vehicleType={vehicleType || undefined}
          isAdminUser={isAdminUser}
          onRefetch={refetch}
        />
      </div>
    </div>
  );
}

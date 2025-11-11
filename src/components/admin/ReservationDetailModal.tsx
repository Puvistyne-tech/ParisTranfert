"use client";

import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Client } from "@/components/models/clients";
import { ReservationDetailContent } from "@/components/reservation/ReservationDetailContent";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useReservation } from "@/hooks/useReservation";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { getClientById } from "@/lib/supabaseService";

interface ReservationDetailModalProps {
  reservationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationDetailModal({
  reservationId,
  isOpen,
  onClose,
}: ReservationDetailModalProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("confirmation");
  const tStatus = useTranslations("reservationStatus");

  const { data: reservation, isLoading, error, refetch } = useReservation(
    reservationId || "",
  );
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
        .catch((err) => {
          console.error("Error fetching client:", err);
          setClient(null);
        })
        .finally(() => setLoadingClient(false));
    }
  }, [reservation?.clientId]);

  // Find service and vehicle type
  const service = reservation
    ? services.find((s) => s.id === reservation.serviceId)
    : null;
  const vehicleType = reservation
    ? vehicleTypes.find((v) => v.id === reservation.vehicleTypeId)
    : null;

  if (!isOpen || !reservationId) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Reservation Details (Admin)"
      size="xl"
      >
      {isLoading || loadingClient ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading reservation...
          </span>
        </div>
      ) : error || !reservation ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error
              ? tStatus("error") || "Error loading reservation"
              : tStatus("notFound") || "Reservation not found"}
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
                </div>
              ) : (
                <div>
          {/* Header with reservation ID and status */}
          <div className="mb-6 pb-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("reservationId")}:{" "}
                <span className="font-mono text-xs">{reservation.id}</span>
              </p>
              <StatusBadge status={reservation.status as any} />
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  router.push(`/${locale}/reservation/${reservation.id}`);
                  onClose();
                }}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("downloadPDF") || "Download PDF"}
              </Button>
          </div>
          </div>

          {/* Reservation Detail Content */}
          <ReservationDetailContent
            reservation={reservation}
            client={client}
            service={service || undefined}
            vehicleType={vehicleType || undefined}
            isAdminUser={true}
            onRefetch={refetch}
            onClose={onClose}
            disableAnimations={true}
          />
        </div>
      )}
    </Dialog>
  );
}

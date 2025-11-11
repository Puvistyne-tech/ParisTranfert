"use client";

import { Baby, Car, Image as ImageIcon, UserCheck, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { Service } from "@/components/models";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  getTranslatedServiceName,
  getTranslatedVehicleDescription,
} from "@/lib/translations";
import type { AdditionalServices } from "@/store/reservationStore";

interface Step3BookingSummaryProps {
  selectedVehicleType: VehicleType | null;
  selectedService: Service | null;
  additionalServices: AdditionalServices;
  basePrice: number | null;
  priceLoading: boolean;
  isFormValid: () => boolean;
  onSubmit: () => void;
  // Add form data dependencies to make validation reactive
  formData: Record<string, any>;
  serviceSubData: Record<string, any>;
}

export function Step3BookingSummary({
  selectedVehicleType,
  selectedService,
  additionalServices,
  basePrice,
  priceLoading,
  isFormValid,
  onSubmit,
  formData,
  serviceSubData,
}: Step3BookingSummaryProps) {
  const t = useTranslations("reservation.step3");
  const tFleet = useTranslations("fleet");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const [formValid, setFormValid] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Update validation status only when form data actually changes
  // This prevents infinite loops by depending on actual data, not the function reference
  useEffect(() => {
    const valid = isFormValid();
    setFormValid(valid);
  }, [
    // Depend on actual form data, not the function reference
    formData.firstName,
    formData.lastName,
    formData.email,
    formData.phone,
    formData.date,
    formData.time,
    formData.passengers,
    selectedVehicleType,
    selectedService,
    serviceSubData,
    additionalServices,
  ]);

  // Reset image error when vehicle type changes
  useEffect(() => {
    setImageError(false);
  }, [selectedVehicleType?.id]);

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("bookingSummary")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please verify your information before confirming
            </p>
          </div>

          {selectedVehicleType && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                {t("vehicleType")}
              </h4>
              <div className="flex items-start space-x-4">
                {/* Vehicle Image */}
                <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
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
                  <p className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
                    {selectedVehicleType.name}
                  </p>
                  {selectedVehicleType.description && (
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
            </div>
          )}

          {selectedService && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("service")}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
              </p>
              {selectedService.priceRange && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedService.priceRange}
                </p>
              )}
            </div>
          )}

          {/* Price Breakdown - Only show for airport-transfers */}
          {selectedService?.id === "airport-transfers" && (
            <div className="border-t dark:border-gray-700 pt-4 mb-4">
              {priceLoading ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("loadingPrice")}
                </div>
              ) : basePrice !== null ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("basePrice")}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      €{basePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold mt-4 pt-4 border-t dark:border-gray-700">
                    <span className="text-gray-900 dark:text-gray-100">
                      {t("total")}
                    </span>
                    <span className="text-gray-900 dark:text-gray-100">
                      €{basePrice.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("selectPickupDestination")}
                </div>
              )}
            </div>
          )}

          {/* Additional Services Info - Only for airport-transfers */}
          {selectedService?.id === "airport-transfers" &&
            (additionalServices.babySeats > 0 ||
              additionalServices.boosters > 0 ||
              additionalServices.meetAndGreet) && (
              <div className="border-t dark:border-gray-700 pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {t("additionalServicesFree")}
                </h4>
                {additionalServices.babySeats > 0 && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("babySeats")} ({additionalServices.babySeats})
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t("free")}
                    </span>
                  </div>
                )}
                {additionalServices.boosters > 0 && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("boosterSeats")} ({additionalServices.boosters})
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t("free")}
                    </span>
                  </div>
                )}
                {additionalServices.meetAndGreet && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("meetGreet")}
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {t("free")}
                    </span>
                  </div>
                )}
              </div>
            )}

          <Button size="lg" onClick={onSubmit} className="w-full mt-6">
            {t("confirmBooking")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

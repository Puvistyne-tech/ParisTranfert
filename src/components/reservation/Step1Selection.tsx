"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Car, Baby, Users, UserCheck, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Category } from "@/components/models/categories";
import type { VehicleType } from "@/components/models/vehicleTypes";
import type { Service } from "@/components/models";
import type { AdditionalServices } from "@/store/reservationStore";

interface Step1SelectionProps {
  vehicleTypes: VehicleType[];
  categories: Category[];
  services: Service[];
  selectedVehicleType: VehicleType | null;
  selectedService: Service | null;
  additionalServices: AdditionalServices;
  validationErrors: string[];
  onVehicleTypeSelect: (vehicleType: VehicleType) => void;
  onVehicleTypeModify: () => void;
  onServiceSelect: (service: Service) => void;
  onServiceModify: () => void;
  onAdditionalServicesUpdate: (updates: Partial<AdditionalServices>) => void;
  onContinue: () => void;
}

export function Step1Selection({
  vehicleTypes,
  categories,
  services,
  selectedVehicleType,
  selectedService,
  additionalServices,
  validationErrors,
  onVehicleTypeSelect,
  onVehicleTypeModify,
  onServiceSelect,
  onServiceModify,
  onAdditionalServicesUpdate,
  onContinue,
}: Step1SelectionProps) {
  const t = useTranslations("reservation.step1");
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t("makeReservation")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("selectVehicleService")}
        </p>
      </motion.div>

      {/* Validation Errors at Top */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                    {t("pleaseCompleteSelection")}
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Vehicle Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("selectVehicleType")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("chooseVehicleType")}
              </p>
            </div>

            {selectedVehicleType ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          selectedVehicleType.id === 'car'
                            ? 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                            : 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                        }
                        alt={selectedVehicleType.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-1">
                        {selectedVehicleType.name}
                      </h3>
                      {selectedVehicleType.description && (
                        <p className="text-blue-700 dark:text-blue-400 text-sm mb-2">
                          {selectedVehicleType.description}
                        </p>
                      )}
                      {(selectedVehicleType.minPassengers || selectedVehicleType.maxPassengers) && (
                        <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">
                          {selectedVehicleType.minPassengers || 1}-{selectedVehicleType.maxPassengers || 8} {t("passengers")}
                        </p>
                      )}
                      <p className="text-blue-600 dark:text-blue-400 text-xs italic">
                        {t("youWillReceive", { vehicleType: selectedVehicleType.name.toLowerCase() })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onVehicleTypeModify}
                    className="flex items-center space-x-2"
                  >
                    <span>{t("change")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicleTypes.map((vehicleType) => (
                  <button
                    key={vehicleType.id}
                    onClick={() => onVehicleTypeSelect(vehicleType)}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
                  >
                    <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                      {vehicleType.image ? (
                        <img
                          src={vehicleType.image}
                          alt={vehicleType.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={
                            vehicleType.id === 'car'
                              ? 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                              : 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                          }
                          alt={vehicleType.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mb-2">
                      <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {vehicleType.name}
                      </h3>
                    </div>
                    {vehicleType.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {vehicleType.description}
                      </p>
                    )}
                    {(vehicleType.minPassengers || vehicleType.maxPassengers) && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                        {vehicleType.minPassengers || 1}-{vehicleType.maxPassengers || 8} {t("passengers")}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {t("youWillReceive", { vehicleType: vehicleType.name.toLowerCase() })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("selectService")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("chooseService")}
              </p>
            </div>

            {selectedService ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      {selectedService.name}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 mb-3">
                      {selectedService.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-blue-600 dark:text-blue-400">
                      {selectedService.duration && (
                        <span>{t("duration")}: {selectedService.duration}</span>
                      )}
                      {selectedService.priceRange && (
                        <span>{t("price")}: {selectedService.priceRange}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onServiceModify}
                    className="flex items-center space-x-2"
                  >
                    <span>{t("change")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((category) => {
                  const categoryServices = services.filter(
                    (s) => s.categoryId === category.id && s.isAvailable
                  );
                  if (categoryServices.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {category.name}
                      </h3>
                      {/* Services in uniform width grid for this category */}
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                        {categoryServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => onServiceSelect(service)}
                            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left relative h-full flex flex-col"
                          >
                            {service.isPopular && (
                              <span className="absolute top-2 right-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-1.5 py-0.5 rounded text-xs font-medium">
                                {t("popular")}
                              </span>
                            )}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 pr-8">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 flex-grow">
                              {service.shortDescription}
                            </p>
                            {service.priceRange && (
                              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                {service.priceRange}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Services - Available for all services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("additionalServices")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t("addExtraServices")}
              </p>
            </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Baby className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("babySeats")}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("babySeatsDescription")}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdditionalServicesUpdate({ 
                        babySeats: Math.max(0, additionalServices.babySeats - 1) 
                      })}
                      disabled={additionalServices.babySeats === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {additionalServices.babySeats}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdditionalServicesUpdate({ 
                        babySeats: additionalServices.babySeats + 1 
                      })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("boosterSeats")}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("boosterSeatsDescription")}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdditionalServicesUpdate({ 
                        boosters: Math.max(0, additionalServices.boosters - 1) 
                      })}
                      disabled={additionalServices.boosters === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {additionalServices.boosters}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAdditionalServicesUpdate({ 
                        boosters: additionalServices.boosters + 1 
                      })}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("meetGreet")}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("meetGreetDescription")}</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={additionalServices.meetAndGreet}
                      onChange={(e) => onAdditionalServicesUpdate({
                        meetAndGreet: e.target.checked 
                      })}
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {additionalServices.meetAndGreet ? t("selected") : t("addService")}
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    {t("pleaseCompleteSelection")}
                  </h3>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-red-700 flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <Button
          size="lg"
          onClick={onContinue}
          className="px-8 py-3"
        >
          {t("continueToTripDetails")}
        </Button>
      </motion.div>
    </>
  );
}


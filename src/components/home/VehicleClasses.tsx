"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Crown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useHomePageImages } from "@/hooks/useHomePageImages";
import { useReservationStore } from "@/store/reservationStore";

export function VehicleClasses() {
  const t = useTranslations("home.vehicleClasses");
  const router = useRouter();
  const locale = useLocale();
  const { setSelectedVehicleType } = useReservationStore();

  // Use TanStack Query hook for data fetching with automatic caching
  const { data: vehicleTypes = [], isLoading: loading } = useVehicleTypes();
  const { data: backgroundImages = [] } = useHomePageImages("vehicles");
  const backgroundImage = backgroundImages.length > 0 && backgroundImages[0]?.imageUrl ? backgroundImages[0] : null;

  const handleSelectVehicleType = (vehicleTypeId: string) => {
    // Find the vehicle type object and save it to the store
    const vehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeId);
    if (vehicleType) {
      setSelectedVehicleType(vehicleType);
    }
    // Navigate to reservation page
    router.push(`/${locale}/reservation`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-800 relative overflow-hidden">
      {/* Background Image (if available) */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.imageUrl}
            alt="Vehicles background"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/85 to-cyan-50/90 dark:from-gray-900/80 dark:via-emerald-900/70 dark:to-gray-800/80" />
        </div>
      )}

      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden ${backgroundImage ? "opacity-30" : ""}`}>
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 50, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300/20 dark:bg-teal-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
            {t("title")}
          </h2>
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            {t("loadingVehicleTypes")}
          </div>
        ) : (
          <>
            {/* Vehicle Types Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {vehicleTypes.map((vehicleType, index) => (
                <motion.div
                  key={vehicleType.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="group relative overflow-hidden h-full">
                    <CardContent className="p-0">
                      {/* Background Image */}
                      <div className="relative h-64">
                        {vehicleType.image ? (
                          <Image
                            src={vehicleType.image}
                            alt={vehicleType.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center">
                            {vehicleType.id === "car" ? (
                              <Briefcase className="w-16 h-16 text-white/50" />
                            ) : (
                              <Crown className="w-16 h-16 text-white/50" />
                            )}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Vehicle Type Icon */}
                        <div className="absolute top-6 left-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg">
                            {vehicleType.id === "car" ? (
                              <Briefcase className="text-white text-2xl" />
                            ) : (
                              <Crown className="text-white text-2xl" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">
                            {vehicleType.name}
                          </h3>
                          {vehicleType.description && (
                            <p className="text-white/90 text-lg lg:text-xl xl:text-2xl mb-4">
                              {vehicleType.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="p-6 bg-white dark:bg-gray-800">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full btn-premium group-hover:scale-105 transition-transform duration-300"
                          onClick={() =>
                            handleSelectVehicleType(vehicleType.id)
                          }
                        >
                          {t("bookNow")}
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 text-white">
              {t("needHelpChoosing")}
            </h3>
            <p className="text-base lg:text-lg xl:text-xl text-white/95 mb-6 max-w-2xl mx-auto">
              {t("teamCanHelp")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                onClick={() => router.push(`/${locale}/reservation`)}
              >
                {t("makeReservation")}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-2 border-white hover:bg-white/20 font-semibold"
                onClick={() => router.push(`/${locale}/contact`)}
              >
                {t("contactUs")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

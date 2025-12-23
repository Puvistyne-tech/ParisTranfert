// BriefServices component for home page
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Crown,
  Globe,
  Heart,
  ImageIcon,
  MapPin,
  Plane,
  Shield,
  Star,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { useHomePageImages } from "@/hooks/useHomePageImages";
import type { Service } from "../models";
import { useReservationStore } from "@/store/reservationStore";

export function BriefServices() {
  const t = useTranslations("home.briefServices");
  const tServices = useTranslations("services");
  const router = useRouter();
  const locale = useLocale();
  const { setSelectedService } = useReservationStore();
  const [serviceImageErrors, setServiceImageErrors] = useState<
    Record<string, boolean>
  >({});

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: categories = [] } = useCategories();
  const { data: backgroundImages = [] } = useHomePageImages("services");
  const backgroundImage = backgroundImages.length > 0 && backgroundImages[0]?.imageUrl ? backgroundImages[0] : null;
  const loading = servicesLoading;

  const iconMap: { [key: string]: any } = {
    Plane: Plane,
    Crown: Crown,
    Star: Star,
    Globe: Globe,
    Shield: Shield,
    MapPin: MapPin,
    UserCheck: UserCheck,
    Heart: Heart,
    Calendar: Calendar,
    BookOpen: BookOpen,
  };

  // Get category icon for a service
  const getCategoryIcon = (service: Service) => {
    const category = categories.find((cat) => cat.id === service.categoryId);
    if (!category) return Star;
    // Map category types to icons
    const categoryIconMap: { [key: string]: any } = {
      transport: Plane,
      luxury: Crown,
      tour: Globe,
      security: Shield,
      special: Heart,
    };
    return categoryIconMap[category.categoryType] || Star;
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    router.push(`/${locale}/reservation`);
  };

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 relative overflow-hidden"
    >
      {/* Background Image (if available) */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.imageUrl}
            alt="Services background"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/90 via-blue-50/85 to-indigo-50/90 dark:from-gray-900/80 dark:via-blue-900/70 dark:to-gray-800/80" />
        </div>
      )}

      {/* Animated background elements */}
      <div className={`absolute inset-0 overflow-hidden ${backgroundImage ? "opacity-30" : ""}`}>
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
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
          <p className="text-xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            {t("subtitle")}
          </p>
          <Button
            size="lg"
            onClick={() => router.push(`/${locale}/services`)}
            className="px-8 py-3"
          >
            {t("viewAllServices")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            {t("loadingServices")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service: Service, index: number) => {
              const iconName =
                typeof service.icon === "string"
                  ? service.icon
                  : service.icon;
              const Icon = iconMap[iconName] || Star;
              const CategoryIcon = getCategoryIcon(service);
              const hasImageError = serviceImageErrors[service.id];

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  viewport={{ once: true }}
                >
                  <Card
                    className="group relative p-0 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800 flex flex-col h-full"
                    onClick={() => handleServiceClick(service)}
                  >
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Service Image */}
                      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                        {!hasImageError && service.image ? (
                          <Image
                            src={service.image}
                            alt={service.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() =>
                              setServiceImageErrors((prev) => ({
                                ...prev,
                                [service.id]: true,
                              }))
                            }
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                        {/* Category Icon Badge */}
                        <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
                          <CategoryIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        {/* Popular Badge */}
                        {service.isPopular && (
                          <span className="absolute top-3 right-3 bg-yellow-400 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-950 px-2 py-1 rounded-md text-xs font-semibold shadow-md">
                            {tServices("popular") || "Popular"}
                          </span>
                        )}
                      </div>

                      {/* Service Content */}
                      <div className="p-4 flex flex-col flex-grow">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {service.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">
                          {service.shortDescription}
                        </p>
                        {service.priceRange && (
                          <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {service.priceRange}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400 mb-6">
            {t("needCustomSolution")}
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/${locale}/contact`)}
            className="px-8 py-3"
          >
            {t("contactUsForCustom")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

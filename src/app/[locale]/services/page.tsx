"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { ServiceIcon } from "@/components/models/services";
import { useReservationStore } from "@/store/reservationStore";
import {
  Plane,
  Crown,
  Star,
  Globe,
  Shield,
  MapPin,
  UserCheck,
  Heart,
  Calendar,
  BookOpen,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  const tServices = useTranslations("services");
  const locale = useLocale();
  const router = useRouter();
  const { setSelectedService } = useReservationStore();
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  
  const isLoading = categoriesLoading || servicesLoading;

  // Memoize the icon map to prevent recreation on every render
  const iconMap = useMemo(() => ({
    [ServiceIcon.PLANE]: Plane,
    [ServiceIcon.CROWN]: Crown,
    [ServiceIcon.STAR]: Star,
    [ServiceIcon.GLOBE]: Globe,
    [ServiceIcon.SHIELD]: Shield,
    [ServiceIcon.MAPPIN]: MapPin,
    [ServiceIcon.USERCHECK]: UserCheck,
    [ServiceIcon.HEART]: Heart,
    [ServiceIcon.CALENDAR]: Calendar,
    [ServiceIcon.BOOKOPEN]: BookOpen,
  }), []);

  // Memoize filtered services by category to prevent recalculation
  const servicesByCategory = useMemo(() => {
    return categories.map(category => ({
      ...category,
      services: services.filter(service => service.categoryId === category.id)
    })).filter(category => category.services.length > 0);
  }, [categories, services]);

  const handleBookService = (service: any) => {
    // Save selected service to store
    setSelectedService(service);
    router.push(`/${locale}/reservation`);
  };

  const handleBackToHome = () => {
    // Check if there's a service in the store
    const { selectedService: storeService } = useReservationStore.getState();
    
    if (storeService) {
      // Show confirmation dialog
      setShowExitConfirmation(true);
    } else {
      // No service selected, go directly home
      router.push(`/${locale}`);
    }
  };

  const handleKeepService = () => {
    // Keep the service selection and go home
    setShowExitConfirmation(false);
    router.push(`/${locale}`);
  };

  const handleDeleteService = () => {
    // Clear service selection and go home
    setSelectedService(null);
    setShowExitConfirmation(false);
    router.push(`/${locale}`);
  };

  const handleCancelExit = () => {
    // Cancel the exit and stay on the page
    setShowExitConfirmation(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t("loadingServices")}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t("preparingServices")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToHome")}</span>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
              {t("title")}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Services by Category */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {servicesByCategory.map((category, categoryIndex) => {
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {category.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.services.map((service, serviceIndex) => {
                  const iconName = typeof service.icon === 'string' ? service.icon : service.icon;
                  const Icon = (iconMap as Record<string, any>)[iconName] || Star;

                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      viewport={{ once: true, margin: "-100px" }}
                    >
                      <Card 
                        className="p-0 shadow-lg card-hover h-full flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                        onClick={() => handleBookService(service)}
                      >
                        <CardContent className="text-center flex flex-col h-full relative p-0">
                          {/* Service Image - Full Width */}
                          <div className="w-full h-48 relative overflow-hidden group-hover:scale-105 md:group-hover:scale-105 transition-all duration-300">
                            {service.image ? (
                              <Image
                                src={service.image}
                                alt={service.name}
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                quality={85}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center relative overflow-hidden">
                                {/* Static background pattern - removed animations for performance */}
                                <div className="absolute inset-0 opacity-20">
                                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 rounded-full"></div>
                                  <div className="absolute top-12 right-8 w-6 h-6 bg-white/20 rounded-full"></div>
                                  <div className="absolute bottom-8 left-8 w-4 h-4 bg-white/25 rounded-full"></div>
                                  <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/15 rounded-full"></div>
                                </div>
                                
                                {/* Large beautiful icon */}
                                <div className="relative z-10">
                                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
                                    <Icon className="text-white text-4xl drop-shadow-lg" />
                                  </div>
                                  <div className="text-white/90 text-sm font-medium tracking-wide">
                                    {service.name}
                                  </div>
                                </div>
                                
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            {/* Popular Badge */}
                            {service.isPopular && (
                              <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                                {t("popular")}
                              </div>
                            )}

                            {/* Service Name Overlay */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="bg-gradient-to-r from-blue-500 to-transparent text-white px-2 py-1 rounded text-xs font-semibold">
                                {service.name}
                              </div>
                            </div>
                          </div>

                          {/* Hover Overlay with Book Button - Visible on hover (desktop) and always on mobile */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 md:group-hover:opacity-100 md:transition-opacity duration-300 flex items-center justify-center z-20 pointer-events-none">
                            <Button
                              variant="primary"
                              size="lg"
                              className="btn-premium scale-110 shadow-2xl pointer-events-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookService(service);
                              }}
                            >
                              <Calendar className="w-5 h-5 mr-2" />
                              {t("bookNow")}
                            </Button>
                          </div>
                          
                          {/* Mobile Book Button - Always visible on mobile */}
                          <div className="md:hidden absolute bottom-4 left-4 right-4 z-20">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full btn-premium shadow-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookService(service);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              {t("bookNow")}
                            </Button>
                          </div>

                          {/* Service Info */}
                          <div className="px-4 py-3 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {service.name}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-1">
                              {service.shortDescription}
                            </p>

                            {/* Features */}
                            <div className="space-y-1 text-left mb-3">
                              {Array.isArray(service.features) 
                                ? service.features.slice(0, 3).map((feature: any, featureIndex: number) => (
                                <div
                                  key={featureIndex}
                                  className="flex items-center text-xs text-gray-500 dark:text-gray-400"
                                >
                                  <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full mr-2"></span>
                                      <span>{typeof feature === 'string' ? feature : JSON.stringify(feature)}</span>
                                </div>
                                  ))
                                : null}
                            </div>

                            {/* Price */}
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {service.priceRange}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {service.duration}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("saveServiceSelection")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t("selectedServiceMessage")}
              </p>
            </div>

            {/* Current Selection Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t("currentSelection")}</h4>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                <span>{t("service")}: {useReservationStore.getState().selectedService?.name}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleKeepService}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{t("keepGoHome")}</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleDeleteService}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t("deleteStartFresh")}</span>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={handleCancelExit}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {t("cancel")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
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
  MapPin,
  Plane,
  Shield,
  Star,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import type { Service } from "../models";
import type { Category } from "../models/categories";

export function BriefServices() {
  const t = useTranslations("home.briefServices");
  const tServices = useTranslations("services");
  const router = useRouter();
  const locale = useLocale();

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const loading = categoriesLoading || servicesLoading;

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

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-gray-800 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
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
          <>
            {/* Services by Category */}
            {categories
              .slice(0, 2)
              .map((category: Category, categoryIndex: number) => {
                const categoryServices = services.filter(
                  (service: Service) => service.categoryId === category.id,
                );
                const displayServices = categoryServices.slice(0, 2); // Show max 2 services per category

                if (displayServices.length === 0) return null;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                    viewport={{ once: true }}
                    className="mb-12"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400">
                        {category.description}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {displayServices.map(
                        (service: Service, serviceIndex: number) => {
                          const iconName =
                            typeof service.icon === "string"
                              ? service.icon
                              : service.icon;
                          const Icon = iconMap[iconName] || Star;

                          return (
                            <motion.div
                              key={service.id}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: serviceIndex * 0.1,
                              }}
                              viewport={{ once: true }}
                            >
                              <Card
                                className="service-card p-6 card-hover h-full group cursor-pointer"
                                onClick={() =>
                                  router.push(`/${locale}/services`)
                                }
                              >
                                <CardContent className="text-center h-full flex flex-col">
                                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                                    <Icon className="text-white text-xl" />
                                  </div>
                                  <h4 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {service.name}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm lg:text-base xl:text-lg leading-relaxed flex-1">
                                    {service.shortDescription}
                                  </p>
                                  <div className="text-lg lg:text-xl xl:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3">
                                    {service.priceRange}
                                  </div>
                                  <div className="text-xs lg:text-sm xl:text-base text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {t("learnMore")}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        },
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </>
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

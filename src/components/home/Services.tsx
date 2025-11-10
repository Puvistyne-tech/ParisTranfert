"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useServices } from "@/hooks/useServices";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { Service } from "@/components/models/services";


export function Services() {
  const t = useTranslations("services");
  const router = useRouter();
  const locale = useLocale();
  
  // Use TanStack Query hook for data fetching with automatic caching
  const { data: services = [], isLoading: loading } = useServices();
  
  const tCommon = useTranslations("common");
  
  if (loading) {
    return (
      <section id="services" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 dark:text-gray-400">{tCommon("loading")}</div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: Service, index: number) => {
            const iconMap: { [key: string]: any } = {
              'Plane': Plane,
              'Crown': Crown,
              'Star': Star,
              'Globe': Globe,
              'Shield': Shield,
              'MapPin': MapPin,
              'UserCheck': UserCheck,
              'Heart': Heart,
              'Calendar': Calendar,
              'BookOpen': BookOpen,
            };
            const iconName = typeof service.icon === 'string' ? service.icon : service.icon;
            const Icon = iconMap[iconName] || Plane;
            
            // Handle features as JSONB (could be array or object)
            const features = Array.isArray(service.features) 
              ? service.features 
              : typeof service.features === 'object' && service.features !== null
              ? Object.values(service.features)
              : [];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Card className="service-card p-8 card-hover h-full">
                  <CardContent className="text-center h-full flex flex-col">
                    <div
                      className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300`}
                    >
                      <Icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed flex-1">
                      {service.shortDescription}
                    </p>

                    <div className="space-y-2 text-left mb-6">
                      {features.slice(0, 3).map((feature: any, featureIndex: number) => (
                        <div
                          key={featureIndex}
                          className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          <CheckCircle className="text-green-500 dark:text-green-400 mr-2 w-4 h-4" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-2xl font-bold text-blue-600">
                        {service.priceRange}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => router.push(`/${locale}/reservation`)}
                      >
                        {t("bookNow")} <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

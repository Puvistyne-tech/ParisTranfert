"use client";

import { motion } from "framer-motion";
import { Award, Car, Clock, Shield, Star, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

// Stats will be translated in the component
const stats = [
  { icon: Users, value: "500+", labelKey: "stats.happyClients" },
  { icon: Car, value: "15+", labelKey: "stats.mercedesFleet" },
  { icon: Clock, value: "24/7", labelKey: "stats.serviceAvailable" },
  { icon: Star, value: "5★", labelKey: "stats.averageRating" },
];

// Values will be translated in the component
const values = [
  {
    icon: Shield,
    titleKey: "ourValues.safetyFirst.title",
    descriptionKey: "ourValues.safetyFirst.description",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Clock,
    titleKey: "ourValues.punctuality.title",
    descriptionKey: "ourValues.punctuality.description",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Star,
    titleKey: "ourValues.excellence.title",
    descriptionKey: "ourValues.excellence.description",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Award,
    titleKey: "ourValues.professionalism.title",
    descriptionKey: "ourValues.professionalism.description",
    gradient: "from-purple-500 to-pink-500",
  },
];

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="hero-bg text-white pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold font-display mb-6">
              {t("title")}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.labelKey}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center">
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{t(stat.labelKey)}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t("ourStory.title")}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  {t("ourStory.paragraph1")}
                </p>
                <p>
                  {t("ourStory.paragraph2")}
                </p>
                <p>
                  {t("ourStory.paragraph3")}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">{t("whyChooseUs.title")}</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {t("whyChooseUs.professionalFleet")}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {t("whyChooseUs.experiencedDrivers")}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {t("whyChooseUs.customerSupport")}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {t("whyChooseUs.competitivePricing")}
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                    {t("whyChooseUs.freeCancellation")}
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t("ourValues.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t("ourValues.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center p-6 h-full">
                    <CardContent>
                      <div
                        className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${value.gradient} rounded-2xl flex items-center justify-center`}
                      >
                        <Icon className="text-white text-2xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        {t(value.titleKey)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{t(value.descriptionKey)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-white/90"
              onClick={() => {
                window.location.href = `/${locale}/reservation`;
              }}
            >
              {t("cta.bookTransferNow")}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

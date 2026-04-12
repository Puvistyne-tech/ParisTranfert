"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Plane, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { DisneylandHotelCard } from "@/components/disneyland/DisneylandHotelCard";
import { AnimatedCastle } from "@/components/home/AnimatedCastle";
import { FloatingIcons } from "@/components/home/FloatingIcons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useDisneylandHotels } from "@/hooks/useDisneylandHotels";
import { useHomePageImages } from "@/hooks/useHomePageImages";
import { useServices } from "@/hooks/useServices";
import { useReservationStore } from "@/store/reservationStore";

function firstSlotImage(urls: { imageUrl: string }[]) {
  return urls[0];
}

export default function DisneylandParisPage() {
  const t = useTranslations("disneylandPage");
  const router = useRouter();
  const locale = useLocale();
  const { data: headerImgs = [] } = useHomePageImages("disneyland-header");
  const { data: contentImgs = [] } = useHomePageImages("disneyland-content");
  const { data: bgImgs = [] } = useHomePageImages("disneyland-background");
  const { data: footerImgs = [] } = useHomePageImages("disneyland-footer");
  const { data: bookingImgs = [] } = useHomePageImages("disneyland-booking");
  const { data: hotels = [], isLoading: hotelsLoading } = useDisneylandHotels();
  const { data: servicesList = [] } = useServices();

  const heroImage = firstSlotImage(headerImgs);
  const contentImage = firstSlotImage(contentImgs);
  const pageBgImage = firstSlotImage(bgImgs);
  const footerImage = firstSlotImage(footerImgs);
  const bookingSectionImage = firstSlotImage(bookingImgs);

  const disneylandService = servicesList.find((s) => s.id === "disneyland");
  const airportService = servicesList.find((s) => s.id === "airport-transfers");

  const { setSelectedService, updateServiceSubData, setCurrentStep } =
    useReservationStore();

  const handleBookDisneyTour = () => {
    if (disneylandService) {
      setSelectedService(disneylandService);
      setCurrentStep(1);
      router.push(`/${locale}/reservation`);
    }
  };

  const handleBookAirportTransfer = () => {
    if (airportService) {
      setSelectedService(airportService);
      updateServiceSubData({
        destination_location: "disneyland",
      });
      setCurrentStep(1);
      router.push(`/${locale}/reservation`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      {pageBgImage && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src={pageBgImage.imageUrl}
            alt=""
            fill
            className="object-cover opacity-25 dark:opacity-20"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/85 to-pink-50/90 dark:from-gray-900/92 dark:via-purple-950/80 dark:to-gray-900/92" />
        </div>
      )}

      <div className="relative z-10">
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {heroImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImage.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/70 dark:via-purple-900/50 dark:to-gray-800/70" />
            </div>
          )}

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AnimatedCastle
              className="absolute top-10 left-10 opacity-20"
              size={150}
            />
            <AnimatedCastle
              className="absolute bottom-10 right-10 opacity-20"
              size={180}
            />
            <AnimatedCastle
              className="absolute top-1/2 right-20 opacity-15"
              size={120}
            />
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingIcons count={8} />
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -40, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-block mb-6"
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="w-16 h-16 text-yellow-400" />
              </motion.div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-display mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("hero.title")}
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                {t("hero.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBookDisneyTour}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  <Calendar className="mr-2 w-5 h-5" />
                  {t("hero.bookDisneyTour")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBookAirportTransfer}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Plane className="mr-2 w-5 h-5" />
                  {t("hero.bookAirportTransfer")}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm relative overflow-hidden">
          {contentImage && (
            <div className="absolute top-0 left-0 right-0 h-56 md:h-72 opacity-90 pointer-events-none">
              <Image
                src={contentImage.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/85 to-white dark:via-gray-900/90 dark:to-gray-900" />
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold font-display text-gray-900 dark:text-gray-100 mb-4">
                {t("hotels.title")}
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                {t("hotels.subtitle")}
              </p>
            </motion.div>

            {hotelsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-gray-200/80 dark:bg-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                {t("hotels.empty")}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {hotels.map((hotel, index) => (
                  <DisneylandHotelCard
                    key={hotel.id}
                    hotel={hotel}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section
          className={`relative py-14 md:py-18 overflow-hidden ${
            footerImage
              ? ""
              : "bg-gradient-to-r from-purple-100/80 via-blue-50/80 to-pink-100/80 dark:from-purple-950/50 dark:via-gray-900/80 dark:to-pink-950/50"
          }`}
        >
          {footerImage && (
            <div className="absolute inset-0">
              <Image
                src={footerImage.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/75 via-blue-900/65 to-pink-900/75" />
            </div>
          )}
          <div
            className={`relative z-10 max-w-4xl mx-auto px-4 text-center ${
              footerImage ? "" : "py-4"
            }`}
          >
            <Sparkles
              className={`w-10 h-10 mx-auto mb-3 opacity-90 ${
                footerImage
                  ? "text-amber-300"
                  : "text-purple-500 dark:text-amber-400"
              }`}
            />
            <p
              className={`text-lg font-medium ${
                footerImage
                  ? "text-white/95 drop-shadow"
                  : "text-gray-800 dark:text-gray-100"
              }`}
            >
              {t("hotels.footerHint")}
            </p>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 relative overflow-hidden">
          {bookingSectionImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={bookingSectionImage.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-pink-600/80" />
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-6xl font-bold font-display text-white mb-6">
                {t("booking.title")}
              </h2>
              <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
                {t("booking.subtitle")}
              </p>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg hover:shadow-2xl transition-all relative overflow-hidden group">
                    {disneylandService?.image && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={disneylandService.image}
                          alt={disneylandService.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/90 via-purple-500/70 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-8 text-center relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                        {t("booking.disneyTour.title")}
                      </h3>
                      <p className="text-white/90 mb-6 drop-shadow-md">
                        {t("booking.disneyTour.description")}
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleBookDisneyTour}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                      >
                        <Calendar className="mr-2 w-5 h-5" />
                        {t("booking.disneyTour.button")}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg hover:shadow-2xl transition-all relative overflow-hidden group">
                    {airportService?.image && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={airportService.image}
                          alt={airportService.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-blue-500/70 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-8 text-center relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Plane className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">
                        {t("booking.airportTransfer.title")}
                      </h3>
                      <p className="text-white/90 mb-6 drop-shadow-md">
                        {t("booking.airportTransfer.description")}
                      </p>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleBookAirportTransfer}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                      >
                        <Plane className="mr-2 w-5 h-5" />
                        {t("booking.airportTransfer.button")}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Castle,
  MapPin,
  Plane,
  Sparkles,
  Star,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useServices } from "@/hooks/useServices";
import { useReservationStore } from "@/store/reservationStore";
import { useHomePageImages } from "@/hooks/useHomePageImages";
import { AnimatedCastle } from "@/components/home/AnimatedCastle";
import { MagicalSparkles } from "@/components/home/MagicalSparkles";
import { FloatingIcons } from "@/components/home/FloatingIcons";

export default function DisneylandParisPage() {
  const t = useTranslations("disneylandPage");
  const router = useRouter();
  const locale = useLocale();
  const { data: services = [] } = useServices();
  const { setSelectedService, updateServiceSubData, setCurrentStep } =
    useReservationStore();
  const { data: disneylandImages = [] } = useHomePageImages("disneyland-page");
  const [selectedImageIndex, setSelectedImageIndex] = useState<Record<string, number>>({});

  // Filter images by section (using display_order ranges or all images)
  // For simplicity, we'll use all images and let admin manage via display_order
  const heroImage = disneylandImages.find(img => img.displayOrder === 0) || disneylandImages[0];
  const attractionsImages = disneylandImages.filter((_, idx) => idx >= 1 && idx < 5);
  const diningImages = disneylandImages.filter((_, idx) => idx >= 5 && idx < 7);
  const entertainmentImages = disneylandImages.filter((_, idx) => idx >= 7 && idx < 9);
  const bookingSectionImage = disneylandImages.find(img => img.displayOrder === 9) || disneylandImages.find((_, idx) => idx >= 9);

  // Find services
  const disneylandService = services.find((s) => s.id === "disneyland");
  const airportService = services.find((s) => s.id === "airport-transfers");

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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const attractions = [
    {
      icon: Castle,
      title: t("attractions.castle.title"),
      description: t("attractions.castle.description"),
    },
    {
      icon: Wand2,
      title: t("attractions.alice.title"),
      description: t("attractions.alice.description"),
    },
    {
      icon: Sparkles,
      title: t("attractions.dragon.title"),
      description: t("attractions.dragon.description"),
    },
    {
      icon: Star,
      title: t("attractions.studios.title"),
      description: t("attractions.studios.description"),
    },
  ];

  const dining = [
    {
      title: t("dining.cinderella.title"),
      description: t("dining.cinderella.description"),
    },
    {
      title: t("dining.blueLagoon.title"),
      description: t("dining.blueLagoon.description"),
    },
  ];

  const entertainment = [
    {
      title: t("entertainment.talesOfMagic.title"),
      description: t("entertainment.talesOfMagic.description"),
    },
    {
      title: t("entertainment.parades.title"),
      description: t("entertainment.parades.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.imageUrl}
              alt="Disneyland Paris"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 dark:from-gray-900/70 dark:via-purple-900/50 dark:to-gray-800/70" />
          </div>
        )}
        
        {/* Animated Castle Silhouettes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <AnimatedCastle className="absolute top-10 left-10 opacity-20" size={150} />
          <AnimatedCastle className="absolute bottom-10 right-10 opacity-20" size={180} />
          <AnimatedCastle className="absolute top-1/2 right-20 opacity-15" size={120} />
        </div>
        
        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingIcons count={8} />
        </div>
        
        {/* Animated Background */}
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
              repeat: Infinity,
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
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/25 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              x: [0, 30, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
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
                repeat: Infinity,
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

      {/* Things to Do Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 dark:text-gray-100 mb-6">
              {t("thingsToDo.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t("thingsToDo.subtitle")}
            </p>
          </motion.div>

          {/* Attractions */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
              <Castle className="mr-3 w-8 h-8 text-purple-600" />
              {t("attractions.title")}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {attractions.map((attraction, index) => {
                const Icon = attraction.icon;
                const cardImages = attractionsImages.filter((_, imgIdx) => imgIdx === index);
                const currentImageIndex = selectedImageIndex[`attraction-${index}`] || 0;
                const currentImage = cardImages[currentImageIndex];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                      {/* Background Image */}
                      {currentImage && (
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={currentImage.imageUrl}
                            alt={attraction.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                        </div>
                      )}
                      
                      {/* Magical Sparkles on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <MagicalSparkles count={6} />
                      </div>
                      
                      <CardContent className="p-6 relative z-10">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 shadow-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <h4 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                          {attraction.title}
                        </h4>
                        <p className="text-white/90 drop-shadow-md">
                          {attraction.description}
                        </p>
                        
                        {/* Image Gallery Navigation */}
                        {cardImages.length > 1 && (
                          <div className="flex gap-2 mt-4">
                            {cardImages.map((_, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(prev => ({
                                    ...prev,
                                    [`attraction-${index}`]: imgIdx
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  imgIdx === currentImageIndex
                                    ? "bg-yellow-300 w-6"
                                    : "bg-white/50 hover:bg-white/75"
                                }`}
                                aria-label={`View image ${imgIdx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dining */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
              <UtensilsCrossed className="mr-3 w-8 h-8 text-purple-600" />
              {t("dining.title")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {dining.map((restaurant, index) => {
                const cardImages = diningImages.filter((_, imgIdx) => imgIdx === index);
                const currentImageIndex = selectedImageIndex[`dining-${index}`] || 0;
                const currentImage = cardImages[currentImageIndex];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                      {/* Background Image */}
                      {currentImage && (
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={currentImage.imageUrl}
                            alt={restaurant.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                        </div>
                      )}
                      
                      {/* Animated Utensil Icon */}
                      <motion.div
                        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <UtensilsCrossed className="w-8 h-8 text-yellow-300" />
                      </motion.div>
                      
                      <CardContent className="p-6 relative z-10">
                        <h4 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                          {restaurant.title}
                        </h4>
                        <p className="text-white/90 drop-shadow-md">
                          {restaurant.description}
                        </p>
                        
                        {/* Image Gallery Navigation */}
                        {cardImages.length > 1 && (
                          <div className="flex gap-2 mt-4">
                            {cardImages.map((_, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(prev => ({
                                    ...prev,
                                    [`dining-${index}`]: imgIdx
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  imgIdx === currentImageIndex
                                    ? "bg-yellow-300 w-6"
                                    : "bg-white/50 hover:bg-white/75"
                                }`}
                                aria-label={`View image ${imgIdx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Entertainment */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center">
              <Sparkles className="mr-3 w-8 h-8 text-purple-600" />
              {t("entertainment.title")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {entertainment.map((show, index) => {
                const cardImages = entertainmentImages.filter((_, imgIdx) => imgIdx === index);
                const currentImageIndex = selectedImageIndex[`entertainment-${index}`] || 0;
                const currentImage = cardImages[currentImageIndex];
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                      {/* Background Image */}
                      {currentImage && (
                        <div className="absolute inset-0 z-0">
                          <Image
                            src={currentImage.imageUrl}
                            alt={show.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                        </div>
                      )}
                      
                      {/* Animated Sparkles */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        <MagicalSparkles count={8} />
                      </div>
                      
                      {/* Animated Star Icon */}
                      <motion.div
                        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Star className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                      </motion.div>
                      
                      <CardContent className="p-6 relative z-10">
                        <h4 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                          {show.title}
                        </h4>
                        <p className="text-white/90 drop-shadow-md">
                          {show.description}
                        </p>
                        
                        {/* Image Gallery Navigation */}
                        {cardImages.length > 1 && (
                          <div className="flex gap-2 mt-4">
                            {cardImages.map((_, imgIdx) => (
                              <button
                                key={imgIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedImageIndex(prev => ({
                                    ...prev,
                                    [`entertainment-${index}`]: imgIdx
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  imgIdx === currentImageIndex
                                    ? "bg-yellow-300 w-6"
                                    : "bg-white/50 hover:bg-white/75"
                                }`}
                                aria-label={`View image ${imgIdx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 relative overflow-hidden">
        {/* Background Image */}
        {bookingSectionImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={bookingSectionImage.imageUrl}
              alt="Book your magical journey"
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-pink-600/80" />
          </div>
        )}
        
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 50, 0],
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
              {/* Disney Tour Booking */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg hover:shadow-2xl transition-all relative overflow-hidden group">
                  {/* Service Image Background */}
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

              {/* Airport Transfer Booking */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg hover:shadow-2xl transition-all relative overflow-hidden group">
                  {/* Service Image Background */}
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
  );
}

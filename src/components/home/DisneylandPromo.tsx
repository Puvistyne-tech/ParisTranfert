"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { useHomePageImages } from "@/hooks/useHomePageImages";

export function DisneylandPromo() {
  const t = useTranslations("disneylandPromo");
  const router = useRouter();
  const locale = useLocale();
  const { data: promoImages = [] } = useHomePageImages("disneyland-promo");
  const backgroundImage = promoImages.length > 0 && promoImages[0]?.imageUrl ? promoImages[0] : null;
  const characterImage = promoImages.length > 1 && promoImages[1]?.imageUrl ? promoImages[1] : null;
  const prefersReducedMotion = useReducedMotion();

  const handleClick = () => {
    router.push(`/${locale}/disneyland-paris`);
  };

  // Simplified animation variants
  const floatAnimation = prefersReducedMotion
    ? {}
    : {
        y: [0, -8, 0],
      };

  const glowAnimation = prefersReducedMotion
    ? {}
    : {
        opacity: [0.3, 0.5, 0.3],
      };

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 relative overflow-hidden">
      {/* Background Image (if available) */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <Image
            src={backgroundImage.imageUrl}
            alt="Disneyland promo background"
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 via-blue-600/80 to-pink-600/80" />
        </div>
      )}

      {/* Simplified Background Elements - Only on desktop */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        {/* Single subtle floating orb */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-300/5 rounded-full blur-3xl"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Content - Order changes on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-white order-2 md:order-1 text-center md:text-left w-full"
          >
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              {!prefersReducedMotion && (
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
                </motion.div>
              )}
              {prefersReducedMotion && (
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-300" />
              )}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                {t("title")}
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto md:mx-0">
              {t("subtitle")}
            </p>
            <div className="flex justify-center md:justify-start">
              <Button
                variant="outline"
                size="lg"
                onClick={handleClick}
                className="bg-white/20 backdrop-blur-sm text-white border-white/50 hover:bg-white/30 hover:border-white/70"
              >
                <Wand2 className="mr-2 w-5 h-5" />
                {t("button")}
              </Button>
            </div>
          </motion.div>

          {/* Character Image - Order changes on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center order-1 md:order-2 w-full"
          >
            <motion.div
              className="relative cursor-pointer group"
              onClick={handleClick}
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Simplified glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-400/20 to-purple-400/20 rounded-full blur-2xl -z-10"
                animate={glowAnimation}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Character Image with subtle animation */}
              <motion.div
                className="relative z-10"
                animate={floatAnimation}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="relative w-[250px] h-[320px] sm:w-[300px] sm:h-[400px] md:w-[350px] md:h-[450px] lg:w-[400px] lg:h-[500px]">
                  <Image
                    src={characterImage?.imageUrl || "/mickey-mouse.png"}
                    alt="Disneyland character"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                    sizes="(max-width: 640px) 250px, (max-width: 768px) 300px, (max-width: 1024px) 350px, 400px"
                  />
                </div>

                {/* Single subtle sparkle - only on desktop */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="hidden md:block absolute top-1/4 right-1/4 z-20"
                    animate={{
                      opacity: [0.4, 1, 0.4],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </motion.div>
                )}

                {/* Click hint text - only on desktop */}
                <motion.div
                  className="hidden md:block absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold whitespace-nowrap z-20"
                  animate={prefersReducedMotion ? {} : {
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  {t("clickHint")}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

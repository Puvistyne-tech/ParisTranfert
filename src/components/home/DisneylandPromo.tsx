"use client";

import { motion } from "framer-motion";
import { Sparkles, Wand2, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useHomePageImages } from "@/hooks/useHomePageImages";

interface ParticlePosition {
  left: number;
  top: number;
  x: number;
  duration: number;
  delay: number;
}

interface HeartPosition {
  x: number;
  y: number;
}

export function DisneylandPromo() {
  const t = useTranslations("disneylandPromo");
  const router = useRouter();
  const locale = useLocale();
  const { data: promoImages = [] } = useHomePageImages("disneyland-promo");
  const backgroundImage = promoImages.length > 0 && promoImages[0]?.imageUrl ? promoImages[0] : null;
  const characterImage = promoImages.length > 1 && promoImages[1]?.imageUrl ? promoImages[1] : null;
  
  // Generate random positions only on client to avoid hydration mismatch
  const [particlePositions, setParticlePositions] = useState<ParticlePosition[]>([]);
  const [heartPositions, setHeartPositions] = useState<HeartPosition[]>([]);
  
  useEffect(() => {
    // Generate random positions only on client side
    const positions: ParticlePosition[] = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      x: (Math.random() - 0.5) * 50,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
    setParticlePositions(positions);

    // Generate floating hearts positions only on client side
    const hearts: HeartPosition[] = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 360) / 6;
      const radius = 180;
      return {
        x: 50 + radius * Math.cos((angle * Math.PI) / 180),
        y: 50 + radius * Math.sin((angle * Math.PI) / 180),
      };
    });
    setHeartPositions(hearts);
  }, []);

  const handleClick = () => {
    router.push(`/${locale}/disneyland-paris`);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 relative overflow-hidden">
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
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
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
        <motion.div
          className="absolute top-1/2 left-1/3 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl"
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
        
        {/* Floating Sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              left: `${10 + (i % 6) * 15}%`,
              top: `${20 + Math.floor(i / 6) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Floating Stars */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${15 + (i % 4) * 25}%`,
              top: `${25 + Math.floor(i / 4) * 35}%`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          >
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
          </motion.div>
        ))}

        {/* Magical particles */}
        {particlePositions.map((particle, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, particle.x, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display">
                {t("title")}
              </h2>
            </div>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
              {t("subtitle")}
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={handleClick}
              className="bg-white/20 backdrop-blur-sm text-white border-white/50 hover:bg-white/30 hover:border-white/70"
            >
              <Wand2 className="mr-2 w-5 h-5" />
              {t("button")}
            </Button>
          </motion.div>

          {/* Right Content - Animated Character */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              className="relative cursor-pointer group"
              onClick={handleClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Magical glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-pink-400/30 to-purple-400/30 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Mickey Mouse Image with Animation */}
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: [0, -10, 0]
                }}
                transition={{ 
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8 },
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <div className="relative w-[300px] h-[400px] md:w-[350px] md:h-[450px] lg:w-[400px] lg:h-[500px]">
                  <Image
                    src={characterImage?.imageUrl || "/mickey-mouse.png"}
                    alt="Disneyland character"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                    sizes="(max-width: 768px) 300px, (max-width: 1024px) 350px, 400px"
                  />
                </div>
                
                {/* Waving hand animation overlay */}
                <motion.div
                  className="absolute top-1/4 right-1/4 z-20"
                  animate={{
                    rotate: [0, 20, -10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
              </motion.div>

              {/* Animated Disney Castle SVG in background */}
              <motion.svg
                width="400"
                height="400"
                viewBox="0 0 400 400"
                className="absolute inset-0 w-full h-full opacity-20 -z-10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1 }}
              >
                {/* Castle Base */}
                <motion.rect
                  x="50"
                  y="250"
                  width="300"
                  height="100"
                  fill="rgba(255, 255, 255, 0.9)"
                  rx="10"
                  animate={{
                    y: [250, 248, 250],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Main Tower */}
                <motion.rect
                  x="150"
                  y="150"
                  width="100"
                  height="100"
                  fill="rgba(255, 255, 255, 0.95)"
                  rx="5"
                  animate={{
                    y: [150, 148, 150],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                />
                {/* Left Tower */}
                <motion.rect
                  x="70"
                  y="180"
                  width="60"
                  height="70"
                  fill="rgba(255, 255, 255, 0.9)"
                  rx="5"
                  animate={{
                    y: [180, 178, 180],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.1,
                  }}
                />
                {/* Right Tower */}
                <motion.rect
                  x="270"
                  y="180"
                  width="60"
                  height="70"
                  fill="rgba(255, 255, 255, 0.9)"
                  rx="5"
                  animate={{
                    y: [180, 178, 180],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  }}
                />
                {/* Spire on Main Tower */}
                <motion.polygon
                  points="200,150 220,120 200,100 180,120"
                  fill="rgba(255, 215, 0, 0.9)"
                  animate={{
                    y: [150, 148, 150],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Stars around castle */}
                {[...Array(8)].map((_, i) => {
                  const angle = (i * 360) / 8;
                  const radius = 180;
                  const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <motion.polygon
                      key={`star-${i}`}
                      points={`${x},${y - 10} ${x + 3},${y - 3} ${x + 10},${y - 3} ${x + 4},${y + 2} ${x + 6},${y + 9} ${x},${y + 4} ${x - 6},${y + 9} ${x - 4},${y + 2} ${x - 10},${y - 3} ${x - 3},${y - 3}`}
                      fill="rgba(255, 215, 0, 0.8)"
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  );
                })}
                {/* Magical sparkles */}
                {[...Array(16)].map((_, i) => {
                  const angle = (i * 360) / 16;
                  const radius = 150;
                  const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <motion.circle
                      key={`sparkle-${i}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="rgba(255, 255, 255, 0.9)"
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  );
                })}

                {/* Additional decorative stars */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i * 360) / 6;
                  const radius = 120;
                  const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <motion.polygon
                      key={`decor-star-${i}`}
                      points={`${x},${y - 5} ${x + 2},${y - 1} ${x + 5},${y - 1} ${x + 2},${y + 1} ${x + 3},${y + 4} ${x},${y + 2} ${x - 3},${y + 4} ${x - 2},${y + 1} ${x - 5},${y - 1} ${x - 2},${y - 1}`}
                      fill="rgba(255, 215, 0, 0.7)"
                      animate={{
                        rotate: [0, 180, 360],
                        scale: [0.5, 1, 0.5],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 3 + i * 0.3,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  );
                })}

                {/* Floating hearts (Disney magic) */}
                {[...Array(4)].map((_, i) => {
                  const angle = (i * 360) / 4 + 45;
                  const radius = 100;
                  const x = 200 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 200 + radius * Math.sin((angle * Math.PI) / 180);
                  return (
                    <motion.path
                      key={`heart-${i}`}
                      d={`M ${x} ${y} C ${x} ${y - 5}, ${x - 5} ${y - 10}, ${x - 5} ${y - 5} C ${x - 5} ${y}, ${x} ${y + 5}, ${x} ${y + 5} C ${x} ${y + 5}, ${x + 5} ${y}, ${x + 5} ${y - 5} C ${x + 5} ${y - 10}, ${x} ${y - 5}, ${x} ${y} Z`}
                      fill="rgba(255, 182, 193, 0.6)"
                      animate={{
                        y: [y, y - 20, y],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  );
                })}
              </motion.svg>

              {/* Floating hearts around Mickey */}
              {heartPositions.map((heart, i) => (
                <motion.div
                  key={`heart-float-${i}`}
                  className="absolute"
                  style={{
                    left: `${heart.x}px`,
                    top: `${heart.y}px`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255, 182, 193, 0.8)">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </motion.div>
              ))}

              {/* Floating magic wands */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wand-${i}`}
                  className="absolute"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 15}%`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                >
                  <Wand2 className="w-6 h-6 text-yellow-300" />
                </motion.div>
              ))}

              {/* Click hint text with animation */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-semibold whitespace-nowrap z-20"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {t("clickHint")}
              </motion.div>

              {/* Pulsing ring effect */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute inset-0 border-2 border-yellow-300/30 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.7,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

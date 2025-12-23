"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useHomePageImages } from "@/hooks/useHomePageImages";

export function ImageCarousel() {
    const [isMounted, setIsMounted] = useState(false);
    const { data: images = [], isLoading, error } = useHomePageImages("carousel");
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle client-side mounting to prevent hydration issues
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-play carousel
    useEffect(() => {
        if (!isMounted || !images || images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, [images, isMounted]);

    // Don't render if not mounted, loading, or no images
  if (!isMounted) {
    return null;
  }

  // Safety check - ensure we have valid images
  if (error || isLoading || !images || images.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    if (!images || images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    if (!images || images.length === 0) return;
    setCurrentIndex(index);
  };

  const currentImage = images[currentIndex];
  if (!currentImage?.imageUrl) {
    return null;
  }

  return (
    <section className="relative w-full h-[500px] md:h-[650px] lg:h-[750px] xl:h-[850px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={currentImage.imageUrl}
            alt={`Carousel image ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="100vw"
            quality={95}
          />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? "bg-white w-8"
                                    : "bg-white/50 hover:bg-white/75"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}


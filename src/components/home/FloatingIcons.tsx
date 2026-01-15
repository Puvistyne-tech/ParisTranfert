"use client";

import { motion } from "framer-motion";
import { Star, Sparkles, Wand2 } from "lucide-react";

interface FloatingIconsProps {
  count?: number;
  className?: string;
}

const icons = [Star, Sparkles, Wand2];

export function FloatingIcons({ count = 6, className = "" }: FloatingIconsProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const Icon = icons[i % icons.length];
        const angle = (i * 360) / count;
        const radius = 40 + Math.random() * 20;
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        return (
          <motion.div
            key={`icon-${i}`}
            className={`absolute ${className}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [0.8, 1.2, 0.8],
              rotate: [0, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 1,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            <Icon className="w-5 h-5 text-yellow-300" />
          </motion.div>
        );
      })}
    </>
  );
}

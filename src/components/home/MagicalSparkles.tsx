"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MagicalSparklesProps {
  count?: number;
  className?: string;
}

export function MagicalSparkles({ count = 8, className = "" }: MagicalSparklesProps) {
  return (
    <>
      {[...Array(count)].map((_, i) => {
        const angle = (i * 360) / count;
        const radius = 50 + Math.random() * 30;
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        return (
          <motion.div
            key={`sparkle-${i}`}
            className={`absolute ${className}`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.5, 1.5, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 2 + Math.random() * 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </motion.div>
        );
      })}
    </>
  );
}

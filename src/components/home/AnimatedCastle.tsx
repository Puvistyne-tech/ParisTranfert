"use client";

import { motion } from "framer-motion";

interface AnimatedCastleProps {
  className?: string;
  size?: number;
}

export function AnimatedCastle({ className = "", size = 200 }: AnimatedCastleProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ duration: 1 }}
    >
      {/* Castle Base */}
      <motion.rect
        x="30"
        y="130"
        width="140"
        height="50"
        fill="rgba(255, 255, 255, 0.9)"
        rx="5"
        animate={{
          y: [130, 128, 130],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Main Tower */}
      <motion.rect
        x="70"
        y="80"
        width="60"
        height="50"
        fill="rgba(255, 255, 255, 0.95)"
        rx="3"
        animate={{
          y: [80, 78, 80],
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
        x="30"
        y="100"
        width="40"
        height="30"
        fill="rgba(255, 255, 255, 0.9)"
        rx="3"
        animate={{
          y: [100, 98, 100],
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
        x="130"
        y="100"
        width="40"
        height="30"
        fill="rgba(255, 255, 255, 0.9)"
        rx="3"
        animate={{
          y: [100, 98, 100],
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
        points="100,80 110,60 100,50 90,60"
        fill="rgba(255, 215, 0, 0.9)"
        animate={{
          y: [80, 78, 80],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Stars around castle */}
      {[...Array(6)].map((_, i) => {
        const angle = (i * 360) / 6;
        const radius = 90;
        const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 100 + radius * Math.sin((angle * Math.PI) / 180);
        return (
          <motion.polygon
            key={`star-${i}`}
            points={`${x},${y - 5} ${x + 2},${y - 1} ${x + 5},${y - 1} ${x + 2},${y + 1} ${x + 3},${y + 4} ${x},${y + 2} ${x - 3},${y + 4} ${x - 2},${y + 1} ${x - 5},${y - 1} ${x - 2},${y - 1}`}
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
    </motion.svg>
  );
}

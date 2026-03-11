"use client"

import React from "react"
import { motion } from "framer-motion"
import { Car, Home, Sparkles } from "lucide-react"
import Link from "next/link"
import { routing } from "@/i18n/routing"

export function NotFoundContent() {
  const homeUrl = `/${routing.defaultLocale}`
  const servicesUrl = `/${routing.defaultLocale}/services`

  return (
    <>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <div
        className="relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
        }}
      >
      {/* Decorative floating circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-16 left-12 w-32 h-32 rounded-full bg-white/5"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-16 w-48 h-48 rounded-full bg-white/5"
          animate={{ y: [0, 14, 0] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute bottom-24 left-1/4 w-24 h-24 rounded-full bg-white/5"
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className="absolute bottom-16 right-1/3 w-40 h-40 rounded-full bg-white/5"
          animate={{ y: [0, 16, 0] }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-8 w-16 h-16 rounded-full bg-cyan-400/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Car icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Car className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        {/* 404 number */}
        <motion.h1
          className="text-[10rem] leading-none font-bold text-white drop-shadow-lg mb-2 font-display"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}
        >
          404
        </motion.h1>

        {/* Headline */}
        <motion.h2
          className="text-3xl lg:text-4xl font-bold text-white mb-4 font-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Page Not Found
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="text-lg text-white/80 mb-10 leading-relaxed max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let us drive you back home.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link
            href={homeUrl}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 min-w-[180px] justify-center"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            href={servicesUrl}
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/60 hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105 min-w-[180px] justify-center"
          >
            <Sparkles className="w-5 h-5" />
            Browse Services
          </Link>
        </motion.div>

        {/* Brand name */}
        <motion.p
          className="mt-12 text-white/50 text-sm tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Prestige Shuttle Group
        </motion.p>
      </div>
    </div>
    </>
  )
}

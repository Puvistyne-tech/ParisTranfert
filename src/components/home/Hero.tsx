//hero
"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Car,
  ChevronDown,
  Clock,
  Clock as ClockIcon,
  MapPin,
  Shield,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { Location } from "@/components/models/locations";
import type { Service } from "@/components/models/services";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useLocationsByService } from "@/hooks/useLocationsByService";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useReservationStore } from "@/store/reservationStore";

export function Hero() {
  const t = useTranslations("hero");
  const router = useRouter();
  const locale = useLocale();
  const [showPendingNotification, setShowPendingNotification] = useState(false);
  const [pendingReservationId, setPendingReservationId] = useState<
    string | null
  >(null);
  const [dismissedReservations, setDismissedReservations] = useState<
    Set<string>
  >(new Set());

  // Quick booking form state
  const [airportLocations, setAirportLocations] = useState<Location[]>([]);
  const [airportService, setAirportService] = useState<Service | null>(null);
  const [carVehicleType, setCarVehicleType] = useState<VehicleType | null>(
    null,
  );
  const prevLocationsRef = useRef<string>("");
  const [quickBookingData, setQuickBookingData] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
  });

  const {
    setSelectedService,
    setSelectedVehicleType,
    updateFormData,
    updateServiceSubData,
    setCurrentStep,
  } = useReservationStore();

  const handleQuickBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !airportService ||
      !carVehicleType ||
      !quickBookingData.pickup ||
      !quickBookingData.destination
    ) {
      alert(t("pleaseFillAllFields"));
      return;
    }

    // Set selected service and vehicle type
    setSelectedService(airportService);
    setSelectedVehicleType(carVehicleType);

    // Prefill form data
    updateFormData({
      date: quickBookingData.date,
      time: quickBookingData.time,
      passengers: 1, // Default
    });

    // Prefill service sub data with locations
    updateServiceSubData({
      pickup_location: quickBookingData.pickup,
      destination_location: quickBookingData.destination,
    });

    // Set to step 2 (trip details)
    setCurrentStep(2);

    // Navigate to reservation page
    router.push(`/${locale}/reservation`);
  };

  // Check for pending reservations on mount and on storage changes
  const checkPendingReservations = () => {
    // Load dismissed reservations from localStorage
    const dismissedData = localStorage.getItem("dismissed-reservations");
    const dismissed = dismissedData
      ? new Set<string>(JSON.parse(dismissedData))
      : new Set<string>();
    setDismissedReservations(dismissed);

    // Check all localStorage keys that start with "reservation-"
    const keys = Object.keys(localStorage);
    const reservationKeys = keys.filter((key) =>
      key.startsWith("reservation-"),
    );

    let foundPending = false;
    let validPendingId: string | null = null;

    for (const key of reservationKeys) {
      try {
        const savedData = localStorage.getItem(key);
        if (!savedData) {
          continue;
        }

        const state = JSON.parse(savedData);

        // Validate state structure
        if (typeof state !== "object" || state === null) {
          continue;
        }

        // Check if reservation is completed - if so, skip it
        if (state.isCompleted === true) {
          continue;
        }

        // Check if reservation is recent (within 7 days)
        // If no timestamp, assume it's old and skip it
        if (!state.timestamp || typeof state.timestamp !== "number") {
          continue;
        }

        const daysSinceSave =
          (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
        if (daysSinceSave >= 7) {
          // Reservation is too old, skip it
          continue;
        }

        // Check if this reservation was dismissed
        const reservationId = key.replace("reservation-", "");
        if (dismissed.has(reservationId)) {
          continue;
        }

        // Check if there's meaningful reservation data (not just empty state)
        const hasService =
          state.selectedService &&
          Object.keys(state.selectedService).length > 0;
        const hasVehicleType =
          state.selectedVehicleType &&
          Object.keys(state.selectedVehicleType).length > 0;
        const hasAdditionalServices =
          state.additionalServices &&
          (state.additionalServices.babySeats > 0 ||
            state.additionalServices.boosters > 0 ||
            state.additionalServices.meetAndGreet === true);
        const hasFormData =
          state.formData && Object.keys(state.formData).length > 0;

        // Only show if there's actual meaningful data (at least one of these)
        if (
          hasService ||
          hasVehicleType ||
          hasAdditionalServices ||
          hasFormData
        ) {
          // Found a valid pending reservation that hasn't been dismissed
          validPendingId = reservationId;
          foundPending = true;
          break;
        }
      } catch (error) {}
    }

    // Also check the Zustand persisted store (only if no specific reservation found)
    if (!foundPending) {
      try {
        const persistedStore = localStorage.getItem("reservation-store");
        if (persistedStore) {
          const storeData = JSON.parse(persistedStore);
          if (storeData?.state) {
            const state = storeData.state;

            // Skip if this reservation ID was dismissed
            if (state.reservationId && dismissed.has(state.reservationId)) {
              foundPending = false;
            } else if (!state.isCompleted) {
              // Check if there's meaningful pending reservation data in the store
              // Must have at least a service OR vehicle type OR additional services
              const hasService =
                state.selectedService &&
                Object.keys(state.selectedService).length > 0;
              const hasVehicleType =
                state.selectedVehicleType &&
                Object.keys(state.selectedVehicleType).length > 0;
              const hasAdditionalServices =
                state.additionalServices &&
                (state.additionalServices.babySeats > 0 ||
                  state.additionalServices.boosters > 0 ||
                  state.additionalServices.meetAndGreet === true);

              // Only show if there's actual meaningful data
              if (hasService || hasVehicleType || hasAdditionalServices) {
                foundPending = true;
              }
            }
          }
        }
      } catch (error) {
        // Ignore errors in persisted store check
      }
    }

    // Update state - only show if we found a valid pending reservation that hasn't been dismissed
    if (foundPending && validPendingId) {
      setPendingReservationId(validPendingId);
      setShowPendingNotification(true);
    } else if (foundPending && !validPendingId) {
      // Store-based reservation found
      setShowPendingNotification(true);
    } else {
      setPendingReservationId(null);
      setShowPendingNotification(false);
    }
  };

  useEffect(() => {
    // Initial check - start with false to ensure clean state
    setShowPendingNotification(false);

    // Clean up old dismissed reservations (older than 7 days) to prevent list from growing
    try {
      const dismissedData = localStorage.getItem("dismissed-reservations");
      if (dismissedData) {
        const dismissed = JSON.parse(dismissedData);
        // For now, just keep the list - we'll clean it when checking reservations
        // The dismissed list will naturally shrink as old reservations expire
      }
    } catch (error) {
      // Ignore
    }

    checkPendingReservations();

    // Listen for storage changes (when reservation is deleted/completed in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key?.startsWith("reservation-") ||
        e.key === "reservation-store" ||
        e.key === "dismissed-reservations"
      ) {
        checkPendingReservations();
      }
    };

    // Listen for custom storage events (for same-tab changes)
    const handleCustomStorageChange = () => {
      checkPendingReservations();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "reservation-storage-change",
      handleCustomStorageChange,
    );

    // Check periodically but less frequently (every 5 seconds instead of 2)
    const interval = setInterval(() => {
      checkPendingReservations();
    }, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "reservation-storage-change",
        handleCustomStorageChange,
      );
      clearInterval(interval);
    };
  }, []);

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: services = [] } = useServices();
  const { data: vehicleTypes = [] } = useVehicleTypes();
  const { data: airportLocationsData = [] } =
    useLocationsByService("airport-transfers");

  // Find airport transfers service and car vehicle type
  useEffect(() => {
    // Only initialize once or when data actually changes
    if (services.length === 0 || vehicleTypes.length === 0) return;

    const airportServiceData = services.find(
      (s) => s.id === "airport-transfers",
    );
    if (airportServiceData) {
      setAirportService((prev) => {
        if (!prev || prev.id !== airportServiceData.id) {
          return airportServiceData;
        }
        return prev;
      });
    }

    if (airportLocationsData.length > 0) {
      // Compare by serializing IDs to avoid reference equality issues
      const newIds = JSON.stringify(
        airportLocationsData.map((l) => l.id).sort(),
      );
      if (prevLocationsRef.current !== newIds) {
        prevLocationsRef.current = newIds;
        setAirportLocations(airportLocationsData);
      }
    }

    const carType = vehicleTypes.find((vt) => vt.id === "car");
    if (carType) {
      setCarVehicleType((prev) => {
        if (!prev || prev.id !== carType.id) {
          return carType;
        }
        return prev;
      });
    }
  }, [services, vehicleTypes, airportLocationsData]);

  const handleContinueReservation = () => {
    router.push(`/${locale}/reservation`);
  };

  const handleDismissNotification = () => {
    // Load current dismissed list
    const dismissedData = localStorage.getItem("dismissed-reservations");
    const dismissed = dismissedData
      ? new Set<string>(JSON.parse(dismissedData))
      : new Set<string>();

    // Mark this reservation as dismissed
    if (pendingReservationId) {
      dismissed.add(pendingReservationId);
    }

    // Also mark the Zustand persisted store reservation as dismissed if it exists
    try {
      const persistedStore = localStorage.getItem("reservation-store");
      if (persistedStore) {
        const storeData = JSON.parse(persistedStore);
        if (storeData?.state?.reservationId) {
          dismissed.add(storeData.state.reservationId);
        }
      }
    } catch (error) {
      // Ignore errors
    }

    // Save dismissed list
    localStorage.setItem(
      "dismissed-reservations",
      JSON.stringify(Array.from(dismissed)),
    );
    setDismissedReservations(dismissed);

    // Clear all pending reservations from localStorage
    const keys = Object.keys(localStorage);
    const reservationKeys = keys.filter((key) =>
      key.startsWith("reservation-"),
    );
    reservationKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Clear the persisted store
    localStorage.removeItem("reservation-store");

    // Hide the notification immediately
    setShowPendingNotification(false);
    setPendingReservationId(null);

    // Trigger a re-check to ensure state is updated
    setTimeout(() => {
      checkPendingReservations();
    }, 100);
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-400 to-indigo-800 pt-20 md:pt-24"
    >
      {/* Modern Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl"
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
          className="absolute top-40 right-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
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
          className="absolute bottom-32 left-1/3 w-80 h-80 bg-purple-400/25 rounded-full blur-3xl"
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

        {/* Animated Car 1 - Moving left to right (Top) */}
        <motion.div
          className="absolute top-[12%] z-0"
          initial={{ x: "-100vw" }}
          animate={{ x: "100vw" }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.5,
          }}
        >
          <motion.div
            className="relative"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Modern Car SVG - Even Bigger */}
            <svg
              width="200"
              height="100"
              viewBox="0 0 80 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/50"
            >
              {/* Car body */}
              <motion.path
                d="M10 25 L15 15 L25 10 L55 10 L65 15 L70 25 L70 30 L65 32 L60 32 L58 30 L22 30 L20 32 L15 32 L10 30 Z"
                fill="currentColor"
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Windows */}
              <path
                d="M20 15 L30 12 L50 12 L60 15 L60 20 L20 20 Z"
                fill="rgba(255,255,255,0.2)"
              />
              {/* Wheel 1 */}
              <g transform="translate(25, 30)">
                <circle cx="0" cy="0" r="4" fill="rgba(0,0,0,0.3)" />
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-2"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="2"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-2"
                    y2="0"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="2"
                    y2="0"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                </motion.g>
              </g>
              {/* Wheel 2 */}
              <g transform="translate(55, 30)">
                <circle cx="0" cy="0" r="4" fill="rgba(0,0,0,0.3)" />
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-2"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="2"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-2"
                    y2="0"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="2"
                    y2="0"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                </motion.g>
              </g>
            </svg>
            {/* Speed lines effect behind car */}
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-12 bg-gradient-to-b from-white/30 via-white/50 to-transparent rounded-full"
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>

        {/* Animated Car 2 - Moving right to left (Bottom) */}
        <motion.div
          className="absolute top-[88%] z-0"
          initial={{ x: "100vw" }}
          animate={{ x: "-100vw" }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5,
          }}
        >
          <motion.div
            className="relative"
            animate={{
              y: [0, 6, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Modern Car SVG - Flipped and Even Bigger */}
            <svg
              width="200"
              height="100"
              viewBox="0 0 80 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/40"
              style={{ transform: "scaleX(-1)" }}
            >
              {/* Car body */}
              <motion.path
                d="M10 25 L15 15 L25 10 L55 10 L65 15 L70 25 L70 30 L65 32 L60 32 L58 30 L22 30 L20 32 L15 32 L10 30 Z"
                fill="currentColor"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              {/* Windows */}
              <path
                d="M20 15 L30 12 L50 12 L60 15 L60 20 L20 20 Z"
                fill="rgba(255,255,255,0.15)"
              />
              {/* Wheel 1 */}
              <g transform="translate(25, 30)">
                <circle cx="0" cy="0" r="4" fill="rgba(0,0,0,0.2)" />
                <motion.g
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-2"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="2"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-2"
                    y2="0"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="2"
                    y2="0"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                </motion.g>
              </g>
              {/* Wheel 2 */}
              <g transform="translate(55, 30)">
                <circle cx="0" cy="0" r="4" fill="rgba(0,0,0,0.2)" />
                <motion.g
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-2"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="2"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="-2"
                    y2="0"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <line
                    x1="0"
                    y1="0"
                    x2="2"
                    y2="0"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                </motion.g>
              </g>
            </svg>
            {/* Speed lines effect */}
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-10 bg-gradient-to-b from-white/20 via-white/40 to-transparent rounded-full"
                  animate={{
                    scaleY: [0.3, 1, 0.3],
                    opacity: [0.15, 0.5, 0.15],
                  }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Road lines animation - Top (faster to match car speed) */}
        <div className="absolute top-[15%] left-0 right-0 h-1 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`top-line-${i}`}
              className="absolute h-full w-32 bg-white/20"
              style={{
                left: `${i * 20}%`,
              }}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Road lines animation - Bottom (faster to match car speed) */}
        <div className="absolute top-[85%] left-0 right-0 h-1 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`bottom-line-${i}`}
              className="absolute h-full w-32 bg-white/20"
              style={{
                left: `${i * 20}%`,
              }}
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Speed particles effect - Top */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-top-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${15 + (i % 3) * 30}%`,
              top: `${12 + Math.floor(i / 3) * 3}%`,
            }}
            animate={{
              x: [0, 100],
              y: [0, -50],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Speed particles effect - Bottom */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`particle-bottom-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${15 + (i % 3) * 30}%`,
              top: `${82 + Math.floor(i / 3) * 3}%`,
            }}
            animate={{
              x: [0, 100],
              y: [0, -50],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut",
            }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Pending Reservation Notification Banner - Fixed/Sticky */}
      {showPendingNotification && (
        <div className="fixed top-20 md:top-24 left-4 right-4 md:right-4 md:left-auto z-[60] w-auto md:w-full md:max-w-sm">
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-xl shadow-2xl p-2 sm:p-3 border-2 border-yellow-300 relative overflow-hidden">
            {/* Sparkle animation */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <div className="relative flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="font-bold text-white text-xs sm:text-sm leading-tight mb-0.5 truncate">
                  {t("continueReservation")}
                </h3>
                <p className="text-white/90 text-[10px] sm:text-xs leading-tight line-clamp-1">
                  {t("pendingReservation")}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <Button
                  onClick={handleContinueReservation}
                  className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded-md shadow-md whitespace-nowrap"
                >
                  {t("resumeBooking")}
                </Button>
                <button
                  onClick={handleDismissNotification}
                  className="text-white hover:text-white/80 p-0.5 sm:p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
                  aria-label={t("dismiss")}
                >
                  <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-display mb-6 leading-tight">
              Premium{" "}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Paris
              </span>
              <br />
              Transfers
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
              {t("subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                variant="primary"
                size="lg"
                className="btn-premium"
                onClick={() => router.push(`/${locale}/reservation`)}
              >
                <Calendar className="mr-3 w-5 h-5" />
                {t("quickBooking")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 dark:bg-white/10 dark:text-white dark:border-white/30 dark:hover:bg-white/20 dark:hover:border-white/50"
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <MapPin className="mr-3 w-5 h-5" />
                {t("viewServices")}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 text-sm text-white/90">
              <div className="flex items-center">
                <Shield className="mr-2 w-4 h-4 text-yellow-300" />
                <span>{t("trustIndicators.insured")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 w-4 h-4 text-yellow-300" />
                <span>{t("trustIndicators.service")}</span>
              </div>
              <div className="flex items-center">
                <Star className="mr-2 w-4 h-4 text-yellow-300" />
                <span>{t("trustIndicators.rated")}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Quick Booking Form */}
          <div>
            <div className="relative">
              {/* Main Card */}
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl p-8 border border-white/50 dark:border-gray-700/50 shadow-2xl">
                <div className="text-center text-gray-900 dark:text-gray-100 mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {t("quickBooking")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Get instant quotes and book in seconds
                  </p>
                </div>

                {/* Mini Booking Form */}
                <form onSubmit={handleQuickBooking} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("from")}
                      </label>
                      <Select
                        value={quickBookingData.pickup}
                        onChange={(e) =>
                          setQuickBookingData({
                            ...quickBookingData,
                            pickup: e.target.value,
                          })
                        }
                        placeholder={t("selectPickupLocation")}
                        options={airportLocations.map((location) => ({
                          value: location.id,
                          label: location.name,
                        }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("to")}
                      </label>
                      <Select
                        value={quickBookingData.destination}
                        onChange={(e) =>
                          setQuickBookingData({
                            ...quickBookingData,
                            destination: e.target.value,
                          })
                        }
                        placeholder={t("selectDestination")}
                        options={airportLocations
                          .filter((loc) => loc.id !== quickBookingData.pickup)
                          .map((location) => ({
                            value: location.id,
                            label: location.name,
                          }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("date")}
                      </label>
                      <Input
                        type="date"
                        value={quickBookingData.date}
                        onChange={(e) =>
                          setQuickBookingData({
                            ...quickBookingData,
                            date: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t("time")}
                      </label>
                      <Input
                        type="time"
                        value={quickBookingData.time}
                        onChange={(e) =>
                          setQuickBookingData({
                            ...quickBookingData,
                            time: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    <ClockIcon className="mr-3 w-5 h-5" />
                    {t("getQuote")}
                  </Button>
                </form>
              </div>

              {/* Floating Stats */}
              <motion.div
                className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    500+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("happyClients")}
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("service24")}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="text-white text-2xl opacity-70" />
      </motion.div>
    </section>
  );
}

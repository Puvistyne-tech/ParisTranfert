"use client";

import {
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  Search,
  TrendingUp,
  Users,
  MapPin,
  Briefcase,
  Car,
  FileText,
  Euro,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ReservationDetailModal } from "@/components/admin/ReservationDetailModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Reservation } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { getReservationById, getReservations } from "@/lib/supabaseService";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import {
  getTranslatedServiceName,
  getTranslatedVehicleDescription,
} from "@/lib/translations";

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const tServices = useTranslations("services");
  const tFleet = useTranslations("fleet");
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  
  // Fetch services and vehicle types for display
  const { data: servicesData = [] } = useServices();
  const { data: vehiclesData = [] } = useVehicleTypes();

  // Handle OAuth callback - extract tokens from URL hash and clean URL
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check if there's a hash in the URL (OAuth tokens)
      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );

        // If we have OAuth tokens in the hash, Supabase will handle them
        // We just need to clean up the URL
        if (hashParams.has("access_token") || hashParams.has("error")) {
          // Wait a bit for Supabase to process the session
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Clean up the URL by removing the hash
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, "", cleanUrl);

          // Refresh to update auth state
          router.refresh();
        }
      }
    };

    handleOAuthCallback();
  }, [router]);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingQuotes: 0,
    confirmedReservations: 0,
    totalRevenue: 0,
    recentReservations: [] as Reservation[],
  });
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchStats = async () => {
    try {
      const { data: allReservations } = await getReservations({
        limit: 1000,
        offset: 0,
      });

      const pending = allReservations.filter((r) => r.status === "pending" || r.status === "quote_requested");
      const confirmed = allReservations.filter((r) => r.status === "confirmed");
      const revenue = allReservations
        .filter((r) => r.status === "completed")
        .reduce((sum, r) => sum + Number(r.totalPrice), 0);

      setStats({
        totalReservations: allReservations.length,
        pendingQuotes: pending.length,
        confirmedReservations: confirmed.length,
        totalRevenue: revenue,
        recentReservations: allReservations.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearchReservation = async () => {
    if (!searchId.trim()) return;

    setSearching(true);
    try {
      const reservation = await getReservationById(searchId.trim());
      if (reservation) {
        // Open reservation in modal
        setSelectedReservationId(reservation.id);
      } else {
        // If not found, navigate to reservations page with search filter
        router.push(
          `/${locale}/admin/reservations?search=${encodeURIComponent(searchId.trim())}`,
        );
      }
    } catch (error) {
      console.error("Error searching reservation:", error);
      // Navigate to reservations page with search filter anyway
      router.push(
        `/${locale}/admin/reservations?search=${encodeURIComponent(searchId.trim())}`,
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchReservation();
    }
  };

  const handleUpdateReservation = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          Overview of your reservations and business metrics
        </p>
      </div>

      {/* Quick Reservation Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Search Reservation
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Enter Reservation ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1"
            />
            <Button
              onClick={handleSearchReservation}
              disabled={searching || !searchId.trim()}
              className="w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Reservations
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalReservations}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Quotes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.pendingQuotes}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Confirmed Reservations
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.confirmedReservations}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  €{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Recent Reservations
            </h2>
            <button
              onClick={() => router.push(`/${locale}/admin/reservations`)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-left sm:text-right"
            >
              View All
            </button>
          </div>

          {stats.recentReservations.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No reservations yet
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.recentReservations.map((reservation) => {
                const service = servicesData.find((s) => s.id === reservation.serviceId);
                const vehicleType = vehiclesData.find(
                  (v) => v.id === reservation.vehicleTypeId,
                );
                const serviceName = service
                  ? getTranslatedServiceName(
                      service.id,
                      service.name,
                      (key: string) => {
                        try {
                          const result = tServices(key);
                          return result && result !== key ? result : undefined;
                        } catch {
                          return undefined;
                        }
                      },
                    )
                  : reservation.serviceId;
                const vehicleName = vehicleType
                  ? vehicleType.name
                  : reservation.vehicleTypeId;

                return (
                  <Card
                    key={reservation.id}
                    className="dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={() => setSelectedReservationId(reservation.id)}
                  >
                    <CardContent className="p-4 sm:p-5">
                      {/* Header: Status, ID, and Price */}
                      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 flex-wrap">
                          <StatusBadge status={reservation.status as any} />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {reservation.id.slice(0, 8)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                          <Euro className="w-4 h-4 sm:w-5 sm:h-5" />
                          {reservation.totalPrice.toFixed(2)}
                        </div>
                      </div>

                      {/* Main Content Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Left Column: Date/Time and Route */}
                        <div className="space-y-3">
                          {/* Date and Time */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Date & Time
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {reservation.date}
                                </p>
                                <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {reservation.time}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Route */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Route
                              </p>
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                  {reservation.pickupLocation}
                                </p>
                                {reservation.destinationLocation && (
                                  <>
                                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                                      ↓
                                    </span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                                      {reservation.destinationLocation}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Service, Vehicle, Passengers */}
                        <div className="space-y-3">
                          {/* Service */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Service
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                {serviceName}
                              </p>
                            </div>
                          </div>

                          {/* Vehicle */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                              <Car className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Vehicle
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                {vehicleName}
                              </p>
                            </div>
                          </div>

                          {/* Passengers */}
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Passengers
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {reservation.passengers}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Services */}
                      {(reservation.babySeats > 0 ||
                        reservation.boosterSeats > 0 ||
                        reservation.meetAndGreet) && (
                        <div className="mb-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Additional Services
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {reservation.babySeats > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-md text-xs font-medium">
                                <Users className="w-3.5 h-3.5" />
                                {reservation.babySeats} Baby Seat
                                {reservation.babySeats > 1 ? "s" : ""}
                              </span>
                            )}
                            {reservation.boosterSeats > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-md text-xs font-medium">
                                <Users className="w-3.5 h-3.5" />
                                {reservation.boosterSeats} Booster
                                {reservation.boosterSeats > 1 ? "s" : ""}
                              </span>
                            )}
                            {reservation.meetAndGreet && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-md text-xs font-medium">
                                <Briefcase className="w-3.5 h-3.5" />
                                Meet & Greet
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {reservation.notes && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Notes
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 line-clamp-2 break-words">
                                {reservation.notes}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Created Date */}
                      {reservation.createdAt && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Created: {new Date(reservation.createdAt).toLocaleDateString()}{" "}
                            {new Date(reservation.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Detail Modal */}
        <ReservationDetailModal
        reservationId={selectedReservationId}
        isOpen={!!selectedReservationId}
          onClose={() => {
          setSelectedReservationId(null);
          fetchStats(); // Refresh stats when modal closes
          }}
        />
    </div>
  );
}

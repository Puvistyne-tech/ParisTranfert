"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Car,
  Users,
  FileText,
  Euro,
  List,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FilterBar } from "@/components/admin/FilterBar";
import { ReservationCalendar } from "@/components/admin/ReservationCalendar";
import { ReservationDetailModal } from "@/components/admin/ReservationDetailModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ReservationStatus } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAdminReservations, useInvalidateReservations } from "@/hooks/admin/useAdminReservations";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useReservationsStore } from "@/store/admin/reservationsStore";
import {
  getTranslatedServiceName,
  getTranslatedVehicleDescription,
} from "@/lib/translations";

export default function AdminReservationsPage() {
  const searchParams = useSearchParams();
  const tServices = useTranslations("services");
  const tFleet = useTranslations("fleet");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const {
    selectedReservationId,
    searchQuery,
    statusFilter,
    dateFrom,
    dateTo,
    serviceId,
    vehicleTypeId,
    page,
    setSelectedReservationId,
    setSearchQuery,
    setStatusFilter,
    setDateFrom,
    setDateTo,
    setServiceId,
    setVehicleTypeId,
    setPage,
  } = useReservationsStore();

  const pageSize = 20;

  // Check URL for reservation ID to auto-open modal
  useEffect(() => {
    const pathname = window.location.pathname;
    const reservationMatch = pathname.match(/\/[^/]+\/admin\/reservation\/([^/]+)/);
    const reservationParam = searchParams.get("reservation");
    
    if (reservationMatch && reservationMatch[1]) {
      setSelectedReservationId(reservationMatch[1]);
      const newPath = pathname.replace(/\/reservation\/[^/]+/, "");
      if (newPath !== pathname) {
        window.history.replaceState({}, "", newPath);
      }
    } else if (reservationParam) {
      setSelectedReservationId(reservationParam);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("reservation");
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }

    // Initialize from URL search param
    const searchParam = searchParams.get("search");
    if (searchParam && !searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [searchParams, setSelectedReservationId, setSearchQuery, searchQuery]);

  // Fetch data with TanStack Query
  const { data, isLoading } = useAdminReservations({
    search: searchQuery,
    status: statusFilter ? (statusFilter as ReservationStatus) : undefined,
    dateFrom,
    dateTo,
    serviceId,
    vehicleTypeId,
    page,
    pageSize,
  });

  const reservations = data?.data || [];
  const total = data?.total || 0;

  // Use existing hooks for filter options
  const { data: servicesData = [] } = useServices();
  const { data: vehiclesData = [] } = useVehicleTypes();

  const services = servicesData.map((s) => ({ value: s.id, label: s.name }));
  const vehicles = vehiclesData.map((v) => ({ value: v.id, label: v.name }));

  const statusOptions = [
    { value: "quote_requested", label: "Quote Requested" },
    { value: "pending", label: "Pending" },
    { value: "quote_sent", label: "Quote Sent" },
    { value: "quote_accepted", label: "Quote Accepted" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleFilterChange = (newFilters: {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    serviceId?: string;
    vehicleTypeId?: string;
  }) => {
    if (newFilters.search !== undefined) setSearchQuery(newFilters.search);
    if (newFilters.status !== undefined) setStatusFilter(newFilters.status);
    if (newFilters.dateFrom !== undefined) setDateFrom(newFilters.dateFrom);
    if (newFilters.dateTo !== undefined) setDateTo(newFilters.dateTo);
    if (newFilters.serviceId !== undefined) setServiceId(newFilters.serviceId);
    if (newFilters.vehicleTypeId !== undefined) setVehicleTypeId(newFilters.vehicleTypeId);
  };

  const invalidateReservations = useInvalidateReservations();

  const handleUpdate = () => {
    invalidateReservations();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          Manage all reservations and quotes
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "calendar" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Button>
        </div>
      </div>

      <FilterBar
        filters={{
          search: searchQuery,
          status: statusFilter,
          dateFrom,
          dateTo,
          serviceId,
          vehicleTypeId,
        }}
        onFilterChange={handleFilterChange}
        statusOptions={statusOptions}
        serviceOptions={services}
        vehicleOptions={vehicles}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reservations...</p>
        </div>
      ) : viewMode === "calendar" ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <ReservationCalendar
              reservations={reservations}
              onSelectEvent={(reservation) => setSelectedReservationId(reservation.id)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {reservations.map((reservation) => {
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
                        // Check if result is the key itself (meaning translation not found)
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

          {reservations.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No reservations found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ||
                statusFilter ||
                dateFrom ||
                dateTo ||
                serviceId ||
                vehicleTypeId
                  ? "Try adjusting your filters"
                  : "New reservations will appear here once customers submit them"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{" "}
                {total} reservations
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reservation Detail Modal */}
        <ReservationDetailModal
        reservationId={selectedReservationId}
        isOpen={!!selectedReservationId}
          onClose={() => {
          setSelectedReservationId(null);
          invalidateReservations();
          }}
        />
    </div>
  );
}

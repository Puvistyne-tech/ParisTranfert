"use client";

import { Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FilterBar } from "@/components/admin/FilterBar";
import { ReservationDetailModal } from "@/components/admin/ReservationDetailModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ReservationStatus } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useAdminReservations, useInvalidateReservations } from "@/hooks/admin/useAdminReservations";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useReservationsStore } from "@/store/admin/reservationsStore";

export default function AdminReservationsPage() {
  const searchParams = useSearchParams();
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
      <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
          Manage all reservations and quotes
        </p>

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
      ) : (
        <>
          <div className="grid gap-3">
            {reservations.map((reservation) => (
              <Card
                key={reservation.id}
                className="dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedReservationId(reservation.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Status and ID */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <StatusBadge status={reservation.status as any} />
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {reservation.id.slice(0, 8)}
                        </span>
                      </div>

                      {/* Date and Time */}
                      <div className="mb-3">
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {reservation.date} at {reservation.time}
                        </p>
                        {reservation.createdAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Created: {new Date(reservation.createdAt).toLocaleDateString()}
                          </p>
                          )}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block sm:inline">
                            Service:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100 block sm:inline">
                            {reservation.serviceId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400 block sm:inline">
                            Vehicle:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100 block sm:inline">
                            {reservation.vehicleTypeId}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-600 dark:text-gray-400 block sm:inline">
                            Route:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100 block sm:inline">
                            {reservation.pickupLocation}
                            {reservation.destinationLocation
                              ? ` → ${reservation.destinationLocation}`
                              : ""}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Price:
                          </span>{" "}
                          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            €{reservation.totalPrice}
                          </span>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

"use client";

import { Calendar, Download, Eye } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { FilterBar } from "@/components/admin/FilterBar";
import { ReservationDetailModal } from "@/components/admin/ReservationDetailModal";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type {
  Reservation,
  ReservationStatus,
} from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { getReservations } from "@/lib/supabaseService";

export default function AdminReservationsPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: "",
    dateFrom: "",
    dateTo: "",
    serviceId: "",
    vehicleTypeId: "",
  });
  const pageSize = 20;

  // Check URL for reservation ID to auto-open modal
  useEffect(() => {
    // Check for reservation ID in URL path (e.g., /{locale}/admin/reservation/{id})
    const pathname = window.location.pathname;
    const reservationMatch = pathname.match(/\/[^/]+\/admin\/reservation\/([^/]+)/);
    
    // Also check for reservation query parameter
    const reservationParam = searchParams.get("reservation");
    
    if (reservationMatch && reservationMatch[1]) {
      setSelectedReservationId(reservationMatch[1]);
      // Clean up URL by removing the reservation path
      const newPath = pathname.replace(/\/reservation\/[^/]+/, "");
      if (newPath !== pathname) {
        window.history.replaceState({}, "", newPath);
      }
    } else if (reservationParam) {
      setSelectedReservationId(reservationParam);
      // Clean up URL by removing the reservation query parameter
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("reservation");
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: servicesData = [] } = useServices();
  const { data: vehiclesData = [] } = useVehicleTypes();

  const services = servicesData.map((s) => ({ value: s.id, label: s.name }));
  const vehicles = vehiclesData.map((v) => ({ value: v.id, label: v.name }));

  useEffect(() => {
    fetchReservations();
  }, [filters, page]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const statusFilter = filters.status
        ? (filters.status as ReservationStatus)
        : undefined;
      const result = await getReservations({
        status: statusFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      let filtered = result.data;

      // Apply additional filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase().trim();
        // Check if search is an exact UUID match (reservation ID)
        // UUIDs are typically 36 characters with hyphens: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        const isUUIDFormat =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            filters.search.trim(),
          );
        const isPartialUUID = /^[0-9a-f-]{8,}$/i.test(filters.search.trim());

        if (isUUIDFormat) {
          // Exact UUID match - prioritize this result
          const exactMatch = filtered.find(
            (r) => r.id.toLowerCase() === searchLower,
          );
          if (exactMatch) {
            filtered = [exactMatch];
          } else {
            // No exact match found
            filtered = [];
          }
        } else if (isPartialUUID) {
          // Partial UUID - prioritize ID matches
          const idMatches = filtered.filter((r) =>
            r.id.toLowerCase().includes(searchLower),
          );
          const otherMatches = filtered.filter(
            (r) =>
              !r.id.toLowerCase().includes(searchLower) &&
              (r.pickupLocation.toLowerCase().includes(searchLower) ||
                r.destinationLocation?.toLowerCase().includes(searchLower)),
          );
          filtered = [...idMatches, ...otherMatches];
        } else {
          // Regular search - check all fields
          filtered = filtered.filter(
            (r) =>
              r.id.toLowerCase().includes(searchLower) ||
              r.pickupLocation.toLowerCase().includes(searchLower) ||
              r.destinationLocation?.toLowerCase().includes(searchLower),
          );
        }
      }

      if (filters.serviceId) {
        filtered = filtered.filter((r) => r.serviceId === filters.serviceId);
      }

      if (filters.vehicleTypeId) {
        filtered = filtered.filter(
          (r) => r.vehicleTypeId === filters.vehicleTypeId,
        );
      }

      if (filters.dateFrom) {
        filtered = filtered.filter((r) => r.date >= filters.dateFrom);
      }

      if (filters.dateTo) {
        filtered = filtered.filter((r) => r.date <= filters.dateTo);
      }

      setReservations(filtered);
      setTotal(filtered.length);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "quote_requested", label: "Quote Requested" },
    { value: "pending", label: "Pending" },
    { value: "quote_sent", label: "Quote Sent" },
    { value: "quote_accepted", label: "Quote Accepted" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservationId(reservation.id);
  };

  const handleUpdate = () => {
    fetchReservations();
  };

  // Remove unused imports
  // ReservationDetailModal is no longer used - navigation goes to unified page

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reservations & Quotes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all reservations and quotes
        </p>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={(newFilters) => {
          setFilters(newFilters as typeof filters);
          setPage(1);
        }}
        statusOptions={statusOptions}
        serviceOptions={services}
        vehicleOptions={vehicles}
      />

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading reservations...
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2 flex-wrap gap-2">
                        <StatusBadge status={reservation.status as any} />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {reservation.id.slice(0, 8)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {reservation.date} at {reservation.time}
                        </span>
                        {reservation.createdAt && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            Created:{" "}
                            {new Date(reservation.createdAt).toLocaleString()}
                          </span>
                        )}
                        {reservation.updatedAt &&
                          reservation.updatedAt !== reservation.createdAt && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Modified:{" "}
                              {new Date(reservation.updatedAt).toLocaleString()}
                            </span>
                          )}
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Service:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {reservation.serviceId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Vehicle:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {reservation.vehicleTypeId}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Route:
                          </span>{" "}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {reservation.pickupLocation}
                            {reservation.destinationLocation
                              ? ` → ${reservation.destinationLocation}`
                              : ""}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">
                            Price:
                          </span>{" "}
                          <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            €{reservation.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(reservation)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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
                {Object.values(filters).some((f) => f)
                  ? "Try adjusting your filters"
                  : "New reservations will appear here once customers submit them"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} reservations
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
          fetchReservations(); // Refresh list when modal closes
          }}
        />
    </div>
  );
}

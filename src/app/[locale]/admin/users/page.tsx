"use client";

import { Calendar, Eye, Mail, Phone, Search, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { ReservationDetailModal } from "@/components/admin/ReservationDetailModal";
import { StatusBadge, type StatusType } from "@/components/admin/StatusBadge";
import type { Client } from "@/components/models/clients";
import type { Reservation } from "@/components/models/reservations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getClientReservations, getClients } from "@/lib/supabaseService";

export default function AdminUsersPage() {
  const router = useRouter();
  const locale = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientReservations, setClientReservations] = useState<Reservation[]>(
    [],
  );
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const pageSize = 20;

  useEffect(() => {
    fetchClients();
  }, [search, page]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const result = await getClients({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search: search || undefined,
      });
      setClients(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClient = async (client: Client) => {
    setSelectedClient(client);
    try {
      const reservations = await getClientReservations(client.id);
      setClientReservations(reservations);
    } catch (error) {
      console.error("Error fetching client reservations:", error);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Users & Clients
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage all registered clients
        </p>
      </div>

      {/* Search */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="dark:bg-gray-800 dark:border-gray-700"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                          <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {client.firstName} {client.lastName}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{client.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleViewClient(client)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} clients
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

      {/* Client Details Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedClient(null)}
                >
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {selectedClient.email}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </div>
                  <p className="text-gray-900 dark:text-white">
                    {selectedClient.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reservations
                </h3>
                {clientReservations.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No reservations found
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => setSelectedReservationId(reservation.id)}
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {reservation.date} at {reservation.time}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reservation.pickupLocation} →{" "}
                            {reservation.destinationLocation || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <StatusBadge
                            status={reservation.status as StatusType}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            €{reservation.totalPrice}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      <ReservationDetailModal
        reservationId={selectedReservationId}
        isOpen={!!selectedReservationId}
        onClose={() => {
          setSelectedReservationId(null);
          // Refresh client reservations if a client is selected
          if (selectedClient) {
            handleViewClient(selectedClient);
          }
        }}
      />
    </div>
  );
}

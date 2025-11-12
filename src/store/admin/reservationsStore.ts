import { create } from "zustand";
import type { Reservation, ReservationStatus } from "@/components/models/reservations";

interface ReservationsStore {
  // UI State
  selectedReservationId: string | null;
  searchQuery: string;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  serviceId: string;
  vehicleTypeId: string;
  page: number;

  // Actions
  setSelectedReservationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setServiceId: (id: string) => void;
  setVehicleTypeId: (id: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useReservationsStore = create<ReservationsStore>((set) => ({
  // Initial state
  selectedReservationId: null,
  searchQuery: "",
  statusFilter: "",
  dateFrom: "",
  dateTo: "",
  serviceId: "",
  vehicleTypeId: "",
  page: 1,

  // Actions
  setSelectedReservationId: (id) => set({ selectedReservationId: id }),
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setStatusFilter: (status) => set({ statusFilter: status, page: 1 }),
  setDateFrom: (date) => set({ dateFrom: date, page: 1 }),
  setDateTo: (date) => set({ dateTo: date, page: 1 }),
  setServiceId: (id) => set({ serviceId: id, page: 1 }),
  setVehicleTypeId: (id) => set({ vehicleTypeId: id, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "",
      dateFrom: "",
      dateTo: "",
      serviceId: "",
      vehicleTypeId: "",
      page: 1,
    }),
}));


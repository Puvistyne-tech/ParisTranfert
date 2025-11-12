import { create } from "zustand";
import type { ServiceVehiclePricing } from "@/components/models/pricing";

interface PricingStore {
  // UI State
  isCreateModalOpen: boolean;
  isEditingCell: { rowId: string; columnId: string } | null;
  editValue: string;
  deleteConfirm: { isOpen: boolean; pricingId: string | null };
  showColumnMenu: boolean;
  searchQuery: string;
  serviceFilter: string;
  vehicleFilter: string;
  groupBy: "service" | "vehicle" | "none";

  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  setEditingCell: (cell: { rowId: string; columnId: string } | null) => void;
  setEditValue: (value: string) => void;
  setDeleteConfirm: (confirm: { isOpen: boolean; pricingId: string | null }) => void;
  setShowColumnMenu: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  setServiceFilter: (serviceId: string) => void;
  setVehicleFilter: (vehicleId: string) => void;
  setGroupBy: (group: "service" | "vehicle" | "none") => void;
  resetFilters: () => void;
}

export const usePricingStore = create<PricingStore>((set) => ({
  // Initial state
  isCreateModalOpen: false,
  isEditingCell: null,
  editValue: "",
  deleteConfirm: { isOpen: false, pricingId: null },
  showColumnMenu: false,
  searchQuery: "",
  serviceFilter: "",
  vehicleFilter: "",
  groupBy: "none",

  // Actions
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  setEditingCell: (cell) => set({ isEditingCell: cell }),
  setEditValue: (value) => set({ editValue: value }),
  setDeleteConfirm: (confirm) => set({ deleteConfirm: confirm }),
  setShowColumnMenu: (show) => set({ showColumnMenu: show }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setServiceFilter: (serviceId) => set({ serviceFilter: serviceId }),
  setVehicleFilter: (vehicleId) => set({ vehicleFilter: vehicleId }),
  setGroupBy: (group) => set({ groupBy: group }),
  resetFilters: () =>
    set({
      searchQuery: "",
      serviceFilter: "",
      vehicleFilter: "",
      groupBy: "none",
    }),
}));


import { create } from "zustand";
import type { Service } from "@/components/models/services";

interface ServicesStore {
  // UI State
  isServiceModalOpen: boolean;
  selectedService: Service | null;
  searchQuery: string;
  selectedCategory: string;
  availabilityFilter: string;
  popularFilter: string;

  // Actions
  openServiceModal: (service?: Service | null) => void;
  closeServiceModal: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;
  setAvailabilityFilter: (filter: string) => void;
  setPopularFilter: (filter: string) => void;
  resetFilters: () => void;
}

export const useServicesStore = create<ServicesStore>((set) => ({
  // Initial state
  isServiceModalOpen: false,
  selectedService: null,
  searchQuery: "",
  selectedCategory: "",
  availabilityFilter: "all",
  popularFilter: "all",

  // Actions
  openServiceModal: (service = null) =>
    set({ isServiceModalOpen: true, selectedService: service }),
  closeServiceModal: () =>
    set({ isServiceModalOpen: false, selectedService: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  setAvailabilityFilter: (filter) => set({ availabilityFilter: filter }),
  setPopularFilter: (filter) => set({ popularFilter: filter }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategory: "",
      availabilityFilter: "all",
      popularFilter: "all",
    }),
}));


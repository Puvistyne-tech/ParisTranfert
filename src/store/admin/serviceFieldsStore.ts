import { create } from "zustand";
import type { ServiceField } from "@/components/models/serviceFields";

interface ServiceFieldsStore {
  // UI State
  isServiceFieldsModalOpen: boolean;
  isFieldEditorOpen: boolean;
  selectedField: ServiceField | null;
  serviceId: string | null;

  // Actions
  openServiceFieldsModal: (serviceId: string) => void;
  closeServiceFieldsModal: () => void;
  openFieldEditor: (field?: ServiceField | null) => void;
  closeFieldEditor: () => void;
  setServiceId: (id: string | null) => void;
}

export const useServiceFieldsStore = create<ServiceFieldsStore>((set) => ({
  // Initial state
  isServiceFieldsModalOpen: false,
  isFieldEditorOpen: false,
  selectedField: null,
  serviceId: null,

  // Actions
  openServiceFieldsModal: (serviceId) =>
    set({ isServiceFieldsModalOpen: true, serviceId }),
  closeServiceFieldsModal: () =>
    set({ isServiceFieldsModalOpen: false, serviceId: null, selectedField: null }),
  openFieldEditor: (field = null) =>
    set({ isFieldEditorOpen: true, selectedField: field }),
  closeFieldEditor: () =>
    set({ isFieldEditorOpen: false, selectedField: null }),
  setServiceId: (id) => set({ serviceId: id }),
}));


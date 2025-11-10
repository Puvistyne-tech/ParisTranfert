import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReservationFormData } from "@/lib/validations";
import type { VehicleType } from "@/components/models/vehicleTypes";
import type { Service } from "@/components/models/services";

export interface AdditionalServices {
  babySeats: number;
  boosters: number;
  meetAndGreet: boolean;
}

interface ReservationState {
  // Reservation ID - local tracking only (not sent to server)
  reservationId: string | null;
  
  // Final reservation ID from server after successful submission
  submittedReservationId: string | null;
  
  // Whether reservation is completed (prevents going back to sections)
  isCompleted: boolean;
  
  // Whether reservation submission is in progress
  isSubmitting: boolean;
  
  // Hash of reservation data to track submission attempts
  submissionAttemptHash: string | null;
  
  // Current step in the reservation process
  currentStep: number;
  
  // Form data for booking details
  formData: Partial<ReservationFormData>;
  
  // Selected items (stored as full objects, not just IDs)
  selectedService: Service | null;
  selectedVehicleType: VehicleType | null;
  
  // Additional services
  additionalServices: AdditionalServices;
  
  // Service-specific sub-options data
  serviceSubData: Record<string, any>;

  // Actions
  setReservationId: (id: string) => void;
  setSubmittedReservationId: (id: string) => void;
  setCompleted: (completed: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmissionAttemptHash: (hash: string | null) => void;
  setCurrentStep: (step: number) => void;
  updateFormData: (data: Partial<ReservationFormData>) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedVehicleType: (vehicleType: VehicleType | null) => void;
  updateAdditionalServices: (services: Partial<AdditionalServices>) => void;
  updateServiceSubData: (data: Record<string, any>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  clearSelections: () => void;
  printData: () => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservationId: null,
      submittedReservationId: null,
      isCompleted: false,
      isSubmitting: false,
      submissionAttemptHash: null,
      currentStep: 1,
      formData: {},
      selectedService: null,
      selectedVehicleType: null,
      additionalServices: {
        babySeats: 0,
        boosters: 0,
        meetAndGreet: false
      },
      serviceSubData: {},

      setReservationId: (id) => set({ reservationId: id }),
      setSubmittedReservationId: (id) => set({ submittedReservationId: id }),
      setCompleted: (completed) => set({ isCompleted: completed }),
      setSubmitting: (submitting) => set({ isSubmitting: submitting }),
      setSubmissionAttemptHash: (hash) => set({ submissionAttemptHash: hash }),
      setCurrentStep: (step) => {
        const state = get();
        // Prevent going back to sections if reservation is completed
        if (state.isCompleted && step < 3) {
          return;
        }
        set({ currentStep: step });
      },

      updateFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      setSelectedService: (service) => {
        set({ selectedService: service });
        // Clear service sub-data when service changes
        if (service === null) {
          set({ serviceSubData: {} });
        }
      },

      setSelectedVehicleType: (vehicleType) => set({ selectedVehicleType: vehicleType }),

      updateAdditionalServices: (services) =>
        set((state) => ({
          additionalServices: { ...state.additionalServices, ...services },
        })),

      updateServiceSubData: (data) =>
        set((state) => ({
          serviceSubData: { ...state.serviceSubData, ...data },
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      resetForm: () =>
        set({
          reservationId: null,
          submittedReservationId: null,
          isCompleted: false,
          isSubmitting: false,
          submissionAttemptHash: null,
          currentStep: 1,
          formData: {},
          selectedService: null,
          selectedVehicleType: null,
          additionalServices: {
            babySeats: 0,
            boosters: 0,
            meetAndGreet: false
          },
          serviceSubData: {},
        }),

      clearSelections: () =>
        set({
          selectedService: null,
          selectedVehicleType: null,
          serviceSubData: {},
          formData: {},
          additionalServices: {
            babySeats: 0,
            boosters: 0,
            meetAndGreet: false
          },
          isCompleted: false,
          isSubmitting: false,
          submissionAttemptHash: null,
          currentStep: 1,
        }),

      printData: () => {
        const state = get();
        console.log('Reservation Data:', {
          currentStep: state.currentStep,
          selectedService: state.selectedService,
          selectedVehicleType: state.selectedVehicleType,
          additionalServices: state.additionalServices,
          serviceSubData: state.serviceSubData,
          formData: state.formData,
        });
      },
    }),
    {
      name: "reservation-store",
      partialize: (state) => ({
        reservationId: state.reservationId,
        submittedReservationId: state.submittedReservationId,
        isCompleted: state.isCompleted,
        isSubmitting: state.isSubmitting,
        submissionAttemptHash: state.submissionAttemptHash,
        currentStep: state.currentStep,
        formData: state.formData,
        selectedService: state.selectedService,
        selectedVehicleType: state.selectedVehicleType,
        additionalServices: state.additionalServices,
        serviceSubData: state.serviceSubData,
      }),
    },
  ),
);

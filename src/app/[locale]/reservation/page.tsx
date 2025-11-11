"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Step1Selection } from "@/components/reservation/Step1Selection";
import { Step2TripDetails } from "@/components/reservation/Step2TripDetails";
import { Step3BookingSummary } from "@/components/reservation/Step3BookingSummary";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCategories } from "@/hooks/useCategories";
import { useLocations } from "@/hooks/useLocations";
import { usePricing } from "@/hooks/usePricing";
import { useServiceFields } from "@/hooks/useServiceFields";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import {
  createServiceFieldSchema,
  locationSchema,
  reservationSchema,
} from "@/lib/validations";
import { useReservationStore } from "@/store/reservationStore";

interface ServiceField {
  type:
    | "text"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "time"
    | "location_select";
  label: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  is_pickup?: boolean;
  is_destination?: boolean;
}

export default function ReservationPage() {
  const t = useTranslations("reservationPage");
  const tReservation = useTranslations("reservation");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [errorFields, setErrorFields] = useState<Set<string>>(new Set());
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const {
    reservationId,
    isCompleted,
    currentStep,
    selectedVehicleType,
    selectedService,
    additionalServices,
    serviceSubData,
    formData,
    setReservationId,
    setCompleted,
    setCurrentStep,
    setSelectedVehicleType,
    setSelectedService,
    updateAdditionalServices,
    updateServiceSubData,
    updateFormData,
    clearSelections,
  } = useReservationStore();

  // Prevent going back to sections if reservation is completed - redirect to submit page
  useEffect(() => {
    if (isCompleted) {
      router.push(`/${locale}/reservation/submit`);
      return;
    }
  }, [isCompleted, locale, router]);

  // Note: reservationId is for local tracking only, not sent to server
  // Server generates the actual reservation ID after submission

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: vehicleTypes = [], isLoading: vehicleTypesLoading } =
    useVehicleTypes();
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: serviceFields = [] } = useServiceFields(selectedService?.id);

  const loading =
    categoriesLoading ||
    servicesLoading ||
    vehicleTypesLoading ||
    locationsLoading;

  // Handle vehicle type from query parameter (fallback if not already selected)
  useEffect(() => {
    const vehicleTypeParam = searchParams.get("vehicleType");
    if (vehicleTypeParam && !selectedVehicleType && vehicleTypes.length > 0) {
      const vehicleType = vehicleTypes.find((vt) => vt.id === vehicleTypeParam);
      if (vehicleType) {
        setSelectedVehicleType(vehicleType);
        // Clean up URL by removing query parameter
        router.replace(`/${locale}/reservation`, { scroll: false });
      }
    }
  }, [
    searchParams,
    selectedVehicleType,
    vehicleTypes,
    setSelectedVehicleType,
    locale,
    router,
  ]);

  // Extract only location fields that affect pricing
  // This ensures price only refetches when locations change, not when other fields like flight_number change
  const pickupLocation = serviceSubData?.pickup_location;
  const destinationLocation = serviceSubData?.destination_location;

  // Use TanStack Query to fetch pricing with caching - prevents unnecessary refetches
  const isAirportTransfer = selectedService?.id === "airport-transfers";
  const { data: pricingData, isLoading: priceLoading } = usePricing(
    isAirportTransfer ? selectedService?.id : null,
    isAirportTransfer ? selectedVehicleType?.id : null,
    isAirportTransfer ? pickupLocation : null,
    isAirportTransfer ? destinationLocation : null,
    isAirportTransfer,
  );

  const basePrice = pricingData?.price ?? null;

  const handleBackToHome = () => {
    const hasSelections =
      selectedVehicleType ||
      selectedService ||
      additionalServices.babySeats > 0 ||
      additionalServices.boosters > 0 ||
      additionalServices.meetAndGreet;

    if (hasSelections) {
      setShowExitConfirmation(true);
    } else {
      router.push(`/${locale}`);
    }
  };

  const handleSaveAndExit = () => {
    // State is already saved via useEffect, just navigate
    setShowExitConfirmation(false);
    router.push(`/${locale}`);
  };

  const handleConfirmExit = () => {
    // Delete and start over - clear everything including localStorage
    if (reservationId) {
      localStorage.removeItem(`reservation-${reservationId}`);
    }
    // Explicitly clear the Zustand persisted store BEFORE resetForm
    localStorage.removeItem("reservation-store");
    // Use resetForm to completely clear everything
    const { resetForm } = useReservationStore.getState();
    resetForm();
    setShowExitConfirmation(false);
    router.push(`/${locale}`);
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  // Load saved reservation on mount using reservation ID
  useEffect(() => {
    if (reservationId) {
      const savedReservation = localStorage.getItem(
        `reservation-${reservationId}`,
      );
      if (savedReservation) {
        try {
          const state = JSON.parse(savedReservation);
          // Check if saved state is recent (within 7 days)
          const daysSinceSave =
            (Date.now() - state.timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceSave < 7 && !state.isCompleted) {
            // Restore state
            if (state.currentStep) setCurrentStep(state.currentStep);
            if (state.selectedVehicleType)
              setSelectedVehicleType(state.selectedVehicleType);
            if (state.selectedService)
              setSelectedService(state.selectedService);
            if (state.additionalServices)
              updateAdditionalServices(state.additionalServices);
            if (state.serviceSubData)
              updateServiceSubData(state.serviceSubData);
            if (state.formData) updateFormData(state.formData);
            if (state.isCompleted) setCompleted(state.isCompleted);
          } else {
            localStorage.removeItem(`reservation-${reservationId}`);
          }
        } catch (error) {
          console.error("Error loading saved reservation:", error);
          localStorage.removeItem(`reservation-${reservationId}`);
        }
      }
    }
  }, [
    reservationId,
    setCurrentStep,
    setSelectedVehicleType,
    setSelectedService,
    updateAdditionalServices,
    updateServiceSubData,
    updateFormData,
    setCompleted,
  ]);

  // Save reservation state to localStorage whenever it changes
  useEffect(() => {
    if (reservationId && !isCompleted) {
      const reservationState = {
        currentStep,
        selectedVehicleType,
        selectedService,
        additionalServices,
        serviceSubData,
        formData,
        isCompleted,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `reservation-${reservationId}`,
        JSON.stringify(reservationState),
      );

      // Dispatch custom event to notify other components (like Hero notification)
      window.dispatchEvent(new Event("reservation-storage-change"));
    }
  }, [
    reservationId,
    currentStep,
    selectedVehicleType,
    selectedService,
    additionalServices,
    serviceSubData,
    formData,
    isCompleted,
  ]);

  const handleModifyVehicleType = () => {
    setSelectedVehicleType(null);
    setValidationErrors([]);
    setErrorFields(new Set());
  };

  const handleModifyService = () => {
    setSelectedService(null);
    setValidationErrors([]);
    setErrorFields(new Set());
  };

  const handleContinueToTripDetails = () => {
    setValidationErrors([]);
    setErrorFields(new Set());
    const errors: string[] = [];

    if (!selectedVehicleType) {
      errors.push("Please select a vehicle type");
    }

    if (!selectedService) {
      errors.push("Please select a service");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setValidationErrors([]);
    setErrorFields(new Set());
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "passengers") {
      updateFormData({ [field]: parseInt(value) });
    } else {
      updateFormData({ [field]: value });
    }

    // Clear error for this field when user starts typing
    if (errorFields.has(field)) {
      const newErrorFields = new Set(errorFields);
      newErrorFields.delete(field);
      setErrorFields(newErrorFields);

      // Also clear related error messages
      const remainingErrors = validationErrors.filter((error) => {
        const fieldLower = field.toLowerCase();
        const errorLower = error.toLowerCase();
        return !(
          errorLower.includes(fieldLower) ||
          (field === "firstName" && errorLower.includes("first name")) ||
          (field === "lastName" && errorLower.includes("last name")) ||
          (field === "pickup" && errorLower.includes("pickup")) ||
          (field === "destination" && errorLower.includes("destination"))
        );
      });
      if (remainingErrors.length !== validationErrors.length) {
        setValidationErrors(remainingErrors);
      }
    }
  };

  const handleServiceFieldChange = (fieldKey: string, value: any) => {
    const newData = { ...serviceSubData, [fieldKey]: value };
    updateServiceSubData(newData);

    // Clear error for this service field when user changes it
    if (errorFields.has(fieldKey)) {
      const newErrorFields = new Set(errorFields);
      newErrorFields.delete(fieldKey);
      setErrorFields(newErrorFields);

      // Also clear related error messages
      const field = serviceFields.find((f) => f.fieldKey === fieldKey);
      if (field) {
        const remainingErrors = validationErrors.filter((error) => {
          return !error.includes(field.label);
        });
        if (remainingErrors.length !== validationErrors.length) {
          setValidationErrors(remainingErrors);
        }
      }
    }
  };

  const isFormValid = () => {
    // Basic contact info validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      return false;
    }

    // Basic trip info validation - passengers defaults to 1 if not set
    const passengers = formData.passengers
      ? parseInt(formData.passengers.toString(), 10)
      : 1;
    if (!formData.date || !formData.time || passengers < 1) {
      return false;
    }

    // Validate service fields only if service is selected
    if (selectedService) {
      // If service fields are loaded, validate required ones
      if (serviceFields.length > 0) {
        // Check all required service fields
        for (const field of serviceFields) {
          if (field.required) {
            const value = serviceSubData[field.fieldKey];
            if (
              !value ||
              value === "" ||
              (Array.isArray(value) && value.length === 0)
            ) {
              return false;
            }
          }
        }
      }

      // Check location and destination are filled (mapped from service_fields)
      // Only check if the service has pickup/destination fields defined
      const pickupField = serviceFields.find((f) => f.isPickup);
      const destinationField = serviceFields.find((f) => f.isDestination);

      if (pickupField) {
        const pickupValue =
          serviceSubData[pickupField.fieldKey] || formData.pickup;
        if (!pickupValue || pickupValue === "") {
          return false;
        }
      }

      if (destinationField) {
        const destinationValue =
          serviceSubData[destinationField.fieldKey] || formData.destination;
        if (!destinationValue || destinationValue === "") {
          return false;
        }
      }

      // For airport transfers, check pickup and destination are different
      if (selectedService.id === "airport-transfers") {
        const pickupValue =
          formData.pickup ||
          (pickupField ? serviceSubData[pickupField.fieldKey] : "");
        const destinationValue =
          formData.destination ||
          (destinationField ? serviceSubData[destinationField.fieldKey] : "");
        // Normalize for comparison (trim and lowercase)
        const normalizedPickup = String(pickupValue).toLowerCase().trim();
        const normalizedDestination = String(destinationValue)
          .toLowerCase()
          .trim();
        if (normalizedPickup === normalizedDestination) {
          return false;
        }
      }
    }

    console.log("isFormValid", true);

    return true;
  };

  const handleSubmitBooking = () => {
    const errors: string[] = [];
    const fieldsWithErrors = new Set<string>();

    try {
      // Get pickup and destination from service fields if they exist
      const pickupField = serviceFields.find((f) => f.isPickup);
      const destinationField = serviceFields.find((f) => f.isDestination);
      const pickupValue = pickupField
        ? serviceSubData[pickupField.fieldKey] || formData.pickup || ""
        : formData.pickup || "";
      const destinationValue = destinationField
        ? serviceSubData[destinationField.fieldKey] ||
          formData.destination ||
          ""
        : formData.destination || "";

      // Validate base form data with Zod
      const baseData = {
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        pickup: pickupValue,
        destination: destinationValue,
        date: formData.date || "",
        time: formData.time || "",
        service: selectedService?.id || "",
        passengers: formData.passengers || 1,
      };

      // Validate base reservation schema
      const baseResult = reservationSchema.safeParse(baseData);
      if (!baseResult.success) {
        baseResult.error.issues.forEach((err) => {
          const fieldName = err.path[0] as string;
          errors.push(err.message);
          fieldsWithErrors.add(fieldName);
        });
      }

      // Validate location schema for airport transfers
      if (selectedService?.id === "airport-transfers") {
        const locationResult = locationSchema.safeParse({
          pickup: pickupValue,
          destination: destinationValue,
        });
        if (!locationResult.success) {
          locationResult.error.issues.forEach((err) => {
            errors.push(err.message);
            // Map location errors to service field keys
            const fieldPath = err.path[0] as string;
            if (fieldPath === "pickup") {
              // Find the pickup location field in service fields
              const pickupField = serviceFields.find((f) => f.isPickup);
              if (pickupField) {
                fieldsWithErrors.add(pickupField.fieldKey);
              }
              fieldsWithErrors.add("pickup");
            } else if (fieldPath === "destination") {
              // Find the destination location field in service fields
              const destField = serviceFields.find((f) => f.isDestination);
              if (destField) {
                fieldsWithErrors.add(destField.fieldKey);
              }
              fieldsWithErrors.add("destination");
            }
          });
        }
      }

      // Validate service-specific fields
      if (selectedService && serviceFields.length > 0) {
        const serviceFieldSchema = createServiceFieldSchema(serviceFields);
        const serviceFieldResult = serviceFieldSchema.safeParse(serviceSubData);
        if (!serviceFieldResult.success) {
          serviceFieldResult.error.issues.forEach((err) => {
            errors.push(err.message);
            const fieldKey = err.path[0] as string;
            fieldsWithErrors.add(fieldKey);
          });
        }

        // Validate pickup and destination if they're required by service fields
        if (pickupField && pickupField.required) {
          if (!pickupValue || pickupValue === "") {
            errors.push(`${pickupField.label} is required`);
            fieldsWithErrors.add(pickupField.fieldKey);
            fieldsWithErrors.add("pickup");
          }
        }

        if (destinationField && destinationField.required) {
          if (!destinationValue || destinationValue === "") {
            errors.push(`${destinationField.label} is required`);
            fieldsWithErrors.add(destinationField.fieldKey);
            fieldsWithErrors.add("destination");
          }
        }
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        setErrorFields(fieldsWithErrors);
        return;
      }

      // All validations passed, clear errors and proceed to confirmation
      setValidationErrors([]);
      setErrorFields(new Set());
      router.push(`/${locale}/confirmation`);
    } catch (error) {
      console.error("Validation error:", error);
      errors.push("An error occurred during validation. Please try again.");
      setValidationErrors(errors);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToHome}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToHome")}</span>
            </Button>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("stepOf", { current: currentStep, total: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full shadow-xl relative dark:bg-gray-800">
            <CardContent className="p-6">
              {/* Close button in top right */}
              <button
                onClick={handleCancelExit}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label={t("cancel")}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pr-8">
                {t("saveReservation")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t("unsavedSelections")}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveAndExit}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {t("saveExit")}
                </Button>
                <Button
                  onClick={handleConfirmExit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {t("deleteStartOver")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Vehicle Type, Service, and Additional Services */}
        {currentStep === 1 && (
          <Step1Selection
            vehicleTypes={vehicleTypes}
            categories={categories}
            services={services}
            selectedVehicleType={selectedVehicleType}
            selectedService={selectedService}
            additionalServices={additionalServices}
            validationErrors={validationErrors}
            onVehicleTypeSelect={setSelectedVehicleType}
            onVehicleTypeModify={handleModifyVehicleType}
            onServiceSelect={setSelectedService}
            onServiceModify={handleModifyService}
            onAdditionalServicesUpdate={updateAdditionalServices}
            onContinue={handleContinueToTripDetails}
          />
        )}

        {/* Step 2: Trip Details */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Step2TripDetails
                selectedService={selectedService}
                selectedVehicleType={selectedVehicleType}
                serviceSubData={serviceSubData}
                formData={formData}
                validationErrors={validationErrors}
                errorFields={errorFields}
                setValidationErrors={setValidationErrors}
                onBack={handleBackToStep1}
                onServiceFieldChange={handleServiceFieldChange}
                onFormFieldChange={handleInputChange}
                onSubmit={handleSubmitBooking}
                isFormValid={isFormValid}
              />
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Step3BookingSummary
                selectedVehicleType={selectedVehicleType}
                selectedService={selectedService}
                additionalServices={additionalServices}
                basePrice={basePrice}
                priceLoading={priceLoading}
                isFormValid={isFormValid}
                onSubmit={handleSubmitBooking}
                formData={formData}
                serviceSubData={serviceSubData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plane,
  TestTube,
  User,
  Users,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslatedFieldLabel } from "@/lib/translations";
import { useEffect, useMemo, useState } from "react";
import type { Service } from "@/components/models";
import type { Location } from "@/components/models/locations";
import type { ServiceField } from "@/components/models/serviceFields";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Select } from "@/components/ui/Select";
import { ContactInformation } from "./ContactInformation";
import { useLocationsByService } from "@/hooks/useLocationsByService";
import { useServiceFields } from "@/hooks/useServiceFields";
import { cn } from "@/lib/utils";

interface Step2TripDetailsProps {
  selectedService: Service | null;
  selectedVehicleType: VehicleType | null;
  serviceSubData: Record<string, any>;
  formData: Record<string, any>;
  validationErrors: string[];
  errorFields?: Set<string>;
  setValidationErrors: (errors: string[]) => void;
  onBack: () => void;
  onServiceFieldChange: (fieldKey: string, value: any) => void;
  onFormFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isFormValid: () => boolean;
}

const fieldIcons: Record<string, any> = {
  pickup_location: MapPin,
  pickup_address: MapPin,
  destination_location: MapPin,
  flight_number: Plane,
  flight_date: Calendar,
  flight_time: Clock,
  terminal: FileText,
  duration: Clock,
};

export function Step2TripDetails({
  selectedService,
  selectedVehicleType,
  serviceSubData,
  formData,
  validationErrors,
  errorFields: errorFieldsProp,
  setValidationErrors,
  onBack,
  onServiceFieldChange,
  onFormFieldChange,
  onSubmit,
  isFormValid,
}: Step2TripDetailsProps) {
  const t = useTranslations("reservation.step2");

  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: allServiceFields = [], isLoading: loadingFields } =
    useServiceFields(selectedService?.id);
  // Filter out passenger_count if it exists
  const serviceFields = useMemo(
    () =>
      allServiceFields.filter((field) => field.fieldKey !== "passenger_count"),
    [allServiceFields],
  );

  // Check if service has location_select fields
  const hasLocationSelect = useMemo(
    () => serviceFields.some((field) => field.fieldType === "location_select"),
    [serviceFields],
  );

  // Load service locations only if needed
  const { data: serviceLocations = [] } = useLocationsByService(
    hasLocationSelect ? selectedService?.id : null,
  );

  // Initialize passengers to 1 if not set
  useEffect(() => {
    if (!formData.passengers) {
      onFormFieldChange("passengers", "1");
    }
  }, []); // Only run once on mount

  // Clear errors when user starts typing in fields
  const handleFieldChange = (field: string, value: string) => {
    onFormFieldChange(field, value);
    // Clear related errors when user types
    if (validationErrors.length > 0) {
      const remainingErrors = validationErrors.filter((error) => {
        if (
          field === "firstName" ||
          field === "lastName" ||
          field === "email" ||
          field === "phone"
        ) {
          return !error.includes("contact information");
        }
        if (field === "date" || field === "time" || field === "passengers") {
          return !error.includes("trip details");
        }
        return true;
      });
      if (remainingErrors.length !== validationErrors.length) {
        setValidationErrors(remainingErrors);
      }
    }
  };

  const handleServiceFieldChange = (fieldKey: string, value: any) => {
    onServiceFieldChange(fieldKey, value);

    // Map location fields to formData
    const field = serviceFields.find((f) => f.fieldKey === fieldKey);
    if (field) {
      if (field.isPickup) {
        onFormFieldChange("pickup", value);
      }
      if (field.isDestination) {
        onFormFieldChange("destination", value);
      }
    }

    // Clear related errors when user changes service field
    if (validationErrors.length > 0) {
      const remainingErrors = validationErrors.filter((error) => {
        if (error.includes("pickup") && fieldKey === "pickup_location")
          return false;
        if (
          error.includes("destination") &&
          fieldKey === "destination_location"
        )
          return false;
        // Check if error matches this field's label
        if (field && error.includes(field.label)) return false;
        return true;
      });
      if (remainingErrors.length !== validationErrors.length) {
        setValidationErrors(remainingErrors);
      }
    }
  };

  // Apply default values immediately when Disneyland service is selected (before service fields load)
  useEffect(() => {
    if (selectedService?.id === "disneyland") {
      // Prefill pickup_location = "paris" (hidden, for pricing only) if not already set
      if (!serviceSubData.pickup_location || serviceSubData.pickup_location === "") {
        onServiceFieldChange("pickup_location", "paris");
      }
      // Prefill destination_location = "disneyland" (hidden, for pricing only) if not already set
      if (!serviceSubData.destination_location || serviceSubData.destination_location === "") {
        onServiceFieldChange("destination_location", "disneyland");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService?.id]);

  // Apply default values and map to formData when service fields are loaded
  useEffect(() => {
    if (!selectedService || serviceFields.length === 0) {
      return;
    }

    // Apply default values from service fields
    serviceFields.forEach((field) => {
      if (field.defaultValue) {
        // Set default value in serviceSubData if not already set
        const currentValue = serviceSubData[field.fieldKey];
        if (!currentValue || currentValue === "") {
          onServiceFieldChange(field.fieldKey, field.defaultValue);
        }
      }

      // Map location fields to formData (use current value or default)
      const locationValue =
        serviceSubData[field.fieldKey] || field.defaultValue || "";
      if (field.isPickup && locationValue) {
        onFormFieldChange("pickup", locationValue);
      }
      if (field.isDestination && locationValue) {
        onFormFieldChange("destination", locationValue);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, serviceFields]);

  // Map service field values to formData.pickup/location and formData.destination
  useEffect(() => {
    serviceFields.forEach((field) => {
      const value = serviceSubData[field.fieldKey];
      if (value) {
        if (field.isPickup) {
          onFormFieldChange("pickup", value);
        }
        if (field.isDestination) {
          onFormFieldChange("destination", value);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSubData, serviceFields]);

  // Get error fields for highlighting - use prop if available, otherwise parse from errors
  // Use useMemo to ensure it updates when props change
  const errorFields = useMemo(() => {
    if (errorFieldsProp && errorFieldsProp.size > 0) {
      return errorFieldsProp;
    }

    // Fallback: parse error messages to find field names
    const fields = new Set<string>();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        // Check for common field names (case-insensitive)
        const errorLower = error.toLowerCase();
        if (
          errorLower.includes("first name") ||
          errorLower.includes("prénom") ||
          errorLower.includes("nombre")
        )
          fields.add("firstName");
        if (
          errorLower.includes("last name") ||
          errorLower.includes("nom") ||
          errorLower.includes("apellido")
        )
          fields.add("lastName");
        if (errorLower.includes("email") || errorLower.includes("courriel"))
          fields.add("email");
        if (
          errorLower.includes("phone") ||
          errorLower.includes("téléphone") ||
          errorLower.includes("teléfono")
        )
          fields.add("phone");
        if (errorLower.includes("date") || errorLower.includes("fecha"))
          fields.add("date");
        if (
          errorLower.includes("time") ||
          errorLower.includes("heure") ||
          errorLower.includes("hora")
        )
          fields.add("time");
        if (
          errorLower.includes("passenger") ||
          errorLower.includes("passager") ||
          errorLower.includes("pasajero")
        )
          fields.add("passengers");
        if (
          errorLower.includes("pickup") ||
          errorLower.includes("prise en charge") ||
          errorLower.includes("recogida")
        ) {
          fields.add("pickup");
          const pickupField = serviceFields.find((f) => f.isPickup);
          if (pickupField) fields.add(pickupField.fieldKey);
        }
        if (
          errorLower.includes("destination") ||
          errorLower.includes("destino")
        ) {
          fields.add("destination");
          const destField = serviceFields.find((f) => f.isDestination);
          if (destField) fields.add(destField.fieldKey);
        }

        // Try to match service field names
        serviceFields.forEach((field) => {
          if (error.includes(field.label)) {
            fields.add(field.fieldKey);
          }
        });
      });
    }
    return fields;
  }, [errorFieldsProp, validationErrors, serviceFields]);

  const renderServiceField = (field: ServiceField) => {
    const Icon = fieldIcons[field.fieldKey] || FileText;
    // Get value from serviceSubData, or use default value if not set
    // For pickup_address, ensure we use the default if not set
    const value = serviceSubData[field.fieldKey] ?? field.defaultValue ?? "";
    const hasError = errorFields.has(field.fieldKey);
    // If field has a default value and it's set, make it read-only
    // Exception: pickup_address should always be editable
    const isReadOnly = Boolean(
      field.defaultValue && 
      value === field.defaultValue &&
      field.fieldKey !== "pickup_address"
    );

    // Common props for Input and Select components
    const commonInputProps = {
      value: value,
      onChange: (e: any) =>
        handleServiceFieldChange(field.fieldKey, e.target.value),
      className: cn(
        "w-full",
        hasError ? "border-red-500 dark:border-red-500 border-2" : "",
        isReadOnly ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : "",
      ),
      ...(isReadOnly && { disabled: true, readOnly: true }),
    };

    // Common props for textarea (different styling)
    const commonTextareaProps = {
      value: value,
      onChange: (e: any) =>
        handleServiceFieldChange(field.fieldKey, e.target.value),
      className: cn(
        "w-full px-4 py-3 rounded-lg border-2 transition-all duration-300",
        hasError
          ? "border-red-500 dark:border-red-500 focus:border-red-500 dark:focus:border-red-500 focus:outline-none"
          : "border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none hover:border-gray-300 dark:hover:border-gray-500",
        isReadOnly && "bg-gray-100 dark:bg-gray-700 cursor-not-allowed",
      ),
      ...(isReadOnly && { disabled: true, readOnly: true }),
    };

    switch (field.fieldType) {
      case "number":
        return (
          <Input
            {...commonInputProps}
            type="number"
            min={field.minValue}
            max={field.maxValue}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      case "select": {
        const selectOptions =
          field.options?.map((opt) => ({ value: opt, label: opt })) || [];
        // Only use value if it exists in options, otherwise use empty string to show placeholder
        const selectValue =
          value && selectOptions.some((opt) => opt.value === value)
            ? value
            : "";
        return (
          <Select
            value={selectValue}
            onChange={(e: any) =>
              handleServiceFieldChange(field.fieldKey, e.target.value)
            }
            options={selectOptions}
            placeholder={`Select ${field.label.toLowerCase()}`}
            error={hasError ? t("fieldRequired") : undefined}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        );
      }
      case "textarea":
        return (
          <textarea
            {...commonTextareaProps}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      case "date":
        return (
          <Input
            {...commonInputProps}
            type="date"
            className={cn(
              commonInputProps.className,
              "text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4 max-w-full",
            )}
          />
        );
      case "time":
        return (
          <Input
            {...commonInputProps}
            type="time"
            className={cn(
              commonInputProps.className,
              "text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4 max-w-full",
            )}
          />
        );
      case "location_select": {
        // Filter out the selected location from the opposite field
        // If this is pickup_location, exclude the selected destination_location
        // If this is destination_location, exclude the selected pickup_location
        const filteredLocations = serviceLocations.filter((loc) => {
          if (field.fieldKey === "pickup_location" && field.isPickup) {
            // For pickup, exclude the selected destination
            return loc.id !== serviceSubData.destination_location;
          }
          if (
            field.fieldKey === "destination_location" &&
            field.isDestination
          ) {
            // For destination, exclude the selected pickup
            return loc.id !== serviceSubData.pickup_location;
          }
          return true; // No filtering needed for other cases
        });

        const locationOptions = filteredLocations.map((loc) => ({
          value: loc.id,
          label: loc.name,
        }));
        // Only use value if it exists in options, otherwise use empty string to show placeholder
        const locationValue =
          value && locationOptions.some((opt) => opt.value === value)
            ? value
            : "";
        return (
          <Select
            value={locationValue}
            onChange={(e: any) =>
              handleServiceFieldChange(field.fieldKey, e.target.value)
            }
            options={locationOptions}
            placeholder={`Select ${field.label.toLowerCase()}`}
            error={hasError ? t("fieldRequired") : undefined}
            disabled={isReadOnly}
            readOnly={isReadOnly}
          />
        );
      }
      case "address_autocomplete":
        // If field has default value and it's set, show as read-only text input
        if (isReadOnly) {
          return (
            <Input
              value={value}
              readOnly
              disabled
              className={cn(
                "w-full bg-gray-100 dark:bg-gray-700 cursor-not-allowed",
                hasError && "border-red-500 dark:border-red-500 border-2",
              )}
              placeholder={field.label}
            />
          );
        }
        return (
          <AddressAutocomplete
            value={value}
            onChange={(newValue) =>
              handleServiceFieldChange(field.fieldKey, newValue)
            }
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={
              hasError ? "border-red-500 dark:border-red-500 border-2" : ""
            }
            field={field}
          />
        );
      default:
        return (
          <Input
            {...commonInputProps}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("tripDetailsTitle")}
            </h2>
            <div className="flex items-center space-x-2">
              {/* DEBUG BUTTON - Only visible in development */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Autofill basic trip info
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const dateStr = tomorrow.toISOString().split("T")[0];
                    const timeStr = "10:00";

                    onFormFieldChange("date", dateStr);
                    onFormFieldChange("time", timeStr);
                    onFormFieldChange("passengers", "2");

                    // Autofill contact info
                    onFormFieldChange("firstName", "John");
                    onFormFieldChange("lastName", "Doe");
                    onFormFieldChange("email", "puvistien@gmail.com");
                    onFormFieldChange("phone", "+33123456789");
                  }}
                  className="flex items-center space-x-2 bg-yellow-100 hover:bg-yellow-200 border-yellow-400 text-yellow-800 text-xs"
                  title="DEBUG: Autofill form - Only visible in development"
                >
                  <TestTube className="w-4 h-4" />
                  <span>DEBUG: Fill</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("back")}</span>
              </Button>
            </div>
          </div>

          {/* Basic Trip Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("basicInformation")}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t("pickupDate")} <span className="text-red-500 ml-1">*</span></span>
                  <span className="sm:hidden">{t("date")} <span className="text-red-500 ml-1">*</span></span>
                </label>
                <Input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => onFormFieldChange("date", e.target.value)}
                  className={`w-full max-w-full text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4 ${errorFields.has("date") ? "border-red-500 dark:border-red-500 border-2" : ""}`}
                />
              </div>

              <div className="w-full min-w-0">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{t("pickupTime")} <span className="text-red-500 ml-1">*</span></span>
                  <span className="sm:hidden">{t("time")} <span className="text-red-500 ml-1">*</span></span>
                </label>
                <Input
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) => handleFieldChange("time", e.target.value)}
                  className={`w-full max-w-full text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4 ${errorFields.has("time") ? "border-red-500 dark:border-red-500 border-2" : ""}`}
                />
              </div>

              <div className="w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  {t("numberOfPassengers")} <span className="text-red-500 ml-1">*</span>
                </label>
                <Select
                  value={formData.passengers?.toString() || "1"}
                  onChange={(e) => {
                    handleFieldChange("passengers", e.target.value);
                  }}
                  options={Array.from(
                    {
                      length: selectedVehicleType
                        ? selectedVehicleType.maxPassengers || 8
                        : 8,
                    },
                    (_, i) => ({
                      value: (i + 1).toString(),
                      label: `${i + 1} ${i === 0 ? t("passenger") : t("passengers")}`,
                    }),
                  )}
                  className={`w-full ${errorFields.has("passengers") ? "border-red-500 dark:border-red-500 border-2" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Service-Specific Fields */}
          {loadingFields ? (
            <div className="mb-8">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("loadingServiceFields")}
              </div>
            </div>
          ) : (
            serviceFields.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t("serviceDetails")}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t("pleaseProvideInfo", {
                    serviceName: selectedService?.name || "",
                  })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Return Trip Toggle for Disneyland Service */}
                  {selectedService?.id === "disneyland" && (
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                        <input
                          type="checkbox"
                          id="return_trip"
                          checked={serviceSubData.return_trip === true}
                          onChange={(e) =>
                            onServiceFieldChange("return_trip", e.target.checked)
                          }
                          className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label
                          htmlFor="return_trip"
                          className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                        >
                          <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span>{t("returnTrip") || "Return Trip"}</span>
                        </label>
                      </div>

                      {/* Return Date - Required when return trip is selected */}
                      {serviceSubData.return_trip === true && (
                        <div className="space-y-2 w-full min-w-0">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>
                              {t("serviceFields.returnDate") || "Return Date"}
                              <span className="text-red-500 ml-1">*</span>
                            </span>
                          </label>
                          <Input
                            type="date"
                            value={serviceSubData.return_date || ""}
                            onChange={(e) =>
                              onServiceFieldChange("return_date", e.target.value)
                            }
                            className={`w-full max-w-full text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4 ${
                              errorFields.has("return_date")
                                ? "border-red-500 dark:border-red-500 border-2"
                                : ""
                            }`}
                            min={formData.date || ""}
                          />
                        </div>
                      )}

                      {/* Return Time - Optional when return trip is selected */}
                      {serviceSubData.return_trip === true && (
                        <div className="space-y-2 w-full min-w-0">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>{t("serviceFields.returnTime") || "Return Time"}</span>
                          </label>
                          <Input
                            type="time"
                            value={serviceSubData.return_time || ""}
                            onChange={(e) =>
                              onServiceFieldChange("return_time", e.target.value)
                            }
                            className="w-full max-w-full text-sm sm:text-base py-2 sm:py-3 px-2 sm:px-4"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regular Service Fields - Exclude return_time, return_date, pickup_location, and destination_location (hidden) for Disneyland */}
                  {serviceFields
                    .filter(
                      (field) =>
                        !(
                          selectedService?.id === "disneyland" &&
                          (field.fieldKey === "return_time" ||
                            field.fieldKey === "return_date" ||
                            (field.fieldKey === "pickup_location" && field.isPickup) ||
                            (field.fieldKey === "destination_location" && field.isDestination))
                        ),
                    )
                    .map((field) => {
                      const Icon = fieldIcons[field.fieldKey] || FileText;
                      const translatedLabel = getTranslatedFieldLabel(field.label, t);
                      return (
                        <div key={field.id} className="space-y-2 w-full">
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>
                              {translatedLabel}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </span>
                          </label>
                          {renderServiceField(field)}
                        </div>
                      );
                    })}
                </div>
              </div>
            )
          )}

          {/* Contact Information */}
          <div className="mb-8">
            <ContactInformation
              formData={formData}
              errorFields={errorFields}
              onFormFieldChange={onFormFieldChange}
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("specialRequestsOptional")}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              rows={4}
              placeholder={t("specialRequestsPlaceholderText")}
              value={formData.notes || ""}
              onChange={(e) => onFormFieldChange("notes", e.target.value)}
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-6">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-1">
                        {t("pleaseCompleteAllFields")}
                      </h4>
                      <ul className="space-y-1 text-sm text-red-700">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

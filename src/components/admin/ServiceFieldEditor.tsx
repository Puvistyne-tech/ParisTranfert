"use client";

import { ArrowDown, ArrowUp, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { ServiceField, ServiceFieldType } from "@/components/models/serviceFields";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ServiceFieldEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Omit<ServiceField, "id" | "serviceId">) => Promise<void>;
  field?: ServiceField | null;
  serviceId: string;
  existingFields: ServiceField[];
  loading?: boolean;
}

const FIELD_TYPES: { value: ServiceFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select (Dropdown)" },
  { value: "textarea", label: "Textarea" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "location_select", label: "Location Select" },
  { value: "address_autocomplete", label: "Address Autocomplete" },
];

export function ServiceFieldEditor({
  isOpen,
  onClose,
  onSave,
  field,
  serviceId,
  existingFields,
  loading = false,
}: ServiceFieldEditorProps) {
  const [formData, setFormData] = useState({
    fieldKey: "",
    fieldType: "text" as ServiceFieldType,
    label: "",
    required: false,
    options: [] as string[],
    minValue: undefined as number | undefined,
    maxValue: undefined as number | undefined,
    isPickup: false,
    isDestination: false,
    defaultValue: "",
    fieldOrder: 0,
  });
  const [optionsInput, setOptionsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (field) {
      setFormData({
        fieldKey: field.fieldKey,
        fieldType: field.fieldType,
        label: field.label,
        required: field.required || false,
        options: field.options || [],
        minValue: field.minValue,
        maxValue: field.maxValue,
        isPickup: field.isPickup || false,
        isDestination: field.isDestination || false,
        defaultValue: field.defaultValue || "",
        fieldOrder: field.fieldOrder || 0,
      });
      setOptionsInput((field.options || []).join(", "));
    } else {
      // New field - find max order
      const maxOrder = existingFields.reduce(
        (max, f) => Math.max(max, f.fieldOrder || 0),
        -1
      );
      setFormData({
        fieldKey: "",
        fieldType: "text",
        label: "",
        required: false,
        options: [],
        minValue: undefined,
        maxValue: undefined,
        isPickup: false,
        isDestination: false,
        defaultValue: "",
        fieldOrder: maxOrder + 1,
      });
      setOptionsInput("");
    }
    setErrors({});
  }, [field, existingFields]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fieldKey.trim()) {
      newErrors.fieldKey = "Field key is required";
    } else if (!/^[a-z][a-z0-9_]*$/.test(formData.fieldKey)) {
      newErrors.fieldKey =
        "Field key must start with a letter and contain only lowercase letters, numbers, and underscores";
    } else if (
      existingFields.some(
        (f) => f.id !== field?.id && f.fieldKey === formData.fieldKey
      )
    ) {
      newErrors.fieldKey = "Field key must be unique";
    }

    if (!formData.label.trim()) {
      newErrors.label = "Label is required";
    }

    if (formData.fieldType === "select" && formData.options.length === 0) {
      newErrors.options = "At least one option is required for select fields";
    }

    if (formData.fieldType === "number") {
      if (
        formData.minValue !== undefined &&
        formData.maxValue !== undefined &&
        formData.minValue > formData.maxValue
      ) {
        newErrors.maxValue = "Max value must be greater than min value";
      }
    }

    if (
      formData.fieldType === "location_select" &&
      !formData.isPickup &&
      !formData.isDestination
    ) {
      newErrors.locationType = "Select either pickup or destination for location fields";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionsChange = (value: string) => {
    setOptionsInput(value);
    const options = value
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    setFormData({ ...formData, options });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSave({
        fieldKey: formData.fieldKey,
        fieldType: formData.fieldType,
        label: formData.label,
        required: formData.required,
        options: formData.fieldType === "select" ? formData.options : undefined,
        minValue: formData.fieldType === "number" ? formData.minValue : undefined,
        maxValue: formData.fieldType === "number" ? formData.maxValue : undefined,
        isPickup: formData.fieldType === "location_select" ? formData.isPickup : false,
        isDestination:
          formData.fieldType === "location_select" ? formData.isDestination : false,
        defaultValue: formData.defaultValue || undefined,
        fieldOrder: formData.fieldOrder,
      });
      onClose();
    } catch (error) {
      console.error("Error saving field:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {field ? "Edit Service Field" : "Add Service Field"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field Key *
              </label>
              <Input
                value={formData.fieldKey}
                onChange={(e) =>
                  setFormData({ ...formData, fieldKey: e.target.value.toLowerCase() })
                }
                required
                disabled={!!field}
                placeholder="e.g., passenger_name"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {errors.fieldKey && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.fieldKey}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unique identifier (lowercase, letters, numbers, underscores)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field Type *
              </label>
              <select
                value={formData.fieldType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fieldType: e.target.value as ServiceFieldType,
                    // Reset type-specific fields
                    options: [],
                    minValue: undefined,
                    maxValue: undefined,
                    isPickup: false,
                    isDestination: false,
                  })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label *
            </label>
            <Input
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              placeholder="e.g., Passenger Name"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            {errors.label && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.label}
              </p>
            )}
          </div>

          {formData.fieldType === "select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Options * (comma-separated)
              </label>
              <Input
                value={optionsInput}
                onChange={(e) => handleOptionsChange(e.target.value)}
                placeholder="e.g., Option 1, Option 2, Option 3"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              {errors.options && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.options}
                </p>
              )}
              {formData.options.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.fieldType === "number" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Value
                </label>
                <Input
                  type="number"
                  value={formData.minValue ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minValue: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Value
                </label>
                <Input
                  type="number"
                  value={formData.maxValue ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxValue: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                {errors.maxValue && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.maxValue}
                  </p>
                )}
              </div>
            </div>
          )}

          {formData.fieldType === "location_select" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location Type *
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPickup}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPickup: e.target.checked,
                        isDestination: e.target.checked ? false : formData.isDestination,
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Pickup Location
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isDestination}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDestination: e.target.checked,
                        isPickup: e.target.checked ? false : formData.isPickup,
                      })
                    }
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Destination Location
                  </span>
                </label>
              </div>
              {errors.locationType && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.locationType}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Value
            </label>
            <Input
              value={formData.defaultValue}
              onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
              placeholder="Optional default value"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) =>
                  setFormData({ ...formData, required: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="admin" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="admin" size="sm" disabled={loading}>
              {loading ? "Saving..." : field ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


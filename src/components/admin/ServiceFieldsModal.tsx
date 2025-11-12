"use client";

import { ArrowDown, ArrowUp, Edit, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { ServiceField } from "@/components/models/serviceFields";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ServiceFieldEditor } from "./ServiceFieldEditor";
import {
  useAdminServiceFields,
  useCreateServiceField,
  useDeleteServiceField,
  useUpdateServiceField,
} from "@/hooks/admin/useAdminServiceFields";

interface ServiceFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
}

const FIELD_TYPE_LABELS: Record<ServiceField["fieldType"], string> = {
  text: "Text",
  number: "Number",
  select: "Select",
  textarea: "Textarea",
  date: "Date",
  time: "Time",
  location_select: "Location",
  address_autocomplete: "Address",
};

export function ServiceFieldsModal({
  isOpen,
  onClose,
  serviceId,
  serviceName,
}: ServiceFieldsModalProps) {
  const [selectedField, setSelectedField] = useState<ServiceField | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    fieldId: string | null;
  }>({ isOpen: false, fieldId: null });

  const { data: fields = [], isLoading } = useAdminServiceFields(serviceId);
  const createMutation = useCreateServiceField();
  const updateMutation = useUpdateServiceField();
  const deleteMutation = useDeleteServiceField();

  const handleAddField = () => {
    setSelectedField(null);
    setIsEditorOpen(true);
  };

  const handleEditField = (field: ServiceField) => {
    setSelectedField(field);
    setIsEditorOpen(true);
  };

  const handleSaveField = async (fieldData: Omit<ServiceField, "id" | "serviceId">) => {
    if (selectedField) {
      await updateMutation.mutateAsync({
        fieldId: selectedField.id,
        serviceId,
        updates: fieldData,
      });
    } else {
      await createMutation.mutateAsync({
        serviceId,
        fieldData,
      });
    }
    setIsEditorOpen(false);
    setSelectedField(null);
  };

  const handleDeleteField = async () => {
    if (!deleteConfirm.fieldId) return;
    await deleteMutation.mutateAsync({
      fieldId: deleteConfirm.fieldId,
      serviceId,
    });
    setDeleteConfirm({ isOpen: false, fieldId: null });
  };

  const handleMoveField = async (field: ServiceField, direction: "up" | "down") => {
    const currentIndex = fields.findIndex((f) => f.id === field.id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const targetField = fields[newIndex];
    const newOrder = targetField.fieldOrder;

    // Swap orders
    await Promise.all([
      updateMutation.mutateAsync({
        fieldId: field.id,
        serviceId,
        updates: { fieldOrder: newOrder },
      }),
      updateMutation.mutateAsync({
        fieldId: targetField.id,
        serviceId,
        updates: { fieldOrder: field.fieldOrder },
      }),
    ]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Service Fields
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {serviceName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fields.length} field{fields.length !== 1 ? "s" : ""} configured
              </p>
              <Button variant="admin" size="sm" onClick={handleAddField}>
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading fields...</p>
              </div>
            ) : fields.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No fields configured for this service
                </p>
                <Button variant="admin" size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Field
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {field.label}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                          {FIELD_TYPE_LABELS[field.fieldType]}
                        </span>
                        {field.required && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded text-xs font-medium">
                            Required
                          </span>
                        )}
                        {field.fieldType === "location_select" && (
                          <>
                            {field.isPickup && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">
                                Pickup
                              </span>
                            )}
                            {field.isDestination && (
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium">
                                Destination
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-mono text-xs">{field.fieldKey}</span>
                        {field.defaultValue && (
                          <span className="ml-2">
                            • Default: {field.defaultValue}
                          </span>
                        )}
                        {field.options && field.options.length > 0 && (
                          <span className="ml-2">
                            • {field.options.length} option{field.options.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleMoveField(field, "up")}
                        disabled={index === 0}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleMoveField(field, "down")}
                        disabled={index === fields.length - 1}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleEditField(field)}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ isOpen: true, fieldId: field.id })
                        }
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Field Editor */}
      <ServiceFieldEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedField(null);
        }}
        onSave={handleSaveField}
        field={selectedField}
        serviceId={serviceId}
        existingFields={fields}
        loading={
          createMutation.isPending || updateMutation.isPending
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, fieldId: null })}
        onConfirm={handleDeleteField}
        title="Delete Service Field"
        message="Are you sure you want to delete this service field? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
}


"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    minPassengers?: number;
    maxPassengers?: number;
  }) => Promise<void>;
  vehicle?: any | null;
  loading?: boolean;
}

export function VehicleModal({
  isOpen,
  onClose,
  onSave,
  vehicle,
  loading = false,
}: VehicleModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    image: "",
    minPassengers: 1,
    maxPassengers: 8,
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        id: vehicle.id,
        name: vehicle.name || "",
        description: vehicle.description || "",
        image: vehicle.image || "",
        minPassengers: vehicle.minPassengers || 1,
        maxPassengers: vehicle.maxPassengers || 8,
      });
    } else {
      const newId = `vehicle-${Date.now()}`;
      setFormData({
        id: newId,
        name: "",
        description: "",
        image: "",
        minPassengers: 1,
        maxPassengers: 8,
      });
    }
  }, [vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave({
        ...formData,
        minPassengers: Number(formData.minPassengers),
        maxPassengers: Number(formData.maxPassengers),
      });
      onClose();
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {vehicle ? "Edit Vehicle Type" : "Add New Vehicle Type"}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle ID *
            </label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              disabled={!!vehicle}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <Input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter a URL to an image (supports local images or external URLs)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Passengers *
              </label>
              <Input
                type="number"
                value={formData.minPassengers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minPassengers: parseInt(e.target.value) || 1,
                  })
                }
                required
                min={1}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Passengers *
              </label>
              <Input
                type="number"
                value={formData.maxPassengers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxPassengers: parseInt(e.target.value) || 8,
                  })
                }
                required
                min={1}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? "Saving..."
                : vehicle
                  ? "Update Vehicle"
                  : "Create Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

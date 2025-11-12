"use client";

import { Car, Plus } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import { VehicleModal } from "@/components/admin/VehicleModal";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createVehicleType,
  deleteVehicleType,
  getVehicleTypes,
  updateVehicleType,
} from "@/lib/supabaseService";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    vehicleId: string | null;
  }>({
    isOpen: false,
    vehicleId: null,
  });
  const [saving, setSaving] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVehicleTypes();
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: VehicleType) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleSave = async (vehicleData: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    minPassengers?: number;
    maxPassengers?: number;
  }) => {
    setSaving(true);
    try {
      if (selectedVehicle) {
        await updateVehicleType(selectedVehicle.id, vehicleData);
      } else {
        await createVehicleType(vehicleData);
      }
      await fetchVehicles();
      setIsModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.vehicleId) return;

    try {
      await deleteVehicleType(deleteConfirm.vehicleId);
      await fetchVehicles();
      setDeleteConfirm({ isOpen: false, vehicleId: null });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage vehicle types and passenger limits
          </p>
        </div>
        <Button variant="admin" size="sm" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Vehicle Type</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading vehicles...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    {vehicle.image ? (
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={vehicle.image}
                          alt={vehicle.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                        <Car className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {vehicle.name}
                      </h3>
                      {vehicle.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {vehicle.description}
                      </p>
                      )}
                      <div className="mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Passengers: {vehicle.minPassengers || 1} -{" "}
                          {vehicle.maxPassengers || 8}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <MobileActionButtons
                      onEdit={() => handleEdit(vehicle)}
                      onDelete={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          vehicleId: vehicle.id,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {vehicles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No vehicles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by creating a new vehicle type
          </p>
        </div>
      )}

      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSave={handleSave}
        vehicle={selectedVehicle}
        loading={saving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, vehicleId: null })}
        onConfirm={handleDelete}
        title="Delete Vehicle Type"
        message="Are you sure you want to delete this vehicle type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

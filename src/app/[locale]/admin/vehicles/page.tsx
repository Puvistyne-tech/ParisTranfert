"use client";

import { Car, Edit, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vehicle Types Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage vehicle types and passenger limits
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle Type
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
        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {vehicle.image ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={vehicle.image}
                          alt={vehicle.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Car className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {vehicle.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Passengers: {vehicle.minPassengers || 1} -{" "}
                          {vehicle.maxPassengers || 8}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          vehicleId: vehicle.id,
                        })
                      }
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
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

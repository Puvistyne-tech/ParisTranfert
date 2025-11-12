"use client";

import { MapPin, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import { LocationModal } from "@/components/admin/LocationModal";
import type { Location } from "@/components/models/locations";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "@/lib/supabaseService";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    locationId: string | null;
  }>({
    isOpen: false,
    locationId: null,
  });
  const [saving, setSaving] = useState(false);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleSave = async (locationData: {
    id: string;
    name: string;
    type: string;
  }) => {
    setSaving(true);
    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, locationData);
      } else {
        await createLocation(locationData);
      }
      await fetchLocations();
      setIsModalOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.locationId) return;

    try {
      await deleteLocation(deleteConfirm.locationId);
      await fetchLocations();
      setDeleteConfirm({ isOpen: false, locationId: null });
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage pickup and destination locations
          </p>
        </div>
        <Button variant="admin" size="sm" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Location</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading locations...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {locations.map((location) => (
            <Card
              key={location.id}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {location.name}
                      </h3>
                      <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {location.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <MobileActionButtons
                      onEdit={() => handleEdit(location)}
                      onDelete={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          locationId: location.id,
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

      {locations.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No locations found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by creating a new location
          </p>
        </div>
      )}

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLocation(null);
        }}
        onSave={handleSave}
        location={selectedLocation}
        loading={saving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, locationId: null })}
        onConfirm={handleDelete}
        title="Delete Location"
        message="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

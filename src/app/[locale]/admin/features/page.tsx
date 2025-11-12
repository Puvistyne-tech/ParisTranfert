"use client";

import { Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeatureModal } from "@/components/admin/FeatureModal";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createFeature,
  deleteFeature,
  getFeatures,
  updateFeature,
} from "@/lib/supabaseService";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    featureKey: string | null;
  }>({
    isOpen: false,
    featureKey: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const data = await getFeatures();
      setFeatures(data);
    } catch (error) {
      console.error("Error fetching features:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedFeature(null);
    setIsModalOpen(true);
  };

  const handleEdit = (feature: any) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleSave = async (featureData: any) => {
    setSaving(true);
    try {
      if (selectedFeature) {
        await updateFeature(selectedFeature.key, featureData);
      } else {
        await createFeature(featureData);
      }
      await fetchFeatures();
      setIsModalOpen(false);
      setSelectedFeature(null);
    } catch (error) {
      console.error("Error saving feature:", error);
      alert("Failed to save feature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.featureKey) return;

    try {
      await deleteFeature(deleteConfirm.featureKey);
      await fetchFeatures();
      setDeleteConfirm({ isOpen: false, featureKey: null });
    } catch (error) {
      console.error("Error deleting feature:", error);
      alert("Failed to delete feature. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage service features
          </p>
        </div>
        <Button variant="admin" size="sm" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Feature</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading features...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {features.map((feature) => (
            <Card
              key={feature.key}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                      <Star className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        {feature.key}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Icon: {feature.icon}
                      </p>
                      {feature.gradient && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Gradient: {feature.gradient}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <MobileActionButtons
                      onEdit={() => handleEdit(feature)}
                      onDelete={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          featureKey: feature.key,
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

      {features.length === 0 && !loading && (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No features found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by creating a new feature
          </p>
        </div>
      )}

      <FeatureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFeature(null);
        }}
        onSave={handleSave}
        feature={selectedFeature}
        loading={saving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, featureKey: null })}
        onConfirm={handleDelete}
        title="Delete Feature"
        message="Are you sure you want to delete this feature? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

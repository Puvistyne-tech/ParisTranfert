"use client";

import { Edit, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { FeatureModal } from "@/components/admin/FeatureModal";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Features Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage service features
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feature
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
        <div className="grid gap-4">
          {features.map((feature) => (
            <Card
              key={feature.key}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(feature)}
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
                          featureKey: feature.key,
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

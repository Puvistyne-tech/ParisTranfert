"use client";

import { Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "@/components/models/categories";
import type { Service } from "@/components/models/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    deleteServiceImage,
    uploadServiceImage,
} from "@/lib/supabaseService";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    service: Partial<Service> & {
      id: string;
      key: string;
      name: string;
      categoryId: string;
    },
  ) => Promise<void>;
  service?: Service | null;
  categories: Category[];
  loading?: boolean;
}

export function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  categories,
  loading = false,
}: ServiceModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    key: "",
    name: "",
    description: "",
    shortDescription: "",
    icon: "",
    image: "",
    duration: "",
    priceRange: "",
    isPopular: false,
    isAvailable: true,
    categoryId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setFormData({
        id: service.id,
        key: service.key,
        name: service.name,
        description: service.description || "",
        shortDescription: service.shortDescription || "",
        icon: service.icon || "",
        image: service.image || "",
        duration: service.duration || "",
        priceRange: service.priceRange || "",
        isPopular: service.isPopular || false,
        isAvailable: service.isAvailable ?? true,
        categoryId: service.categoryId,
      });
      setImagePreview(service.image || null);
    } else {
      // Generate ID and key for new service
      const newId = `service-${Date.now()}`;
      const newKey = "";
      setFormData({
        id: newId,
        key: newKey,
        name: "",
        description: "",
        shortDescription: "",
        icon: "",
        image: "",
        duration: "",
        priceRange: "",
        isPopular: false,
        isAvailable: true,
        categoryId: categories[0]?.id || "",
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setUploadError(null);
  }, [service, categories]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "Invalid file type. Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: "" });
    setUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    try {
      let imageUrl = formData.image;

      // Upload new image if file is selected
      if (selectedFile) {
        setUploading(true);
        try {
          // Delete old image if replacing
          if (service?.image && service.image.includes("service-images")) {
            await deleteServiceImage(service.image);
          }

          // Upload new image
          imageUrl = await uploadServiceImage(selectedFile, formData.id);
          setFormData({ ...formData, image: imageUrl });
        } catch (error: any) {
          setUploadError(error.message || "Failed to upload image");
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      // Save service with image URL
      await onSave({ ...formData, image: imageUrl });
      onClose();
    } catch (error) {
      console.error("Error saving service:", error);
      setUploadError("Failed to save service. Please try again.");
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
            {service ? "Edit Service" : "Add New Service"}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service ID *
              </label>
              <Input
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                required
                disabled={!!service}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key *
              </label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                required
                placeholder="e.g., airport-transfer"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
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
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
              Short Description
            </label>
            <Input
              value={formData.shortDescription}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Icon
            </label>
            <Input
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              placeholder="Icon name or URL"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Service Image
            </label>
            <div className="space-y-3">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* File Upload Input */}
              <div>
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, WEBP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    disabled={uploading || loading}
                  />
                </label>
              </div>

              {/* Upload Error */}
              {uploadError && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {uploadError}
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  <span>Uploading image...</span>
                </div>
              )}

              {/* Fallback: Manual URL input (optional) */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Or enter image URL manually:
              </div>
              <Input
                value={formData.image}
                onChange={(e) => {
                  setFormData({ ...formData, image: e.target.value });
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                  } else {
                    setImagePreview(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                disabled={!!selectedFile || uploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <Input
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="e.g., 1 hour"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price Range
              </label>
              <Input
                value={formData.priceRange}
                onChange={(e) =>
                  setFormData({ ...formData, priceRange: e.target.value })
                }
                placeholder="e.g., €50-€100"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Popular
              </span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Available
              </span>
            </label>
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
            <Button
              type="submit"
              variant="primary"
              disabled={loading || uploading}
            >
              {uploading
                ? "Uploading..."
                : loading
                  ? "Saving..."
                  : service
                    ? "Update Service"
                    : "Create Service"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

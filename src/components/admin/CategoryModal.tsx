"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CategoryType } from "@/components/models/categories";
import { CategoryType as CategoryTypeEnum, CATEGORY_TYPES } from "@/components/models/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: {
    id: string;
    name: string;
    categoryType: CategoryType;
    description?: string;
  }) => Promise<void>;
  category?: any | null;
  loading?: boolean;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  loading = false,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    categoryType: CategoryTypeEnum.TRANSPORT as CategoryType,
    description: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name || "",
        categoryType: category.categoryType || CategoryTypeEnum.TRANSPORT,
        description: category.description || "",
      });
    } else {
      const newId = `category-${Date.now()}`;
      setFormData({
        id: newId,
        name: "",
        categoryType: CategoryTypeEnum.TRANSPORT as CategoryType,
        description: "",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
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
            {category ? "Edit Category" : "Add New Category"}
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
              Category ID *
            </label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              disabled={!!category}
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
              Category Type *
            </label>
            <select
              value={formData.categoryType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryType: e.target.value as CategoryType,
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {CATEGORY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="admin"
              size="sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="admin" size="sm" disabled={loading}>
              {loading ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

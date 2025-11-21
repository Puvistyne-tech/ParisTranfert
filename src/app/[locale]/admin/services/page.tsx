"use client";

import { Filter, Package, Plus, Search, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminFilter } from "@/components/admin/AdminFilterContext";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import { ServiceFieldsModal } from "@/components/admin/ServiceFieldsModal";
import { ServiceModal } from "@/components/admin/ServiceModal";
import type { Service } from "@/components/models/services";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  useAdminCategories,
  useAdminServices,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from "@/hooks/admin/useAdminServices";
import { useAdminServiceFields } from "@/hooks/admin/useAdminServiceFields";
import { useServicesStore } from "@/store/admin/servicesStore";

export default function AdminServicesPage() {
  const {
    isServiceModalOpen,
    selectedService,
    searchQuery,
    selectedCategory,
    availabilityFilter,
    popularFilter,
    openServiceModal,
    closeServiceModal,
    setSearchQuery,
    setSelectedCategory,
    setAvailabilityFilter,
    setPopularFilter,
    resetFilters,
  } = useServicesStore();

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    serviceId: string | null;
  }>({ isOpen: false, serviceId: null });
  const [isServiceFieldsModalOpen, setIsServiceFieldsModalOpen] = useState(false);
  const [selectedServiceForFields, setSelectedServiceForFields] = useState<string | null>(null);
  
  const { setFilterContent } = useAdminFilter();

  // Fetch data with TanStack Query
  const { data: services = [], isLoading } = useAdminServices({
    search: searchQuery,
    category: selectedCategory,
    availability: availabilityFilter,
    popular: popularFilter,
  });
  const { data: categories = [] } = useAdminCategories();

  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  // Create a stable key for categories to prevent unnecessary re-renders
  const categoriesKey = useMemo(
    () => categories.map((cat) => `${cat.id}:${cat.name}`).join(","),
    [categories]
  );

  // Memoize filter UI to prevent unnecessary re-renders
  // Note: Zustand setter functions are stable and don't need to be in dependencies
  const filterUI = useMemo(
    () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Availability
          </label>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Services</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Popular Status
          </label>
          <select
            value={popularFilter}
            onChange={(e) => setPopularFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Services</option>
            <option value="popular">Popular Only</option>
            <option value="not-popular">Not Popular</option>
          </select>
        </div>
      </div>
    ),
    [searchQuery, selectedCategory, availabilityFilter, popularFilter, categoriesKey, categories]
    );

  // Register filter content in header
  // setFilterContent is stable from useState, so we don't need it in dependencies
  useEffect(() => {
    setFilterContent(filterUI);
    return () => {
      setFilterContent(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterUI]);

  const handleCreate = () => {
    openServiceModal(null);
  };

  const handleEdit = (service: typeof services[0]) => {
    openServiceModal(service);
  };

  const handleSave = async (
    serviceData: Partial<Service> & {
      id: string;
      key: string;
      name: string;
      categoryId: string;
    }
  ) => {
    try {
      // Convert to API format
      const apiData = {
        id: serviceData.id,
        key: serviceData.key,
        name: serviceData.name,
        description: serviceData.description,
        shortDescription: serviceData.shortDescription,
        icon: serviceData.icon,
        image: serviceData.image,
        duration: serviceData.duration,
        priceRange: serviceData.priceRange,
        features: Array.isArray(serviceData.features)
          ? serviceData.features
          : serviceData.features
            ? [serviceData.features]
            : [],
        languages: serviceData.languages,
        isPopular: serviceData.isPopular ?? false,
        isAvailable: serviceData.isAvailable ?? true,
        categoryId: serviceData.categoryId,
      };

      if (selectedService) {
        await updateMutation.mutateAsync({
          id: selectedService.id,
          data: apiData as any,
        });
      } else {
        await createMutation.mutateAsync(apiData as any);
      }
      closeServiceModal();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.serviceId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.serviceId);
      setDeleteConfirm({ isOpen: false, serviceId: null });
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  const handleManageFields = (serviceId: string) => {
    setSelectedServiceForFields(serviceId);
    setIsServiceFieldsModalOpen(true);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    availabilityFilter !== "all" ||
    popularFilter !== "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage all services
          </p>
        <Button variant="admin" size="sm" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Service</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
            onClick={resetFilters}
            className="text-sm w-full sm:w-auto"
              >
                Clear Filters
              </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            Showing {services.length} service{services.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

      {/* Services List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => handleEdit(service)}
              onDelete={() =>
                setDeleteConfirm({ isOpen: true, serviceId: service.id })
              }
              onManageFields={() => handleManageFields(service.id)}
            />
          ))}
        </div>
      )}

      {services.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No services found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {hasActiveFilters
              ? "Try adjusting your filters"
              : "Get started by creating a new service"}
          </p>
        </div>
      )}

      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={closeServiceModal}
        onSave={handleSave}
        service={selectedService}
        categories={categories}
        loading={createMutation.isPending || updateMutation.isPending}
        onManageFields={handleManageFields}
      />

      {selectedServiceForFields && (
        <ServiceFieldsModal
          isOpen={isServiceFieldsModalOpen}
          onClose={() => {
            setIsServiceFieldsModalOpen(false);
            setSelectedServiceForFields(null);
          }}
          serviceId={selectedServiceForFields}
          serviceName={
            services.find((s) => s.id === selectedServiceForFields)?.name || "Service"
          }
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, serviceId: null })}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

// Service Card Component
function ServiceCard({
  service,
  onEdit,
  onDelete,
  onManageFields,
}: {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
  onManageFields: () => void;
}) {
  const { data: fields = [] } = useAdminServiceFields(service.id);

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                <Package className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.isAvailable
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    }`}
                  >
                    {service.isAvailable ? "Available" : "Unavailable"}
                  </span>
                      {(service.isPopular ?? false) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                          Popular
                        </span>
                      )}
                      {fields.length > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                          {fields.length} field{fields.length !== 1 ? "s" : ""}
                        </span>
                      )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end sm:justify-start gap-2 sm:gap-1">
            <button
              onClick={onManageFields}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Manage Fields"
              aria-label="Manage Fields"
            >
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageFields}
              className="hidden lg:flex"
            >
              <Settings className="w-4 h-4 mr-1" />
              Fields
            </Button>
            <MobileActionButtons
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

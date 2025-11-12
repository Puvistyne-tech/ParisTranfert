"use client";

import { ChevronDown, ChevronUp, DollarSign, Edit, Filter, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminFilter } from "@/components/admin/AdminFilterContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  useAdminPricing,
  useCreatePricing,
  useDeletePricing,
  useUpdatePricing,
} from "@/hooks/admin/useAdminPricing";
import { useLocations } from "@/hooks/useLocations";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { usePricingStore } from "@/store/admin/pricingStore";

type PricingRow = {
  id: string;
  serviceId: string;
  vehicleTypeId: string;
  pickupLocationId: string;
  destinationLocationId: string | null;
  price: number;
  serviceName: string;
  vehicleName: string;
  pickupName: string;
  destinationName: string;
};

export default function AdminPricingPage() {
  const {
    isCreateModalOpen,
    isEditingCell,
    editValue,
    deleteConfirm,
    searchQuery,
    serviceFilter,
    vehicleFilter,
    groupBy,
    openCreateModal,
    closeCreateModal,
    setEditingCell,
    setEditValue,
    setDeleteConfirm,
    setSearchQuery,
    setServiceFilter,
    setVehicleFilter,
    setGroupBy,
  } = usePricingStore();
  
  const { setFilterContent } = useAdminFilter();

  const [newPricing, setNewPricing] = useState({
    serviceId: "",
    vehicleTypeId: "",
    pickupLocationId: "",
    destinationLocationId: "",
    price: "",
  });

  // Fetch data
  const { data: pricing = [], isLoading } = useAdminPricing({
    search: searchQuery,
    serviceId: serviceFilter,
    vehicleTypeId: vehicleFilter,
  });
  const { data: services = [] } = useServices();
  const { data: vehicles = [] } = useVehicleTypes();
  const { data: locations = [] } = useLocations();

  const createMutation = useCreatePricing();
  const updateMutation = useUpdatePricing();
  const deleteMutation = useDeletePricing();

  // Register filter content in header
  useEffect(() => {
    const filterUI = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Service
          </label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vehicle
          </label>
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Group By
          </label>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as "service" | "vehicle" | "none")}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="none">None</option>
            <option value="service">Service</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>
      </div>
    );
    setFilterContent(filterUI);
    return () => setFilterContent(null);
  }, [searchQuery, serviceFilter, vehicleFilter, groupBy, services, vehicles, setFilterContent, setSearchQuery, setServiceFilter, setVehicleFilter, setGroupBy]);

  // Transform data for display
  const tableData = useMemo<PricingRow[]>(() => {
    return pricing.map((item) => ({
      ...item,
      serviceName: services.find((s) => s.id === item.serviceId)?.name || item.serviceId,
      vehicleName: vehicles.find((v) => v.id === item.vehicleTypeId)?.name || item.vehicleTypeId,
      pickupName: locations.find((l) => l.id === item.pickupLocationId)?.name || item.pickupLocationId,
      destinationName: item.destinationLocationId
        ? locations.find((l) => l.id === item.destinationLocationId)?.name || item.destinationLocationId
        : "N/A",
    }));
  }, [pricing, services, vehicles, locations]);

  // Filter and group data
  const filteredAndGrouped = useMemo(() => {
    let filtered = tableData;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.serviceName.toLowerCase().includes(searchLower) ||
          p.vehicleName.toLowerCase().includes(searchLower) ||
          p.pickupName.toLowerCase().includes(searchLower) ||
          p.destinationName.toLowerCase().includes(searchLower)
      );
    }

    if (groupBy === "service") {
      const grouped = filtered.reduce((acc, item) => {
        if (!acc[item.serviceId]) {
          acc[item.serviceId] = {
            key: item.serviceId,
            name: item.serviceName,
            items: [],
          };
        }
        acc[item.serviceId].items.push(item);
        return acc;
      }, {} as Record<string, { key: string; name: string; items: PricingRow[] }>);
      return Object.values(grouped);
    } else if (groupBy === "vehicle") {
      const grouped = filtered.reduce((acc, item) => {
        if (!acc[item.vehicleTypeId]) {
          acc[item.vehicleTypeId] = {
            key: item.vehicleTypeId,
            name: item.vehicleName,
            items: [],
          };
        }
        acc[item.vehicleTypeId].items.push(item);
        return acc;
      }, {} as Record<string, { key: string; name: string; items: PricingRow[] }>);
      return Object.values(grouped);
    }

    return [{ key: "all", name: "All Pricing", items: filtered }];
  }, [tableData, searchQuery, groupBy]);

  const handleCellClick = (rowId: string, columnId: string, value: any) => {
    if (columnId === "serviceName" || columnId === "vehicleName") return;
    setEditingCell({ rowId, columnId });
    setEditValue(String(value || ""));
  };

  const handleCellSave = async (rowId: string, columnId: string) => {
    const row = pricing.find((p) => p.id === rowId);
    if (!row) return;

      const updates: any = {};

      if (columnId === "price") {
        const priceValue = parseFloat(editValue);
        if (isNaN(priceValue) || priceValue < 0) {
          alert("Please enter a valid price");
          setEditingCell(null);
          setEditValue("");
          return;
        }
        updates.price = priceValue;
      } else if (columnId === "pickupName") {
        const location = locations.find((l) => l.name === editValue);
        if (!location) {
          alert("Location not found");
          setEditingCell(null);
          setEditValue("");
          return;
        }
        updates.pickupLocationId = location.id;
      } else if (columnId === "destinationName") {
        const location = locations.find((l) => l.name === editValue);
        if (!location) {
          alert("Location not found");
          setEditingCell(null);
          setEditValue("");
          return;
        }
        updates.destinationLocationId = location.id;
      }

    try {
      await updateMutation.mutateAsync({ id: rowId, updates });
      setEditingCell(null);
      setEditValue("");
    } catch (error: any) {
      console.error("Error updating cell:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const handleCreate = async () => {
    if (
      !newPricing.serviceId ||
      !newPricing.vehicleTypeId ||
      !newPricing.pickupLocationId ||
      !newPricing.destinationLocationId ||
      !newPricing.price
    ) {
      alert("Please fill in all fields");
      return;
    }

    const priceValue = parseFloat(newPricing.price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Please enter a valid price");
      return;
    }

    try {
      await createMutation.mutateAsync({
        serviceId: newPricing.serviceId,
        vehicleTypeId: newPricing.vehicleTypeId,
        pickupLocationId: newPricing.pickupLocationId,
        destinationLocationId: newPricing.destinationLocationId,
        price: priceValue,
      });
      closeCreateModal();
      setNewPricing({
        serviceId: "",
        vehicleTypeId: "",
        pickupLocationId: "",
        destinationLocationId: "",
        price: "",
      });
    } catch (error: any) {
      console.error("Error creating pricing:", error);
      alert(`Failed to create: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.pricingId) return;
    try {
      await deleteMutation.mutateAsync(deleteConfirm.pricingId);
      setDeleteConfirm({ isOpen: false, pricingId: null });
    } catch (error: any) {
      console.error("Error deleting pricing:", error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

            return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage service pricing matrix
          </p>
        <Button variant="admin" size="sm" onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Pricing</span>
          <span className="sm:hidden">Add</span>
          </Button>
      </div>

      {/* Pricing Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pricing...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndGrouped.map((group) => (
            <GroupedPricingSection
              key={group.key}
              group={group}
              isEditingCell={isEditingCell}
              editValue={editValue}
              locations={locations}
              onCellClick={handleCellClick}
              onCellSave={handleCellSave}
              onCellCancel={() => {
                setEditingCell(null);
                setEditValue("");
              }}
              onDelete={(id) => setDeleteConfirm({ isOpen: true, pricingId: id })}
            />
          ))}

          {tableData.length === 0 && (
            <div className="text-center py-12">
                        <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No pricing entries found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Get started by creating a new pricing entry
                        </p>
            </div>
          )}
              </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Pricing
                </h2>
                <button
                onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service *
                </label>
                <select
                  value={newPricing.serviceId}
                  onChange={(e) =>
                    setNewPricing({ ...newPricing, serviceId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select service...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={newPricing.vehicleTypeId}
                  onChange={(e) =>
                    setNewPricing({ ...newPricing, vehicleTypeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pickup Location *
                </label>
                <select
                  value={newPricing.pickupLocationId}
                  onChange={(e) =>
                    setNewPricing({ ...newPricing, pickupLocationId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select pickup location...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination Location *
                </label>
                <select
                  value={newPricing.destinationLocationId}
                  onChange={(e) =>
                    setNewPricing({ ...newPricing, destinationLocationId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select destination location...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (€) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newPricing.price}
                  onChange={(e) => setNewPricing({ ...newPricing, price: e.target.value })}
                  placeholder="0.00"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-2">
              <Button variant="admin" size="sm" onClick={closeCreateModal} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                variant="admin"
                size="sm"
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, pricingId: null })}
        onConfirm={handleDelete}
        title="Delete Pricing Entry"
        message="Are you sure you want to delete this pricing entry? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}

// Grouped Pricing Section Component
function GroupedPricingSection({
  group,
  isEditingCell,
  editValue,
  locations,
  onCellClick,
  onCellSave,
  onCellCancel,
  onDelete,
}: {
  group: { key: string; name: string; items: PricingRow[] };
  isEditingCell: { rowId: string; columnId: string } | null;
  editValue: string;
  locations: Array<{ id: string; name: string }>;
  onCellClick: (rowId: string, columnId: string, value: any) => void;
  onCellSave: (rowId: string, columnId: string) => void;
  onCellCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (group.items.length === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {group.name}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {group.items.length} entr{group.items.length !== 1 ? "ies" : "y"}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 inline-block ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 inline-block ml-2" />
          )}
        </span>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
            {group.items.map((item) => (
              <PricingCard
                key={item.id}
                item={item}
                isEditingCell={isEditingCell}
                editValue={editValue}
                locations={locations}
                onCellClick={onCellClick}
                onCellSave={onCellSave}
                onCellCancel={onCellCancel}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual Pricing Card Component
function PricingCard({
  item,
  isEditingCell,
  editValue,
  locations,
  onCellClick,
  onCellSave,
  onCellCancel,
  onDelete,
}: {
  item: PricingRow;
  isEditingCell: { rowId: string; columnId: string } | null;
  editValue: string;
  locations: Array<{ id: string; name: string }>;
  onCellClick: (rowId: string, columnId: string, value: any) => void;
  onCellSave: (rowId: string, columnId: string) => void;
  onCellCancel: () => void;
  onDelete: (id: string) => void;
}) {
  const isEditingPrice = isEditingCell?.rowId === item.id && isEditingCell?.columnId === "price";
  const isEditingPickup =
    isEditingCell?.rowId === item.id && isEditingCell?.columnId === "pickupName";
  const isEditingDestination =
    isEditingCell?.rowId === item.id && isEditingCell?.columnId === "destinationName";

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 p-2.5">
      <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Service</p>
            <p className="font-medium text-gray-900 dark:text-white">{item.serviceName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
            <p className="font-medium text-gray-900 dark:text-white">{item.vehicleName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
            {isEditingPickup ? (
              <select
                value={editValue}
                onChange={(e) => onCellClick(item.id, "pickupName", e.target.value)}
                onBlur={() => onCellSave(item.id, "pickupName")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCellSave(item.id, "pickupName");
                  if (e.key === "Escape") onCellCancel();
                }}
                autoFocus
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => onCellClick(item.id, "pickupName", item.pickupName)}
                className="text-left font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                {item.pickupName} <Edit className="w-3 h-3 inline-block ml-1" />
              </button>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
            {isEditingDestination ? (
              <select
                value={editValue}
                onChange={(e) => onCellClick(item.id, "destinationName", e.target.value)}
                onBlur={() => onCellSave(item.id, "destinationName")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCellSave(item.id, "destinationName");
                  if (e.key === "Escape") onCellCancel();
                }}
                autoFocus
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
            ) : (
              <button
                onClick={() => onCellClick(item.id, "destinationName", item.destinationName)}
                className="text-left font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                {item.destinationName} <Edit className="w-3 h-3 inline-block ml-1" />
              </button>
            )}
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
            {isEditingPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">€</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editValue}
                  onChange={(e) => onCellClick(item.id, "price", e.target.value)}
                  onBlur={() => onCellSave(item.id, "price")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCellSave(item.id, "price");
                    if (e.key === "Escape") onCellCancel();
                  }}
                  autoFocus
                  className="flex-1 h-8 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                />
              </div>
            ) : (
              <button
                onClick={() => onCellClick(item.id, "price", item.price)}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
              >
                €{item.price} <Edit className="w-3 h-3 inline-block ml-1" />
              </button>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, DollarSign, Columns, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, X } from "lucide-react";
import { 
  getAllPricing,
  createPricing,
  updatePricing,
  deletePricing,
} from "@/lib/supabaseService";
import { useServices } from "@/hooks/useServices";
import { useVehicleTypes } from "@/hooks/useVehicleTypes";
import { useLocations } from "@/hooks/useLocations";
import type { ServiceVehiclePricing } from "@/components/models/pricing";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type PricingRow = ServiceVehiclePricing & {
  serviceName: string;
  vehicleName: string;
  pickupName: string;
  destinationName: string;
};

export default function AdminPricingPage() {
  const [pricing, setPricing] = useState<ServiceVehiclePricing[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use TanStack Query hooks for data fetching with automatic caching
  const { data: services = [] } = useServices();
  const { data: vehicles = [] } = useVehicleTypes();
  const { data: locations = [] } = useLocations();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    service: true,
    vehicle: true,
    pickup: true,
    destination: true,
    price: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingCellId, setSavingCellId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; pricingId: string | null }>({
    isOpen: false,
    pricingId: null,
  });

  // Create modal form state
  const [newPricing, setNewPricing] = useState({
    serviceId: "",
    vehicleTypeId: "",
    pickupLocationId: "",
    destinationLocationId: "",
    price: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const pricingResult = await getAllPricing({ limit: 1000 });
      setPricing(pricingResult.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || serviceId;
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.name || vehicleId;
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || locationId;
  };

  // Transform data for table
  const tableData = useMemo<PricingRow[]>(() => {
    return pricing.map(item => ({
      ...item,
      serviceName: getServiceName(item.serviceId),
      vehicleName: getVehicleName(item.vehicleTypeId),
      pickupName: getLocationName(item.pickupLocationId),
      destinationName: item.destinationLocationId ? getLocationName(item.destinationLocationId) : "N/A",
    }));
  }, [pricing, services, vehicles, locations]);

  const handleCellClick = (rowId: string, columnId: string, value: any) => {
    // Only allow editing price, pickup, and destination
    if (columnId === "serviceName" || columnId === "vehicleName") {
      return; // Not editable
    }
    setEditingCell({ rowId, columnId });
    setEditValue(String(value || ""));
  };

  const handleCellSave = async (rowId: string, columnId: string) => {
    // Prevent multiple simultaneous saves
    const cellKey = `${rowId}-${columnId}`;
    if (savingCellId === cellKey) {
      return; // Already saving this cell
    }

    const row = pricing.find(p => p.id === rowId);
    if (!row) {
      console.error("Row not found in pricing array:", rowId, "Available IDs:", pricing.map(p => p.id));
      alert("Row not found. Please refresh the page.");
      setEditingCell(null);
      setEditValue("");
      return;
    }

    // Check if value actually changed
    let currentValue: any;
    if (columnId === "price") {
      currentValue = row.price;
    } else if (columnId === "pickupName") {
      currentValue = getLocationName(row.pickupLocationId);
    } else if (columnId === "destinationName") {
      currentValue = row.destinationLocationId ? getLocationName(row.destinationLocationId) : "N/A";
    }

    // If value hasn't changed, just cancel editing
    if (String(currentValue) === editValue) {
      setEditingCell(null);
      setEditValue("");
      return;
    }

    setSavingCellId(cellKey);
    setSaving(true);
    try {
      const updates: any = {};

      if (columnId === "price") {
        const priceValue = parseFloat(editValue);
        if (isNaN(priceValue) || priceValue < 0) {
          alert("Please enter a valid price");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        // Only update if value changed
        if (priceValue === row.price) {
          setEditingCell(null);
          setEditValue("");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        updates.price = priceValue;
      } else if (columnId === "pickupName") {
        // editValue is the location name, find the location ID
        const location = locations.find(l => l.name === editValue);
        if (!location) {
          alert("Location not found");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        // Only update if value changed
        if (location.id === row.pickupLocationId) {
          setEditingCell(null);
          setEditValue("");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        updates.pickupLocationId = location.id;
      } else if (columnId === "destinationName") {
        // editValue is the location name, find the location ID
        const location = locations.find(l => l.name === editValue);
        if (!location) {
          alert("Location not found");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        // Only update if value changed
        if (location.id === row.destinationLocationId) {
          setEditingCell(null);
          setEditValue("");
          setSavingCellId(null);
          setSaving(false);
          return;
        }
        updates.destinationLocationId = location.id;
      }

      // Only proceed if there are actual updates
      if (Object.keys(updates).length === 0) {
        setEditingCell(null);
        setEditValue("");
        setSavingCellId(null);
        setSaving(false);
        return;
      }

      try {
        await updatePricing(rowId, updates);
      } catch (updateError: any) {
        // If update says "could not retrieve", it likely succeeded, just refresh
        if (updateError.message?.includes("could not retrieve") || updateError.message?.includes("Please refresh")) {
          console.log("Update likely succeeded, refreshing data...");
        } else {
          throw updateError;
        }
      }
      
      // Always refresh data after update attempt
      await fetchInitialData();
      setEditingCell(null);
      setEditValue("");
    } catch (error: any) {
      console.error("Error updating cell:", error);
      alert(`Failed to update: ${error.message}`);
    } finally {
      setSavingCellId(null);
      setSaving(false);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleDelete = async () => {
    if (!deleteConfirm.pricingId) return;

    setSaving(true);
    try {
      await deletePricing(deleteConfirm.pricingId);
      await fetchInitialData();
      setDeleteConfirm({ isOpen: false, pricingId: null });
    } catch (error: any) {
      console.error("Error deleting pricing:", error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newPricing.serviceId || !newPricing.vehicleTypeId || !newPricing.pickupLocationId || !newPricing.destinationLocationId || !newPricing.price) {
      alert("Please fill in all fields");
      return;
    }

    const priceValue = parseFloat(newPricing.price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert("Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      await createPricing({
        serviceId: newPricing.serviceId,
        vehicleTypeId: newPricing.vehicleTypeId,
        pickupLocationId: newPricing.pickupLocationId,
        destinationLocationId: newPricing.destinationLocationId,
        price: priceValue,
      });
      await fetchInitialData();
      setShowCreateModal(false);
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
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnDef<PricingRow>[]>(
    () => [
      {
        accessorKey: "serviceName",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Service</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("serviceName") as string;
          // Service is read-only
          return (
            <div className="px-2 py-1 text-gray-900 dark:text-white">
              {value}
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "vehicleName",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Vehicle</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("vehicleName") as string;
          // Vehicle is read-only
          return (
            <div className="px-2 py-1 text-gray-900 dark:text-white">
              {value}
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "pickupName",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Pickup</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          );
        },
        cell: ({ row, column }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === column.id;
          const value = row.getValue(column.id) as string;

          if (isEditing) {
            return (
              <div className="flex items-center space-x-2">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={(e) => {
                    // Prevent blur if clicking on the select itself
                    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('select')) {
                      return;
                    }
                    // Small delay to allow Enter key to process first
                    setTimeout(() => {
                      if (editingCell?.rowId === row.original.id && editingCell?.columnId === column.id) {
                        handleCellSave(row.original.id, column.id);
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCellSave(row.original.id, column.id);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      handleCellCancel();
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div className="group relative">
              <div
                onClick={() => handleCellClick(row.original.id, column.id, value)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
              >
                {value}
              </div>
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(row.original.id, column.id, value);
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ isOpen: true, pricingId: row.original.id });
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "destinationName",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Destination</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          );
        },
        cell: ({ row, column }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === column.id;
          const value = row.getValue(column.id) as string;

          if (isEditing) {
            return (
              <div className="flex items-center space-x-2">
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={(e) => {
                    // Prevent blur if clicking on the select itself
                    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('select')) {
                      return;
                    }
                    // Small delay to allow Enter key to process first
                    setTimeout(() => {
                      if (editingCell?.rowId === row.original.id && editingCell?.columnId === column.id) {
                        handleCellSave(row.original.id, column.id);
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCellSave(row.original.id, column.id);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      handleCellCancel();
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          return (
            <div className="group relative">
              <div
                onClick={() => handleCellClick(row.original.id, column.id, value)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
              >
                {value}
              </div>
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(row.original.id, column.id, value);
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ isOpen: true, pricingId: row.original.id });
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: "price",
        header: ({ column }) => {
          return (
            <button
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center space-x-1 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span>Price</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              ) : (
                <ArrowUpDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )}
            </button>
          );
        },
        cell: ({ row, column }) => {
          const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === column.id;
          const value = row.getValue(column.id) as number;

          if (isEditing) {
            return (
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400">€</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={(e) => {
                    // Prevent blur if clicking on the input itself
                    if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest('input')) {
                      return;
                    }
                    // Small delay to allow Enter key to process first
                    setTimeout(() => {
                      if (editingCell?.rowId === row.original.id && editingCell?.columnId === column.id) {
                        handleCellSave(row.original.id, column.id);
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCellSave(row.original.id, column.id);
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      handleCellCancel();
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            );
          }

          return (
            <div className="group relative">
              <div
                onClick={() => handleCellClick(row.original.id, column.id, value)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors font-semibold"
              >
                €{value}
              </div>
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(row.original.id, column.id, value);
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ isOpen: true, pricingId: row.original.id });
                  }}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
      },
    ],
    [editingCell, editValue, services, vehicles, locations]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => row.id, // Use the actual pricing ID
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const visibleColumnsCount = table.getVisibleLeafColumns().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage service pricing matrix</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="relative"
            >
              <Columns className="w-4 h-4 mr-2" />
              Columns ({visibleColumnsCount})
            </Button>
            {showColumnMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowColumnMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-2">
                  {table.getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <label
                        key={column.id}
                        className="flex items-center space-x-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={(e) => column.toggleVisibility(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {column.id === "actions" ? "Actions" : column.id}
                        </span>
                      </label>
                    ))}
                </div>
              </>
            )}
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Pricing
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pricing...</p>
        </div>
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={visibleColumnsCount} className="px-6 py-12 text-center">
                        <DollarSign className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          No pricing entries found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Get started by creating a new pricing entry
                        </p>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {table.getRowModel().rows.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {table.getRowModel().rows.length} of {pricing.length} pricing entries
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Pricing</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service *
                </label>
                <select
                  value={newPricing.serviceId}
                  onChange={(e) => setNewPricing({ ...newPricing, serviceId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
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
                  onChange={(e) => setNewPricing({ ...newPricing, vehicleTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
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
                  onChange={(e) => setNewPricing({ ...newPricing, pickupLocationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select pickup location...</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
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
                  onChange={(e) => setNewPricing({ ...newPricing, destinationLocationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select destination location...</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
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
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Pricing"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
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

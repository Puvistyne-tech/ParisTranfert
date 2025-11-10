"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Edit, Trash2, Search, Package, Filter } from "lucide-react";
import { getAllServices, getCategories, createService, updateService, deleteService } from "@/lib/supabaseService";
import type { Service } from "@/components/models/services";
import type { Category } from "@/components/models/categories";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ServiceModal } from "@/components/admin/ServiceModal";

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all"); // "all", "available", "unavailable"
  const [popularFilter, setPopularFilter] = useState<string>("all"); // "all", "popular", "not-popular"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; serviceId: string | null }>({
    isOpen: false,
    serviceId: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getAllServices(),
        getCategories(),
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch = !search || 
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || service.categoryId === selectedCategory;
    const matchesAvailability = 
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && service.isAvailable) ||
      (availabilityFilter === "unavailable" && !service.isAvailable);
    const matchesPopular = 
      popularFilter === "all" ||
      (popularFilter === "popular" && service.isPopular) ||
      (popularFilter === "not-popular" && !service.isPopular);
    return matchesSearch && matchesCategory && matchesAvailability && matchesPopular;
  });

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSave = async (serviceData: any) => {
    setSaving(true);
    try {
      if (selectedService) {
        await updateService(selectedService.id, serviceData);
      } else {
        await createService(serviceData);
      }
      await fetchData();
      setIsModalOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.serviceId) return;
    
    try {
      await deleteService(deleteConfirm.serviceId);
      await fetchData();
      setDeleteConfirm({ isOpen: false, serviceId: null });
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Services Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all services</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Services</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Popular Status</label>
              <select
                value={popularFilter}
                onChange={(e) => setPopularFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Services</option>
                <option value="popular">Popular Only</option>
                <option value="not-popular">Not Popular</option>
              </select>
            </div>
          </div>
          {(search || selectedCategory || availabilityFilter !== "all" || popularFilter !== "all") && (
            <div className="mt-4 flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("");
                  setAvailabilityFilter("all");
                  setPopularFilter("all");
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredServices.length} of {services.length} services
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            service.isAvailable 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" 
                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                          }`}>
                            {service.isAvailable ? "Available" : "Unavailable"}
                          </span>
                          {service.isPopular && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(service)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() => setDeleteConfirm({ isOpen: true, serviceId: service.id })}
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

      {filteredServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No services found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {search || selectedCategory || availabilityFilter !== "all" || popularFilter !== "all" 
              ? "Try adjusting your filters" 
              : "Get started by creating a new service"}
          </p>
        </div>
      )}

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        onSave={handleSave}
        service={selectedService}
        categories={categories}
        loading={saving}
      />

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


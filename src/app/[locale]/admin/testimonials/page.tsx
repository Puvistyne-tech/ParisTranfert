"use client";

import { MessageSquare, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import { TestimonialModal } from "@/components/admin/TestimonialModal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "@/lib/supabaseService";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    testimonialId: string | null;
  }>({
    isOpen: false,
    testimonialId: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (testimonial: any) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleSave = async (testimonialData: any) => {
    setSaving(true);
    try {
      if (selectedTestimonial) {
        await updateTestimonial(selectedTestimonial.id, testimonialData);
      } else {
        await createTestimonial(testimonialData);
      }
      await fetchTestimonials();
      setIsModalOpen(false);
      setSelectedTestimonial(null);
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.testimonialId) return;

    try {
      await deleteTestimonial(deleteConfirm.testimonialId);
      await fetchTestimonials();
      setDeleteConfirm({ isOpen: false, testimonialId: null });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
            Manage customer testimonials
          </p>
        </div>
        <Button variant="admin" size="sm" onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Testimonial</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading testimonials...
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="dark:bg-gray-800 dark:border-gray-700"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </h3>
                        <div className="flex items-center">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                        {testimonial.comment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end sm:justify-start">
                    <MobileActionButtons
                      onEdit={() => handleEdit(testimonial)}
                      onDelete={() =>
                        setDeleteConfirm({
                          isOpen: true,
                          testimonialId: testimonial.id,
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

      {testimonials.length === 0 && !loading && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No testimonials found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by creating a new testimonial
          </p>
        </div>
      )}

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTestimonial(null);
        }}
        onSave={handleSave}
        testimonial={selectedTestimonial}
        loading={saving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, testimonialId: null })}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

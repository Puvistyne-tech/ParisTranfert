"use client";

import { Building2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  DisneylandHotelModal,
  type DisneylandHotelSavePayload,
} from "@/components/admin/DisneylandHotelModal";
import { MobileActionButtons } from "@/components/admin/MobileActionButtons";
import {
  type DisneylandHotel,
  priceTierSymbols,
} from "@/components/models/disneylandHotels";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  useCreateDisneylandHotel,
  useDeleteDisneylandHotel,
  useDisneylandHotels,
  useUpdateDisneylandHotel,
  useUpdateDisneylandHotelOrder,
} from "@/hooks/useDisneylandHotels";

export default function AdminDisneylandHotelsPage() {
  const { data: hotels = [], isLoading } = useDisneylandHotels();
  const createMutation = useCreateDisneylandHotel();
  const updateMutation = useUpdateDisneylandHotel();
  const deleteMutation = useDeleteDisneylandHotel();
  const reorderMutation = useUpdateDisneylandHotelOrder();

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<DisneylandHotel | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (data: DisneylandHotelSavePayload) => {
    if (selected) {
      await updateMutation.mutateAsync({
        id: selected.id,
        name: data.name,
        descriptionI18n: data.descriptionI18n,
        googleMapsUrl: data.googleMapsUrl,
        address: data.address,
        starRating: data.starRating,
        tags: data.tags,
        hotelWebsiteUrl: data.hotelWebsiteUrl,
        priceRange: data.priceRange,
        priceCurrency: data.priceCurrency,
        imageFile: data.imageFile,
      });
    } else {
      if (!data.imageFile) {
        throw new Error("Image required");
      }
      await createMutation.mutateAsync({
        name: data.name,
        descriptionI18n: data.descriptionI18n,
        googleMapsUrl: data.googleMapsUrl,
        address: data.address,
        starRating: data.starRating,
        tags: data.tags,
        hotelWebsiteUrl: data.hotelWebsiteUrl,
        priceRange: data.priceRange,
        priceCurrency: data.priceCurrency,
        imageFile: data.imageFile,
      });
    }
  };

  const move = (index: number, delta: -1 | 1) => {
    const next = index + delta;
    if (next < 0 || next >= hotels.length) return;
    const copy = [...hotels];
    const t = copy[index];
    copy[index] = copy[next];
    copy[next] = t;
    reorderMutation.mutate(copy);
  };

  const saving =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-purple-600" />
            Disneyland hotels
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Hotels shown on the Disneyland Paris page with photos and Google
            Maps links
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelected(null);
            setModalOpen(true);
          }}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add hotel
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent" />
        </div>
      ) : hotels.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-600 dark:text-gray-400">
            No hotels yet. Add one to display them on the public page.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {hotels.map((hotel, index) => (
            <Card
              key={hotel.id}
              className="overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 bg-gray-100 dark:bg-gray-900">
                    <Image
                      src={hotel.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 224px"
                    />
                  </div>
                  <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {hotel.name}
                        </h2>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            hotel.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {hotel.isActive ? "Active" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {hotel.starRating != null && hotel.starRating >= 1 && (
                          <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                            {hotel.starRating}★ hotel
                          </span>
                        )}
                        {priceTierSymbols(
                          hotel.priceRange,
                          hotel.priceCurrency,
                        ) && (
                          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            {priceTierSymbols(
                              hotel.priceRange,
                              hotel.priceCurrency,
                            )}
                          </span>
                        )}
                        {hotel.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-purple-800 dark:text-purple-200 bg-purple-100/90 dark:bg-purple-900/50 px-2 py-0.5 rounded-full max-w-[10rem] truncate"
                          >
                            {tag}
                          </span>
                        ))}
                        {hotel.tags && hotel.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{hotel.tags.length - 3}
                          </span>
                        )}
                      </div>
                      {hotel.address?.trim() && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {hotel.address}
                        </p>
                      )}
                      {hotel.googleMapsUrl?.trim() && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {hotel.googleMapsUrl}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-between md:justify-start">
                      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
                          disabled={index === 0 || saving}
                          onClick={() => move(index, -1)}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 border-l border-gray-200 dark:border-gray-600"
                          disabled={index === hotels.length - 1 || saving}
                          onClick={() => move(index, 1)}
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <MobileActionButtons
                        onEdit={() => {
                          setSelected(hotel);
                          setModalOpen(true);
                        }}
                        onDelete={() => setDeleteId(hotel.id)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DisneylandHotelModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSave={handleSave}
        hotel={selected}
        loading={saving}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
        title="Delete hotel"
        message="Remove this hotel from the Disneyland page? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

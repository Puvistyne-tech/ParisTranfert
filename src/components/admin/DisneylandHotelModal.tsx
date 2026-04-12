"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  parseHotelTagsInput,
  type DisneylandHotel,
  type DisneylandHotelDescriptionI18n,
  type DisneylandHotelPriceCurrency,
} from "@/components/models/disneylandHotels";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { errorMessageFromUnknown } from "@/lib/errorMessage";
import type { MapsHotelAutofillResult } from "@/lib/mapsHotelAutofill";
import { supabase } from "@/lib/supabase";

function isValidGoogleMapsUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const h = u.hostname.replace(/^www\./, "");
    return (
      h === "maps.app.goo.gl" ||
      h === "goo.gl" ||
      h.endsWith("google.com") ||
      h.endsWith("google.fr")
    );
  } catch {
    return false;
  }
}

function isOptionalHttpUrl(url: string): boolean {
  const t = url.trim();
  if (!t) return true;
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type DisneylandHotelSavePayload = {
  name: string;
  descriptionI18n: DisneylandHotelDescriptionI18n;
  googleMapsUrl: string | null;
  address: string | null;
  starRating: number | null;
  tags: string[];
  hotelWebsiteUrl: string | null;
  priceRange: number | null;
  priceCurrency: DisneylandHotelPriceCurrency;
  imageFile?: File;
};

interface DisneylandHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DisneylandHotelSavePayload) => Promise<void>;
  hotel: DisneylandHotel | null;
  loading?: boolean;
}

export function DisneylandHotelModal({
  isOpen,
  onClose,
  onSave,
  hotel,
  loading = false,
}: DisneylandHotelModalProps) {
  const [name, setName] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descEs, setDescEs] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [address, setAddress] = useState("");
  const [starRating, setStarRating] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [hotelWebsiteUrl, setHotelWebsiteUrl] = useState("");
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [priceCurrency, setPriceCurrency] =
    useState<DisneylandHotelPriceCurrency>("eur");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newImageObjectUrl, setNewImageObjectUrl] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [autofillLoading, setAutofillLoading] = useState(false);

  const tagPreview = useMemo(
    () => parseHotelTagsInput(tagsInput),
    [tagsInput],
  );

  useEffect(() => {
    if (!imageFile) {
      setNewImageObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setNewImageObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    if (hotel) {
      setName(hotel.name);
      setDescEn(hotel.descriptionI18n?.en ?? "");
      setDescFr(hotel.descriptionI18n?.fr ?? "");
      setDescEs(hotel.descriptionI18n?.es ?? "");
      setGoogleMapsUrl(hotel.googleMapsUrl ?? "");
      setAddress(hotel.address ?? "");
      setStarRating(hotel.starRating ?? null);
      setTagsInput(hotel.tags?.length ? hotel.tags.join(", ") : "");
      setHotelWebsiteUrl(hotel.hotelWebsiteUrl ?? "");
      setPriceRange(hotel.priceRange ?? null);
      setPriceCurrency(hotel.priceCurrency ?? "eur");
    } else {
      setName("");
      setDescEn("");
      setDescFr("");
      setDescEs("");
      setGoogleMapsUrl("");
      setAddress("");
      setStarRating(null);
      setTagsInput("");
      setHotelWebsiteUrl("");
      setPriceRange(null);
      setPriceCurrency("eur");
    }
    setImageFile(null);
    setError(null);
    setHintMessage(null);
  }, [hotel, isOpen]);

  if (!isOpen) return null;

  const handleAutofillFromMapsUrl = async () => {
    setError(null);
    setHintMessage(null);
    const trimmed = googleMapsUrl.trim();
    if (!trimmed) {
      setError("Paste a Google Maps link first.");
      return;
    }
    if (!isValidGoogleMapsUrl(trimmed)) {
      setError(
        "Google Maps link must be a valid maps URL (maps.google.com, goo.gl, etc.)",
      );
      return;
    }

    setAutofillLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Sign in to the admin panel to use autofill.");
        return;
      }

      const res = await fetch("/api/admin/resolve-maps-hotel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = (await res.json()) as
        | MapsHotelAutofillResult
        | { error?: string };

      if (!res.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : `Autofill failed (${res.status})`,
        );
        return;
      }

      const payload = data as MapsHotelAutofillResult;
      if (payload.googleMapsUrl) setGoogleMapsUrl(payload.googleMapsUrl);
      if (payload.name?.trim()) setName(payload.name.trim());
      if (payload.address?.trim()) setAddress(payload.address.trim());
      if (payload.starRating != null) setStarRating(payload.starRating);
      if (payload.priceRange != null) setPriceRange(payload.priceRange);
      setPriceCurrency(payload.priceCurrency ?? "eur");
      if (payload.hotelWebsiteUrl?.trim()) {
        setHotelWebsiteUrl(payload.hotelWebsiteUrl.trim());
      }
      if (payload.tags?.length) {
        setTagsInput(payload.tags.join(", "));
      }
      if (payload.descriptionEn?.trim()) {
        setDescEn(payload.descriptionEn.trim());
      }
      setHintMessage(payload.message);
    } catch (err) {
      console.error(err);
      setError(errorMessageFromUnknown(err, "Autofill failed."));
    } finally {
      setAutofillLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const mapsTrim = googleMapsUrl.trim();
    if (mapsTrim && !isValidGoogleMapsUrl(mapsTrim)) {
      setError(
        "Google Maps link must be a valid maps URL (maps.google.com, goo.gl, etc.)",
      );
      return;
    }
    const webTrim = hotelWebsiteUrl.trim();
    if (webTrim && !isOptionalHttpUrl(webTrim)) {
      setError("Hotel website must start with http:// or https://");
      return;
    }
    if (!hotel && !imageFile) {
      setError("Please upload an image");
      return;
    }

    const descriptionI18n: DisneylandHotelDescriptionI18n = {};
    if (descEn.trim()) descriptionI18n.en = descEn.trim();
    if (descFr.trim()) descriptionI18n.fr = descFr.trim();
    if (descEs.trim()) descriptionI18n.es = descEs.trim();

    const tags = parseHotelTagsInput(tagsInput);

    try {
      await onSave({
        name: name.trim(),
        descriptionI18n,
        googleMapsUrl: mapsTrim || null,
        address: address.trim() || null,
        starRating,
        tags,
        hotelWebsiteUrl: webTrim || null,
        priceRange,
        priceCurrency,
        imageFile: imageFile ?? undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        errorMessageFromUnknown(
          err,
          "Could not save hotel. Check the message below or your connection.",
        ),
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(ev) => ev.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-gray-200/80 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disneyland-hotel-modal-title"
      >
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2
            id="disneyland-hotel-modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {hotel ? "Edit hotel" : "Add hotel"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-4 rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Google Maps link
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Paste any Maps link (including{" "}
              <span className="font-medium">maps.app.goo.gl</span> short links).
              <strong> Autofill from link</strong> expands the URL and, when{" "}
              <code className="text-[11px] bg-white/80 dark:bg-gray-800 px-1 rounded">
                GOOGLE_PLACES_API_KEY
              </code>{" "}
              is set on the server, loads name, address, stars, price level,
              website, tags, and a short description from Google Places. Always
              review before saving.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/… or full google.com/maps/…"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-1.5"
                onClick={() => void handleAutofillFromMapsUrl()}
                disabled={!googleMapsUrl.trim() || autofillLoading || loading}
              >
                {autofillLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Autofill from link
              </Button>
            </div>
            {hintMessage && (
              <p className="text-xs text-purple-800 dark:text-purple-200 bg-white/80 dark:bg-purple-950/40 rounded-lg px-3 py-2 border border-purple-200/80 dark:border-purple-800/80">
                {hintMessage}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Basics
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div className="grid gap-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optional description (per language). If a language is empty,
                another available translation may be shown.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  English
                </label>
                <textarea
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Français
                </label>
                <textarea
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Español
                </label>
                <textarea
                  value={descEs}
                  onChange={(e) => setDescEs(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Guest-facing highlights
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Use <strong>Autofill from link</strong> at the top when possible.
              You can still adjust stars, price, tags, and website manually.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Star rating
                </label>
                <select
                  value={starRating ?? ""}
                  onChange={(e) =>
                    setStarRating(
                      e.target.value === ""
                        ? null
                        : Number.parseInt(e.target.value, 10),
                    )
                  }
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                >
                  <option value="">— Not set —</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price category (optional)
                </label>
                <div className="flex flex-wrap gap-2 items-end">
                  <select
                    value={priceRange ?? ""}
                    onChange={(e) =>
                      setPriceRange(
                        e.target.value === ""
                          ? null
                          : Number.parseInt(e.target.value, 10),
                      )
                    }
                    className="flex-1 min-w-[8rem] rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                  >
                    <option value="">— Not set —</option>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} {priceCurrency === "usd" ? "$" : "€"} (budget →
                        premium)
                      </option>
                    ))}
                  </select>
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden text-xs font-medium">
                    <button
                      type="button"
                      className={`px-3 py-2 ${priceCurrency === "eur" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                      onClick={() => setPriceCurrency("eur")}
                    >
                      €
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-2 border-l border-gray-300 dark:border-gray-600 ${priceCurrency === "usd" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                      onClick={() => setPriceCurrency("usd")}
                    >
                      $
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Shown as one to four symbols on the public page (indicative
                  only).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <textarea
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                rows={2}
                placeholder="At park entrance, 10 min walk to gates, shuttle bus"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separate each tag with a comma{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  (,)
                </span>
                . You can also use semicolons or line breaks. Duplicates are
                removed. Preview:
              </p>
              {tagPreview.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0 mt-2">
                  {tagPreview.map((tag) => (
                    <li
                      key={tag}
                      className="text-xs font-medium rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900/50 dark:text-purple-100 px-2.5 py-1 border border-purple-200/80 dark:border-purple-700/60"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                  No tags yet — type above, separated by commas.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hotel website (optional)
              </label>
              <Input
                value={hotelWebsiteUrl}
                onChange={(e) => setHotelWebsiteUrl(e.target.value)}
                placeholder="https://…"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Official site or trusted booking page — opens in a new tab for
                guests.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Location
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address (optional)
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Street, postal code, city — used if no Maps link, or for copy/paste"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Autofill fills this when Google returns a formatted address. If
                the Maps link field is empty, guests can still open a search from
                this address on the public page.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Photo
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {hotel ? "Replace image (optional)" : "Hotel image *"}
              </label>

              <ImageUploader
                onFileSelect={(files) => {
                  if (files[0]) setImageFile(files[0]);
                }}
                multiple={false}
              />

              {(newImageObjectUrl || hotel?.imageUrl) && (
                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  {hotel?.imageUrl && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Current image on site
                      </p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
                        <Image
                          src={hotel.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 360px"
                        />
                      </div>
                    </div>
                  )}
                  {newImageObjectUrl && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        New photo (saved when you click Save)
                      </p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-emerald-500/80 dark:border-emerald-500/60 bg-gray-100 dark:bg-gray-900 ring-2 ring-emerald-500/20">
                        {/* eslint-disable-next-line @next/next/no-img-element -- blob: URLs */}
                        <img
                          src={newImageObjectUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setImageFile(null)}
                      >
                        Discard new photo — keep current
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {hotel && !imageFile && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose a file to see a preview next to the current image.
                  Until you save, the live site keeps the current image.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2.5 text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap break-words"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
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
              disabled={loading || autofillLoading}
            >
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

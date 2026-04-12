"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, ExternalLink, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  priceTierSymbols,
  type DisneylandHotel,
} from "@/components/models/disneylandHotels";
import { Card, CardContent } from "@/components/ui/Card";
import { Link } from "@/i18n/navigation";
import { hotelDescriptionForLocale } from "@/lib/disneylandHotelDescription";
import {
  embedMapUrlForHotel,
  resolveHotelMapHref,
} from "@/lib/disneylandHotelMaps";

interface DisneylandHotelCardProps {
  hotel: DisneylandHotel;
  index: number;
}

export function DisneylandHotelCard({
  hotel,
  index,
}: DisneylandHotelCardProps) {
  const t = useTranslations("disneylandPage.hotels");
  const locale = useLocale();
  const desc = hotelDescriptionForLocale(hotel.descriptionI18n, locale);
  const mapHref = resolveHotelMapHref(hotel);
  const embedUrl = embedMapUrlForHotel(hotel);
  const addressText = hotel.address?.trim() ?? "";
  const displayLine = addressText || hotel.name;
  const copyText = addressText || `${hotel.name}, Disneyland Paris`;
  const [mapOpen, setMapOpen] = useState(false);
  const stars =
    hotel.starRating != null &&
    hotel.starRating >= 1 &&
    hotel.starRating <= 5
      ? hotel.starRating
      : null;
  const priceStr = priceTierSymbols(hotel.priceRange, hotel.priceCurrency);
  const tags = hotel.tags?.filter(Boolean) ?? [];
  const website = hotel.hotelWebsiteUrl?.trim() ?? "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
      }}
      viewport={{ once: true }}
      className="group"
    >
      <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800/90">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </div>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {hotel.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 justify-end shrink-0">
              {stars != null && (
                <div
                  className="flex items-center gap-0.5"
                  role="img"
                  aria-label={t("starRatingAria", { count: stars })}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < stars
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              )}
              {priceStr && (
                <span
                  className="text-sm font-semibold tracking-tight text-emerald-800 dark:text-emerald-300 tabular-nums"
                  aria-label={t("priceCategoryAria")}
                >
                  {priceStr}
                </span>
              )}
            </div>
          </div>
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="text-xs font-medium rounded-full bg-purple-100/95 text-purple-900 dark:bg-purple-900/45 dark:text-purple-100 px-2.5 py-1 border border-purple-200/80 dark:border-purple-800/60"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
          {desc && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
              {desc}
            </p>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {t("visitHotelWebsite")}
            </a>
          )}

          {embedUrl && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(copyText);
                  }}
                  className="mt-0.5 shrink-0 rounded-lg p-2 text-purple-700 dark:text-purple-300 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-colors"
                  aria-label={t("copyAddressAria")}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMapOpen((o) => !o)}
                  className="flex flex-1 min-w-0 items-start gap-1.5 text-left rounded-lg -m-1 p-1 hover:bg-purple-50/90 dark:hover:bg-gray-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-colors"
                  aria-expanded={mapOpen}
                  aria-controls={`hotel-map-${hotel.id}`}
                >
                  <span className="text-sm text-gray-800 dark:text-gray-100 leading-snug flex-1">
                    {displayLine}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 text-purple-600 dark:text-purple-400 transition-transform mt-0.5 ${mapOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <AnimatePresence initial={false}>
                {mapOpen && (
                  <motion.div
                    id={`hotel-map-${hotel.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden rounded-2xl border border-purple-200/80 dark:border-purple-800/80 shadow-inner bg-gray-100 dark:bg-gray-900/50"
                  >
                    <div className="relative w-full aspect-[16/10] min-h-[200px]">
                      <iframe
                        title={t("mapPreviewTitle", { name: hotel.name })}
                        src={embedUrl}
                        className="absolute inset-0 h-full w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            {mapHref && (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-gray-800/90 text-purple-800 dark:text-purple-200 px-4 py-2.5 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition-colors"
              >
                <MapPin className="w-4 h-4 shrink-0" />
                {t("viewOnMaps")}
              </a>
            )}
            <Link
              href={{
                pathname: "/reservation",
                query: {
                  service: "disneyland",
                  hotelName: hotel.name,
                },
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-colors text-center"
            >
              {t("bookTransfer")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

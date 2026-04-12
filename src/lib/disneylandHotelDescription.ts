import type { DisneylandHotelDescriptionI18n } from "@/components/models/disneylandHotels";

const LOCALE_ORDER = ["en", "fr", "es"] as const;

/**
 * Picks description for locale, then en, then any non-empty value.
 */
export function hotelDescriptionForLocale(
  descriptionI18n: DisneylandHotelDescriptionI18n | null | undefined,
  locale: string,
): string | undefined {
  if (!descriptionI18n || typeof descriptionI18n !== "object") {
    return undefined;
  }
  const short = locale.split("-")[0] ?? locale;
  const tryKeys = [short, ...LOCALE_ORDER.filter((k) => k !== short)];
  for (const key of tryKeys) {
    const v = descriptionI18n[key as keyof DisneylandHotelDescriptionI18n];
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  for (const v of Object.values(descriptionI18n)) {
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return undefined;
}

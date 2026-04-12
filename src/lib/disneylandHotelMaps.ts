import type { DisneylandHotel } from "@/components/models/disneylandHotels";

/** Google Maps search URL from a free-text address */
export function mapsSearchUrlFromAddress(address: string): string {
  const q = address.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * Prefer saved Maps link; otherwise search by address.
 */
export function resolveHotelMapHref(hotel: DisneylandHotel): string | null {
  const link = hotel.googleMapsUrl?.trim();
  if (link) return link;
  const addr = hotel.address?.trim();
  if (addr) return mapsSearchUrlFromAddress(addr);
  return null;
}

/**
 * URL for an embedded map (iframe). Uses address when present, otherwise a
 * search query with the hotel name near Disneyland Paris.
 */
export function embedMapUrlForHotel(hotel: DisneylandHotel): string | null {
  const name = hotel.name?.trim();
  if (!name) return null;
  const addr = hotel.address?.trim();
  const q = addr || `${name}, Disneyland Paris, France`;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`;
}

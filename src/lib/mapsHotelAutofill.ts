import type { DisneylandHotelPriceCurrency } from "@/components/models/disneylandHotels"

/** Response from POST /api/admin/resolve-maps-hotel */
export type MapsHotelAutofillSource = "places_api" | "url_only"

export type MapsHotelAutofillResult = {
  source: MapsHotelAutofillSource
  /** Expanded or canonical Maps URL to store */
  googleMapsUrl: string
  name: string | null
  address: string | null
  starRating: number | null
  priceRange: number | null
  priceCurrency: DisneylandHotelPriceCurrency
  hotelWebsiteUrl: string | null
  tags: string[]
  /** Google editorial summary — we only fill English by default */
  descriptionEn: string | null
  /** Human-readable status (API key missing, partial fill, etc.) */
  message: string | null
}

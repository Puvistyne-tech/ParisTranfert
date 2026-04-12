export type DisneylandHotelDescriptionI18n = Partial<
  Record<"en" | "fr" | "es", string>
>

export type DisneylandHotelPriceCurrency = "eur" | "usd"

export interface DisneylandHotel {
  id: string
  name: string
  descriptionI18n: DisneylandHotelDescriptionI18n | null
  imageUrl: string
  /** Full Google Maps place/share URL when available */
  googleMapsUrl: string | null
  /** Physical address; used for map search / copy when no URL */
  address: string | null
  /** 1–5 stars; not available from URL alone — set in admin */
  starRating: number | null
  /** Short labels, e.g. park entrance, walking time */
  tags: string[]
  /** Official or booking page for guests */
  hotelWebsiteUrl: string | null
  /** 1–4 = one to four € or $ signs */
  priceRange: number | null
  priceCurrency: DisneylandHotelPriceCurrency
  displayOrder: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export function priceTierSymbols(
  tier: number | null,
  currency: DisneylandHotelPriceCurrency,
): string | null {
  if (tier === null || tier < 1 || tier > 4) return null
  const sym = currency === "usd" ? "$" : "€"
  return sym.repeat(tier)
}

/** Comma- or newline-separated tags, deduped */
export function parseHotelTagsInput(raw: string): string[] {
  const parts = raw.split(/[,;\n]+/)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of parts) {
    const t = p.trim()
    if (!t || seen.has(t.toLowerCase())) continue
    seen.add(t.toLowerCase())
    out.push(t)
  }
  return out
}

import type { MapsHotelAutofillResult } from "@/lib/mapsHotelAutofill"
import { extractHintsFromGoogleMapsUrl } from "@/lib/parseGoogleMapsHotelHints"

type PlacesLocalized = { text?: string }
type PlacesPlace = {
  displayName?: PlacesLocalized
  formattedAddress?: string
  rating?: number
  priceLevel?: string
  websiteUri?: string
  editorialSummary?: PlacesLocalized
  types?: string[]
  primaryTypeDisplayName?: PlacesLocalized
  googleMapsUri?: string
}

const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"

const FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.priceLevel",
  "places.websiteUri",
  "places.editorialSummary",
  "places.types",
  "places.primaryTypeDisplayName",
  "places.googleMapsUri",
].join(",")

function isShortHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./, "")
  return h === "goo.gl" || h === "maps.app.goo.gl"
}

/**
 * Follow redirects so maps.app.goo.gl / goo.gl become full google.com/maps URLs.
 */
export async function expandGoogleMapsUrl(input: string): Promise<string> {
  const trimmed = input.trim()
  if (!trimmed) return trimmed
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return trimmed
  }
  if (!isShortHost(url.hostname)) return trimmed

  const res = await fetch(trimmed, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ParisTranfertAdmin/1.0; +https://prestigeparistransfert.com)",
      Accept: "text/html,application/xhtml+xml",
    },
  })
  const finalUrl = res.url?.trim()
  return finalUrl || trimmed
}

export function buildTextQueryFromPlaceHint(textHint: string | null): string {
  if (!textHint?.trim()) {
    return "Disneyland Paris hotel Marne-la-Vallée France"
  }
  const t = textHint.trim()
  if (/marne|disney|77700|77500|paris/i.test(t)) {
    return t
  }
  return `${t}, Marne-la-Vallée, France`
}

function mapPriceLevelEnum(level: string | undefined): number | null {
  if (!level) return null
  const map: Record<string, number | null> = {
    PRICE_LEVEL_FREE: null,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }
  if (level in map) return map[level] ?? null
  const lower = level.toLowerCase()
  if (lower.includes("free")) return null
  if (lower.includes("inexpensive")) return 1
  if (lower.includes("moderate")) return 2
  if (lower.includes("expensive") && !lower.includes("very")) return 3
  if (lower.includes("very")) return 4
  return null
}

const SKIP_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "political",
  "premise",
])

function googleTypeToLabel(t: string): string | null {
  const map: Record<string, string> = {
    lodging: "Hotel",
    hotel: "Hotel",
    motel: "Motel",
    resort_hotel: "Resort hotel",
    bed_and_breakfast: "Bed & breakfast",
    campground: "Campground",
    rv_park: "RV park",
    restaurant: "Restaurant",
    food: "Food",
    cafe: "Cafe",
    bar: "Bar",
    tourist_attraction: "Tourist attraction",
    spa: "Spa",
    gym: "Gym",
    store: "Shopping",
    shopping_mall: "Shopping mall",
  }
  if (map[t]) return map[t]
  return t
    .split("_")
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

function typesToTags(types: string[], primaryLabel?: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (s: string) => {
    const k = s.toLowerCase()
    if (seen.has(k)) return
    seen.add(k)
    out.push(s)
  }
  if (primaryLabel?.trim()) add(primaryLabel.trim())
  for (const t of types) {
    if (SKIP_TYPES.has(t)) continue
    const label = googleTypeToLabel(t)
    if (label) add(label)
  }
  return out.slice(0, 8)
}

function roundStarRating(r: number): number {
  return Math.round(Math.min(5, Math.max(1, r)))
}

export async function placesSearchText(
  textQuery: string,
  apiKey: string,
): Promise<PlacesPlace | null> {
  const res = await fetch(PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "en",
      regionCode: "FR",
    }),
  })

  const raw = await res.text()
  if (!res.ok) {
    throw new Error(
      `Google Places API (${res.status}): ${raw.slice(0, 800)}`,
    )
  }

  let parsed: { places?: PlacesPlace[] }
  try {
    parsed = JSON.parse(raw) as { places?: PlacesPlace[] }
  } catch {
    throw new Error("Google Places API returned invalid JSON")
  }

  const first = parsed.places?.[0]
  return first ?? null
}

function placeToFields(place: PlacesPlace) {
  const name = place.displayName?.text?.trim() ?? null
  const address = place.formattedAddress?.trim() ?? null
  const starRating =
    typeof place.rating === "number" ? roundStarRating(place.rating) : null
  const priceRange = mapPriceLevelEnum(place.priceLevel)
  const hotelWebsiteUrl = place.websiteUri?.trim() ?? null
  const descriptionEn = place.editorialSummary?.text?.trim() ?? null
  const primaryLabel = place.primaryTypeDisplayName?.text?.trim()
  const tags = typesToTags(place.types ?? [], primaryLabel)
  const googleMapsUrl = place.googleMapsUri?.trim() ?? null

  return {
    name,
    address,
    starRating,
    priceRange,
    hotelWebsiteUrl,
    descriptionEn,
    tags,
    googleMapsUrl,
  }
}

function hintToNameAddress(textHint: string | null): {
  name: string | null
  address: string | null
} {
  if (!textHint?.trim()) return { name: null, address: null }
  const t = textHint.trim()
  if (/^\s*\d/.test(t)) return { name: null, address: t }
  return { name: t, address: null }
}

export async function resolveMapsHotelFromUrl(params: {
  inputUrl: string
  placesApiKey: string | undefined
}): Promise<MapsHotelAutofillResult> {
  const expanded = await expandGoogleMapsUrl(params.inputUrl)
  const hints = extractHintsFromGoogleMapsUrl(expanded)
  const textHint = hints.textHint
  const fallbackNa = hintToNameAddress(textHint)

  const base = {
    priceCurrency: "eur" as const,
    googleMapsUrl: expanded,
  }

  if (!params.placesApiKey?.trim()) {
    return {
      source: "url_only",
      ...base,
      name: fallbackNa.name,
      address: fallbackNa.address,
      starRating: null,
      priceRange: null,
      hotelWebsiteUrl: null,
      tags: [],
      descriptionEn: null,
      message:
        "Add GOOGLE_PLACES_API_KEY to your server environment for full autofill (name, address, stars, price, website, tags, description). Short links are expanded on the server.",
    }
  }

  const textQuery = buildTextQueryFromPlaceHint(textHint)

  let place: PlacesPlace | null
  try {
    place = await placesSearchText(textQuery, params.placesApiKey.trim())
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      source: "url_only",
      ...base,
      name: fallbackNa.name,
      address: fallbackNa.address,
      starRating: null,
      priceRange: null,
      hotelWebsiteUrl: null,
      tags: [],
      descriptionEn: null,
      message: `Places API error — filled link only. ${msg}`,
    }
  }

  if (!place) {
    return {
      source: "url_only",
      ...base,
      name: fallbackNa.name,
      address: fallbackNa.address,
      starRating: null,
      priceRange: null,
      hotelWebsiteUrl: null,
      tags: [],
      descriptionEn: null,
      message:
        "No place matched this search. Try a more specific Maps link (open the hotel on Google Maps and copy the URL again).",
    }
  }

  const f = placeToFields(place)

  return {
    source: "places_api",
    googleMapsUrl: f.googleMapsUrl ?? expanded,
    name: f.name,
    address: f.address,
    starRating: f.starRating,
    priceRange: f.priceRange,
    priceCurrency: "eur",
    hotelWebsiteUrl: f.hotelWebsiteUrl,
    tags: f.tags,
    descriptionEn: f.descriptionEn,
    message:
      "Filled from Google Places. Review all fields before saving — especially description language.",
  }
}

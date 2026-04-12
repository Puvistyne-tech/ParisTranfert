import type { Testimonial } from "@/components/models/testimonials"

const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places"

/** Fields for reviews + Maps link (Place Details New). */
const FIELD_MASK = [
  "reviews",
  "googleMapsUri",
  "displayName",
  "rating",
  "userRatingCount",
].join(",")

const GRADIENT_CYCLE = [
  "from-amber-500 to-orange-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
] as const

function initialsFromAuthorName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const w = parts[0]!
    return w.slice(0, 2).toUpperCase()
  }
  const first = parts[0]![0] ?? ""
  const last = parts[parts.length - 1]![0] ?? ""
  return `${first}${last}`.toUpperCase() || "?"
}

type PlacesReviewJson = {
  name?: string
  rating?: number
  text?: { text?: string }
  authorAttribution?: { displayName?: string }
}

type PlaceDetailsJson = {
  reviews?: PlacesReviewJson[]
  googleMapsUri?: string
  displayName?: { text?: string }
}

function mapReviewsToTestimonials(reviews: PlacesReviewJson[]): Testimonial[] {
  const out: Testimonial[] = []
  let i = 0
  for (const r of reviews) {
    const text = typeof r.text?.text === "string" ? r.text.text.trim() : ""
    if (!text) continue
    const author =
      typeof r.authorAttribution?.displayName === "string"
        ? r.authorAttribution.displayName.trim()
        : ""
    const displayName = author || "Google user"
    const ratingRaw = typeof r.rating === "number" ? r.rating : 5
    const rating = Math.min(5, Math.max(1, Math.round(ratingRaw)))
    const base: Testimonial = {
      name: displayName,
      initials: initialsFromAuthorName(displayName),
      rating,
      comment: text,
      gradient: GRADIENT_CYCLE[i % GRADIENT_CYCLE.length]!,
    }
    if (typeof r.name === "string") {
      base.reviewName = r.name
    }
    out.push(base)
    i++
  }
  return out
}

export type GooglePlaceReviewsForTestimonials = {
  items: Testimonial[]
  googleMapsUri: string | null
  placeDisplayName: string | null
}

/**
 * Loads Google Business reviews for the testimonials section (server-only).
 * Returns null if the request fails or there are no text reviews.
 */
export async function fetchGooglePlaceReviewsForTestimonials(options: {
  placeId: string
  apiKey: string
  languageCode?: string
}): Promise<GooglePlaceReviewsForTestimonials | null> {
  const { placeId, apiKey, languageCode } = options
  const id = encodeURIComponent(placeId)
  const url = new URL(`${PLACE_DETAILS_URL}/${id}`)
  if (languageCode) {
    url.searchParams.set("languageCode", languageCode)
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error(
      "Google Place Details (reviews):",
      res.status,
      await res.text().catch(() => ""),
    )
    return null
  }

  const json = (await res.json()) as PlaceDetailsJson
  const raw = Array.isArray(json.reviews) ? json.reviews : []
  const items = mapReviewsToTestimonials(raw)
  if (items.length === 0) return null

  return {
    items,
    googleMapsUri:
      typeof json.googleMapsUri === "string" ? json.googleMapsUri : null,
    placeDisplayName:
      typeof json.displayName?.text === "string" ? json.displayName.text : null,
  }
}

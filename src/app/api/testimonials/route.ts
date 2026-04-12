import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import type { Testimonial } from "@/components/models/testimonials"
import { fetchGooglePlaceReviewsForTestimonials } from "@/lib/googlePlaceReviews"
import { getTestimonials } from "@/lib/supabaseService"
import type { TestimonialsPayload } from "@/lib/testimonialsPayload"

export const revalidate = 3600

const DEFAULT_GRADIENT = "from-amber-500 to-orange-600"

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang") ?? "en"
  const placeId =
    process.env.GOOGLE_BUSINESS_PLACE_ID ?? process.env.GOOGLE_PLACE_ID
  const apiKey =
    process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY

  if (placeId && apiKey) {
    try {
      const google = await fetchGooglePlaceReviewsForTestimonials({
        placeId,
        apiKey,
        languageCode: lang,
      })
      if (google && google.items.length > 0) {
        const body: TestimonialsPayload = {
          source: "google",
          items: google.items,
          googleMapsUri: google.googleMapsUri,
        }
        return NextResponse.json(body)
      }
    } catch (e) {
      console.error("testimonials API (Google):", e)
    }
  }

  try {
    const rows = await getTestimonials()
    const items: Testimonial[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      initials: row.initials,
      rating: row.rating,
      comment: row.comment,
      gradient: row.gradient ?? DEFAULT_GRADIENT,
    }))
    const body: TestimonialsPayload = {
      source: "database",
      items,
    }
    return NextResponse.json(body)
  } catch (e) {
    console.error("testimonials API (database):", e)
    return NextResponse.json(
      { error: "Failed to load testimonials" },
      { status: 500 },
    )
  }
}

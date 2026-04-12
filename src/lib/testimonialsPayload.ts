import type { Testimonial } from "@/components/models/testimonials"

/** Response body for GET /api/testimonials */
export type TestimonialsPayload =
  | {
      source: "google"
      items: Testimonial[]
      googleMapsUri: string | null
    }
  | {
      source: "database"
      items: Testimonial[]
    }

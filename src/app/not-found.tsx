import type { Metadata } from "next"
import { NotFoundContent } from "@/components/not-found/NotFoundContent"

export const metadata: Metadata = {
  title: "404 - Page Not Found | Prestige Shuttle Group",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return <NotFoundContent />
}

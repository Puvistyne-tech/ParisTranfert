"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Admin reservation detail route
 * Redirects to reservations page with modal open
 */
export default function AdminReservationDetailPage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const reservationId = params.id as string;

  useEffect(() => {
    // Redirect to reservations page with reservation ID as query parameter
    // The reservations page will detect this and open the modal
    router.replace(`/${locale}/admin/reservations?reservation=${reservationId}`);
  }, [router, locale, reservationId]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading reservation...</p>
      </div>
    </div>
  );
}


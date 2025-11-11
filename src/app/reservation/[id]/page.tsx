import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/**
 * Redirect handler for legacy reservation URLs without locale prefix
 * Handles URLs like /reservation/{id} and redirects to /{defaultLocale}/reservation/{id}
 */
export default async function LegacyReservationRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const defaultLocale = routing.defaultLocale;
  redirect(`/${defaultLocale}/reservation/${id}`);
}


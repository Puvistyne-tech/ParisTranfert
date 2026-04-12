/** Surface API / Supabase / Error messages for admin UI */
export function errorMessageFromUnknown(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (err === null || err === undefined) return fallback
  if (typeof err === "string" && err.trim()) return err.trim()
  if (err instanceof Error && err.message.trim()) return err.message.trim()
  if (typeof err === "object") {
    const o = err as Record<string, unknown>
    if (typeof o.message === "string" && o.message.trim()) return o.message.trim()
    if (typeof o.details === "string" && o.details.trim()) return o.details.trim()
    if (typeof o.hint === "string" && o.hint.trim()) return o.hint.trim()
  }
  return fallback
}

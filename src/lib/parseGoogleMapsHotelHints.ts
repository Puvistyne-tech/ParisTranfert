/**
 * Google Maps share/place URLs do not expose star ratings, price, or categories
 * without the Places API. We only extract human-readable text when it appears
 * in the URL (query param or /place/… path) to help prefill address or name.
 */

export type GoogleMapsUrlHints = {
  /** Text that may describe the place or search query */
  textHint: string | null
  /** True for short links that cannot be parsed without resolving the redirect */
  isShortLink: boolean
}

function decodePlaceSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.replace(/\+/g, ' '))
      .replace(/\+/g, ' ')
      .trim();
  } catch {
    return segment.replace(/\+/g, ' ').trim();
  }
}

export function isShortGoogleMapsUrl(url: string): boolean {
  try {
    const h = new URL(url.trim()).hostname.replace(/^www\./, '');
    return h === 'goo.gl' || h === 'maps.app.goo.gl';
  } catch {
    return false;
  }
}

/**
 * Best-effort extraction from a pasted Maps URL. Does not call the network.
 */
export function extractHintsFromGoogleMapsUrl(url: string): GoogleMapsUrlHints {
  const trimmed = url.trim();
  if (!trimmed) {
    return { textHint: null, isShortLink: false };
  }

  if (isShortGoogleMapsUrl(trimmed)) {
    return { textHint: null, isShortLink: true };
  }

  try {
    const u = new URL(trimmed);
    const q = u.searchParams.get('q') || u.searchParams.get('query');
    if (q) {
      return {
        textHint: decodePlaceSegment(q),
        isShortLink: false,
      };
    }

    const placeMatch = u.pathname.match(/\/place\/([^/?#]+)/);
    if (placeMatch) {
      return {
        textHint: decodePlaceSegment(placeMatch[1]),
        isShortLink: false,
      };
    }

    const searchMatch = u.pathname.match(/\/search\/([^/?#]+)/);
    if (searchMatch) {
      return {
        textHint: decodePlaceSegment(searchMatch[1]),
        isShortLink: false,
      };
    }
  } catch {
    return { textHint: null, isShortLink: false };
  }

  return { textHint: null, isShortLink: false };
}

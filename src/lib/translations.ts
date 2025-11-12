/**
 * Translation helpers for database content (services, vehicle types)
 * These use the translation system with keys based on IDs
 */

// Map database service IDs to translation keys
const serviceIdToTranslationKey: Record<string, string> = {
  "airport-transfers": "airportTransfer",
  "disneyland-paris": "disneyland",
  "private-tours": "privateTour",
  "wedding-transfers": "weddingTransfer",
  "business-transfers": "businessTransfer",
  "custom-transfers": "customTransfer",
  international: "international",
  "transport-international": "international",
  "greeter-service": "greeterService",
  "service-vip": "serviceVip",
  "tour-guide": "tourGuide",
  "event-transport": "eventTransport",
};

/**
 * Get translated service name using translation key
 * Falls back to original name if translation not found
 * Note: The `t` function should already be scoped to the "services" namespace
 */
export function getTranslatedServiceName(
  serviceId: string,
  serviceName: string,
  t: (key: string) => string | undefined,
): string {
  const translationKey = serviceIdToTranslationKey[serviceId] || serviceId;
  // Don't add "services." prefix since t is already scoped to services namespace
  const fullKey = `${translationKey}.name`;
  try {
    const translated = t(fullKey);
    // If translation returns undefined or the key itself, it means translation doesn't exist
    if (!translated || translated === fullKey) {
      return serviceName;
    }
    return translated;
  } catch {
    return serviceName;
  }
}

/**
 * Get translated vehicle description using translation key
 * Falls back to original description if translation not found
 * Note: The `t` function should already be scoped to the "fleet" namespace
 */
export function getTranslatedVehicleDescription(
  vehicleId: string,
  description: string,
  t: (key: string) => string | undefined,
): string {
  if (!description) return description;

  // Don't add "fleet." prefix since t is already scoped to fleet namespace
  const translationKey = `${vehicleId}.description`;
  try {
    const translated = t(translationKey);
    // If translation returns undefined or the key itself, it means translation doesn't exist
    if (!translated || translated === translationKey) {
      return description;
    }
    return translated;
  } catch {
    return description;
  }
}

/**
 * Map common service field labels to translation keys
 */
const fieldLabelToTranslationKey: Record<string, string> = {
  "Lieu de prise en charge": "pickupAddress",
  "Nom de l'hôtel (si applicable)": "hotelName",
  "Heure de retour": "returnTime",
  "Date de retour": "returnDate",
  "Destination": "destination",
  "Pickup Location (hidden)": "pickupLocationHidden",
  "Destination (hidden)": "destinationHidden",
};

/**
 * Get translated service field label
 * Falls back to original label if translation not found
 * Note: The `t` function should be scoped to the "reservation.step2" namespace
 */
export function getTranslatedFieldLabel(
  label: string,
  t: (key: string) => string | undefined,
): string {
  if (!label) return label;

  const translationKey = fieldLabelToTranslationKey[label];
  if (!translationKey) {
    // If no mapping found, return original label
    return label;
  }

  try {
    const translated = t(`serviceFields.${translationKey}`);
    // If translation returns undefined or the key itself, it means translation doesn't exist
    if (!translated || translated === `serviceFields.${translationKey}`) {
      return label;
    }
    return translated;
  } catch {
    return label;
  }
}

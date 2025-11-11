import type { Json } from "@/lib/supabaseTypes";

export enum CategoryType {
  TRANSPORT = "transport",
  LUXURY = "luxury",
  TOUR = "tour",
  SECURITY = "security",
  SPECIAL = "special",
}

export enum CategoryId {
  TRANSPORT_AIRPORT = "transport-airport",
  TRANSPORT_INTERNATIONAL = "transport-international",
  SPECIAL_DISNEYLAND = "special-disneyland",
  LUXURY_VIP = "luxury-vip",
  TOUR_PARIS = "tour-paris",
  TOUR_GUIDE = "tour-guide",
  SECURITY_PERSONAL = "security-personal",
  SPECIAL_GREETER = "special-greeter",
  SPECIAL_EVENT = "special-event",
}

export const CATEGORY_TYPES = Object.values(CategoryType);

export const CATEGORY_IDS = Object.values(CategoryId);
export interface Category {
  id: CategoryId | string; // Can be string from DB
  name: string;
  categoryType: CategoryType | string; // Can be string from DB enum
  description: string;
}

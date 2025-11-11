import type { Json } from "@/lib/supabaseTypes";
import { Category } from "./categories";

export enum ServiceIcon {
  PLANE = "Plane",
  CROWN = "Crown",
  STAR = "Star",
  GLOBE = "Globe",
  SHIELD = "Shield",
  MAPPIN = "MapPin",
  USERCHECK = "UserCheck",
  HEART = "Heart",
  CALENDAR = "Calendar",
  BOOKOPEN = "BookOpen",
}

export const SERVICE_ICONS = Object.values(ServiceIcon);

export enum ServiceColor {
  BLUE = "blue",
  PURPLE = "purple",
  GREEN = "green",
  RED = "red",
  ORANGE = "orange",
}

export const SERVICE_COLORS = Object.values(ServiceColor);

export enum ServiceRequirement {
  FLIGHT_DETAILS = "Flight details",
  PASSENGER_COUNT = "Passenger count",
  DURATION = "Duration",
  PICKUP_LOCATION = "Pickup location",
  SECURITY_CLEARANCE = "Security clearance",
  SPECIAL_REQUESTS = "Special requests",
  RISK_ASSESSMENT = "Risk assessment",
  SPECIAL_NEEDS = "Special needs",
  PASSPORT_DETAILS = "Passport details",
  DESTINATION_COUNTRY = "Destination country",
  RETURN_DATE = "Return date",
  INTERESTS = "Interests",
  DURATION_PREFERENCE = "Duration preference",
  GROUP_SIZE = "Group size",
  ARRIVAL_DETAILS = "Arrival details",
  LANGUAGE_PREFERENCE = "Language preference",
  HOTEL_NAME = "Hotel name",
  RETURN_TIME = "Return time",
  EVENT_DETAILS = "Event details",
  GUEST_COUNT = "Guest count",
  TIMELINE = "Timeline",
  TOUR_FOCUS = "Tour focus",
}

export const SERVICE_REQUIREMENTS = Object.values(ServiceRequirement);

export enum ServiceLanguage {
  ENGLISH = "English",
  FRENCH = "French",
  SPANISH = "Spanish",
  GERMAN = "German",
  ITALIAN = "Italian",
  RUSSIAN = "Russian",
  DUTCH = "Dutch",
  PORTUGUESE = "Portuguese",
  CHINESE = "Chinese",
}

export interface Service {
  id: string;
  key: string; // Unique service key (stored in DB)
  name: string;
  description: string;
  shortDescription: string;
  icon: ServiceIcon | string; // Can be string from DB
  image?: string;
  duration?: string;
  priceRange?: string;
  features: Json; // JSONB array in DB
  isPopular?: boolean;
  isAvailable: boolean;
  categoryId: string;
  languages?: Json; // JSONB array in DB
}

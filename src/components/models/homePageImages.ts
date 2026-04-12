export enum HomePageImageType {
  CAROUSEL = "carousel",
  HERO = "hero",
  SERVICES = "services",
  VEHICLES = "vehicles",
  FEATURES = "features",
  TESTIMONIALS = "testimonials",
  DISNEYLAND_PROMO = "disneyland-promo",
  DISNEYLAND_HEADER = "disneyland-header",
  DISNEYLAND_CONTENT = "disneyland-content",
  DISNEYLAND_BACKGROUND = "disneyland-background",
  DISNEYLAND_FOOTER = "disneyland-footer",
  DISNEYLAND_BOOKING = "disneyland-booking",
}

/** Types stored in `home_page_images` (and used by useHomePageImages). */
export type HomePageImageSectionType =
  | "carousel"
  | "hero"
  | "services"
  | "vehicles"
  | "features"
  | "testimonials"
  | "disneyland-promo"
  | "disneyland-header"
  | "disneyland-content"
  | "disneyland-background"
  | "disneyland-footer"
  | "disneyland-booking";

/** Storage bucket folder prefix — includes hotel card uploads. */
export type WebsiteImageUploadType =
  | HomePageImageSectionType
  | "disneyland-hotel";

export interface HomePageImage {
  id: string;
  type: HomePageImageType | string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum HomePageImageType {
  CAROUSEL = "carousel",
  HERO = "hero",
  SERVICES = "services",
  VEHICLES = "vehicles",
  FEATURES = "features",
  TESTIMONIALS = "testimonials",
  DISNEYLAND_PROMO = "disneyland-promo",
  DISNEYLAND_PAGE = "disneyland-page",
}

export interface HomePageImage {
  id: string;
  type: HomePageImageType | string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


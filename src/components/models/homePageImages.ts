export enum HomePageImageType {
  CAROUSEL = "carousel",
  HERO = "hero",
  SERVICES = "services",
  VEHICLES = "vehicles",
  FEATURES = "features",
  TESTIMONIALS = "testimonials",
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


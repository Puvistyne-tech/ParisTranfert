export interface Testimonial {
  /** Supabase row id when loaded from the database */
  id?: string;
  name: string;
  initials: string;
  rating: number;
  comment: string;
  gradient: string;
  /** Google Places review resource name — for list keys when source is Google */
  reviewName?: string;
}

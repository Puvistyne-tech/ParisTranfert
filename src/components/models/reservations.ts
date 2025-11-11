export enum ReservationStatus {
  QUOTE_REQUESTED = "quote_requested",
  PENDING = "pending",
  QUOTE_SENT = "quote_sent",
  QUOTE_ACCEPTED = "quote_accepted",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Reservation {
  id: string;
  clientId: string; // Relationship to Clients
  serviceId: string; // Relationship to Services
  vehicleTypeId: string; // Relationship to Vehicle Types
  date: string; // DATE
  time: string; // TIME
  pickupLocation: string;
  destinationLocation: string | null;
  passengers: number;
  babySeats: number;
  boosterSeats: number;
  meetAndGreet: boolean;
  serviceSubData?: Record<string, any>; // JSONB
  notes?: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

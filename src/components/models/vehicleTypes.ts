export enum VehicleTypeId {
  CAR = "car",
  VAN = "van",
}

export const VEHICLE_TYPE_IDS = Object.values(VehicleTypeId);

export interface VehicleType {
  id: VehicleTypeId | string; // Can be string from DB
  name: string;
  description?: string;
  image?: string;
  minPassengers?: number;
  maxPassengers?: number;
}

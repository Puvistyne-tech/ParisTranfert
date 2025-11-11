export interface ServiceVehiclePricing {
  id: string;
  serviceId: string;
  vehicleTypeId: string;
  pickupLocationId: string;
  destinationLocationId: string;
  price: number;
}

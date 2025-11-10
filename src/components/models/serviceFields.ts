export type ServiceFieldType = 'text' | 'number' | 'select' | 'textarea' | 'date' | 'time' | 'location_select' | 'address_autocomplete';

export interface ServiceField {
  id: string;
  serviceId: string;
  fieldKey: string;
  fieldType: ServiceFieldType;
  label: string;
  required: boolean;
  options?: string[]; // For 'select' type fields
  minValue?: number; // For 'number' type fields
  maxValue?: number; // For 'number' type fields
  isPickup?: boolean; // For 'location_select' type fields
  isDestination?: boolean; // For 'location_select' type fields
  defaultValue?: string; // Pre-filled value (e.g., "Paris" for Paris Tour destination)
  fieldOrder: number; // Order of display
}


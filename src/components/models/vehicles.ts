// Enums
export enum VehicleClassTypes {
    ECO = "eco",
    BUSINESS = "business",
    VAN = "van",
}

export enum FuelType {
    GASOLINE = "gasoline",
    DIESEL = "diesel",
    ELECTRIC = "electric",
    HYBRID = "hybrid",
}

export enum Transmission {
    MANUAL = "manual",
    AUTOMATIC = "automatic",
}

export enum VehicleFeature {
    AIR_CONDITIONING = "Air Conditioning",
    WIFI = "WiFi",
    CHILD_SEATS_AVAILABLE = "Child Seats Available",
    FLEXIBLE_SEATING = "Flexible Seating",
    GPS_NAVIGATION = "GPS Navigation",
    BLUETOOTH_CONNECTIVITY = "Bluetooth Connectivity",
    USB_CHARGING_PORTS = "USB Charging Ports",
    LEATHER_SEATS = "Leather Seats",
    CLIMATE_CONTROL = "Climate Control",
    PREMIUM_SOUND_SYSTEM = "Premium Sound System",
    SUNROOF = "Sunroof",
    BACKUP_CAMERA = "Backup Camera",
    PARKING_SENSORS = "Parking Sensors",
    CRUISE_CONTROL = "Cruise Control",
    HEATED_SEATS = "Heated Seats",
    ELECTRIC_WINDOWS = "Electric Windows",
    CENTRAL_LOCKING = "Central Locking",
    ABS_BRAKES = "ABS Brakes",
    AIRBAGS = "Airbags",
    TINTED_WINDOWS = "Tinted Windows",
    LUGGAGE_SPACE = "Luggage Space",
    EXTRA_LUGGAGE_SPACE = "Extra Luggage Space",
    LARGE_LUGGAGE_SPACE = "Large Luggage Space",
    USB_CHARGING = "USB Charging",
    MASSAGE_SEATS = "Massage Seats",
    PREMIUM_AUDIO = "Premium Audio",
    AUTOPILOT = "Autopilot",
    OVER_THE_AIR_UPDATES = "Over-the-Air Updates",
    SUPERCHARGING = "Supercharging",
    FALCON_WING_DOORS = "Falcon Wing Doors",
    SEVEN_SEAT_CONFIGURATION = "7-Seat Configuration",
    HYBRID_ENGINE = "Hybrid Engine",
    LOW_EMISSIONS = "Low Emissions",
    FUEL_EFFICIENT = "Fuel Efficient",
    RELIABLE = "Reliable",
}

// Constants for backward compatibility
export const VEHICLE_CLASSES = Object.values(VehicleClassTypes);
export const FUEL_TYPES = Object.values(FuelType);
export const TRANSMISSIONS = Object.values(Transmission);
export const VEHICLE_FEATURES = Object.values(VehicleFeature);

export const GRADIENT_COMBINATIONS = [
    "from-blue-500 to-transparent",
    "from-purple-500 to-transparent",
    "from-green-500 to-transparent",
    "from-orange-500 to-transparent",
    "from-teal-500 to-transparent",
    "from-yellow-500 to-transparent",
    "from-indigo-500 to-transparent",
    "from-pink-500 to-transparent",
    "from-emerald-500 to-transparent",
    "from-red-500 to-transparent",
    "from-cyan-500 to-transparent",
    "from-amber-500 to-transparent",
] as const;

// Utility function to get random gradient
export const getRandomGradient = (): string => {
    return GRADIENT_COMBINATIONS[
        Math.floor(Math.random() * GRADIENT_COMBINATIONS.length)
    ];
};

export interface VehicleClass {
    id: VehicleClassTypes;
    name: VehicleClassTypes;
    description: string;
}

export interface Vehicle {
    id: string;
    name: string;
    brand: string;
    model: string;
    classId: string;
    passengers: number;
    maxPassengers: number;
    price: number;
    gradient: string;
    color?: string;
    image?: string;
    description?: string;
    features?: VehicleFeature[];
    isAvailable: boolean;
    isElectric?: boolean;
    isHybrid?: boolean;
    fuelType?: FuelType;
    transmission?: Transmission;
    year?: number;
    mileage?: number;
    createdAt?: string;
    updatedAt?: string;
}

// export interface VehicleCategoryInfo {
//     id: string;
//     name: string;
//     description: string;
//     icon: string;
//     gradient: string;
//     color: string;
//     vehicles: Vehicle[];
// }

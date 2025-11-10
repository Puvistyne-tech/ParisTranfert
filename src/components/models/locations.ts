export enum LocationType {
    CITY = "city",
    AIRPORT = "airport",
    THEME_PARK = "theme_park",
    OTHER = "other",
}

export interface Location {
    id: string;
    name: string;
    type: LocationType | string; // Can be string from DB
}


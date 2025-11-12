import type {
    Category,
    CategoryId,
    CategoryType,
} from "@/components/models/categories";
import type { Client } from "@/components/models/clients";
import type { Location } from "@/components/models/locations";
import type { ServiceVehiclePricing } from "@/components/models/pricing";
import type { Reservation } from "@/components/models/reservations";
import { ReservationStatus } from "@/components/models/reservations";
import type { ServiceField } from "@/components/models/serviceFields";
import type { Service } from "@/components/models/services";
import type {
    VehicleType,
    VehicleTypeId,
} from "@/components/models/vehicleTypes";
import { supabase } from "./supabase";
import type {
    Database,
    Tables,
    TablesInsert,
    TablesUpdate,
} from "./supabaseTypes";

// Helper to map DB row to Category
export function mapCategoryRow(row: Tables<"categories">): Category {
    return {
        id: row.id as CategoryId,
        name: row.name,
        categoryType: row.category_type as CategoryType,
        description: row.description || "",
    };
}

// Helper to map DB row to Service
export function mapServiceRow(row: Tables<"services">): Service {
    return {
        id: row.id,
        key: row.key,
        name: row.name,
        description: row.description || "",
        shortDescription: row.short_description || "",
        icon: row.icon || "",
        image: row.image || undefined,
        duration: row.duration || undefined,
        priceRange: row.price_range || undefined,
        features: row.features || [],
        isPopular: row.is_popular || false,
        isAvailable: row.is_available ?? true,
        categoryId: row.category_id,
        languages: row.languages || undefined,
    };
}

// Helper to map DB row to Client
export function mapClientRow(row: Tables<"clients">): Client {
    return {
        id: row.id,
        clientId: row.id, // Use the UUID id as clientId for backward compatibility
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
    };
}

// Helper to map DB row to VehicleType
export function mapVehicleTypeRow(row: Tables<"vehicle_types">): VehicleType {
    return {
        id: row.id as VehicleTypeId,
        name: row.name,
        description: row.description || undefined,
        image: row.image || undefined,
        minPassengers: row.min_passengers || 1,
        maxPassengers: row.max_passengers || 8,
    };
}

// Helper to map DB row to Location
export function mapLocationRow(row: Tables<"locations">): Location {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
    };
}

// Helper to map DB row to ServiceVehiclePricing
export function mapPricingRow(
    row: Tables<"service_vehicle_pricing">
): ServiceVehiclePricing {
    return {
        id: row.id,
        serviceId: row.service_id,
        vehicleTypeId: row.vehicle_type_id,
        pickupLocationId: row.pickup_location_id,
        destinationLocationId: row.destination_location_id,
        price: Number(row.price),
    };
}

// Helper to map DB row to Reservation
export function mapReservationRow(row: Tables<"reservations">): Reservation {
    return {
        id: row.id,
        clientId: row.client_id,
        serviceId: row.service_id,
        vehicleTypeId: row.vehicle_type_id,
        date: row.date,
        time: row.time,
        pickupLocation: row.pickup_location,
        destinationLocation: row.destination_location,
        passengers: row.passengers,
        babySeats: row.baby_seats || 0,
        boosterSeats: row.booster_seats || 0,
        meetAndGreet: row.meet_and_greet || false,
        serviceSubData: row.service_sub_data as Record<string, any> | undefined,
        notes: row.notes || undefined,
        totalPrice: Number(row.total_price),
        status: row.status as ReservationStatus,
        createdAt: row.created_at || undefined,
        updatedAt: row.updated_at || undefined,
    };
}

/**
 * Categories Service
 */
export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data.map(mapCategoryRow);
}

export async function getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // Not found
        }
        console.error("Error fetching category:", error);
        throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return data ? mapCategoryRow(data) : null;
}

/**
 * Services Service
 */
export async function getServices(): Promise<Service[]> {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_available", true)
        .order("name");

    if (error) {
        console.error("Error fetching services:", error);
        throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return data.map(mapServiceRow);
}

/**
 * Get all services without filtering by availability
 * Used in admin panel to show all services regardless of status
 */
export async function getAllServices(): Promise<Service[]> {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching all services:", error);
        throw new Error(`Failed to fetch all services: ${error.message}`);
    }

    return data.map(mapServiceRow);
}

export async function getServiceById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // Not found
        }
        console.error("Error fetching service:", error);
        throw new Error(`Failed to fetch service: ${error.message}`);
    }

    return data ? mapServiceRow(data) : null;
}

export async function getServicesByCategory(
    categoryId: string
): Promise<Service[]> {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("category_id", categoryId)
        .eq("is_available", true)
        .order("name");

    if (error) {
        console.error("Error fetching services by category:", error);
        throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return data.map(mapServiceRow);
}

/**
 * Service Fields Service
 */
export async function getServiceFields(
    serviceId: string
): Promise<ServiceField[]> {
    const { data, error } = await supabase
        .from("service_fields")
        .select("*")
        .eq("service_id", serviceId)
        .order("field_order", { ascending: true });

    if (error) {
        console.error("Error fetching service fields:", error);
        throw new Error(`Failed to fetch service fields: ${error.message}`);
    }

    if (!data || data.length === 0) {
        return [];
    }

    console.log("Data:", data);

    return data.map((row: any) => ({
        id: row.id,
        serviceId: row.service_id,
        fieldKey: row.field_key,
        fieldType: row.field_type as ServiceField["fieldType"],
        label: row.label,
        required: row.required || false,
        options: row.options
            ? Array.isArray(row.options)
                ? row.options
                : []
            : undefined,
        minValue: row.min_value || undefined,
        maxValue: row.max_value || undefined,
        isPickup: row.is_pickup || false,
        isDestination: row.is_destination || false,
        defaultValue: row.default_value || undefined,
        fieldOrder: row.field_order || 0,
    }));
}

/**
 * Create a service field
 */
export async function createServiceField(
    serviceId: string,
    fieldData: Omit<ServiceField, "id" | "serviceId">
): Promise<ServiceField> {
    const insertData: any = {
        service_id: serviceId,
        field_key: fieldData.fieldKey,
        field_type: fieldData.fieldType,
        label: fieldData.label,
        required: fieldData.required || false,
        options: fieldData.options ? fieldData.options : null,
        min_value: fieldData.minValue || null,
        max_value: fieldData.maxValue || null,
        is_pickup: fieldData.isPickup || false,
        is_destination: fieldData.isDestination || false,
        default_value: fieldData.defaultValue || null,
        field_order: fieldData.fieldOrder || 0,
    };

    const { data, error } = await supabase
        .from("service_fields")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating service field:", error);
        throw new Error(`Failed to create service field: ${error.message}`);
    }

    if (!data) {
        throw new Error("Failed to create service field: No data returned");
    }

    return {
        id: data.id,
        serviceId: data.service_id,
        fieldKey: data.field_key,
        fieldType: data.field_type,
        label: data.label,
        required: data.required || false,
        options:
            data.options && Array.isArray(data.options)
                ? data.options.filter(
                      (item): item is string => typeof item === "string"
                  )
                : undefined,
        minValue: data.min_value || undefined,
        maxValue: data.max_value || undefined,
        isPickup: data.is_pickup || false,
        isDestination: data.is_destination || false,
        defaultValue: data.default_value || undefined,
        fieldOrder: data.field_order || 0,
    };
}

/**
 * Update a service field
 */
export async function updateServiceField(
    fieldId: string,
    updates: Partial<Omit<ServiceField, "id" | "serviceId">>
): Promise<ServiceField> {
    const updateData: any = {};
    if (updates.fieldKey !== undefined) updateData.field_key = updates.fieldKey;
    if (updates.fieldType !== undefined)
        updateData.field_type = updates.fieldType;
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.required !== undefined) updateData.required = updates.required;
    if (updates.options !== undefined)
        updateData.options = updates.options || null;
    if (updates.minValue !== undefined)
        updateData.min_value = updates.minValue || null;
    if (updates.maxValue !== undefined)
        updateData.max_value = updates.maxValue || null;
    if (updates.isPickup !== undefined) updateData.is_pickup = updates.isPickup;
    if (updates.isDestination !== undefined)
        updateData.is_destination = updates.isDestination;
    if (updates.defaultValue !== undefined)
        updateData.default_value = updates.defaultValue || null;
    if (updates.fieldOrder !== undefined)
        updateData.field_order = updates.fieldOrder;

    const { data, error } = await supabase
        .from("service_fields")
        .update(updateData)
        .eq("id", fieldId)
        .select()
        .single();

    if (error) {
        console.error("Error updating service field:", error);
        throw new Error(`Failed to update service field: ${error.message}`);
    }

    return {
        id: data.id,
        serviceId: data.service_id,
        fieldKey: data.field_key,
        fieldType: data.field_type,
        label: data.label,
        required: data.required || false,
        options:
            data.options && Array.isArray(data.options)
                ? data.options.filter(
                      (item): item is string => typeof item === "string"
                  )
                : undefined,
        minValue: data.min_value || undefined,
        maxValue: data.max_value || undefined,
        isPickup: data.is_pickup || false,
        isDestination: data.is_destination || false,
        defaultValue: data.default_value || undefined,
        fieldOrder: data.field_order || 0,
    };
}

/**
 * Delete a service field
 */
export async function deleteServiceField(fieldId: string): Promise<void> {
    const { error } = await supabase
        .from("service_fields")
        .delete()
        .eq("id", fieldId);

    if (error) {
        console.error("Error deleting service field:", error);
        throw new Error(`Failed to delete service field: ${error.message}`);
    }
}

/**
 * Features Service
 */
export async function getFeatures() {
    const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("key");

    if (error) {
        console.error("Error fetching features:", error);
        throw new Error(`Failed to fetch features: ${error.message}`);
    }

    return data || [];
}

/**
 * Testimonials Service
 */
export async function getTestimonials() {
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching testimonials:", error);
        throw new Error(`Failed to fetch testimonials: ${error.message}`);
    }

    return data || [];
}

/**
 * Clients Service
 */
export async function createClient(clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}): Promise<Client> {
    // Try to find existing client by email
    const { data: existing } = await supabase
        .from("clients")
        .select("*")
        .eq("email", clientData.email)
        .single();

    if (existing) {
        return mapClientRow(existing);
    }

    // Create new client
    const insertData: TablesInsert<"clients"> = {
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
    };

    const { data, error } = await supabase
        .from("clients")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating client:", error);
        throw new Error(`Failed to create client: ${error.message}`);
    }

    return mapClientRow(data);
}

/**
 * Vehicle Types Service
 */
export async function getVehicleTypes(): Promise<VehicleType[]> {
    const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching vehicle types:", error);
        throw new Error(`Failed to fetch vehicle types: ${error.message}`);
    }

    return (data || []).map(mapVehicleTypeRow);
}

export async function getVehicleTypeById(
    id: string
): Promise<VehicleType | null> {
    const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // Not found
        }
        console.error("Error fetching vehicle type:", error);
        throw new Error(`Failed to fetch vehicle type: ${error.message}`);
    }

    return data ? mapVehicleTypeRow(data) : null;
}

/**
 * Locations Service
 */
export async function getLocations(): Promise<Location[]> {
    const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

    if (error) {
        console.error("Error fetching locations:", error);
        throw new Error(`Failed to fetch locations: ${error.message}`);
    }

    return (data || []).map(mapLocationRow);
}

export async function getLocationsByService(
    serviceId: string
): Promise<Location[]> {
    const { data, error } = await supabase
        .from("service_locations")
        .select("location_id, locations(*)")
        .eq("service_id", serviceId);

    if (error) {
        console.error("Error fetching service locations:", error);
        throw new Error(`Failed to fetch service locations: ${error.message}`);
    }

    return (data || [])
        .map((item: any) => item.locations)
        .filter(Boolean)
        .map(mapLocationRow);
}

export async function getLocationById(
    locationId: string
): Promise<Location | null> {
    const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("id", locationId)
        .single();

    if (error) {
        console.error("Error fetching location:", error);
        return null;
    }

    return data ? mapLocationRow(data) : null;
}

/**
 * Pricing Service
 */
export async function getPricing(
    serviceId: string,
    vehicleTypeId: string,
    pickupLocation: string,
    destination: string
): Promise<ServiceVehiclePricing | null> {
    // Dropdowns return location IDs directly (e.g., 'paris', 'cdg', 'orly')
    // Simply normalize to lowercase and trim to ensure exact match
    const pickupId = pickupLocation.toLowerCase().trim();
    const destinationId = destination.toLowerCase().trim();

    // Log for debugging
    console.log("Pricing lookup:", {
        serviceId,
        vehicleTypeId,
        pickupId,
        destinationId,
    });

    // Try direct route first (A -> B)
    let { data, error } = await supabase
        .from("service_vehicle_pricing")
        .select("*")
        .eq("service_id", serviceId)
        .eq("vehicle_type_id", vehicleTypeId)
        .eq("pickup_location_id", pickupId)
        .eq("destination_location_id", destinationId)
        .single();

    // If not found, try reverse route (B -> A) since routes are bidirectional
    if (error && error.code === "PGRST116") {
        console.log("Direct route not found, trying reverse route...");
        const reverseResult = await supabase
            .from("service_vehicle_pricing")
            .select("*")
            .eq("service_id", serviceId)
            .eq("vehicle_type_id", vehicleTypeId)
            .eq("pickup_location_id", destinationId) // Reverse: destination becomes pickup
            .eq("destination_location_id", pickupId) // Reverse: pickup becomes destination
            .single();

        data = reverseResult.data;
        error = reverseResult.error;
    }

    if (error) {
        if (error.code === "PGRST116") {
            console.warn("Pricing not found for route (both directions):", {
                serviceId,
                vehicleTypeId,
                pickupId,
                destinationId,
            });
            return null; // Not found - no pricing for this route
        }
        console.error("Error fetching pricing:", error, {
            serviceId,
            vehicleTypeId,
            pickupId,
            destinationId,
        });
        throw new Error(`Failed to fetch pricing: ${error.message}`);
    }

    console.log("Pricing found:", data ? mapPricingRow(data) : null);
    return data ? mapPricingRow(data) : null;
}

/**
 * Reservations Service
 */
export async function createReservation(reservationData: {
    clientId: string;
    serviceId: string;
    vehicleTypeId: string;
    date: string;
    time: string;
    pickupLocation: string;
    destinationLocation: string | null;
    passengers: number;
    babySeats?: number;
    boosterSeats?: number;
    meetAndGreet?: boolean;
    serviceSubData?: Record<string, any>;
    notes?: string;
    totalPrice: number;
    status?: ReservationStatus;
    locale?: string; // Locale for email URLs (not stored in database)
}): Promise<Reservation> {
    // Check for duplicate reservation BEFORE inserting
    // Duplicate = same client_id + date + time + pickup_location
    const { data: existingReservation, error: checkError } = await supabase
        .from("reservations")
        .select("*")
        .eq("client_id", reservationData.clientId)
        .eq("date", reservationData.date)
        .eq("time", reservationData.time)
        .eq("pickup_location", reservationData.pickupLocation)
        .limit(1)
        .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" which is expected, other errors are real issues
        console.error("Error checking for duplicate reservation:", checkError);
        throw new Error(
            `Failed to check for duplicate reservation: ${checkError.message}`
        );
    }

    // If duplicate found, return existing reservation (idempotent operation)
    if (existingReservation) {
        console.log(
            "Duplicate reservation detected, returning existing reservation:",
            existingReservation.id
        );
        return mapReservationRow(existingReservation);
    }

    // No duplicate found, create new reservation
    // Determine status based on price: if price is 0, it's a quote request, otherwise pending
    const defaultStatus =
        reservationData.totalPrice === 0
            ? ReservationStatus.QUOTE_REQUESTED
            : ReservationStatus.PENDING;

    const insertData: TablesInsert<"reservations"> = {
        client_id: reservationData.clientId,
        service_id: reservationData.serviceId,
        vehicle_type_id: reservationData.vehicleTypeId,
        date: reservationData.date,
        time: reservationData.time,
        pickup_location: reservationData.pickupLocation,
        destination_location: reservationData.destinationLocation,
        passengers: reservationData.passengers,
        baby_seats: reservationData.babySeats || 0,
        booster_seats: reservationData.boosterSeats || 0,
        meet_and_greet: reservationData.meetAndGreet || false,
        service_sub_data: reservationData.serviceSubData || null,
        notes: reservationData.notes || null,
        total_price: reservationData.totalPrice,
        status: (reservationData.status || defaultStatus) as any,
    };

    const { data, error } = await supabase
        .from("reservations")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating reservation:", error);
        throw new Error(`Failed to create reservation: ${error.message}`);
    }

    const createdReservation = mapReservationRow(data);

    // Check if client emails should be sent for pending/quote_requested statuses
    // Environment variables are always strings, so we check for "true" string
    const shouldSendClientEmail =
        process.env.NEXT_PUBLIC_SEND_PENDING_STATUS_TO_CLIENT === "true";

    // Send email notification (async, don't wait for it)
    // Import dynamically to avoid circular dependencies
    import("./reservationEmailService")
        .then(({ sendReservationStatusEmail, sendAdminNotificationEmail }) => {
            // Get client for email
            getClientById(createdReservation.clientId)
                .then((client) => {
                    if (client) {
                        // Send customer email only if enabled via environment variable
                        // This controls emails for initial reservation creation (pending/quote_requested)
                        if (shouldSendClientEmail) {
                            sendReservationStatusEmail(
                                createdReservation.id,
                                createdReservation.status,
                                client.email,
                                `${client.firstName} ${client.lastName}`,
                                reservationData.locale || "en"
                            ).catch((err) => {
                                console.error(
                                    "Failed to send customer email:",
                                    err
                                );
                            });
                        } else {
                            console.log(
                                "Client email skipped: NEXT_PUBLIC_SEND_PENDING_STATUS_TO_CLIENT is disabled"
                            );
                        }

                        // Send admin notification (admin email is retrieved from env in notifyAdmin)
                        // Admin emails are always sent regardless of the setting
                        sendAdminNotificationEmail(createdReservation.id).catch(
                            (err) => {
                                console.error(
                                    "Failed to send admin email:",
                                    err
                                );
                            }
                        );
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch client for email:", err);
                });
        })
        .catch((err) => {
            console.error("Failed to load email service:", err);
        });

    return createdReservation;
}

export async function getReservations(
    options: {
        status?: ReservationStatus;
        limit?: number;
        offset?: number;
    } = {}
): Promise<{ data: Reservation[]; total: number }> {
    const { status, limit = 10, offset = 0 } = options;

    let query = supabase
        .from("reservations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (status) {
        query = query.eq("status", status as any);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching reservations:", error);
        throw new Error(`Failed to fetch reservations: ${error.message}`);
    }

    return {
        data: (data || []).map(mapReservationRow),
        total: count || 0,
    };
}

export async function getReservationById(
    id: string
): Promise<Reservation | null> {
    const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null; // Not found
        }
        console.error("Error fetching reservation:", error);
        throw new Error(`Failed to fetch reservation: ${error.message}`);
    }

    return data ? mapReservationRow(data) : null;
}

export async function updateReservationStatus(
    id: string,
    status: ReservationStatus
): Promise<Reservation> {
    const { data, error } = await supabase
        .from("reservations")
        .update({ status: status as any })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating reservation:", error);
        throw new Error(`Failed to update reservation: ${error.message}`);
    }

    return mapReservationRow(data);
}

/**
 * Admin: Update reservation (full update)
 */
export async function updateReservation(
    id: string,
    updates: Partial<{
        date: string;
        time: string;
        pickupLocation: string;
        destinationLocation: string | null;
        passengers: number;
        babySeats: number;
        boosterSeats: number;
        meetAndGreet: boolean;
        serviceSubData: Record<string, any>;
        notes: string;
        totalPrice: number;
        status: ReservationStatus;
    }>
): Promise<Reservation> {
    const updateData: TablesUpdate<"reservations"> = {};

    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.pickupLocation !== undefined)
        updateData.pickup_location = updates.pickupLocation;
    if (updates.destinationLocation !== undefined)
        updateData.destination_location = updates.destinationLocation;
    if (updates.passengers !== undefined)
        updateData.passengers = updates.passengers;
    if (updates.babySeats !== undefined)
        updateData.baby_seats = updates.babySeats;
    if (updates.boosterSeats !== undefined)
        updateData.booster_seats = updates.boosterSeats;
    if (updates.meetAndGreet !== undefined)
        updateData.meet_and_greet = updates.meetAndGreet;
    if (updates.serviceSubData !== undefined)
        updateData.service_sub_data = updates.serviceSubData;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.totalPrice !== undefined)
        updateData.total_price = updates.totalPrice;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
        .from("reservations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating reservation:", error);
        throw new Error(`Failed to update reservation: ${error.message}`);
    }

    return mapReservationRow(data);
}

/**
 * Admin: Delete reservation
 */
export async function deleteReservation(id: string): Promise<void> {
    const { error } = await supabase.from("reservations").delete().eq("id", id);

    if (error) {
        console.error("Error deleting reservation:", error);
        throw new Error(`Failed to delete reservation: ${error.message}`);
    }
}

/**
 * Admin: Get all clients
 */
export async function getClients(
    options: { limit?: number; offset?: number; search?: string } = {}
): Promise<{ data: Client[]; total: number }> {
    const { limit = 100, offset = 0, search } = options;

    let query = supabase
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (search) {
        query = query.or(
            `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching clients:", error);
        throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return {
        data: (data || []).map(mapClientRow),
        total: count || 0,
    };
}

/**
 * Admin: Get client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }
        console.error("Error fetching client:", error);
        throw new Error(`Failed to fetch client: ${error.message}`);
    }

    return data ? mapClientRow(data) : null;
}

/**
 * Admin: Get client reservations
 */
export async function getClientReservations(
    clientId: string
): Promise<Reservation[]> {
    const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching client reservations:", error);
        throw new Error(
            `Failed to fetch client reservations: ${error.message}`
        );
    }

    return (data || []).map(mapReservationRow);
}

/**
 * Admin: Update client
 */
export async function updateClient(
    id: string,
    updates: Partial<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }>
): Promise<Client> {
    const updateData: TablesUpdate<"clients"> = {};

    if (updates.firstName !== undefined)
        updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;

    const { data, error } = await supabase
        .from("clients")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating client:", error);
        throw new Error(`Failed to update client: ${error.message}`);
    }

    return mapClientRow(data);
}

/**
 * Admin: Get all pricing entries
 */
export async function getAllPricing(
    options: {
        serviceId?: string;
        vehicleTypeId?: string;
        limit?: number;
        offset?: number;
    } = {}
): Promise<{ data: ServiceVehiclePricing[]; total: number }> {
    const { serviceId, vehicleTypeId, limit = 1000, offset = 0 } = options;

    let query = supabase
        .from("service_vehicle_pricing")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (serviceId) {
        query = query.eq("service_id", serviceId);
    }
    if (vehicleTypeId) {
        query = query.eq("vehicle_type_id", vehicleTypeId);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching pricing:", error);
        throw new Error(`Failed to fetch pricing: ${error.message}`);
    }

    return {
        data: (data || []).map(mapPricingRow),
        total: count || 0,
    };
}

/**
 * Admin: Create pricing entry
 */
export async function createPricing(pricingData: {
    serviceId: string;
    vehicleTypeId: string;
    pickupLocationId: string;
    destinationLocationId: string;
    price: number;
}): Promise<ServiceVehiclePricing> {
    const { data, error } = await supabase
        .from("service_vehicle_pricing")
        .insert({
            service_id: pricingData.serviceId,
            vehicle_type_id: pricingData.vehicleTypeId,
            pickup_location_id: pricingData.pickupLocationId,
            destination_location_id: pricingData.destinationLocationId,
            price: pricingData.price,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating pricing:", error);
        throw new Error(`Failed to create pricing: ${error.message}`);
    }

    return mapPricingRow(data);
}

/**
 * Admin: Update pricing entry
 */
export async function updatePricing(
    id: string,
    updates: Partial<{
        pickupLocationId: string;
        destinationLocationId: string;
        price: number;
    }>
): Promise<ServiceVehiclePricing> {
    const updateData: TablesUpdate<"service_vehicle_pricing"> = {};

    if (updates.pickupLocationId !== undefined) {
        updateData.pickup_location_id = updates.pickupLocationId;
    }
    if (updates.destinationLocationId !== undefined) {
        updateData.destination_location_id = updates.destinationLocationId;
    }
    if (updates.price !== undefined) {
        updateData.price = updates.price;
    }

    // If no updates, return early
    if (Object.keys(updateData).length === 0) {
        throw new Error("No updates provided");
    }

    updateData.updated_at = new Date().toISOString();

    // First verify the row exists (without .single() to avoid PGRST116 error)
    const { data: checkData, error: checkError } = await supabase
        .from("service_vehicle_pricing")
        .select("id")
        .eq("id", id);

    if (checkError) {
        console.error("Error checking pricing entry:", { id, checkError });
        throw new Error(
            `Failed to verify pricing entry: ${checkError.message}`
        );
    }

    if (!checkData || checkData.length === 0) {
        console.error("Pricing entry not found:", { id, checkData });
        throw new Error(
            `Pricing entry with id ${id} not found. It may have been deleted.`
        );
    }

    // Check current user for debugging
    const {
        data: { user },
    } = await supabase.auth.getUser();
    console.log("Current user for update:", {
        userId: user?.id,
        role: user?.user_metadata?.role,
        email: user?.email,
    });

    const { data, error } = await supabase
        .from("service_vehicle_pricing")
        .update(updateData)
        .eq("id", id)
        .select();

    if (error) {
        console.error("Error updating pricing:", {
            error,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId: user?.id,
            role: user?.user_metadata?.role,
            updateData,
            id,
        });
        throw new Error(
            `Failed to update pricing: ${error.message} (Code: ${error.code})`
        );
    }

    // If no data returned (possibly due to RLS), fetch it separately
    if (!data || data.length === 0) {
        console.warn(
            "Update succeeded but no data returned, fetching separately:",
            { id, updateData }
        );
        // Fetch the updated row separately
        const { data: fetchedData, error: fetchError } = await supabase
            .from("service_vehicle_pricing")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !fetchedData) {
            // If we still can't get it, the update likely succeeded but we can't verify
            // Return a partial object based on the original row + updates
            console.warn(
                "Could not fetch updated row, update likely succeeded:",
                {
                    id,
                    fetchError,
                }
            );
            // We'll let the caller refresh the data instead
            throw new Error(
                `Update completed but could not retrieve updated data. Please refresh.`
            );
        }

        return mapPricingRow(fetchedData);
    }

    return mapPricingRow(data[0]);
}

/**
 * Admin: Delete pricing entry
 */
export async function deletePricing(id: string): Promise<void> {
    const { error } = await supabase
        .from("service_vehicle_pricing")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting pricing:", error);
        throw new Error(`Failed to delete pricing: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Services
 */
export async function createService(serviceData: {
    id: string;
    key: string;
    name: string;
    description?: string;
    shortDescription?: string;
    icon?: string;
    image?: string;
    duration?: string;
    priceRange?: string;
    features?: any[];
    languages?: any;
    isPopular?: boolean;
    isAvailable?: boolean;
    categoryId: string;
}): Promise<Service> {
    const insertData: TablesInsert<"services"> = {
        id: serviceData.id,
        key: serviceData.key,
        name: serviceData.name,
        description: serviceData.description || null,
        short_description: serviceData.shortDescription || null,
        icon: serviceData.icon || null,
        image: serviceData.image || null,
        duration: serviceData.duration || null,
        price_range: serviceData.priceRange || null,
        features: serviceData.features || null,
        languages: serviceData.languages || null,
        is_popular: serviceData.isPopular || false,
        is_available: serviceData.isAvailable ?? true,
        category_id: serviceData.categoryId,
    };

    const { data, error } = await supabase
        .from("services")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating service:", error);
        throw new Error(`Failed to create service: ${error.message}`);
    }

    return mapServiceRow(data);
}

export async function updateService(
    id: string,
    updates: Partial<{
        key: string;
        name: string;
        description: string;
        shortDescription: string;
        icon: string;
        image: string;
        duration: string;
        priceRange: string;
        features: any[];
        languages: any;
        isPopular: boolean;
        isAvailable: boolean;
        categoryId: string;
    }>
): Promise<Service> {
    const updateData: any = {};

    if (updates.key !== undefined) updateData.key = updates.key;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
        updateData.description = updates.description;
    if (updates.shortDescription !== undefined)
        updateData.short_description = updates.shortDescription;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.priceRange !== undefined)
        updateData.price_range = updates.priceRange;
    if (updates.features !== undefined) updateData.features = updates.features;
    if (updates.languages !== undefined)
        updateData.languages = updates.languages;
    if (updates.isPopular !== undefined)
        updateData.is_popular = updates.isPopular;
    if (updates.isAvailable !== undefined)
        updateData.is_available = updates.isAvailable;
    if (updates.categoryId !== undefined)
        updateData.category_id = updates.categoryId;

    const { data, error } = await supabase
        .from("services")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating service:", error);
        throw new Error(`Failed to update service: ${error.message}`);
    }

    return mapServiceRow(data);
}

export async function deleteService(id: string): Promise<void> {
    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) {
        console.error("Error deleting service:", error);
        throw new Error(`Failed to delete service: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Categories
 */
export async function createCategory(categoryData: {
    id: string;
    name: string;
    categoryType: CategoryType;
    description?: string;
}): Promise<Category> {
    const insertData: TablesInsert<"categories"> = {
        id: categoryData.id,
        name: categoryData.name,
        category_type: categoryData.categoryType,
        description: categoryData.description || null,
    };

    const { data, error } = await supabase
        .from("categories")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating category:", error);
        throw new Error(`Failed to create category: ${error.message}`);
    }

    return mapCategoryRow(data);
}

export async function updateCategory(
    id: string,
    updates: Partial<{
        name: string;
        categoryType: CategoryType;
        description: string;
    }>
): Promise<Category> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.categoryType !== undefined)
        updateData.category_type = updates.categoryType;
    if (updates.description !== undefined)
        updateData.description = updates.description;

    const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating category:", error);
        throw new Error(`Failed to update category: ${error.message}`);
    }

    return mapCategoryRow(data);
}

export async function deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
        console.error("Error deleting category:", error);
        throw new Error(`Failed to delete category: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Vehicle Types
 */
export async function createVehicleType(vehicleData: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    minPassengers?: number;
    maxPassengers?: number;
}): Promise<VehicleType> {
    const insertData: any = {
        id: vehicleData.id,
        name: vehicleData.name,
        description: vehicleData.description || null,
        image: vehicleData.image || null,
        min_passengers: vehicleData.minPassengers || 1,
        max_passengers: vehicleData.maxPassengers || 8,
    };

    const { data, error } = await supabase
        .from("vehicle_types")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating vehicle type:", error);
        throw new Error(`Failed to create vehicle type: ${error.message}`);
    }

    return mapVehicleTypeRow(data);
}

export async function updateVehicleType(
    id: string,
    updates: Partial<{
        name: string;
        description: string;
        image: string;
        minPassengers: number;
        maxPassengers: number;
    }>
): Promise<VehicleType> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
        updateData.description = updates.description;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.minPassengers !== undefined)
        updateData.min_passengers = updates.minPassengers;
    if (updates.maxPassengers !== undefined)
        updateData.max_passengers = updates.maxPassengers;

    const { data, error } = await supabase
        .from("vehicle_types")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating vehicle type:", error);
        throw new Error(`Failed to update vehicle type: ${error.message}`);
    }

    return mapVehicleTypeRow(data);
}

export async function deleteVehicleType(id: string): Promise<void> {
    const { error } = await supabase
        .from("vehicle_types")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting vehicle type:", error);
        throw new Error(`Failed to delete vehicle type: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Locations
 */
export async function createLocation(locationData: {
    id: string;
    name: string;
    type: string;
}): Promise<Location> {
    const insertData: TablesInsert<"locations"> = {
        id: locationData.id,
        name: locationData.name,
        type: locationData.type,
    };

    const { data, error } = await supabase
        .from("locations")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating location:", error);
        throw new Error(`Failed to create location: ${error.message}`);
    }

    return mapLocationRow(data);
}

export async function updateLocation(
    id: string,
    updates: Partial<{
        name: string;
        type: string;
    }>
): Promise<Location> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.type !== undefined) updateData.type = updates.type;

    const { data, error } = await supabase
        .from("locations")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating location:", error);
        throw new Error(`Failed to update location: ${error.message}`);
    }

    return mapLocationRow(data);
}

export async function deleteLocation(id: string): Promise<void> {
    const { error } = await supabase.from("locations").delete().eq("id", id);

    if (error) {
        console.error("Error deleting location:", error);
        throw new Error(`Failed to delete location: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Testimonials
 */
export async function createTestimonial(testimonialData: {
    name: string;
    initials: string;
    rating: number;
    comment: string;
    gradient?: string;
}): Promise<any> {
    const insertData: TablesInsert<"testimonials"> = {
        name: testimonialData.name,
        initials: testimonialData.initials,
        rating: testimonialData.rating,
        comment: testimonialData.comment,
        gradient: testimonialData.gradient || null,
    };

    const { data, error } = await supabase
        .from("testimonials")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating testimonial:", error);
        throw new Error(`Failed to create testimonial: ${error.message}`);
    }

    return data;
}

export async function updateTestimonial(
    id: string,
    updates: Partial<{
        name: string;
        initials: string;
        rating: number;
        comment: string;
        gradient: string;
    }>
): Promise<any> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.initials !== undefined) updateData.initials = updates.initials;
    if (updates.rating !== undefined) updateData.rating = updates.rating;
    if (updates.comment !== undefined) updateData.comment = updates.comment;
    if (updates.gradient !== undefined) updateData.gradient = updates.gradient;

    const { data, error } = await supabase
        .from("testimonials")
        .update(updateData)
        .eq("id", id)
        .select();

    if (error) {
        console.error("Error updating testimonial:", error);
        throw new Error(`Failed to update testimonial: ${error.message}`);
    }

    if (!data || data.length === 0) {
        throw new Error(`Testimonial with id ${id} not found`);
    }

    return data[0];
}

export async function deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
        console.error("Error deleting testimonial:", error);
        throw new Error(`Failed to delete testimonial: ${error.message}`);
    }
}

/**
 * Admin: CRUD operations for Features
 */
export async function createFeature(featureData: {
    key: string;
    icon: string;
    gradient: string;
}): Promise<any> {
    const insertData: TablesInsert<"features"> = {
        key: featureData.key,
        icon: featureData.icon,
        gradient: featureData.gradient,
    };

    const { data, error } = await supabase
        .from("features")
        .insert(insertData)
        .select()
        .single();

    if (error) {
        console.error("Error creating feature:", error);
        throw new Error(`Failed to create feature: ${error.message}`);
    }

    return data;
}

export async function updateFeature(
    key: string,
    updates: Partial<{
        icon: string;
        gradient: string;
    }>
): Promise<any> {
    const updateData: any = {};

    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.gradient !== undefined) updateData.gradient = updates.gradient;

    const { data, error } = await supabase
        .from("features")
        .update(updateData)
        .eq("key", key)
        .select()
        .single();

    if (error) {
        console.error("Error updating feature:", error);
        throw new Error(`Failed to update feature: ${error.message}`);
    }

    return data;
}

export async function deleteFeature(key: string): Promise<void> {
    const { error } = await supabase.from("features").delete().eq("key", key);

    if (error) {
        console.error("Error deleting feature:", error);
        throw new Error(`Failed to delete feature: ${error.message}`);
    }
}

/**
 * Storage: Upload service image to Supabase storage
 */
const SERVICE_IMAGES_BUCKET = "service-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

/**
 * Upload a service image to Supabase storage
 * @param file - The image file to upload
 * @param serviceId - The service ID to associate with the image
 * @returns The public URL of the uploaded image
 */
export async function uploadServiceImage(
    file: File,
    serviceId: string
): Promise<string> {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error(
            `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
        );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File size exceeds limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop() || "jpg"; // Default to jpg if no extension
    const timestamp = Date.now();
    const fileName = `service-${serviceId}-${timestamp}.${fileExt}`;
    const filePath = `${serviceId}/${fileName}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
        .from(SERVICE_IMAGES_BUCKET)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false, // Don't overwrite existing files
        });

    if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const {
        data: { publicUrl },
    } = supabase.storage.from(SERVICE_IMAGES_BUCKET).getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Delete a service image from Supabase storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteServiceImage(imageUrl: string): Promise<void> {
    try {
        // Extract file path from URL
        // URL format: https://{project}.supabase.co/storage/v1/object/public/service-images/{path}
        const urlParts = imageUrl.split("/service-images/");
        if (urlParts.length !== 2) {
            console.warn(
                "Invalid image URL format, skipping deletion:",
                imageUrl
            );
            return;
        }

        const filePath = urlParts[1];

        // Delete file from storage
        const { error } = await supabase.storage
            .from(SERVICE_IMAGES_BUCKET)
            .remove([filePath]);

        if (error) {
            console.error("Error deleting image:", error);
            // Don't throw - deletion is optional cleanup
            console.warn(`Failed to delete image: ${error.message}`);
        }
    } catch (error) {
        // Don't throw - deletion is optional cleanup
        console.warn("Error deleting service image:", error);
    }
}

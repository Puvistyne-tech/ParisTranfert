-- Supabase Schema for Paris Transfer Booking System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE category_type_enum AS ENUM ('transport', 'luxury', 'tour', 'security', 'special');
CREATE TYPE reservation_status_enum AS ENUM ('quote_requested', 'pending', 'quote_sent', 'quote_accepted', 'confirmed', 'completed', 'cancelled');
CREATE TYPE service_field_type_enum AS ENUM ('text', 'number', 'select', 'textarea', 'date', 'time', 'location_select', 'address_autocomplete');

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_type category_type_enum NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    icon TEXT,
    image TEXT,
    duration TEXT,
    price_range TEXT,
    features JSONB,
    languages JSONB,
    is_popular BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Fields Table - Allows admins to manage service-specific fields dynamically
CREATE TABLE IF NOT EXISTS service_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    field_type service_field_type_enum NOT NULL,
    label TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    options JSONB, -- For 'select' type fields: array of option strings
    min_value INTEGER, -- For 'number' type fields
    max_value INTEGER, -- For 'number' type fields
    is_pickup BOOLEAN DEFAULT false, -- For 'location_select' type fields
    is_destination BOOLEAN DEFAULT false, -- For 'location_select' type fields
    default_value TEXT, -- Pre-filled value (e.g., "Paris" for Paris Tour destination)
    field_order INTEGER DEFAULT 0, -- Order of display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_id, field_key)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_service_fields_service_id ON service_fields(service_id);
CREATE INDEX IF NOT EXISTS idx_service_fields_order ON service_fields(service_id, field_order);

-- Features Table
CREATE TABLE IF NOT EXISTS features (
    key TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    gradient TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    gradient TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicle Types Table
CREATE TABLE IF NOT EXISTS vehicle_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    min_passengers INTEGER DEFAULT 1,
    max_passengers INTEGER DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'city', 'airport', 'theme_park', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Locations Junction Table
CREATE TABLE IF NOT EXISTS service_locations (
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    is_pickup BOOLEAN DEFAULT true,
    is_destination BOOLEAN DEFAULT true,
    PRIMARY KEY (service_id, location_id)
);

-- Service Vehicle Pricing Table
CREATE TABLE IF NOT EXISTS service_vehicle_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    vehicle_type_id TEXT NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    pickup_location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    destination_location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (service_id, vehicle_type_id, pickup_location_id, destination_location_id)
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    vehicle_type_id TEXT NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    pickup_location TEXT NOT NULL,
    destination_location TEXT,
    passengers INTEGER NOT NULL CHECK (passengers > 0),
    baby_seats INTEGER DEFAULT 0 CHECK (baby_seats >= 0),
    booster_seats INTEGER DEFAULT 0 CHECK (booster_seats >= 0),
    meet_and_greet BOOLEAN DEFAULT false,
    service_sub_data JSONB,
    notes TEXT,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status reservation_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_key ON services(key);
CREATE INDEX IF NOT EXISTS idx_services_is_available ON services(is_available);
CREATE INDEX IF NOT EXISTS idx_services_is_popular ON services(is_popular);

CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_service_id ON reservations(service_id);
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_type_id ON reservations(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

CREATE INDEX IF NOT EXISTS idx_service_locations_service_id ON service_locations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_location_id ON service_locations(location_id);

CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_service_id ON service_vehicle_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_vehicle_type_id ON service_vehicle_pricing(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_route ON service_vehicle_pricing(pickup_location_id, destination_location_id);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_types_updated_at BEFORE UPDATE ON vehicle_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_vehicle_pricing_updated_at BEFORE UPDATE ON service_vehicle_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_fields_updated_at BEFORE UPDATE ON service_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


# Supabase Import Files

This directory contains CSV files and SQL schema for importing data into Supabase.

## Files Included

1. **schema.sql** - SQL schema to create all tables
2. **categories.csv** - Service categories data
3. **services.csv** - Services data
4. **features.csv** - Features data
5. **testimonials.csv** - Customer testimonials
6. **clients.csv** - Empty template for clients (to be populated)
7. **reservations.csv** - Empty template for reservations (to be populated)

## Import Instructions

### Step 1: Create Tables

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the `schema.sql` file to create all tables

### Step 2: Import CSV Data

1. Go to Table Editor in Supabase
2. For each table:
   - Click on the table name
   - Click "Import data" or use the Import button
   - Select the corresponding CSV file
   - Map columns if needed
   - Click Import

### Import Order

Import in this order to respect foreign key constraints:

1. **categories** (no dependencies)
2. **features** (no dependencies)
3. **testimonials** (no dependencies)
4. **services** (depends on categories)
5. **clients** (no dependencies, but empty template)
6. **reservations** (depends on clients, services, categories)

## Notes

- **Vehicle Types**: The system only uses two vehicle categories: "car" and "van". Users select vehicle category, not individual vehicles.
- **Reservations**: The `vehicle_id` field in reservations should contain either "car" or "van" as values.
- **JSON Fields**: Fields like `features`, `languages`, `requirements`, and `required_fields` are stored as JSON strings in the CSV files.
- **Empty Templates**: `clients.csv` and `reservations.csv` are empty templates with headers only. Populate them as needed.

## Table Relationships

- `services` → `categories` (via `category_id`)
- `reservations` → `clients` (via `client_id`)
- `reservations` → `services` (via `service_id`)
- `reservations` → `categories` (via `category_id`)


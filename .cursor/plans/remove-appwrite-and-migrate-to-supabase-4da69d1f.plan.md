<!-- 4da69d1f-3ba0-4c64-86f6-4710c70df5f4 d5dd52f1-c335-4269-8de4-c574d181d0df -->
# Fix Airport Transfer Pricing and Location Validation

## Issues Identified

1. **Pricing not showing for some locations**: The `getPricing` function's normalization logic may be incorrectly converting location IDs
2. **Same location selection**: Users can select the same location for pickup and destination
3. **Location ID mismatch**: Dropdown returns location IDs but pricing lookup might not match correctly

## Changes Required

### 1. Fix Pricing Lookup (`src/lib/supabaseService.ts`)

- **Simplify `getPricing` function**: Remove complex normalization logic since dropdowns return location IDs directly
- **Use location IDs directly**: If the input is already a valid location ID (short string like 'paris', 'cdg'), use it as-is
- **Add logging**: Log the exact IDs being used for pricing lookup to debug missing prices
- **Handle edge cases**: Ensure location IDs match exactly with database values

### 2. Add Location Selection Validation (`src/components/reservation/Step2TripDetails.tsx`)

- **For pickup_location dropdown**: Filter out the selected destination location from options
- **For destination_location dropdown**: Filter out the selected pickup location from options
- **Real-time validation**: Update dropdown options when the other location changes
- **Visual feedback**: Disable or hide the same location option in the opposite dropdown

### 3. Verify Pricing Data (`supabase-imports/import-data.sql`)

- **Review all pricing entries**: Ensure all combinations are present:
  - Paris ↔ CDG, ORLY, Beauvais, Disneyland (both directions)
  - CDG ↔ ORLY, Beauvais, Disneyland (both directions)
  - ORLY ↔ Beauvais, Disneyland (both directions)
  - Beauvais ↔ Disneyland (both directions)
- **Add missing routes**: If any routes are missing, add them with appropriate prices
- **Verify location IDs**: Ensure all location IDs in pricing match the locations table exactly

### 4. Update Validation Logic (`src/app/[locale]/reservation/page.tsx`)

- **Enhance same-location check**: Ensure comparison handles string IDs correctly (trim, lowercase)
- **Add validation message**: Show clear error when pickup and destination are the same
- **Prevent form submission**: Block submission if locations are the same

### 5. Improve Error Handling

- **Add console logging**: Log location IDs being used for pricing lookup
- **Show user-friendly errors**: Display specific error messages when pricing is not found
- **Debug mode**: Add optional debug logging to trace pricing lookup flow

## Implementation Details

### Location Dropdown Filtering

```typescript
// For pickup_location dropdown
const pickupOptions = serviceLocations.filter(
  loc => loc.id !== serviceSubData.destination_location
);

// For destination_location dropdown  
const destinationOptions = serviceLocations.filter(
  loc => loc.id !== serviceSubData.pickup_location
);
```

### Simplified Pricing Lookup

```typescript
// Use location ID directly if it's already a valid ID format
const pickupId = pickupLocation.toLowerCase().trim();
const destinationId = destination.toLowerCase().trim();
// No complex normalization needed - dropdowns return IDs directly
```

### Pricing Data Verification

- Check that all 5 locations (paris, cdg, orly, beauvais, disneyland) have pricing for both vehicle types
- Verify bidirectional routes (A→B and B→A) exist
- Total expected routes: 5 locations × 4 destinations × 2 directions × 2 vehicle types = 80 routes (but some may not be needed)

## Files to Modify

1. `src/lib/supabaseService.ts` - Simplify getPricing function
2. `src/components/reservation/Step2TripDetails.tsx` - Add location filtering in dropdowns
3. `src/app/[locale]/reservation/page.tsx` - Enhance validation
4. `supabase-imports/import-data.sql` - Verify and add missing pricing routes if needed





Implement Location Field Types with Proper Mapping to Reservations



Overview



The service_fields table defines HOW to collect location data (dropdown, text, Google Maps, etc.) and can pre-fill values. The reservations table stores the actual location values. This plan implements proper field types and mapping.



Changes Required



1. Database Schema Updates (supabase-imports/schema.sql)



• Keep location_select in service_field_type_enum • Add default_value TEXT column to service_fields table for pre-filling values (e.g., "Paris" for Paris Tour destination) • Keep is_pickup and is_destination columns (they indicate which reservation field to map to) • Add address_autocomplete to service_field_type_enum for Google Maps Places Autocomplete



2. Update Service Fields Data (supabase-imports/import-data.sql)



• Keep pickup_location and destination_location for airport-transfers (location_select type) • Add destination_location field for paris-city-tour with default_value = 'Paris' and is _destination = true • Add destination_location field for disneyland with default_value = 'Disneyland Paris' and is_destination = true • Update other services to use appropriate field types (text or address_autocomplete)



3. Update ServiceField Model ( src/components/models/serviceFields.ts)



• Add defaultValue?: string property • Keep location_select and address_autocomplete types • Keep isPickup and isDestination properties



4. Update Step2TripDetails Component ( src/components/reservation/Step2TripDet ails.tsx)



• For location_select type: Show dropdown with locations from locations table (fetch via getL ocationsByService) • For address_autocomplete type: Implement Google Maps Places Autocomplete input • For text type: Show regular text input (for simple address/city/country) • Map service field values to formData: • If isPickup = true: store in formData. location • If isDestination = true: store in formData.destination • Apply defaultValue when field is first rendered • Remove direct location/destination inputs - they come from service_fields



5. Update Validation Logic ( src/app/[localel/reservation/page.tsx)



• Check formData. location and formData.destination (mapped from service_fields) • Ensure both are filled for all services



6. Update API Route (src/app/api/reservations/route.ts)



• Use formData.location and formData. destination directly (already mapped from service fields)



• Remove location ID to name conversion logic (no longer needed)



7. Install Google Maps Package



• Add areact-google-maps/api or use-places-autocomplete package to package. json • Set up Google Maps API key in environment variables



8. Update Supabase Service (src/lib/supabaseService.ts)



• Update mapServiceFieldRow to include defaultValue • Keep getLocationsByService function for location_select fields



Implementation Details



Location Field Type Mapping:



• location_select: Dropdown from locations table (airport transfers) • address_autocomplete: Google Maps Places Autocomplete (other services needing addresses) • text: Simple text input (city, country, or simple address)



Pre-filled Values:



• Paris Tour: destination_location with default_value = "Paris' , is_destination = true • Disneyland: destination_location with default_value = "Disneyland Paris', is_destinati on = true



• Airport Transfers: Both pickup and destination are selectors (no defaults)



Data Flow:



1. Service fields define location inputs (type, label, default value, pickup/destination flag) 2. User fills location fields in Step2TripDetails 3. Values are mapped to formData.location and formData.destination based on isPickup/isd estination



4. API route saves to reservations. location and reservations.destination



Files to Modify



1. supabase-imports/schema.sql - Add default_value column and address_autocomplete enum 2. supabase-imports/import-data.sql - Add destination fields with defaults for Paris Tour and Disneyland 3. src/components/models/serviceFields.ts - Add defaultValue property 4. src/components/reservation/Step2TripDetails.tsx - Implement field type rendering and mapping 5. src/app/[locale]/reservation/page.tsx - Update validation 6. src/app/api/reservations/route.ts - Simplify location handling

6. src/app/api/reservations/route.ts - Simplify location handling 7. src/lib/supabaseService.ts - Update mapping to include defaultValue 8. package. json - Add Google Maps package 9. env.example - Add Google Maps API key variable

### To-dos

- [ ] Fix PDF: Additional services show as Free, non-airport transfers show quote message, hide price section
- [ ] Create reservation ID in section 1, use for local storage and identification
- [ ] Prevent going back to section screens after reservation completion
- [ ] Add home screen notification for pending reservations
- [ ] Create new submission page with pending status, PDF preview, and action buttons
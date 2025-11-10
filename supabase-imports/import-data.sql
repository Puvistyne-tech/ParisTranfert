-- Import Data from CSV Files
-- Run this script in Supabase SQL Editor after running schema.sql
-- This script populates all tables with data from the CSV files

-- ============================================
-- 1. VEHICLE TYPES
-- ============================================
INSERT INTO vehicle_types (id, name, description, min_passengers, max_passengers) VALUES
('car', 'Car (Business)', 'Business class sedan for comfortable transfers', 1, 4),
('van', 'Van', 'Spacious van for larger groups and luggage', 1, 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  min_passengers = EXCLUDED.min_passengers,
  max_passengers = EXCLUDED.max_passengers,
  updated_at = NOW();

-- ============================================
-- 2. LOCATIONS
-- ============================================
INSERT INTO locations (id, name, type) VALUES
('paris', 'Paris', 'city'),
('cdg', 'Charles de Gaulle Airport (CDG)', 'airport'),
('orly', 'Orly Airport (ORY)', 'airport'),
('beauvais', 'Beauvais Airport (BVA)', 'airport'),
('disneyland', 'Disneyland Paris', 'theme_park')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- ============================================
-- 3. CATEGORIES (from categories.csv)
-- ============================================
INSERT INTO categories (id, name, category_type, description) VALUES
('transport-airport', 'Airport Transfer', 'transport', 'Airport transfer services requiring flight details'),
('transport-international', 'Europe International', 'transport', 'International transfers requiring passport and destination details'),
('special-disneyland', 'Disneyland Transfer', 'special', 'Disneyland transfers requiring hotel and return time details'),
('luxury-vip', 'VIP Luxe Service', 'luxury', 'VIP services requiring duration specification'),
('tour-paris', 'Paris City Tour', 'tour', 'Paris tours requiring interests and duration'),
('tour-guide', 'Tour Guide Service', 'tour', 'Tour guide services requiring language and focus preferences'),
('special-greeter', 'Airport Greeter', 'special', 'Greeter services requiring arrival details'),
('special-event', 'Event Transport', 'special', 'Event transport requiring event details and timeline'),
('security-personal', 'Personal Security', 'security', 'Personal security services requiring security level and risk assessment')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_type = EXCLUDED.category_type,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================
-- 4. FEATURES (from features.csv)
-- ============================================
INSERT INTO features (key, icon, gradient) VALUES
('wifi', 'wifi', 'from-blue-500 to-blue-600'),
('entertainment', 'play-circle', 'from-red-500 to-pink-500'),
('chargers', 'battery', 'from-green-500 to-emerald-500'),
('childSafety', 'baby', 'from-purple-500 to-violet-500'),
('payment', 'credit-card', 'from-indigo-500 to-blue-500'),
('drivers', 'user-check', 'from-orange-500 to-red-500')
ON CONFLICT (key) DO UPDATE SET
  icon = EXCLUDED.icon,
  gradient = EXCLUDED.gradient;

-- ============================================
-- 5. TESTIMONIALS (from testimonials.csv)
-- ============================================
INSERT INTO testimonials (name, initials, rating, comment, gradient) VALUES
('John Smith', 'JS', 5, 'Exceptional service! The driver was professional, the car was spotless, and we arrived exactly on time. Highly recommended!', 'from-primary-600 to-primary-700'),
('Maria Johnson', 'MJ', 5, 'Perfect for our family trip to Disneyland! The child seats were excellent and the driver was so friendly with our kids.', 'from-success-500 to-emerald-500'),
('Robert Brown', 'RB', 5, 'Outstanding airport transfer service. The Mercedes S-Class was luxurious and the driver was knowledgeable about Paris.', 'from-purple-500 to-purple-600')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. SERVICES (from services.csv)
-- ============================================
INSERT INTO services (id, key, name, description, short_description, icon, image, duration, price_range, features, languages, is_popular, is_available, category_id) VALUES
('airport-transfers', 'airport-transfers', 'Airport Transfers (Paris Airports)', 'We provide seamless and comfortable transfers to and from all Paris airports, including Charles de Gaulle (CDG), Orly (ORY), and Beauvais. Whether you''re arriving or departing, our professional drivers ensure timely service and a smooth journey.', 'Professional transfers to/from all Paris airports', 'Plane', '/images/services/airport.jpg', '30-90 minutes', '€45-€120', '["Flight monitoring", "Meet & greet service", "Luggage assistance", "Child seats available", "WiFi on board"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, true, true, 'transport-airport'),

('vip-luxe', 'vip-luxe', 'VIP Luxe Chauffeur Service (By-the-hour)', 'Enjoy flexibility and comfort with our chauffeur-driven car at disposal. Whether for business meetings, shopping trips, or special events, our professional drivers are available by the hour.', 'Premium chauffeur service by the hour', 'Crown', '/images/services/vip-luxe.jpg', 'Minimum 2 hours', '€80-€150/hour', '["Professional chauffeur", "Premium vehicles", "Flexible scheduling", "Concierge services", "Refreshments on board"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, true, true, 'luxury-vip'),

('service-vip', 'service-vip', 'Service VIP', 'Enjoy an exclusive travel experience with our VIP transport service. Discreet, luxurious, and tailored to your needs. Perfect for business executives, celebrities, or any client looking for first-class service.', 'Exclusive VIP transport service', 'Star', '/images/services/service-vip.jpg', 'As required', '€120-€300/hour', '["Discreet service", "Executive vehicles", "Personal assistant", "Security protocols", "Customized experience"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Russian"]'::jsonb, false, true, 'luxury-vip'),

('international', 'international', 'Europe International', 'Need to travel beyond France & Europe? We provide safe and reliable international transfers to neighboring countries such as Belgium, Switzerland, Germany, and more, in total comfort.', 'International transfers across Europe', 'Globe', '/images/services/international.jpg', '2-8 hours', '€200-€800', '["Cross-border expertise", "Documentation assistance", "Multi-language drivers", "Comfort breaks", "Insurance coverage"]'::jsonb, '["English", "French", "German", "Dutch", "Italian", "Spanish"]'::jsonb, false, true, 'transport-international'),

('personal-security', 'personal-security', 'Personal Security Service', 'For clients who require enhanced protection, we offer professional personal security services with trained personnel, ensuring your safety and discretion during all travels. (2SPROTEC)', 'Professional personal security services', 'Shield', '/images/services/personal-security.jpg', 'As required', '€150-€500/hour', '["Trained security personnel", "Risk assessment", "Discreet protection", "Emergency protocols", "Background checks"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, false, true, 'security-personal'),

('paris-city-tour', 'paris-city-tour', 'Paris City Tour (4H-8H)', 'Discover the beauty of Paris with personalized city tours. Explore iconic landmarks and hidden gems with a knowledgeable driver or tour guide, at your own pace and comfort.', 'Personalized Paris city tours', 'MapPin', '/images/services/paris-tour.jpg', '4-8 hours', '€120-€300', '["Professional guide", "Customized itinerary", "Skip-the-line access", "Photo opportunities", "Local insights"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Portuguese"]'::jsonb, true, true, 'tour-paris'),

('greeter-service', 'greeter-service', 'Accueil aéroport Greeter Service', 'Our greeter service ensures a warm welcome upon arrival at the airport or train station. We assist with luggage, orientation, and guide you to your vehicle or destination smoothly and efficiently.', 'Airport and station greeter service', 'UserCheck', '/images/services/greeter.jpg', '30-60 minutes', '€60-€120', '["Meet & greet", "Luggage assistance", "Orientation guidance", "Language support", "Local tips"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, false, true, 'special-greeter'),

('disneyland', 'disneyland', 'Disneyland & hôtels', 'We offer direct and stress-free transfers to Disneyland Paris and its partner hotels. Ideal for families, groups, or solo travelers looking to start the magic the moment they leave Paris.', 'Direct transfers to Disneyland Paris', 'Heart', '/images/services/disneyland.jpg', '45-90 minutes', '€80-€150', '["Family-friendly", "Hotel partnerships", "Theme park knowledge", "Flexible timing", "Group discounts"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, true, true, 'transport-airport'),

('event-transport', 'EVENT_TRANSPORT', 'Evènement Event Transport Service', 'From weddings and corporate events to private parties and VIP occasions, we manage all your transport needs with professionalism and style, ensuring guests arrive on time and in comfort.', 'Professional event transport service', 'Calendar', '/images/services/event.jpg', 'As required', '€100-€400', '["Event coordination", "Multiple vehicles", "Timing precision", "Special decorations", "Group management"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, false, true, 'special-event'),

('tour-guide', 'tour-guide', 'Tour Guide Service', 'Enhance your travel experience with our certified tour guides. Available in multiple languages, they provide rich cultural insights and engaging storytelling as you explore Paris and beyond.', 'Certified multilingual tour guides', 'BookOpen', '/images/services/tour-guide.jpg', '2-8 hours', '€80-€200', '["Certified guides", "Cultural expertise", "Multiple languages", "Customized tours", "Historical knowledge"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Portuguese", "Russian", "Chinese"]'::jsonb, false, true, 'tour-paris')
ON CONFLICT (id) DO UPDATE SET
  key = EXCLUDED.key,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  icon = EXCLUDED.icon,
  image = EXCLUDED.image,
  duration = EXCLUDED.duration,
  price_range = EXCLUDED.price_range,
  features = EXCLUDED.features,
  languages = EXCLUDED.languages,
  is_popular = EXCLUDED.is_popular,
  is_available = EXCLUDED.is_available,
  category_id = EXCLUDED.category_id,
  updated_at = NOW();

-- ============================================
-- 7. SERVICE FIELDS
-- ============================================
-- Airport Transfers Service Fields
INSERT INTO service_fields (service_id, field_key, field_type, label, required, is_pickup, is_destination, field_order) VALUES
('airport-transfers', 'pickup_location', 'location_select', 'Pickup Location', true, true, false, 1),
('airport-transfers', 'destination_location', 'location_select', 'Destination Location', true, false, true, 2),
('airport-transfers', 'flight_number', 'text', 'Flight Number', true, false, false, 3),
('airport-transfers', 'flight_date', 'date', 'Flight Date', true, false, false, 4),
('airport-transfers', 'flight_time', 'time', 'Flight Time', true, false, false, 5),
('airport-transfers', 'terminal', 'text', 'Terminal', false, false, false, 6)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- VIP Luxe Service Fields (pickup is address_autocomplete)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, field_order) VALUES
('vip-luxe', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, NULL, true, 1),
('vip-luxe', 'duration', 'select', 'Durée', true, '["2 heures", "4 heures", "6 heures", "8 heures", "Journée complète"]'::jsonb, false, 2)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Service VIP Fields (pickup and destination are address_autocomplete - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, is_destination, field_order) VALUES
('service-vip', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, NULL, true, false, 1),
('service-vip', 'destination_location', 'address_autocomplete', 'Destination', true, NULL, false, true, 2),
('service-vip', 'duration', 'select', 'Durée du service', true, '["2 heures", "4 heures", "6 heures", "8 heures", "Journée complète", "Plusieurs jours"]'::jsonb, false, false, 3),
('service-vip', 'special_requests', 'textarea', 'Demandes spéciales', false, NULL, false, false, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- International Service Fields (pickup is address_autocomplete, destination is country/address - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, is_pickup, is_destination, field_order) VALUES
('international', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, true, false, 1),
('international', 'destination_location', 'address_autocomplete', 'Destination (Pays/Ville/Adresse)', true, false, true, 2),
('international', 'passport_details', 'text', 'Détails du passeport', true, false, false, 3),
('international', 'return_date', 'date', 'Date de retour', false, false, false, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Personal Security Service Fields (pickup is address_autocomplete - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, field_order) VALUES
('personal-security', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, NULL, true, 1),
('personal-security', 'security_level', 'select', 'Niveau de sécurité', true, '["Standard", "Renforcé", "Maximum"]'::jsonb, false, 2),
('personal-security', 'risk_assessment', 'textarea', 'Détails de l''évaluation des risques', false, NULL, false, 3)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Paris City Tour Service Fields (pickup is address_autocomplete, destination has default - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, is_destination, default_value, field_order) VALUES
('paris-city-tour', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, NULL, true, false, NULL, 1),
('paris-city-tour', 'destination_location', 'text', 'Destination', true, NULL, false, true, 'Paris', 2),
('paris-city-tour', 'duration', 'select', 'Durée de la visite', true, '["4 heures", "6 heures", "8 heures", "Journée complète"]'::jsonb, false, false, NULL, 3),
('paris-city-tour', 'interests', 'select', 'Centres d''intérêt', false, '["Histoire et Culture", "Art et Musées", "Gastronomie et Vin", "Shopping", "Architecture", "Vie nocturne"]'::jsonb, false, false, NULL, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  default_value = EXCLUDED.default_value,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Greeter Service Fields (pickup is airport location_select, destination is address_autocomplete, all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, is_destination, field_order) VALUES
('greeter-service', 'pickup_location', 'location_select', 'Aéroport d''arrivée', true, NULL, true, false, 1),
('greeter-service', 'destination_location', 'address_autocomplete', 'Destination', true, NULL, false, true, 2),
('greeter-service', 'arrival_details', 'textarea', 'Détails d''arrivée', false, NULL, false, false, 3),
('greeter-service', 'language_preference', 'select', 'Préférence de langue', false, '["Anglais", "Français", "Espagnol", "Allemand", "Italien"]'::jsonb, false, false, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Disneyland Service Fields (pickup is address_autocomplete, destination has default - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, is_pickup, is_destination, default_value, field_order) VALUES
('disneyland', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, true, false, NULL, 1),
('disneyland', 'destination_location', 'text', 'Destination', true, false, true, 'Disneyland Paris', 2),
('disneyland', 'hotel_name', 'text', 'Nom de l''hôtel (si applicable)', false, false, false, NULL, 3),
('disneyland', 'return_time', 'time', 'Heure de retour', false, false, false, NULL, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination,
  default_value = EXCLUDED.default_value,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Event Transport Service Fields (pickup and event_location are address_autocomplete)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, is_pickup, field_order) VALUES
('event-transport', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, true, 1),
('event-transport', 'event_location', 'address_autocomplete', 'Lieu de l''événement', true, false, 2),
('event-transport', 'event_details', 'textarea', 'Détails de l''événement', true, false, 3),
('event-transport', 'timeline', 'textarea', 'Calendrier de l''événement', false, false, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  is_pickup = EXCLUDED.is_pickup,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- Tour Guide Service Fields (pickup is address_autocomplete - all in French)
INSERT INTO service_fields (service_id, field_key, field_type, label, required, options, is_pickup, field_order) VALUES
('tour-guide', 'pickup_location', 'address_autocomplete', 'Lieu de prise en charge', true, NULL, true, 1),
('tour-guide', 'language_preference', 'select', 'Préférence de langue', true, '["Anglais", "Français", "Espagnol", "Allemand", "Italien", "Portugais", "Russe", "Chinois"]'::jsonb, false, 2),
('tour-guide', 'tour_focus', 'select', 'Thème de la visite', false, '["Histoire et Culture", "Art et Musées", "Gastronomie et Vin", "Shopping", "Architecture", "Vie nocturne"]'::jsonb, false, 3),
('tour-guide', 'duration', 'select', 'Durée', true, '["2 heures", "4 heures", "6 heures", "8 heures", "Journée complète"]'::jsonb, false, 4)
ON CONFLICT (service_id, field_key) DO UPDATE SET
  field_type = EXCLUDED.field_type,
  label = EXCLUDED.label,
  required = EXCLUDED.required,
  options = EXCLUDED.options,
  is_pickup = EXCLUDED.is_pickup,
  field_order = EXCLUDED.field_order,
  updated_at = NOW();

-- ============================================
-- 8. SERVICE LOCATIONS
-- ============================================
-- Associate airport transfer service with all locations
INSERT INTO service_locations (service_id, location_id, is_pickup, is_destination) VALUES
('airport-transfers', 'paris', true, true),
('airport-transfers', 'cdg', true, true),
('airport-transfers', 'orly', true, true),
('airport-transfers', 'beauvais', true, true),
('airport-transfers', 'disneyland', true, true),
('greeter-service', 'cdg', true, false),
('greeter-service', 'orly', true, false),
('greeter-service', 'beauvais', true, false)
ON CONFLICT (service_id, location_id) DO UPDATE SET
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination;

-- ============================================
-- 8. SERVICE VEHICLE PRICING
-- ============================================
-- Car (Business) rates
-- Service Vehicle Pricing (only one direction per route, getPricing handles bidirectional lookup)
-- Routes with same price both ways: only store one direction
-- Routes with different prices: store both directions
INSERT INTO service_vehicle_pricing (service_id, vehicle_type_id, pickup_location_id, destination_location_id, price) VALUES
-- Car rates
-- Paris ↔ CDG (same price both ways - only store one)
('airport-transfers', 'car', 'paris', 'cdg', 90.00),
-- Paris ↔ ORLY (same price both ways - only store one)
('airport-transfers', 'car', 'paris', 'orly', 90.00),
-- Paris ↔ Beauvais (same price both ways - only store one)
('airport-transfers', 'car', 'paris', 'beauvais', 160.00),
-- CDG ↔ Disneyland (different prices - store both)
('airport-transfers', 'car', 'cdg', 'disneyland', 85.00),
('airport-transfers', 'car', 'disneyland', 'cdg', 80.00),
-- ORLY ↔ Disneyland (same price both ways - only store one)
('airport-transfers', 'car', 'orly', 'disneyland', 90.00),
-- CDG ↔ ORLY (same price both ways - only store one)
('airport-transfers', 'car', 'cdg', 'orly', 100.00),
-- CDG ↔ Beauvais (same price both ways - only store one)
('airport-transfers', 'car', 'cdg', 'beauvais', 180.00),
-- ORLY ↔ Beauvais (same price both ways - only store one)
('airport-transfers', 'car', 'orly', 'beauvais', 180.00),
-- Beauvais ↔ Disneyland (same price both ways - only store one)
('airport-transfers', 'car', 'beauvais', 'disneyland', 180.00),
-- Van rates
-- Paris ↔ CDG (same price both ways - only store one)
('airport-transfers', 'van', 'paris', 'cdg', 100.00),
-- Paris ↔ ORLY (same price both ways - only store one)
('airport-transfers', 'van', 'paris', 'orly', 100.00),
-- Paris ↔ Beauvais (different prices - store both)
('airport-transfers', 'van', 'paris', 'beauvais', 160.00),
('airport-transfers', 'van', 'beauvais', 'paris', 180.00),
-- CDG ↔ Disneyland (same price both ways - only store one)
('airport-transfers', 'van', 'cdg', 'disneyland', 90.00),
-- ORLY ↔ Disneyland (same price both ways - only store one)
('airport-transfers', 'van', 'orly', 'disneyland', 90.00),
-- CDG ↔ ORLY (same price both ways - only store one)
('airport-transfers', 'van', 'cdg', 'orly', 110.00),
-- CDG ↔ Beauvais (same price both ways - only store one)
('airport-transfers', 'van', 'cdg', 'beauvais', 200.00),
-- ORLY ↔ Beauvais (same price both ways - only store one)
('airport-transfers', 'van', 'orly', 'beauvais', 200.00),
-- Beauvais ↔ Disneyland (same price both ways - only store one)
('airport-transfers', 'van', 'beauvais', 'disneyland', 200.00)
ON CONFLICT (service_id, vehicle_type_id, pickup_location_id, destination_location_id) DO UPDATE SET
  price = EXCLUDED.price,
  updated_at = NOW();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Vehicle Types: ' || COUNT(*)::text FROM vehicle_types;
SELECT 'Locations: ' || COUNT(*)::text FROM locations;
SELECT 'Categories: ' || COUNT(*)::text FROM categories;
SELECT 'Services: ' || COUNT(*)::text FROM services;
SELECT 'Features: ' || COUNT(*)::text FROM features;
SELECT 'Testimonials: ' || COUNT(*)::text FROM testimonials;
SELECT 'Service Locations: ' || COUNT(*)::text FROM service_locations;
SELECT 'Service Vehicle Pricing: ' || COUNT(*)::text FROM service_vehicle_pricing;


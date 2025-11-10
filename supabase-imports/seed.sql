-- Supabase Seed Data for Paris Transfer Booking System
-- Run this script in Supabase SQL Editor after running schema.sql

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE reservations CASCADE;
-- TRUNCATE TABLE services CASCADE;
-- TRUNCATE TABLE categories CASCADE;
-- TRUNCATE TABLE features CASCADE;
-- TRUNCATE TABLE testimonials CASCADE;
-- TRUNCATE TABLE service_vehicle_pricing CASCADE;
-- TRUNCATE TABLE service_locations CASCADE;
-- TRUNCATE TABLE locations CASCADE;
-- TRUNCATE TABLE vehicle_types CASCADE;

-- Insert Vehicle Types
INSERT INTO vehicle_types (id, name, description) VALUES
('car', 'Car (Business)', 'Business class sedan for comfortable transfers'),
('van', 'Van', 'Spacious van for larger groups and luggage')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert Locations
INSERT INTO locations (id, name, type) VALUES
('paris', 'Paris', 'city'),
('cdg', 'Charles de Gaulle Airport', 'airport'),
('orly', 'Orly Airport', 'airport'),
('beauvais', 'Beauvais Airport', 'airport'),
('disneyland', 'Disneyland Paris', 'theme_park')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Insert Categories
INSERT INTO categories (id, name, category_type, description, required_fields) VALUES
('transport-airport', 'Airport Transfer', 'transport', 'Airport transfer services requiring flight details', '{"flightDetails": {"type": "string", "required": true}, "terminal": {"type": "string", "required": false}}'::jsonb),
('transport-international', 'Europe International', 'transport', 'International transfers requiring passport and destination details', '{"passportDetails": {"type": "string", "required": true}, "destinationCountry": {"type": "string", "required": true}, "returnDate": {"type": "datetime", "required": true}}'::jsonb),
('special-disneyland', 'Disneyland Transfer', 'special', 'Disneyland transfers requiring hotel and return time details', '{"hotelName": {"type": "string", "required": true}, "returnTime": {"type": "string", "required": true}}'::jsonb),
('luxury-vip', 'VIP Luxe Service', 'luxury', 'VIP services requiring duration specification', '{"duration": {"type": "enum", "values": ["half-day", "full-day", "multi-day"], "required": true}}'::jsonb),
('tour-paris', 'Paris City Tour', 'tour', 'Paris tours requiring interests and duration', '{"interests": {"type": "array", "enum": ["history-culture", "art-museums", "food-wine", "shopping", "architecture", "nightlife"], "required": true}, "duration": {"type": "enum", "values": ["half-day", "full-day", "multi-day"], "required": true}}'::jsonb),
('tour-guide', 'Tour Guide Service', 'tour', 'Tour guide services requiring language and focus preferences', '{"languagePreference": {"type": "enum", "values": ["english", "french", "spanish"], "required": true}, "tourFocus": {"type": "array", "enum": ["history-culture", "art-museums", "food-wine", "shopping", "architecture", "nightlife"], "required": true}}'::jsonb),
('special-greeter', 'Airport Greeter', 'special', 'Greeter services requiring arrival details', '{"arrivalDetails": {"type": "string", "required": true}}'::jsonb),
('special-event', 'Event Transport', 'special', 'Event transport requiring event details and timeline', '{"eventDetails": {"type": "string", "required": true}, "timeline": {"type": "string", "required": true}}'::jsonb),
('security-personal', 'Personal Security', 'security', 'Personal security services requiring security level and risk assessment', '{"securityLevel": {"type": "string", "required": true}, "riskAssessment": {"type": "string", "required": true}}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_type = EXCLUDED.category_type,
  description = EXCLUDED.description,
  required_fields = EXCLUDED.required_fields,
  updated_at = NOW();

-- Insert Features
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

-- Insert Testimonials
INSERT INTO testimonials (name, initials, rating, comment, gradient) VALUES
('John Smith', 'JS', 5, 'Exceptional service! The driver was professional, the car was spotless, and we arrived exactly on time. Highly recommended!', 'from-primary-600 to-primary-700'),
('Maria Johnson', 'MJ', 5, 'Perfect for our family trip to Disneyland! The child seats were excellent and the driver was so friendly with our kids.', 'from-success-500 to-emerald-500'),
('Robert Brown', 'RB', 5, 'Outstanding airport transfer service. The Mercedes S-Class was luxurious and the driver was knowledgeable about Paris.', 'from-purple-500 to-purple-600')
ON CONFLICT DO NOTHING;

-- Insert Services
INSERT INTO services (id, key, name, description, short_description, icon, image, duration, price_range, features, languages, requirements, is_popular, is_available, category_id) VALUES
('airport-transfers', 'airport-transfers', 'Airport Transfers (Paris Airports)', 'We provide seamless and comfortable transfers to and from all Paris airports, including Charles de Gaulle (CDG), Orly (ORY), and Beauvais. Whether you''re arriving or departing, our professional drivers ensure timely service and a smooth journey.', 'Professional transfers to/from all Paris airports', 'Plane', '/images/services/airport.jpg', '30-90 minutes', '€45-€120', '["Flight monitoring", "Meet & greet service", "Luggage assistance", "Child seats available", "WiFi on board"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, '["Flight details", "Passenger count"]'::jsonb, true, true, 'transport-airport'),

('vip-luxe', 'vip-luxe', 'VIP Luxe Chauffeur Service (By-the-hour)', 'Enjoy flexibility and comfort with our chauffeur-driven car at disposal. Whether for business meetings, shopping trips, or special events, our professional drivers are available by the hour.', 'Premium chauffeur service by the hour', 'Crown', '/images/services/vip-luxe.jpg', 'Minimum 2 hours', '€80-€150/hour', '["Professional chauffeur", "Premium vehicles", "Flexible scheduling", "Concierge services", "Refreshments on board"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, '["Duration", "Pickup location"]'::jsonb, true, true, 'luxury-vip'),

('service-vip', 'service-vip', 'Service VIP', 'Enjoy an exclusive travel experience with our VIP transport service. Discreet, luxurious, and tailored to your needs. Perfect for business executives, celebrities, or any client looking for first-class service.', 'Exclusive VIP transport service', 'Star', '/images/services/service-vip.jpg', 'As required', '€120-€300/hour', '["Discreet service", "Executive vehicles", "Personal assistant", "Security protocols", "Customized experience"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Russian"]'::jsonb, '["Security clearance", "Special requests"]'::jsonb, false, true, 'luxury-vip'),

('international', 'international', 'Europe International', 'Need to travel beyond France & Europe? We provide safe and reliable international transfers to neighboring countries such as Belgium, Switzerland, Germany, and more, in total comfort.', 'International transfers across Europe', 'Globe', '/images/services/international.jpg', '2-8 hours', '€200-€800', '["Cross-border expertise", "Documentation assistance", "Multi-language drivers", "Comfort breaks", "Insurance coverage"]'::jsonb, '["English", "French", "German", "Dutch", "Italian", "Spanish"]'::jsonb, '["Passport details", "Destination country", "Return date"]'::jsonb, false, true, 'transport-international'),

('personal-security', 'personal-security', 'Personal Security Service', 'For clients who require enhanced protection, we offer professional personal security services with trained personnel, ensuring your safety and discretion during all travels. (2SPROTEC)', 'Professional personal security services', 'Shield', '/images/services/personal-security.jpg', 'As required', '€150-€500/hour', '["Trained security personnel", "Risk assessment", "Discreet protection", "Emergency protocols", "Background checks"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, '["Security clearance", "Risk assessment", "Special needs"]'::jsonb, false, true, 'security-personal'),

('paris-city-tour', 'paris-city-tour', 'Paris City Tour (4H-8H)', 'Discover the beauty of Paris with personalized city tours. Explore iconic landmarks and hidden gems with a knowledgeable driver or tour guide, at your own pace and comfort.', 'Personalized Paris city tours', 'MapPin', '/images/services/paris-tour.jpg', '4-8 hours', '€120-€300', '["Professional guide", "Customized itinerary", "Skip-the-line access", "Photo opportunities", "Local insights"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Portuguese"]'::jsonb, '["Interests", "Duration preference", "Group size"]'::jsonb, true, true, 'tour-paris'),

('greeter-service', 'greeter-service', 'Accueil aéroport Greeter Service', 'Our greeter service ensures a warm welcome upon arrival at the airport or train station. We assist with luggage, orientation, and guide you to your vehicle or destination smoothly and efficiently.', 'Airport and station greeter service', 'UserCheck', '/images/services/greeter.jpg', '30-60 minutes', '€60-€120', '["Meet & greet", "Luggage assistance", "Orientation guidance", "Language support", "Local tips"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, '["Arrival details", "Language preference"]'::jsonb, false, true, 'special-greeter'),

('disneyland', 'disneyland', 'Disneyland & hôtels', 'We offer direct and stress-free transfers to Disneyland Paris and its partner hotels. Ideal for families, groups, or solo travelers looking to start the magic the moment they leave Paris.', 'Direct transfers to Disneyland Paris', 'Heart', '/images/services/disneyland.jpg', '45-90 minutes', '€80-€150', '["Family-friendly", "Hotel partnerships", "Theme park knowledge", "Flexible timing", "Group discounts"]'::jsonb, '["English", "French", "Spanish", "German"]'::jsonb, '["Hotel name", "Group size", "Return time"]'::jsonb, true, true, 'transport-airport'),

('event-transport', 'EVENT_TRANSPORT', 'Evènement Event Transport Service', 'From weddings and corporate events to private parties and VIP occasions, we manage all your transport needs with professionalism and style, ensuring guests arrive on time and in comfort.', 'Professional event transport service', 'Calendar', '/images/services/event.jpg', 'As required', '€100-€400', '["Event coordination", "Multiple vehicles", "Timing precision", "Special decorations", "Group management"]'::jsonb, '["English", "French", "Spanish", "German", "Italian"]'::jsonb, '["Event details", "Guest count", "Timeline"]'::jsonb, false, true, 'special-event'),

('tour-guide', 'tour-guide', 'Tour Guide Service', 'Enhance your travel experience with our certified tour guides. Available in multiple languages, they provide rich cultural insights and engaging storytelling as you explore Paris and beyond.', 'Certified multilingual tour guides', 'BookOpen', '/images/services/tour-guide.jpg', '2-8 hours', '€80-€200', '["Certified guides", "Cultural expertise", "Multiple languages", "Customized tours", "Historical knowledge"]'::jsonb, '["English", "French", "Spanish", "German", "Italian", "Portuguese", "Russian", "Chinese"]'::jsonb, '["Language preference", "Tour focus", "Duration"]'::jsonb, false, true, 'tour-paris')
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
  requirements = EXCLUDED.requirements,
  is_popular = EXCLUDED.is_popular,
  is_available = EXCLUDED.is_available,
  category_id = EXCLUDED.category_id,
  updated_at = NOW();

-- Insert Service Locations for Airport Transfer Service
-- Associate airport transfer service with all locations
INSERT INTO service_locations (service_id, location_id, is_pickup, is_destination) VALUES
('airport-transfers', 'paris', true, true),
('airport-transfers', 'cdg', true, true),
('airport-transfers', 'orly', true, true),
('airport-transfers', 'beauvais', true, true),
('airport-transfers', 'disneyland', true, true)
ON CONFLICT (service_id, location_id) DO UPDATE SET
  is_pickup = EXCLUDED.is_pickup,
  is_destination = EXCLUDED.is_destination;

-- Insert Service Vehicle Pricing for Airport Transfers
-- Car (Business) rates
INSERT INTO service_vehicle_pricing (service_id, vehicle_type_id, pickup_location_id, destination_location_id, price) VALUES
-- Paris ↔ CDG
('airport-transfers', 'car', 'paris', 'cdg', 90.00),
('airport-transfers', 'car', 'cdg', 'paris', 90.00),
-- Paris ↔ ORLY
('airport-transfers', 'car', 'paris', 'orly', 90.00),
('airport-transfers', 'car', 'orly', 'paris', 90.00),
-- Paris ↔ Beauvais
('airport-transfers', 'car', 'paris', 'beauvais', 160.00),
('airport-transfers', 'car', 'beauvais', 'paris', 160.00),
-- CDG ↔ Disneyland
('airport-transfers', 'car', 'cdg', 'disneyland', 85.00),
('airport-transfers', 'car', 'disneyland', 'cdg', 80.00),
-- ORLY ↔ Disneyland
('airport-transfers', 'car', 'orly', 'disneyland', 90.00),
('airport-transfers', 'car', 'disneyland', 'orly', 90.00),
-- Van rates
-- Paris ↔ CDG
('airport-transfers', 'van', 'paris', 'cdg', 100.00),
('airport-transfers', 'van', 'cdg', 'paris', 100.00),
-- Paris ↔ ORLY
('airport-transfers', 'van', 'paris', 'orly', 100.00),
('airport-transfers', 'van', 'orly', 'paris', 100.00),
-- Paris ↔ Beauvais
('airport-transfers', 'van', 'paris', 'beauvais', 160.00),
('airport-transfers', 'van', 'beauvais', 'paris', 180.00),
-- CDG ↔ Disneyland
('airport-transfers', 'van', 'cdg', 'disneyland', 90.00),
('airport-transfers', 'van', 'disneyland', 'cdg', 90.00),
-- ORLY ↔ Disneyland
('airport-transfers', 'van', 'orly', 'disneyland', 90.00),
('airport-transfers', 'van', 'disneyland', 'orly', 90.00)
ON CONFLICT (service_id, vehicle_type_id, pickup_location_id, destination_location_id) DO UPDATE SET
  price = EXCLUDED.price,
  updated_at = NOW();

-- Verify data was inserted
SELECT 'Categories inserted: ' || COUNT(*)::text FROM categories;
SELECT 'Services inserted: ' || COUNT(*)::text FROM services;
SELECT 'Features inserted: ' || COUNT(*)::text FROM features;
SELECT 'Testimonials inserted: ' || COUNT(*)::text FROM testimonials;
SELECT 'Vehicle Types inserted: ' || COUNT(*)::text FROM vehicle_types;
SELECT 'Locations inserted: ' || COUNT(*)::text FROM locations;
SELECT 'Service Locations inserted: ' || COUNT(*)::text FROM service_locations;
SELECT 'Service Vehicle Pricing inserted: ' || COUNT(*)::text FROM service_vehicle_pricing;


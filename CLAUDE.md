# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Paris Tranfert is a luxury transportation booking platform built with Next.js 15, offering airport transfers, city tours, and special occasion services in Paris. The application features a multi-step reservation system, admin panel, and multi-language support (English, French, Spanish).

## Development Commands

```bash
# Development
npm run dev              # Start dev server (standard)
npm run dev:turbo        # Start dev server with Turbopack

# Building
npm run build            # Production build
npm run build:turbo      # Production build with Turbopack

# Linting & Formatting
npm run lint             # Check code with Biome
npm run lint:fix         # Auto-fix issues with Biome
npm run format           # Format code with Biome

# Utilities
npm run clean            # Remove .next and cache directories
npm start                # Start production server
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4 (mobile-first approach)
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand with persist middleware
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: next-intl (en, fr, es)
- **Email**: Brevo (@getbrevo/brevo)
- **PDF Generation**: @react-pdf/renderer
- **UI Components**: Radix UI primitives, shadcn/ui patterns
- **Animations**: Framer Motion

## Architecture

### File Structure

- **`src/app/[locale]/`**: Internationalized routes (Next.js App Router)
  - Main routes: `page.tsx`, `services/`, `vehicles/`, `contact/`, `about/`
  - `reservation/`: Multi-step booking flow (Step1, Step2, Step3, confirmation)
  - `admin/`: Complete admin panel for managing reservations, services, vehicles, locations, pricing, etc.

- **`src/components/`**:
  - `models/`: TypeScript interfaces and enums for domain models (reservations, services, vehicles, clients, etc.)
  - `admin/`: Admin-specific components (modals, tables, filters, mobile UI)
  - `reservation/`: Booking flow components
  - `ui/`: Reusable UI primitives (Button, Input, etc.)
  - `layout/`: Layout components (Navbar, Footer, LayoutWrapper)
  - `providers/`: React providers (QueryProvider)
  - `pdf/`: PDF generation components

- **`src/lib/`**: Core utilities and services
  - `supabase.ts`: Supabase client initialization
  - `supabaseService.ts`: Database operations (CRUD for all entities)
  - `supabaseTypes.ts`: Auto-generated Supabase types
  - `emailService.ts`, `brevoService.ts`, `reservationEmailService.ts`: Email handling
  - `validations.ts`: Zod schemas for form validation
  - `auth.ts`: Authentication utilities
  - `pdfUtils.tsx`: PDF generation helpers

- **`src/store/`**: Zustand state stores
  - `reservationStore.ts`: Main reservation flow state (persisted to localStorage)
  - `admin/`: Admin-specific stores (pricing, services, reservations, filters, search)

- **`src/i18n/`**: Internationalization
  - `locales/`: Translation files (en.json, fr.json, es.json)
  - `routing.ts`: Locale configuration
  - `translations.ts`: Translation helpers

- **`src/app/api/`**: API routes
  - `reservations/route.ts`: Reservation CRUD operations
  - `reservations/[id]/pdf/route.ts`: PDF generation endpoint
  - `contact/route.ts`: Contact form handling

### Key Architectural Patterns

#### Reservation Flow
The reservation system is a 3-step process managed by `reservationStore`:
1. **Step 1**: Service and vehicle selection
2. **Step 2**: Trip details (date, time, pickup, destination, passenger info)
3. **Step 3**: Booking summary and submission
4. **Confirmation**: Post-booking confirmation page

State persists in localStorage using Zustand's persist middleware. The store tracks:
- Selected service/vehicle (full objects, not IDs)
- Form data, additional services (baby seats, boosters, meet & greet)
- Service-specific sub-data (JSONB for flexible service configurations)
- Submission state to prevent duplicate bookings

#### Database Architecture
Primary entities stored in Supabase:
- **Categories**: Service categories (transfers, tours, etc.)
- **Services**: Individual service offerings with dynamic fields
- **VehicleTypes**: Vehicle categories (sedan, van, etc.)
- **Vehicles**: Actual vehicle inventory
- **ServiceVehiclePricing**: Many-to-many pricing matrix
- **Locations**: Pickup/destination locations
- **Clients**: Customer records
- **Reservations**: Booking records with status workflow
- **ServiceFields**: Dynamic form fields per service (stored as JSONB)

The `supabaseService.ts` provides mapper functions to convert DB rows to TypeScript models.

#### Internationalization
Uses next-intl with locale prefix routing (`/en/`, `/fr/`, `/es/`). All user-facing text lives in `src/i18n/locales/*.json`. The app supports:
- Server-side translations via `getMessages()`
- Client-side translations via `useTranslations()`
- Localized routing and pathnames

#### Admin Panel
Full-featured admin system with:
- Desktop and mobile-optimized layouts
- Bottom tab bar navigation on mobile
- CRUD operations for all entities
- Search and filter functionality (using dedicated stores)
- Reservation status management
- PDF generation and email notifications

#### Email System
Dual email service architecture:
- Primary: Supabase Edge Function (`send-reservation-email`)
- Backup: Brevo API integration
- Templates in `emailTemplates.ts` for reservation confirmations, status updates

## Code Style Rules (from rules.md)

### Critical Patterns
- **Functional components only**: Use `function` keyword, no classes
- **Server Components first**: Minimize `'use client'`; prefer RSC
- **Error handling**: Check errors at function start, use early returns
- **No semicolons**: Follow Standard.js conventions
- **2-space indentation**
- **Single quotes** for strings

### TypeScript
- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Use descriptive names with auxiliary verbs (isLoading, hasError)

### React Best Practices
- Implement proper hook usage (top-level only)
- Use React.memo(), useCallback, useMemo for optimization
- Prefer controlled components
- Wrap client components in Suspense
- Dynamic loading for non-critical components

### State Management
- Zustand for global state
- Lift state when sharing between components
- Context for intermediate state (avoid prop drilling)

### Forms
- React Hook Form for complex forms
- Zod for schema validation
- Client-side and server-side validation

### Styling
- Tailwind CSS (mobile-first)
- No `@apply` directive
- Use Tailwind for utilities and layout
- Stylus modules for complex component-specific styles (though not heavily used in this project)

### File Naming
- Directories: lowercase-with-dashes
- Components: PascalCase
- Functions/variables: camelCase

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Legacy Appwrite (being phased out)
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_ENDPOINT=
```

## Database Models

Key model files in `src/components/models/`:
- `reservations.ts`: Reservation interface and ReservationStatus enum
- `services.ts`: Service definitions
- `vehicleTypes.ts`: Vehicle type definitions
- `categories.ts`: Category types and IDs
- `pricing.ts`: ServiceVehiclePricing interface
- `clients.ts`: Client/customer data
- `locations.ts`: Location definitions
- `serviceFields.ts`: Dynamic service field configurations

All models follow strict TypeScript interfaces. Database operations in `supabaseService.ts` include mapper functions to convert between DB schema and TypeScript models.

## Reservation Status Workflow

```typescript
enum ReservationStatus {
  QUOTE_REQUESTED = "quote_requested",
  PENDING = "pending",
  QUOTE_SENT = "quote_sent",
  QUOTE_ACCEPTED = "quote_accepted",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
```

## Important Notes

- **Next.js 15 routing**: All route params are async (must be awaited)
- **Turbopack support**: Available for both dev and build
- **Mobile-first admin**: Admin panel has dedicated mobile UI with bottom tabs
- **PDF generation**: Server-side via API routes using @react-pdf/renderer
- **Image optimization**: Configured for Unsplash, Supabase, Cloudinary, Imgur
- **Type safety**: Full end-to-end TypeScript with Supabase-generated types

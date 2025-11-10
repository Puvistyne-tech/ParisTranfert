# 🚖 Taxi Reservation Website (Next.js + Tailwind + Appwrite)

## 🧱 Stack
- Next.js (latest)
- Tailwind CSS
- shadcn/ui + Lucide Icons
- Appwrite (backend for forms + admin auth)
- Deployed on Vercel

---

## 🎨 Design & Feel
- Modern, clean, and professional — inspired by Uber / Bolt / Free Now.
- Color palette: **#000000 (black)**, **#FFD000 (yellow)**, **#FFFFFF (white)**.
- Rounded corners, smooth hover animations, light shadows.
- Mobile-first layout with smooth transitions (Framer Motion optional).
- Use responsive grids and cards.
- Fonts: “Inter” or “Outfit”.
- Keep everything minimal and elegant.

---

## 🌍 Pages to Build
### `/` – Home Page
- Hero section with background image + tagline + CTA (“Réserver un trajet”).
- 3–4 icon cards showing main services.
- Section for “Pourquoi nous choisir” with short points.
- Footer with contact info + social icons.

### `/services`
- Grid of cards: service name, short description, optional icon.
- Optional price display.
- CTA “Demander un devis” (modal or route to `/reservation`).

### `/reservation`
- Form fields:
  - Nom complet, Email, Téléphone
  - Départ, Destination, Date & Heure
  - Message libre
- On submit: store data in Appwrite “reservations” collection.
- Show success message.
- No login required.

### `/a-propos`
- Text about the company.
- Small photo section (team, taxis, etc.).

### `/contact`
- Contact form (name, email, message)
- Map (Google Maps iframe)
- Address, phone, email
- Social links

### `/admin` (optional - Option 1)
- Login (Appwrite auth)
- Dashboard: reservations list + status (validated, canceled, etc.)
- CRUD for services and clients
- Simple and clean interface

---

## 🧭 Navigation
- Navbar: Logo (left), Links (Home, Services, Réservation, À propos, Contact)
- CTA button on right: “Réserver”
- Sticky header on scroll.

---

## 📱 Responsiveness
- Full mobile & tablet support
- Hamburger menu on mobile
- Sections stack vertically on small screens

---

## ⚙️ Appwrite Setup
- Collections:
  - `reservations`: name, email, phone, pickup, destination, date, message, status
  - `users` (optional for admin)
- Email notification when new reservation added (Appwrite function later).

---

## 🧩 Components to Create
- `<Navbar />`
- `<Hero />`
- `<ServiceCard />`
- `<ReservationForm />`
- `<ContactForm />`
- `<Footer />`
- `<AdminTable />`
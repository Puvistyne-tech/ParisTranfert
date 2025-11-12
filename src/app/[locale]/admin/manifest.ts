import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  // Note: Scope is set to /admin to match any locale prefix
  // The service worker will be registered with scope /admin
  return {
    name: 'Paris Transfert Admin',
    short_name: 'Admin',
    description: 'Admin panel for Paris Transfert - Manage reservations, services, and bookings',
    start_url: '/admin',
    scope: '/admin',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#1f2937',
    background_color: '#111827',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'productivity'],
  };
}


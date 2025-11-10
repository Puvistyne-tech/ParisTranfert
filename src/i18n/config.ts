export const locales = ["en", "fr", "es"] as const;
export const defaultLocale = "fr";
export const localePrefix = "always"; // Default

export const pathnames = {
  "/": "/",
  "/services": {
    en: "/services",
    fr: "/services",
    es: "/servicios",
  },
  "/reservation": {
    en: "/reservation",
    fr: "/reservation",
    es: "/reserva",
  },
  "/about": {
    en: "/about",
    fr: "/a-propos",
    es: "/acerca-de",
  },
  "/contact": {
    en: "/contact",
    fr: "/contact",
    es: "/contacto",
  },
  "/admin": {
    en: "/admin",
    fr: "/admin",
    es: "/admin",
  },
} as const;

export type AppPathnames = keyof typeof pathnames;

// import { getRequestConfig } from "next-intl/server";
// import { locales } from "./config";

// export default getRequestConfig(async ({ locale }) => {
//   // Validate that the incoming `locale` parameter is valid
//   if (!locale || !locales.includes(locale as (typeof locales)[number])) {
//     locale = "fr"; // fallback to default locale
//   }

//   return {
//     locale,
//     messages: (await import(`./locales/${locale}.json`)).default,
//   };
// });

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Static imports for all locales - required for Next.js build
const messages = {
  en: () => import("./locales/en.json").then((m) => m.default),
  fr: () => import("./locales/fr.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await messages[locale as keyof typeof messages](),
  };
});

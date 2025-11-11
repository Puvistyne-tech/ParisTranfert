import { defineRouting } from "next-intl/routing";
import { pathnames } from "./config";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr", "es"],

  // Used when no locale matches
  defaultLocale: "en",

  // Always show locale prefix in URL
  //   localePrefix: 'always',

  // Localized pathnames
  pathnames,
});

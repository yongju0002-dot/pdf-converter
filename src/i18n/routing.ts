import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ko", "en", "ja", "zh", "es", "fr", "de", "pt", "ru", "zh-TW"],
  defaultLocale: "ko",
});

export type AppLocale = (typeof routing.locales)[number];

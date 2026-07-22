import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "ko", "en", "ja", "zh", "es", "fr", "de", "pt", "ru", "zh-TW",
    "it", "nl", "pl", "sv", "tr", "uk", "vi", "th", "id", "ms",
    "hi", "bg", "ca", "el", "sw", "ar",
  ],
  defaultLocale: "ko",
});

export type AppLocale = (typeof routing.locales)[number];

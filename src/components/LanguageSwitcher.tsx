"use client";

import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "简体中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  "zh-TW": "繁體中文",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  tr: "Türkçe",
  uk: "Українська",
  vi: "Tiếng Việt",
  th: "ภาษาไทย",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  hi: "हिन्दी",
  bg: "Български",
  ca: "Català",
  el: "Ελληνικά",
  sw: "Kiswahili",
  ar: "العربية",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative flex items-center">
      <Languages
        className="pointer-events-none absolute left-2.5 h-4 w-4 text-zinc-400 dark:text-zinc-500"
        strokeWidth={1.75}
      />
      <select
        value={locale}
        onChange={(e) => router.replace(pathname, { locale: e.target.value })}
        className="cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-1.5 pr-3 pl-8 text-xs font-medium text-zinc-600 outline-none transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
        aria-label="Language"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {localeLabels[l]}
          </option>
        ))}
      </select>
    </div>
  );
}

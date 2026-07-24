"use client";

import { Ellipsis, ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { HoverDropdown } from "@/components/HoverDropdown";

const SISTER_SITE_URL = "https://mylifeimg.com";

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

export function SiteMenu() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("SiteMenu");

  return (
    <HoverDropdown
      ariaLabel={t("languageHeading")}
      icon={<Ellipsis className="h-5 w-5" strokeWidth={1.75} />}
      panelClassName="sm:w-80"
    >
      {(close) => (
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {t("otherSitesHeading")}
            </h3>
            <a
              href={SISTER_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/5"
            >
              {t("sisterSiteLabel")}
              <ExternalLink
                className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                strokeWidth={1.75}
              />
            </a>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {t("languageHeading")}
            </h3>
            <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto pr-1">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    router.replace(pathname, { locale: l });
                    close();
                  }}
                  className={`rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                    l === locale
                      ? "bg-indigo-50 font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {localeLabels[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </HoverDropdown>
  );
}

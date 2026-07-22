import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { FileText, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { NavMenu } from "@/components/NavMenu";
import { PdfConvertMenu } from "@/components/PdfConvertMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const ogLocales: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_PT",
  ru: "ru_RU",
  "zh-TW": "zh_TW",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("title"),
      template: `%s | ${tHeader("brand")}`,
    },
    description: t("description"),
    openGraph: {
      siteName: tHeader("brand"),
      type: "website",
      locale: ogLocales[locale],
    },
    twitter: {
      card: "summary",
    },
    verification: {
      google: "8lEeCzF_9NXUa6IkDHWS2O4OIeQhNklYP_khY14d4Lk",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations("Header");
  const tFooter = await getTranslations("Footer");

  const quickLinks = [
    { href: "/merge_pdf", label: t("quickMerge") },
    { href: "/split_pdf", label: t("quickSplit") },
    { href: "/compress_pdf", label: t("quickCompress") },
  ];

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7993734713843733"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <NextIntlClientProvider>
          <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="mr-2 flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                    <FileText className="h-4 w-4 text-white" strokeWidth={2} />
                  </span>
                  {t("brand")}
                </Link>

                <NavMenu />
                <PdfConvertMenu />

                <nav className="hidden items-center gap-1 md:flex">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 sm:inline-flex dark:bg-indigo-500/10 dark:text-indigo-400">
                  {t("freeBadge")}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-zinc-200/70 bg-white py-8 dark:border-zinc-800/70 dark:bg-zinc-950">
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              {tFooter("notice")}
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

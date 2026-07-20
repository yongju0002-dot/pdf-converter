import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ToolCard } from "@/components/ToolCard";
import { categoryMeta, tools } from "@/lib/tools";
import { localizedAlternates, siteUrl } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, ""),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
  };
}

type FaqItem = { q: string; a: string };

export default function Home() {
  const t = useTranslations("Home");
  const tTools = useTranslations("Tools");
  const tFaq = useTranslations("FAQ");
  const faqItems = tFaq.raw("items") as FaqItem[];
  const availableTools = tools.filter((tool) => tool.available);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("title"),
    description: t("subtitle"),
    url: siteUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: tools
      .filter((tool) => tool.available)
      .map((tool) => tTools(`${tool.slug}.name`)),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
          {t("badge", { count: tools.length })}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableTools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            accent={categoryMeta[tool.category]}
          />
        ))}
      </div>

      <div className="mx-auto mt-24 max-w-2xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {tFaq("heading")}
        </h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="cursor-pointer list-none font-medium text-zinc-800 marker:content-none dark:text-zinc-100">
                <span className="flex items-center justify-between gap-2">
                  {item.q}
                  <span className="shrink-0 text-zinc-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

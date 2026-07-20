import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { localizedAlternates } from "@/lib/seo";
import Client from "./Client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WatermarkPage" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/watermark_pdf"),
    openGraph: { title: t("title"), description: t("description") },
  };
}

export default function Page() {
  return <Client />;
}

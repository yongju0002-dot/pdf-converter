"use client";

import { Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function HtmlToPdfPage() {
  const t = useTranslations("HtmlToPdfPage");

  return (
    <ConversionTool
      icon={Globe}
      iconBg={`${categoryMeta.web.iconBg} ${categoryMeta.web.iconBgDark}`}
      iconText={`${categoryMeta.web.iconText} ${categoryMeta.web.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      accept={{ "text/html": [".html", ".htm"] }}
      apiEndpoint="/api/html-to-pdf"
      buttonLabel={t("submit")}
      fallbackFilename="converted.pdf"
    />
  );
}

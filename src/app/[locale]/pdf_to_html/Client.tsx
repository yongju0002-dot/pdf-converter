"use client";

import { FileCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToHtmlPage() {
  const t = useTranslations("PdfToHtmlPage");

  return (
    <ConversionTool
      icon={FileCode}
      iconBg={`${categoryMeta.web.iconBg} ${categoryMeta.web.iconBgDark}`}
      iconText={`${categoryMeta.web.iconText} ${categoryMeta.web.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      warning={t("warning")}
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-html"
      buttonLabel={t("submit")}
      fallbackFilename="converted.html"
    />
  );
}

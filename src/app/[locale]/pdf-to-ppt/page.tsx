"use client";

import { MonitorPlay } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToPptPage() {
  const t = useTranslations("PdfToPptPage");

  return (
    <ConversionTool
      icon={MonitorPlay}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      warning={t("warning")}
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-ppt"
      buttonLabel={t("submit")}
      fallbackFilename="converted.pptx"
    />
  );
}

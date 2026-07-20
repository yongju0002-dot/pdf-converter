"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToWordPage() {
  const t = useTranslations("PdfToWordPage");

  return (
    <ConversionTool
      icon={FileText}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      warning={t("warning")}
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-word"
      buttonLabel={t("submit")}
      fallbackFilename="converted.docx"
    />
  );
}

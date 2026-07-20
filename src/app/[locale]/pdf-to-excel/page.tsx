"use client";

import { FileSpreadsheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToExcelPage() {
  const t = useTranslations("PdfToExcelPage");

  return (
    <ConversionTool
      icon={FileSpreadsheet}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      warning={t("warning")}
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-excel"
      buttonLabel={t("submit")}
      fallbackFilename="converted.xlsx"
    />
  );
}

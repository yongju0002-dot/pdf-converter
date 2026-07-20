"use client";

import { FileSpreadsheet } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function ExcelToPdfPage() {
  const t = useTranslations("ExcelToPdfPage");

  return (
    <ConversionTool
      icon={FileSpreadsheet}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          [".xlsx"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
        "text/csv": [".csv"],
      }}
      apiEndpoint="/api/excel-to-pdf"
      buttonLabel={t("submit")}
      fallbackFilename="converted.pdf"
    />
  );
}

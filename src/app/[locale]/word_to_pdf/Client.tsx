"use client";

import { FileOutput } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function WordToPdfPage() {
  const t = useTranslations("WordToPdfPage");

  return (
    <ConversionTool
      icon={FileOutput}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/msword": [".doc"],
        "application/vnd.oasis.opendocument.text": [".odt"],
      }}
      apiEndpoint="/api/word-to-pdf"
      buttonLabel={t("submit")}
      fallbackFilename="converted.pdf"
    />
  );
}

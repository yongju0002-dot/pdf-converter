"use client";

import { Presentation } from "lucide-react";
import { useTranslations } from "next-intl";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PptToPdfPage() {
  const t = useTranslations("PptToPdfPage");

  return (
    <ConversionTool
      icon={Presentation}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title={t("title")}
      description={t("description")}
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"],
        "application/vnd.oasis.opendocument.presentation": [".odp"],
      }}
      apiEndpoint="/api/ppt-to-pdf"
      buttonLabel={t("submit")}
      fallbackFilename="converted.pdf"
    />
  );
}

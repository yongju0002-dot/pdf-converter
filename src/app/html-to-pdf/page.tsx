"use client";

import { Globe } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function HtmlToPdfPage() {
  return (
    <ConversionTool
      icon={Globe}
      iconBg={`${categoryMeta.web.iconBg} ${categoryMeta.web.iconBgDark}`}
      iconText={`${categoryMeta.web.iconText} ${categoryMeta.web.iconTextDark}`}
      title="HTML → PDF"
      description="HTML 파일을 PDF로 변환합니다."
      accept={{ "text/html": [".html", ".htm"] }}
      apiEndpoint="/api/html-to-pdf"
      buttonLabel="PDF로 변환하기"
      fallbackFilename="converted.pdf"
    />
  );
}

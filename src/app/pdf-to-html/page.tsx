"use client";

import { FileCode } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToHtmlPage() {
  return (
    <ConversionTool
      icon={FileCode}
      iconBg={`${categoryMeta.web.iconBg} ${categoryMeta.web.iconBgDark}`}
      iconText={`${categoryMeta.web.iconText} ${categoryMeta.web.iconTextDark}`}
      title="PDF → HTML"
      description="PDF를 HTML 웹페이지로 변환합니다."
      warning="이미지가 포함된 PDF는 결과가 ZIP 파일(HTML + 이미지)로 제공됩니다."
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-html"
      buttonLabel="HTML로 변환하기"
      fallbackFilename="converted.html"
    />
  );
}

"use client";

import { FileText } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToWordPage() {
  return (
    <ConversionTool
      icon={FileText}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="PDF → Word"
      description="PDF를 편집 가능한 Word(.docx) 문서로 변환합니다."
      warning="레이아웃이 복잡한 PDF는 변환 후 서식이 다소 달라질 수 있습니다."
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-word"
      buttonLabel="Word로 변환하기"
      fallbackFilename="converted.docx"
    />
  );
}

"use client";

import { MonitorPlay } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToPptPage() {
  return (
    <ConversionTool
      icon={MonitorPlay}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="PDF → PowerPoint"
      description="PDF의 각 페이지를 PowerPoint(.pptx) 슬라이드로 변환합니다."
      warning="원본 PDF의 텍스트/이미지 배치에 따라 슬라이드 구성이 달라질 수 있습니다."
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-ppt"
      buttonLabel="PowerPoint로 변환하기"
      fallbackFilename="converted.pptx"
    />
  );
}

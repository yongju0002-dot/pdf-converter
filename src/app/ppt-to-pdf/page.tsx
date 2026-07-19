"use client";

import { Presentation } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PptToPdfPage() {
  return (
    <ConversionTool
      icon={Presentation}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="PowerPoint → PDF"
      description="PowerPoint(.pptx, .ppt) 문서를 PDF로 변환합니다."
      accept={{
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          [".pptx"],
        "application/vnd.ms-powerpoint": [".ppt"],
        "application/vnd.oasis.opendocument.presentation": [".odp"],
      }}
      apiEndpoint="/api/ppt-to-pdf"
      buttonLabel="PDF로 변환하기"
      fallbackFilename="converted.pdf"
    />
  );
}

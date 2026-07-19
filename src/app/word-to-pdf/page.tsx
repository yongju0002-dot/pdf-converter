"use client";

import { FileOutput } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function WordToPdfPage() {
  return (
    <ConversionTool
      icon={FileOutput}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="Word → PDF"
      description="Word(.docx, .doc) 문서를 PDF로 변환합니다."
      accept={{
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/msword": [".doc"],
        "application/vnd.oasis.opendocument.text": [".odt"],
      }}
      apiEndpoint="/api/word-to-pdf"
      buttonLabel="PDF로 변환하기"
      fallbackFilename="converted.pdf"
    />
  );
}

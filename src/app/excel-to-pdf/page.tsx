"use client";

import { FileSpreadsheet } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function ExcelToPdfPage() {
  return (
    <ConversionTool
      icon={FileSpreadsheet}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="Excel → PDF"
      description="Excel(.xlsx, .xls, .csv) 파일을 PDF로 변환합니다."
      accept={{
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          [".xlsx"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
        "text/csv": [".csv"],
      }}
      apiEndpoint="/api/excel-to-pdf"
      buttonLabel="PDF로 변환하기"
      fallbackFilename="converted.pdf"
    />
  );
}

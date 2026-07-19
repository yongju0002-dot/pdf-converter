"use client";

import { FileSpreadsheet } from "lucide-react";
import { ConversionTool } from "@/components/ConversionTool";
import { categoryMeta } from "@/lib/tools";

export default function PdfToExcelPage() {
  return (
    <ConversionTool
      icon={FileSpreadsheet}
      iconBg={`${categoryMeta.office.iconBg} ${categoryMeta.office.iconBgDark}`}
      iconText={`${categoryMeta.office.iconText} ${categoryMeta.office.iconTextDark}`}
      title="PDF → Excel"
      description="PDF 안의 표 형태 데이터를 인식해 Excel(.xlsx) 파일로 변환합니다."
      warning="텍스트 기반 PDF의 단순한 표에서 가장 정확합니다. 스캔본이거나 레이아웃이 복잡한 표는 셀 정렬이 어긋날 수 있습니다."
      accept={{ "application/pdf": [".pdf"] }}
      apiEndpoint="/api/pdf-to-excel"
      buttonLabel="Excel로 변환하기"
      fallbackFilename="converted.xlsx"
    />
  );
}

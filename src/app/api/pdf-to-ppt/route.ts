import { NextResponse } from "next/server";
import { convertPdfToOffice } from "@/lib/officeConversion";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "변환할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  return convertPdfToOffice(file, {
    targetFormat: "pptx",
    infilter: "impress_pdf_import",
    contentType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    failureMessage: "PDF를 PowerPoint로 변환하는 중 오류가 발생했습니다.",
  });
}

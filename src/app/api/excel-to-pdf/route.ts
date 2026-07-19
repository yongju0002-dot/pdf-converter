import { NextResponse } from "next/server";
import { convertOfficeFileToPdf } from "@/lib/officeConversion";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "변환할 Excel 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  return convertOfficeFileToPdf(file, {
    supportedExtensions: ["xlsx", "xls", "ods", "csv"],
    unsupportedMessage:
      "지원하지 않는 파일 형식입니다. (.xlsx, .xls, .ods, .csv만 가능)",
    failureMessage: "Excel을 PDF로 변환하는 중 오류가 발생했습니다.",
  });
}

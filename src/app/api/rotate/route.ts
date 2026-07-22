import { PDFDocument, degrees } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const angle = Number(formData.get("angle"));

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "회전할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }
  if (![90, 180, 270, -90].includes(angle)) {
    return NextResponse.json(
      { error: "회전 각도가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  let pdfDoc;
  try {
    pdfDoc = await PDFDocument.load(bytes);
  } catch {
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  for (const page of pdfDoc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(((current + angle) % 360 + 360) % 360));
  }

  const outBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(Buffer.from(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-rotated.pdf"`,
    },
  });
}

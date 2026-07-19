import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const text = String(formData.get("text") ?? "").trim();
  const opacity = Math.min(
    1,
    Math.max(0.05, Number(formData.get("opacity")) || 0.3),
  );
  const fontSize = Math.min(
    200,
    Math.max(8, Number(formData.get("fontSize")) || 48),
  );

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "워터마크를 추가할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }
  if (text === "") {
    return NextResponse.json(
      { error: "워터마크 텍스트를 입력해주세요." },
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

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity,
      rotate: degrees(45),
    });
  }

  const outBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(new Uint8Array(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-watermarked.pdf"`,
    },
  });
}

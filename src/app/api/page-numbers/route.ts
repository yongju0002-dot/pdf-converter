import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Position = "bottom-center" | "bottom-right" | "top-center";

const MARGIN = 24;

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const position = String(formData.get("position") ?? "bottom-center") as Position;
  const startNumber = Math.max(0, Number(formData.get("startNumber")) || 1);
  const fontSize = Math.min(36, Math.max(8, Number(formData.get("fontSize")) || 12));

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "PDF 파일을 선택해주세요." },
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

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const label = String(startNumber + index);
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    const x =
      position === "bottom-right"
        ? width - MARGIN - textWidth
        : width / 2 - textWidth / 2;
    const y = position === "top-center" ? page.getSize().height - MARGIN : MARGIN;

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  const outBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(Buffer.from(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-numbered.pdf"`,
    },
  });
}

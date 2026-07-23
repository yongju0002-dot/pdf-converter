import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const rectRaw = formData.get("rect");
  const mode = formData.get("mode");
  const pageIndexRaw = formData.get("pageIndex");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "자를 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  let rect: { x: number; y: number; width: number; height: number };
  try {
    rect = JSON.parse(String(rectRaw ?? ""));
    const values = [rect.x, rect.y, rect.width, rect.height];
    if (
      values.some((n) => typeof n !== "number" || !Number.isFinite(n)) ||
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.x < 0 ||
      rect.y < 0 ||
      rect.x + rect.width > 1.0001 ||
      rect.y + rect.height > 1.0001
    ) {
      throw new Error("invalid rect");
    }
  } catch {
    return NextResponse.json(
      { error: "자를 영역 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (mode !== "all" && mode !== "single") {
    return NextResponse.json(
      { error: "적용 범위 정보가 올바르지 않습니다." },
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

  const pages = pdfDoc.getPages();
  let targetIndices: number[];

  if (mode === "all") {
    targetIndices = pages.map((_, i) => i);
  } else {
    const pageIndex = Number(pageIndexRaw);
    if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= pages.length) {
      return NextResponse.json(
        { error: "페이지 번호 정보가 올바르지 않습니다." },
        { status: 400 },
      );
    }
    targetIndices = [pageIndex];
  }

  for (const index of targetIndices) {
    const page = pages[index];
    const {
      x: mediaX,
      y: mediaY,
      width: pageWidth,
      height: pageHeight,
    } = page.getMediaBox();

    const cropWidth = rect.width * pageWidth;
    const cropHeight = rect.height * pageHeight;
    const cropX = mediaX + rect.x * pageWidth;
    // Image-space y grows downward from the top; PDF-space y grows upward
    // from the bottom, so the crop box's bottom edge flips accordingly.
    const cropY = mediaY + pageHeight - (rect.y + rect.height) * pageHeight;

    page.setCropBox(cropX, cropY, cropWidth, cropHeight);
    page.setMediaBox(cropX, cropY, cropWidth, cropHeight);
  }

  const outBytes = await pdfDoc.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(Buffer.from(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-cropped.pdf"`,
    },
  });
}

import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const orderRaw = formData.get("order");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  let order: number[];
  try {
    order = JSON.parse(String(orderRaw ?? "[]"));
    if (
      !Array.isArray(order) ||
      order.length === 0 ||
      !order.every((n) => Number.isInteger(n) && n >= 0)
    ) {
      throw new Error("invalid order");
    }
  } catch {
    return NextResponse.json(
      { error: "페이지 순서 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  let sourcePdf;
  try {
    sourcePdf = await PDFDocument.load(bytes);
  } catch {
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  const pageCount = sourcePdf.getPageCount();
  if (order.some((n) => n >= pageCount)) {
    return NextResponse.json(
      { error: "페이지 순서 정보가 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const outputPdf = await PDFDocument.create();
  const copiedPages = await outputPdf.copyPages(sourcePdf, order);
  copiedPages.forEach((page) => outputPdf.addPage(page));

  const outBytes = await outputPdf.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(Buffer.from(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-organized.pdf"`,
    },
  });
}

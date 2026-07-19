import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { configurePdfWorker } from "@/lib/configurePdfWorker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // pdf-to-img (and pdfjs-dist underneath it) is imported dynamically, not
  // as a static top-level import - see configurePdfWorker.ts for why.
  const [{ pdf }] = await Promise.all([import("pdf-to-img"), configurePdfWorker()]);

  const formData = await request.formData();
  const file = formData.get("file");
  const quality = Math.min(
    95,
    Math.max(10, Number(formData.get("quality")) || 60),
  );
  // Rendering scale: 1.0 keeps pages at their original point size (~72 DPI).
  const scale = Math.min(2, Math.max(0.5, Number(formData.get("scale")) || 1));

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "압축할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  const originalBytes = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:application/pdf;base64,${originalBytes.toString("base64")}`;

  let doc;
  try {
    doc = await pdf(dataUrl, { scale });
  } catch (e) {
    console.error("compress: failed to load PDF", e);
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  const outPdf = await PDFDocument.create();

  for await (const pageBuffer of doc) {
    // Read dimensions from the same encode pass (info) instead of a second
    // sharp(jpegBuffer).metadata() decode - that redundant re-decode of a
    // freshly-produced low-quality JPEG was crashing with "SOI not found in
    // JPEG" on Railway's Linux container (never reproduced on Windows).
    const { data: jpegBuffer, info } = await sharp(pageBuffer)
      .jpeg({ quality })
      .toBuffer({ resolveWithObject: true });
    const pixelWidth = info.width;
    const pixelHeight = info.height;
    if (!pixelWidth || !pixelHeight) {
      return NextResponse.json(
        { error: "페이지를 압축하는 중 오류가 발생했습니다." },
        { status: 500 },
      );
    }

    const embeddedImage = await outPdf.embedJpg(jpegBuffer);
    const pageWidth = pixelWidth / scale;
    const pageHeight = pixelHeight / scale;
    const page = outPdf.addPage([pageWidth, pageHeight]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });
  }

  const outBytes = await outPdf.save();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(new Uint8Array(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-compressed.pdf"`,
      "X-Original-Size": String(originalBytes.length),
      "X-Compressed-Size": String(outBytes.length),
    },
  });
}

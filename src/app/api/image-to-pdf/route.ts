import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "이미지 파일을 1개 이상 선택해주세요." },
      { status: 400 },
    );
  }

  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    let bytes = Buffer.from(await file.arrayBuffer());
    const isPng = file.type === "image/png";
    const isJpg = file.type === "image/jpeg" || file.type === "image/jpg";

    let embeddedImage;
    try {
      if (isPng) {
        embeddedImage = await pdfDoc.embedPng(bytes);
      } else if (isJpg) {
        embeddedImage = await pdfDoc.embedJpg(bytes);
      } else {
        // Convert unsupported formats (webp, gif, etc.) to PNG first.
        bytes = await sharp(bytes).png().toBuffer();
        embeddedImage = await pdfDoc.embedPng(bytes);
      }
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" 파일을 이미지로 읽을 수 없습니다.` },
        { status: 400 },
      );
    }

    const isLandscape = embeddedImage.width > embeddedImage.height;
    const pageWidth = isLandscape ? A4_HEIGHT : A4_WIDTH;
    const pageHeight = isLandscape ? A4_WIDTH : A4_HEIGHT;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const scale = Math.min(
      pageWidth / embeddedImage.width,
      pageHeight / embeddedImage.height,
    );
    const drawWidth = embeddedImage.width * scale;
    const drawHeight = embeddedImage.height * scale;

    page.drawImage(embeddedImage, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="images.pdf"',
    },
  });
}

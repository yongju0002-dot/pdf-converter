import { NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";
import { configurePdfWorker } from "@/lib/configurePdfWorker";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // pdf-to-img (and pdfjs-dist underneath it) is imported dynamically, not
  // as a static top-level import - see configurePdfWorker.ts for why.
  const [{ pdf }] = await Promise.all([import("pdf-to-img"), configurePdfWorker()]);

  const formData = await request.formData();
  const file = formData.get("file");
  const format = formData.get("format") === "jpg" ? "jpg" : "png";
  const scale = Number(formData.get("scale")) || 2;

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "변환할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  const dataUrl = `data:application/pdf;base64,${Buffer.from(
    await file.arrayBuffer(),
  ).toString("base64")}`;

  let doc;
  try {
    doc = await pdf(dataUrl, { scale });
  } catch (e) {
    console.error("pdf-to-image: failed to load PDF", e);
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  const baseName = file.name.replace(/\.pdf$/i, "");
  const images: Buffer[] = [];

  for await (const pageBuffer of doc) {
    images.push(
      format === "jpg"
        ? await sharp(pageBuffer).jpeg({ quality: 90 }).toBuffer()
        : pageBuffer,
    );
  }

  if (images.length === 1) {
    return new NextResponse(new Uint8Array(images[0]), {
      status: 200,
      headers: {
        "Content-Type": format === "jpg" ? "image/jpeg" : "image/png",
        "Content-Disposition": `attachment; filename="${baseName}.${format}"`,
      },
    });
  }

  const zip = new JSZip();
  images.forEach((image, index) => {
    zip.file(`${baseName}-page${index + 1}.${format}`, image);
  });
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}-images.zip"`,
    },
  });
}

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

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  const dataUrl = `data:application/pdf;base64,${Buffer.from(
    await file.arrayBuffer(),
  ).toString("base64")}`;

  let doc;
  try {
    doc = await pdf(dataUrl, { scale: 0.4 });
  } catch (e) {
    console.error("organize/thumbnails: failed to load PDF", e);
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  const pages: { index: number; dataUrl: string }[] = [];
  let index = 0;
  for await (const pageBuffer of doc) {
    const thumbnail = await sharp(pageBuffer)
      .resize({ width: 240 })
      .jpeg({ quality: 70 })
      .toBuffer();
    pages.push({
      index,
      dataUrl: `data:image/jpeg;base64,${thumbnail.toString("base64")}`,
    });
    index += 1;
  }

  return NextResponse.json({ pages });
}

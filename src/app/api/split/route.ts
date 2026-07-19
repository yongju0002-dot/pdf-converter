import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { parsePageRanges } from "@/lib/pageRanges";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const mode = formData.get("mode") === "range" ? "range" : "all";
  const ranges = String(formData.get("ranges") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "분할할 PDF 파일을 선택해주세요." },
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
  const baseName = file.name.replace(/\.pdf$/i, "");

  if (mode === "range") {
    let pageIndices: number[];
    try {
      pageIndices = parsePageRanges(ranges, pageCount);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "페이지 범위가 올바르지 않습니다." },
        { status: 400 },
      );
    }

    const outPdf = await PDFDocument.create();
    const copiedPages = await outPdf.copyPages(sourcePdf, pageIndices);
    copiedPages.forEach((page) => outPdf.addPage(page));
    const outBytes = await outPdf.save();

    return new NextResponse(new Uint8Array(outBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-extracted.pdf"`,
      },
    });
  }

  // mode === "all": split into one PDF per page
  const singlePagePdfs: Uint8Array[] = [];
  for (let i = 0; i < pageCount; i++) {
    const outPdf = await PDFDocument.create();
    const [copiedPage] = await outPdf.copyPages(sourcePdf, [i]);
    outPdf.addPage(copiedPage);
    singlePagePdfs.push(await outPdf.save());
  }

  if (singlePagePdfs.length === 1) {
    return new NextResponse(new Uint8Array(singlePagePdfs[0]), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-page1.pdf"`,
      },
    });
  }

  const zip = new JSZip();
  singlePagePdfs.forEach((pdfBytes, index) => {
    zip.file(`${baseName}-page${index + 1}.pdf`, pdfBytes);
  });
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${baseName}-pages.zip"`,
    },
  });
}

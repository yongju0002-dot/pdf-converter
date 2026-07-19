import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files");

  const pdfFiles = files.filter(
    (file): file is File => file instanceof File && file.size > 0,
  );

  if (pdfFiles.length < 2) {
    return NextResponse.json(
      { error: "병합하려면 PDF 파일이 2개 이상 필요합니다." },
      { status: 400 },
    );
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const bytes = await file.arrayBuffer();
    let sourcePdf;
    try {
      sourcePdf = await PDFDocument.load(bytes);
    } catch {
      return NextResponse.json(
        { error: `"${file.name}" 파일을 읽을 수 없습니다. 올바른 PDF인지 확인해주세요.` },
        { status: 400 },
      );
    }
    const copiedPages = await mergedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices(),
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();

  return new NextResponse(Buffer.from(mergedBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="merged.pdf"',
    },
  });
}

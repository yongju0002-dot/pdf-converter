import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { configurePdfWorker } from "@/lib/configurePdfWorker";
import {
  reconstructTable,
  type PositionedText,
} from "@/lib/extractTableFromPdf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // pdfjs-dist is imported dynamically, not as a static top-level import -
  // see configurePdfWorker.ts for why (breaks Turbopack's production build
  // otherwise).
  const [pdfjs] = await Promise.all([
    import("pdfjs-dist/legacy/build/pdf.mjs"),
    configurePdfWorker(),
  ]);

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "변환할 PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }

  const data = new Uint8Array(await file.arrayBuffer());

  let doc;
  try {
    doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  } catch (e) {
    console.error("pdf-to-excel: failed to load PDF", e);
    return NextResponse.json(
      { error: "PDF를 읽을 수 없습니다. 올바른 PDF인지 확인해주세요." },
      { status: 400 },
    );
  }

  const workbook = new ExcelJS.Workbook();

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // textContent.items is (TextItem | TextMarkedContent)[] - only TextItem
    // has `str`/`transform`, so a plain `in`-narrowed if (rather than a
    // .filter() type predicate, which TS won't narrow correctly against a
    // union array element type here) picks those out.
    const items: PositionedText[] = [];
    for (const item of textContent.items) {
      if ("str" in item && "transform" in item && item.str.trim() !== "") {
        items.push({
          x: item.transform[4],
          y: item.transform[5],
          str: item.str,
        });
      }
    }

    const table = reconstructTable(items);
    const sheet = workbook.addWorksheet(`Page ${pageNum}`);
    table.forEach((row, rowIndex) => {
      sheet.getRow(rowIndex + 1).values = row;
    });
  }

  const outBuffer = await workbook.xlsx.writeBuffer();
  const baseName = file.name.replace(/\.pdf$/i, "");

  return new NextResponse(new Uint8Array(outBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${baseName}.xlsx"`,
    },
  });
}

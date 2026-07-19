import { PDFDocument } from "@cantoo/pdf-lib";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const action = formData.get("action") === "remove" ? "remove" : "add";
  const password = String(formData.get("password") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { error: "PDF 파일을 선택해주세요." },
      { status: 400 },
    );
  }
  if (password === "") {
    return NextResponse.json(
      { error: "비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const baseName = file.name.replace(/\.pdf$/i, "");

  if (action === "add") {
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(bytes);
    } catch {
      return NextResponse.json(
        { error: "PDF를 읽을 수 없습니다. 이미 암호가 걸려 있다면 먼저 해제해주세요." },
        { status: 400 },
      );
    }

    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: { printing: "highResolution" },
    });
    const outBytes = await pdfDoc.save();

    return new NextResponse(new Uint8Array(outBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseName}-protected.pdf"`,
      },
    });
  }

  // action === "remove"
  let sourceDoc;
  try {
    sourceDoc = await PDFDocument.load(bytes, { password });
  } catch {
    return NextResponse.json(
      { error: "비밀번호가 올바르지 않거나 암호화되지 않은 PDF입니다." },
      { status: 400 },
    );
  }

  // Saving a decrypted doc directly still writes out a trailer `Encrypt`
  // reference (a library quirk), producing a file that other PDF readers
  // may treat as still encrypted. Rebuilding into a fresh document avoids
  // carrying over any encryption metadata.
  const outPdf = await PDFDocument.create();
  const copiedPages = await outPdf.copyPages(
    sourceDoc,
    sourceDoc.getPageIndices(),
  );
  copiedPages.forEach((page) => outPdf.addPage(page));
  const outBytes = await outPdf.save();

  return new NextResponse(new Uint8Array(outBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${baseName}-unprotected.pdf"`,
    },
  });
}

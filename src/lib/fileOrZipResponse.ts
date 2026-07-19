import JSZip from "jszip";
import { NextResponse } from "next/server";
import type { ConvertedFile } from "@/lib/convertWithLibreOffice";

export async function fileOrZipResponse(
  files: ConvertedFile[],
  options: { zipName: string; contentTypeForSingle: string },
): Promise<NextResponse> {
  if (files.length === 1) {
    return new NextResponse(new Uint8Array(files[0].data), {
      status: 200,
      headers: {
        "Content-Type": options.contentTypeForSingle,
        "Content-Disposition": `attachment; filename="${files[0].filename}"`,
      },
    });
  }

  const zip = new JSZip();
  files.forEach((file) => zip.file(file.filename, file.data));
  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${options.zipName}"`,
    },
  });
}

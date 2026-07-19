import { NextResponse } from "next/server";
import { convertWithLibreOffice } from "@/lib/convertWithLibreOffice";
import { fileOrZipResponse } from "@/lib/fileOrZipResponse";

/** Shared by every "<office format> -> PDF" route (word/ppt/excel/html -to-pdf). */
export async function convertOfficeFileToPdf(
  file: File,
  options: {
    supportedExtensions: string[];
    unsupportedMessage: string;
    failureMessage: string;
  },
): Promise<NextResponse> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!options.supportedExtensions.includes(ext)) {
    return NextResponse.json({ error: options.unsupportedMessage }, { status: 400 });
  }

  const inputBytes = Buffer.from(await file.arrayBuffer());
  const baseName = file.name.replace(/\.[^.]+$/, "");

  let files;
  try {
    files = await convertWithLibreOffice(inputBytes, {
      inputExt: ext,
      targetFormat: "pdf",
      baseName,
    });
  } catch (e) {
    console.error("convertOfficeFileToPdf: conversion failed", e);
    return NextResponse.json({ error: options.failureMessage }, { status: 500 });
  }

  return fileOrZipResponse(files, {
    zipName: `${baseName}.zip`,
    contentTypeForSingle: "application/pdf",
  });
}

/** Shared by every "PDF -> <office format>" route (pdf-to-word/ppt/html). */
export async function convertPdfToOffice(
  file: File,
  options: {
    targetFormat: string;
    infilter?: string;
    contentType: string;
    failureMessage: string;
  },
): Promise<NextResponse> {
  const inputBytes = Buffer.from(await file.arrayBuffer());
  const baseName = file.name.replace(/\.pdf$/i, "");

  let files;
  try {
    files = await convertWithLibreOffice(inputBytes, {
      inputExt: "pdf",
      targetFormat: options.targetFormat,
      infilter: options.infilter,
      baseName,
    });
  } catch (e) {
    console.error("convertPdfToOffice: conversion failed", e);
    return NextResponse.json({ error: options.failureMessage }, { status: 500 });
  }

  return fileOrZipResponse(files, {
    zipName: `${baseName}.zip`,
    contentTypeForSingle: options.contentType,
  });
}

import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function resolveSofficeBinary(): string {
  if (process.env.LIBREOFFICE_PATH) return process.env.LIBREOFFICE_PATH;
  if (process.platform === "win32") {
    return "C:\\Program Files\\LibreOffice\\program\\soffice.exe";
  }
  // On Linux (production/Docker) soffice is expected to be on PATH.
  return "soffice";
}

type ConvertOptions = {
  /** File extension of the input, without the dot (e.g. "pdf", "docx"). */
  inputExt: string;
  /** Target format passed to --convert-to (e.g. "docx", "pdf"). */
  targetFormat: string;
  /** Forces a specific import filter, needed e.g. so PDFs open in Writer
   * instead of Draw when converting PDF -> Word. */
  infilter?: string;
  timeoutMs?: number;
  /** Base filename (without extension), used for the temp input file so
   * LibreOffice's output inherits it - e.g. "report" produces "report.docx".
   * Sanitized and defaults to "input"; only [A-Za-z0-9_-] is kept since this
   * comes from a user-supplied upload name and becomes part of a real path. */
  baseName?: string;
};

export type ConvertedFile = { filename: string; data: Buffer };

export async function convertWithLibreOffice(
  inputBytes: Buffer,
  options: ConvertOptions,
): Promise<ConvertedFile[]> {
  const { inputExt, targetFormat, infilter, timeoutMs = 60_000 } = options;
  const safeBaseName = (options.baseName ?? "input").replace(/[^A-Za-z0-9_-]/g, "_") || "input";

  const workDir = await mkdtemp(path.join(os.tmpdir(), "pdf-converter-lo-"));
  // Each conversion gets its own LibreOffice user profile so concurrent
  // requests don't collide on the same lock file.
  const profileDir = path.join(workDir, "profile");
  const inputPath = path.join(workDir, `${safeBaseName}.${inputExt}`);

  try {
    await writeFile(inputPath, inputBytes);

    const args = [
      "--headless",
      "--norestore",
      `-env:UserInstallation=file:///${profileDir.replace(/\\/g, "/")}`,
      ...(infilter ? [`--infilter=${infilter}`] : []),
      "--convert-to",
      targetFormat,
      "--outdir",
      workDir,
      inputPath,
    ];

    await new Promise<void>((resolve, reject) => {
      const child = spawn(resolveSofficeBinary(), args);
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill();
        reject(new Error("LibreOffice conversion timed out"));
      }, timeoutMs);

      child.stderr.on("data", (chunk) => {
        stderr += String(chunk);
      });
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0) resolve();
        else reject(new Error(`LibreOffice exited with code ${code}: ${stderr}`));
      });
    });

    // Some conversions (e.g. PDF -> HTML) produce more than one file, such
    // as an .html plus its extracted images - return all of them and let
    // the caller decide whether to zip them up.
    const outputFiles = await readdir(workDir);
    const producedFiles = outputFiles.filter(
      (f) => f !== path.basename(inputPath) && f !== "profile",
    );
    if (producedFiles.length === 0) {
      throw new Error("LibreOffice did not produce an output file");
    }

    return await Promise.all(
      producedFiles.map(async (filename) => ({
        filename,
        data: await readFile(path.join(workDir, filename)),
      })),
    );
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

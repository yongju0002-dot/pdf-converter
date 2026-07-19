import path from "node:path";
import { pathToFileURL } from "node:url";

let configured = false;

// TEMPORARY diagnostic: Next's error boundary was showing a useless generic
// "at new Promise (<anonymous>)" stack for a pdf-to-img crash on Railway that
// never reproduced on Windows, meaning the real error is an unhandled
// rejection from a promise not connected to any of our own await chains
// (e.g. pdfjs-dist's fake-worker message handling). Log the full reason/stack
// so we can actually see it. Remove once the compress crash is diagnosed.
let unhandledRejectionLoggerInstalled = false;
function installUnhandledRejectionLogger() {
  if (unhandledRejectionLoggerInstalled) return;
  process.on("unhandledRejection", (reason) => {
    console.error("DIAGNOSTIC unhandledRejection:", reason);
  });
  unhandledRejectionLoggerInstalled = true;
}

// pdfjs-dist can't resolve its worker's relative default path once bundled
// by Next.js/Turbopack, so it must be pointed at the on-disk file explicitly.
// Built via plain string concat (not require.resolve) so the bundler doesn't
// rewrite it into a module reference instead of a real filesystem path.
//
// The pdfjs-dist import itself is also dynamic (not a static top-level
// import) because Turbopack's production "collect page data" build step
// evaluates every statically-imported module up front, and pdfjs-dist's
// module-scope code breaks in that specific evaluation context (works fine
// in dev, and works fine once actually invoked from a request handler).
// Deferring the import until a request comes in avoids that step entirely.
export async function configurePdfWorker() {
  installUnhandledRejectionLogger();
  if (configured) return;
  const { GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  GlobalWorkerOptions.workerSrc = pathToFileURL(
    path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
    ),
  ).href;
  configured = true;
}

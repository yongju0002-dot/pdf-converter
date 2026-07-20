import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build for the Docker image.
  output: "standalone",
  // pdfjs-dist's module code breaks when Turbopack bundles it for
  // production (works fine in dev) - "TypeError: The path argument must be
  // of type string. Received type number" at runtime. Excluding it from
  // bundling and letting Node `require` it directly avoids the bug.
  serverExternalPackages: ["pdfjs-dist", "pdf-to-img"],
  outputFileTracingIncludes: {
    // Only referenced via dynamically-built filesystem paths (see
    // src/lib/configurePdfWorker.ts), not static imports, so Next's
    // file tracer can't discover them on its own even as an external.
    "/api/pdf-to-image": ["./node_modules/pdfjs-dist/**/*"],
    "/api/compress": ["./node_modules/pdfjs-dist/**/*"],
    "/api/pdf-to-excel": ["./node_modules/pdfjs-dist/**/*"],
  },
  async redirects() {
    // Tool slugs went through 2 renames for SEO (each old form may have been
    // indexed already): bare word -> hyphenated "-pdf"/"pdf-to-x" -> final
    // underscore form ("merge" -> "merge-pdf" -> "merge_pdf", etc).
    const renames: [string, string][] = [
      ["merge", "merge_pdf"],
      ["merge-pdf", "merge_pdf"],
      ["split", "split_pdf"],
      ["split-pdf", "split_pdf"],
      ["compress", "compress_pdf"],
      ["compress-pdf", "compress_pdf"],
      ["watermark", "watermark_pdf"],
      ["watermark-pdf", "watermark_pdf"],
      ["protect", "protect_pdf"],
      ["protect-pdf", "protect_pdf"],
      ["pdf-to-image", "pdf_to_image"],
      ["image-to-pdf", "image_to_pdf"],
      ["pdf-to-word", "pdf_to_word"],
      ["word-to-pdf", "word_to_pdf"],
      ["pdf-to-ppt", "pdf_to_ppt"],
      ["ppt-to-pdf", "ppt_to_pdf"],
      ["pdf-to-excel", "pdf_to_excel"],
      ["excel-to-pdf", "excel_to_pdf"],
      ["pdf-to-html", "pdf_to_html"],
      ["html-to-pdf", "html_to_pdf"],
    ];
    return renames.flatMap(([from, to]) => [
      {
        source: `/${from}`,
        destination: `/${to}`,
        permanent: true,
      },
      {
        source: `/:locale(ko|en|ja|zh)/${from}`,
        destination: `/:locale/${to}`,
        permanent: true,
      },
    ]);
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);

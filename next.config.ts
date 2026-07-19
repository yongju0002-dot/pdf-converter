import type { NextConfig } from "next";

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
  },
};

export default nextConfig;

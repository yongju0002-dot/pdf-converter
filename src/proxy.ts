import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// This Next.js version renamed the `middleware.ts` file convention to
// `proxy.ts` (see node_modules/next/dist/docs/.../file-conventions/proxy.md -
// "middleware" is deprecated). next-intl's `createMiddleware` still returns a
// plain (request) => response function though, so it works fine as the
// default export here regardless of the name change.
export default createMiddleware(routing);

export const config = {
  // Match every path except API routes, static files, and asset-like paths.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

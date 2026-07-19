import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { NavMenu } from "@/components/NavMenu";
import { PdfConvertMenu } from "@/components/PdfConvertMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF 도구 모음 | 무료 PDF 병합, 분할, 압축",
  description: "가입 없이 무료로 PDF를 병합, 분할, 압축, 변환하세요.",
};

const quickLinks = [
  { href: "/merge", label: "PDF 병합" },
  { href: "/split", label: "PDF 분할" },
  { href: "/compress", label: "PDF 압축" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className="mr-2 flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <FileText className="h-4 w-4 text-white" strokeWidth={2} />
                </span>
                PDF도구
              </Link>

              <NavMenu />
              <PdfConvertMenu />

              <nav className="hidden items-center gap-1 md:flex">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 sm:inline-flex dark:bg-indigo-500/10 dark:text-indigo-400">
              가입 없이 무료로 사용
            </span>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-zinc-200/70 bg-white py-8 dark:border-zinc-800/70 dark:bg-zinc-950">
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            업로드된 파일은 처리 후 자동으로 삭제됩니다.
          </p>
        </footer>
      </body>
    </html>
  );
}

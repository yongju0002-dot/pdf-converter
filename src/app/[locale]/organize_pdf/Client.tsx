"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

type PageThumbnail = {
  originalIndex: number;
  dataUrl: string;
};

export default function OrganizePage() {
  const t = useTranslations("OrganizePage");
  const tCommon = useTranslations("Common");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumbnail[] | null>(null);
  const [isLoadingThumbnails, setIsLoadingThumbnails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThumbnails = async (selectedFile: File) => {
    setError(null);
    setPages(null);
    setIsLoadingThumbnails(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/organize/thumbnails", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }

      const data = (await res.json()) as {
        pages: { index: number; dataUrl: string }[];
      };
      setPages(
        data.pages.map((p) => ({ originalIndex: p.index, dataUrl: p.dataUrl })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsLoadingThumbnails(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    loadThumbnails(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const removePage = (originalIndex: number) => {
    setPages((prev) =>
      prev ? prev.filter((p) => p.originalIndex !== originalIndex) : prev,
    );
  };

  const movePage = (index: number, direction: -1 | 1) => {
    setPages((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!file || !pages) return;
    if (pages.length === 0) {
      setError(t("needAtLeastOnePage"));
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "order",
        JSON.stringify(pages.map((p) => p.originalIndex)),
      );

      const res = await fetch("/api/organize", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "organized.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={ArrowUpDown}
        title={t("title")}
        description={t("description")}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      {isLoadingThumbnails && (
        <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
          {t("loadingThumbnails")}
        </p>
      )}

      {pages && pages.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pages.map((page, index) => (
            <li
              key={page.originalIndex}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.dataUrl}
                alt={t("pageLabel", { number: page.originalIndex + 1 })}
                className="h-32 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 border-t border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {index + 1}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => movePage(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label={tCommon("moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(index, 1)}
                    disabled={index === pages.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label={tCommon("moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removePage(page.originalIndex)}
                    className="rounded px-1.5 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label={t("removePage")}
                  >
                    {tCommon("remove")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton
        onClick={handleSave}
        disabled={!pages || pages.length === 0 || isSaving}
      >
        {isSaving ? t("saving") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

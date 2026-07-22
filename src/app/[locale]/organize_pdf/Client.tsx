"use client";

import { useCallback, useState, type DragEvent } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowUpDown, GripVertical } from "lucide-react";
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (index: number) => (e: DragEvent<HTMLLIElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (index: number) => (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragOver = (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => (e: DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setPages((prev) => {
      if (!prev || draggedIndex === null || draggedIndex === index) return prev;
      const next = [...prev];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
              draggable
              onDragStart={handleDragStart(index)}
              onDragEnter={handleDragEnter(index)}
              onDragOver={handleDragOver}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              className={`relative cursor-grab overflow-hidden rounded-xl border bg-white transition-all active:cursor-grabbing dark:bg-zinc-900 ${
                draggedIndex === index
                  ? "opacity-40"
                  : dragOverIndex === index
                    ? "border-indigo-400 dark:border-indigo-500"
                    : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <span className="absolute top-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-black/40 text-white">
                <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={page.dataUrl}
                alt={t("pageLabel", { number: page.originalIndex + 1 })}
                draggable={false}
                className="h-32 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 border-t border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePage(page.originalIndex)}
                  className="shrink-0 rounded px-1.5 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label={t("removePage")}
                >
                  {tCommon("remove")}
                </button>
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

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { categoryMeta } from "@/lib/tools";

type QueuedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export default function ImageToPdfPage() {
  const t = useTranslations("ImageToPdfPage");
  const tCommon = useTranslations("Common");
  const [queue, setQueue] = useState<QueuedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setQueue((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: true,
  });

  useEffect(() => {
    return () => {
      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeFile = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    setQueue((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const totalSizeMb = useMemo(
    () => queue.reduce((sum, item) => sum + item.file.size, 0) / 1024 / 1024,
    [queue],
  );

  const handleConvert = async () => {
    if (queue.length === 0) {
      setError(t("selectAtLeastOne"));
      return;
    }
    setError(null);
    setIsConverting(true);

    try {
      const formData = new FormData();
      queue.forEach((item) => formData.append("files", item.file));

      const res = await fetch("/api/image-to-pdf", {
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
      a.download = "images.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={ImagePlus}
        iconBg={`${categoryMeta.image.iconBg} ${categoryMeta.image.iconBgDark}`}
        iconText={`${categoryMeta.image.iconText} ${categoryMeta.image.iconTextDark}`}
        title={t("title")}
        description={t("description")}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        placeholder={t("dropzonePlaceholder")}
      />

      {queue.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {queue.map((item, index) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.previewUrl}
                alt={item.file.name}
                className="h-32 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 border-t border-zinc-100 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {index + 1}. {item.file.name}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label={tCommon("moveUp")}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === queue.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label={tCommon("moveDown")}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="rounded px-1.5 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label={tCommon("remove")}
                  >
                    {tCommon("remove")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {queue.length > 0 && (
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          {t("summary", { count: queue.length, size: totalSizeMb.toFixed(2) })}
        </p>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton
        onClick={handleConvert}
        disabled={queue.length === 0 || isConverting}
      >
        {isConverting ? t("converting") : t("submit", { count: queue.length })}
      </SubmitButton>
    </ToolPageShell>
  );
}

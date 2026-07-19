"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";
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
      setError("이미지 파일을 1개 이상 선택해주세요.");
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
        throw new Error(data?.error ?? "변환 중 오류가 발생했습니다.");
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
      setError(
        e instanceof Error ? e.message : "변환 중 오류가 발생했습니다.",
      );
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
        title="이미지 → PDF"
        description="JPG, PNG 이미지를 원하는 순서로 정렬해 하나의 PDF로 만듭니다."
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        placeholder="여기에 이미지를 끌어다 놓거나 클릭해서 선택하세요"
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
                    aria-label="앞으로 이동"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === queue.length - 1}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    aria-label="뒤로 이동"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="rounded px-1.5 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {queue.length > 0 && (
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          이미지 {queue.length}개 · 총 {totalSizeMb.toFixed(2)} MB
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
        {isConverting ? "변환 중..." : `PDF로 만들기 (${queue.length}장)`}
      </SubmitButton>
    </ToolPageShell>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Combine } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

type QueuedFile = {
  id: string;
  file: File;
};

export default function MergePage() {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setQueue((prev) => [
      ...prev,
      ...acceptedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
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

  const handleMerge = async () => {
    if (queue.length < 2) {
      setError("병합하려면 PDF 파일이 2개 이상 필요합니다.");
      return;
    }
    setError(null);
    setIsMerging(true);

    try {
      const formData = new FormData();
      queue.forEach((item) => formData.append("files", item.file));

      const res = await fetch("/api/merge", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "병합 중 오류가 발생했습니다.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "병합 중 오류가 발생했습니다.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Combine}
        title="PDF 병합"
        description="여러 PDF 파일을 원하는 순서로 정렬해 하나로 합칩니다."
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        placeholder="여기에 PDF 파일을 끌어다 놓거나 클릭해서 선택하세요"
      />

      {queue.length > 0 && (
        <ul className="mt-6 space-y-2">
          {queue.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {index + 1}
                </span>
                <span className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                  {item.file.name}
                </span>
                <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveFile(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="위로 이동"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveFile(index, 1)}
                  disabled={index === queue.length - 1}
                  className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="아래로 이동"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="rounded-lg px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label="제거"
                >
                  삭제
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

      <SubmitButton onClick={handleMerge} disabled={queue.length < 2 || isMerging}>
        {isMerging ? "병합 중..." : `PDF ${queue.length}개 병합하기`}
      </SubmitButton>
    </ToolPageShell>
  );
}

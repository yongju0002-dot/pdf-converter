"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useDropzone } from "react-dropzone";
import { Crop } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

type Rect = { x: number; y: number; width: number; height: number };
type Corner = "nw" | "ne" | "sw" | "se";
type DragState =
  | { type: "move"; startX: number; startY: number; startRect: Rect }
  | { type: "resize"; corner: Corner; startX: number; startY: number; startRect: Rect };

const DEFAULT_RECT: Rect = { x: 0.08, y: 0.08, width: 0.84, height: 0.84 };
const MIN_SIZE = 0.05;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function CropPdfPage() {
  const t = useTranslations("CropPage");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{ index: number; dataUrl: string }[] | null>(
    null,
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [rect, setRect] = useState<Rect>(DEFAULT_RECT);
  const [applyMode, setApplyMode] = useState<"all" | "single">("all");
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dragStateRef = useRef<DragState | null>(null);
  const activeListenersRef = useRef<{
    move: (e: PointerEvent) => void;
    up: () => void;
  } | null>(null);

  const loadPreview = async (selectedFile: File) => {
    setError(null);
    setPages(null);
    setCurrentPageIndex(0);
    setRect(DEFAULT_RECT);
    setIsLoadingPreview(true);

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
      setPages(data.pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    loadPreview(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  // Both handlers only ever touch dragStateRef (a ref) and setRect (a stable
  // setter), so it's safe for them to be plain per-render closures - the
  // pair captured together in activeListenersRef at drag-start always stays
  // internally consistent even if the component re-renders mid-drag.
  const onPointerMove = (e: PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const container = document.getElementById("crop-image-container");
    if (!container) return;

    const bounds = container.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / bounds.width;
    const dy = (e.clientY - drag.startY) / bounds.height;

    if (drag.type === "move") {
      const maxX = 1 - drag.startRect.width;
      const maxY = 1 - drag.startRect.height;
      setRect({
        ...drag.startRect,
        x: clamp(drag.startRect.x + dx, 0, maxX),
        y: clamp(drag.startRect.y + dy, 0, maxY),
      });
      return;
    }

    const { corner, startRect } = drag;
    let { x, y, width, height } = startRect;
    if (corner === "nw" || corner === "sw") {
      const newX = clamp(
        startRect.x + dx,
        0,
        startRect.x + startRect.width - MIN_SIZE,
      );
      width = startRect.x + startRect.width - newX;
      x = newX;
    }
    if (corner === "ne" || corner === "se") {
      width = clamp(startRect.width + dx, MIN_SIZE, 1 - startRect.x);
    }
    if (corner === "nw" || corner === "ne") {
      const newY = clamp(
        startRect.y + dy,
        0,
        startRect.y + startRect.height - MIN_SIZE,
      );
      height = startRect.y + startRect.height - newY;
      y = newY;
    }
    if (corner === "sw" || corner === "se") {
      height = clamp(startRect.height + dy, MIN_SIZE, 1 - startRect.y);
    }
    setRect({ x, y, width, height });
  };

  const onPointerUp = () => {
    dragStateRef.current = null;
    const listeners = activeListenersRef.current;
    if (listeners) {
      window.removeEventListener("pointermove", listeners.move);
      window.removeEventListener("pointerup", listeners.up);
      activeListenersRef.current = null;
    }
  };

  const startMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragStateRef.current = {
      type: "move",
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
    };
    activeListenersRef.current = { move: onPointerMove, up: onPointerUp };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const startResize = (corner: Corner) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragStateRef.current = {
      type: "resize",
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startRect: rect,
    };
    activeListenersRef.current = { move: onPointerMove, up: onPointerUp };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleCrop = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    setError(null);
    setIsCropping(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("rect", JSON.stringify(rect));
      formData.append("mode", applyMode);
      if (applyMode === "single") {
        formData.append("pageIndex", String(currentPageIndex));
      }

      const res = await fetch("/api/crop", {
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
      a.download = "cropped.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsCropping(false);
    }
  };

  const currentPage = pages?.[currentPageIndex];

  return (
    <ToolPageShell>
      <PageHeader icon={Crop} title={t("title")} description={t("description")} />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      {isLoadingPreview && (
        <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
          {t("loadingPreview")}
        </p>
      )}

      {currentPage && (
        <div className="mt-6">
          <div
            id="crop-image-container"
            className="relative mx-auto w-full max-w-sm touch-none overflow-hidden rounded-xl border border-zinc-200 bg-white select-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPage.dataUrl}
              alt={t("title")}
              draggable={false}
              className="block w-full"
            />
            <div
              onPointerDown={startMove}
              className="absolute cursor-move border-2 border-indigo-500 bg-indigo-500/10"
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.width * 100}%`,
                height: `${rect.height * 100}%`,
              }}
            >
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <div
                  key={corner}
                  onPointerDown={startResize(corner)}
                  className={`absolute h-4 w-4 rounded-full border-2 border-white bg-indigo-500 shadow ${
                    corner === "nw"
                      ? "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"
                      : corner === "ne"
                        ? "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"
                        : corner === "sw"
                          ? "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"
                          : "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
            {t("instructionHint")}
          </p>
        </div>
      )}

      {pages && pages.length > 1 && (
        <div className="mt-4">
          <ToggleGroup
            value={applyMode}
            onChange={setApplyMode}
            options={[
              { value: "all", label: t("applyAllPages") },
              { value: "single", label: t("applyCurrentPage") },
            ]}
          />
          {applyMode === "single" && (
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
                disabled={currentPageIndex === 0}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                ←
              </button>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {t("pageIndicator", {
                  current: currentPageIndex + 1,
                  total: pages.length,
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1))
                }
                disabled={currentPageIndex === pages.length - 1}
                className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleCrop} disabled={!file || isCropping}>
        {isCropping ? t("cropping") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

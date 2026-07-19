"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileImage } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { categoryMeta } from "@/lib/tools";

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) {
      setError("변환할 PDF 파일을 선택해주세요.");
      return;
    }
    setError(null);
    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const res = await fetch("/api/pdf-to-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "변환 중 오류가 발생했습니다.");
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? `converted.${format}`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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
        icon={FileImage}
        iconBg={`${categoryMeta.image.iconBg} ${categoryMeta.image.iconBgDark}`}
        iconText={`${categoryMeta.image.iconText} ${categoryMeta.image.iconTextDark}`}
        title="PDF → 이미지"
        description="PDF의 각 페이지를 이미지로 변환합니다. 페이지가 여러 장이면 ZIP으로 묶어 다운로드됩니다."
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          출력 형식
        </label>
        <div className="mt-1.5">
          <ToggleGroup
            value={format}
            onChange={setFormat}
            options={[
              { value: "png", label: "PNG" },
              { value: "jpg", label: "JPG" },
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleConvert} disabled={!file || isConverting}>
        {isConverting ? "변환 중..." : "이미지로 변환하기"}
      </SubmitButton>
    </ToolPageShell>
  );
}

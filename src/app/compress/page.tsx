"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Shrink } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(60);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    originalSize: number;
    compressedSize: number;
  } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setResult(null);
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleCompress = async () => {
    if (!file) {
      setError("압축할 PDF 파일을 선택해주세요.");
      return;
    }
    setError(null);
    setResult(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", String(quality));

      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "압축 중 오류가 발생했습니다.");
      }

      const originalSize = Number(res.headers.get("X-Original-Size") ?? 0);
      const compressedSize = Number(
        res.headers.get("X-Compressed-Size") ?? 0,
      );

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (originalSize && compressedSize) {
        setResult({ originalSize, compressedSize });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "압축 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

  return (
    <ToolPageShell>
      <PageHeader
        icon={Shrink}
        title="PDF 압축"
        description="각 페이지를 이미지로 다시 압축해 파일 크기를 줄입니다."
        warning="스캔본이나 이미지가 많은 PDF에 효과적입니다. 압축 후에는 텍스트를 선택하거나 복사할 수 없게 됩니다."
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6">
        <SliderField
          label="압축 품질"
          valueLabel={String(quality)}
          min={10}
          max={95}
          value={quality}
          onChange={setQuality}
          hint="낮을수록 파일이 작아지지만 화질이 떨어집니다."
        />
      </div>

      {result && (
        <div className="mt-4">
          <Callout variant="success">
            {formatMb(result.originalSize)} MB → {formatMb(result.compressedSize)}{" "}
            MB (
            {Math.round(
              (1 - result.compressedSize / result.originalSize) * 100,
            )}
            % 감소)
          </Callout>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleCompress} disabled={!file || isProcessing}>
        {isProcessing ? "압축 중..." : "PDF 압축하기"}
      </SubmitButton>
    </ToolPageShell>
  );
}

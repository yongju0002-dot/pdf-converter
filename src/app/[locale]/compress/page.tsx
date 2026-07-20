"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Shrink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function CompressPage() {
  const t = useTranslations("CompressPage");
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
      setError(t("selectFile"));
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
        throw new Error(data?.error ?? t("error"));
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
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatMb = (bytes: number) => (bytes / 1024 / 1024).toFixed(2);

  return (
    <ToolPageShell>
      <PageHeader
        icon={Shrink}
        title={t("title")}
        description={t("description")}
        warning={t("warning")}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6">
        <SliderField
          label={t("qualityLabel")}
          valueLabel={String(quality)}
          min={10}
          max={95}
          value={quality}
          onChange={setQuality}
          hint={t("qualityHint")}
        />
      </div>

      {result && (
        <div className="mt-4">
          <Callout variant="success">
            {t("result", {
              originalSize: formatMb(result.originalSize),
              compressedSize: formatMb(result.compressedSize),
              percent: Math.round(
                (1 - result.compressedSize / result.originalSize) * 100,
              ),
            })}
          </Callout>
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleCompress} disabled={!file || isProcessing}>
        {isProcessing ? t("compressing") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

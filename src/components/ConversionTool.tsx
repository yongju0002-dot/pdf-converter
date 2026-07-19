"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import type { LucideIcon } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

type Props = {
  icon: LucideIcon;
  iconBg?: string;
  iconText?: string;
  title: string;
  description: string;
  warning?: string;
  accept: Accept;
  apiEndpoint: string;
  buttonLabel: string;
  fallbackFilename: string;
};

export function ConversionTool({
  icon,
  iconBg,
  iconText,
  title,
  description,
  warning,
  accept,
  apiEndpoint,
  buttonLabel,
  fallbackFilename,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false,
  });

  const handleConvert = async () => {
    if (!file) {
      setError("변환할 파일을 선택해주세요.");
      return;
    }
    setError(null);
    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "변환 중 오류가 발생했습니다.");
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? fallbackFilename;

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
        icon={icon}
        iconBg={iconBg}
        iconText={iconText}
        title={title}
        description={description}
        warning={warning}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleConvert} disabled={!file || isConverting}>
        {isConverting ? "변환 중..." : buttonLabel}
      </SubmitButton>
    </ToolPageShell>
  );
}

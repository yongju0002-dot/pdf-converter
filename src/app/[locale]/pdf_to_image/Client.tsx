"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileImage } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { categoryMeta } from "@/lib/tools";

export default function PdfToImagePage() {
  const t = useTranslations("PdfToImagePage");
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
      setError(t("selectFile"));
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
        throw new Error(data?.error ?? t("error"));
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
      setError(e instanceof Error ? e.message : t("error"));
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
        title={t("title")}
        description={t("description")}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("formatLabel")}
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
        {isConverting ? t("converting") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

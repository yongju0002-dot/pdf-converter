"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Hash } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

type Position = "bottom-center" | "bottom-right" | "top-center";

export default function PageNumbersPage() {
  const t = useTranslations("PageNumbersPage");
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState("1");
  const [fontSize, setFontSize] = useState("12");
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleApply = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("position", position);
      formData.append("startNumber", String(Math.max(0, Number(startNumber) || 1)));
      formData.append("fontSize", String(Math.max(8, Number(fontSize) || 12)));

      const res = await fetch("/api/page-numbers", {
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
      a.download = "numbered.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Hash}
        title={t("title")}
        description={t("description")}
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("positionLabel")}
          </label>
          <div className="mt-1.5">
            <ToggleGroup
              value={position}
              onChange={setPosition}
              options={[
                { value: "top-center", label: t("positionTopCenter") },
                { value: "bottom-center", label: t("positionBottomCenter") },
                { value: "bottom-right", label: t("positionBottomRight") },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextField
            label={t("startNumberLabel")}
            type="number"
            value={startNumber}
            onChange={setStartNumber}
          />
          <TextField
            label={t("fontSizeLabel")}
            type="number"
            value={fontSize}
            onChange={setFontSize}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleApply} disabled={!file || isProcessing}>
        {isProcessing ? t("applying") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

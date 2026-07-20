"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Droplets } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function WatermarkPage() {
  const t = useTranslations("WatermarkPage");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.3);
  const [fontSize, setFontSize] = useState(48);
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
    if (text.trim() === "") {
      setError(t("enterText"));
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text);
      formData.append("opacity", String(opacity));
      formData.append("fontSize", String(fontSize));

      const res = await fetch("/api/watermark", {
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
      a.download = "watermarked.pdf";
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
        icon={Droplets}
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
        <TextField label={t("textLabel")} value={text} onChange={setText} />

        <SliderField
          label={t("opacityLabel")}
          valueLabel={`${Math.round(opacity * 100)}%`}
          min={5}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={(value) => setOpacity(value / 100)}
        />

        <SliderField
          label={t("fontSizeLabel")}
          valueLabel={`${fontSize}pt`}
          min={16}
          max={120}
          value={fontSize}
          onChange={setFontSize}
        />
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

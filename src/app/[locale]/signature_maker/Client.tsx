"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Signature } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToolPageShell } from "@/components/ui/ToolPageShell";
import { categoryMeta } from "@/lib/tools";

const CHECKERBOARD_STYLE = {
  backgroundImage:
    "conic-gradient(#e5e7eb 90deg, transparent 90deg 180deg, #e5e7eb 180deg 270deg, transparent 270deg)",
  backgroundSize: "16px 16px",
};

export default function SignatureMakerPage() {
  const t = useTranslations("SignatureMakerPage");
  const [file, setFile] = useState<File | null>(null);
  const [sensitivity, setSensitivity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setResultUrl(null);
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    multiple: false,
  });

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sensitivity", String(sensitivity));

      const res = await fetch("/api/signature", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = "signature.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Signature}
        iconBg={`${categoryMeta.edit.iconBg} ${categoryMeta.edit.iconBgDark}`}
        iconText={`${categoryMeta.edit.iconText} ${categoryMeta.edit.iconTextDark}`}
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
        <SliderField
          label={t("sensitivityLabel")}
          valueLabel={String(sensitivity)}
          min={0}
          max={100}
          value={sensitivity}
          onChange={setSensitivity}
          hint={t("sensitivityHint")}
        />
      </div>

      {resultUrl && (
        <div
          className="mt-6 flex justify-center rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
          style={CHECKERBOARD_STYLE}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt={t("resultAlt")}
            className="max-h-48 max-w-full object-contain"
          />
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleSubmit} disabled={!file || isProcessing}>
        {isProcessing ? t("processing") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

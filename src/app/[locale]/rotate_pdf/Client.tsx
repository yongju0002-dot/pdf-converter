"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function RotatePage() {
  const t = useTranslations("RotatePage");
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<"90" | "-90" | "180">("90");
  const [isRotating, setIsRotating] = useState(false);
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

  const handleRotate = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    setError(null);
    setIsRotating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("angle", angle);

      const res = await fetch("/api/rotate", {
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
      a.download = "rotated.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={RotateCw}
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
          {t("directionLabel")}
        </label>
        <div className="mt-1.5">
          <ToggleGroup
            value={angle}
            onChange={setAngle}
            options={[
              { value: "-90", label: t("left90") },
              { value: "180", label: t("rotate180") },
              { value: "90", label: t("right90") },
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleRotate} disabled={!file || isRotating}>
        {isRotating ? t("rotating") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

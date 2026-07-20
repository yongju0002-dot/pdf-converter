"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function SplitPage() {
  const t = useTranslations("SplitPage");
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"all" | "range">("all");
  const [ranges, setRanges] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);
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

  const handleSplit = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    if (mode === "range" && ranges.trim() === "") {
      setError(t("enterRange"));
      return;
    }
    setError(null);
    setIsSplitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      if (mode === "range") formData.append("ranges", ranges);

      const res = await fetch("/api/split", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("error"));
      }

      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] ?? "split.pdf";

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
      setIsSplitting(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Scissors}
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
        <ToggleGroup
          value={mode}
          onChange={setMode}
          options={[
            { value: "all", label: t("modeAll") },
            { value: "range", label: t("modeRange") },
          ]}
        />
      </div>

      {mode === "range" && (
        <div className="mt-4">
          <TextField
            value={ranges}
            onChange={setRanges}
            placeholder={t("rangePlaceholder")}
            hint={t("rangeHint")}
          />
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleSplit} disabled={!file || isSplitting}>
        {isSplitting ? t("splitting") : t("submit")}
      </SubmitButton>
    </ToolPageShell>
  );
}

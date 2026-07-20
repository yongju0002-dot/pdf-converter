"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function ProtectPage() {
  const t = useTranslations("ProtectPage");
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<"add" | "remove">("add");
  const [password, setPassword] = useState("");
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

  const handleSubmit = async () => {
    if (!file) {
      setError(t("selectFile"));
      return;
    }
    if (password === "") {
      setError(t("enterPassword"));
      return;
    }
    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("action", action);
      formData.append("password", password);

      const res = await fetch("/api/protect", {
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
      a.download = action === "add" ? "protected.pdf" : "unprotected.pdf";
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
        icon={Lock}
        title={t("title")}
        description={t("description")}
      />

      <ToggleGroup
        value={action}
        onChange={setAction}
        options={[
          { value: "add", label: t("actionAdd") },
          { value: "remove", label: t("actionRemove") },
        ]}
      />

      <div className="mt-4">
        <FileDropzone
          rootProps={getRootProps()}
          inputProps={getInputProps()}
          isDragActive={isDragActive}
          fileName={file?.name}
        />
      </div>

      <div className="mt-6">
        <TextField
          label={action === "add" ? t("passwordLabelAdd") : t("passwordLabelRemove")}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={t("passwordPlaceholder")}
        />
      </div>

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleSubmit} disabled={!file || isProcessing}>
        {isProcessing
          ? t("processing")
          : action === "add"
            ? t("submitAdd")
            : t("submitRemove")}
      </SubmitButton>
    </ToolPageShell>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Lock } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function ProtectPage() {
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
      setError("PDF 파일을 선택해주세요.");
      return;
    }
    if (password === "") {
      setError("비밀번호를 입력해주세요.");
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
        throw new Error(data?.error ?? "처리 중 오류가 발생했습니다.");
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
      setError(e instanceof Error ? e.message : "처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Lock}
        title="암호 설정/해제"
        description="PDF에 비밀번호를 걸거나, 걸려 있는 비밀번호를 제거합니다."
      />

      <ToggleGroup
        value={action}
        onChange={setAction}
        options={[
          { value: "add", label: "암호 설정" },
          { value: "remove", label: "암호 해제" },
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
          label={action === "add" ? "설정할 비밀번호" : "현재 비밀번호"}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="비밀번호 입력"
        />
      </div>

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleSubmit} disabled={!file || isProcessing}>
        {isProcessing
          ? "처리 중..."
          : action === "add"
            ? "암호 설정하기"
            : "암호 해제하기"}
      </SubmitButton>
    </ToolPageShell>
  );
}

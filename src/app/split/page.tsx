"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Scissors } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function SplitPage() {
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
      setError("분할할 PDF 파일을 선택해주세요.");
      return;
    }
    if (mode === "range" && ranges.trim() === "") {
      setError("추출할 페이지 범위를 입력해주세요. 예: 1-3, 5, 8-10");
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
        throw new Error(data?.error ?? "분할 중 오류가 발생했습니다.");
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
      setError(e instanceof Error ? e.message : "분할 중 오류가 발생했습니다.");
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Scissors}
        title="PDF 분할"
        description="PDF를 페이지별로 나누거나 원하는 페이지만 추출합니다."
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
            { value: "all", label: "모든 페이지 개별 분리" },
            { value: "range", label: "원하는 페이지만 추출" },
          ]}
        />
      </div>

      {mode === "range" && (
        <div className="mt-4">
          <TextField
            value={ranges}
            onChange={setRanges}
            placeholder="예: 1-3, 5, 8-10"
            hint="쉼표로 구분해서 페이지 번호나 범위를 입력하세요."
          />
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Callout variant="error">{error}</Callout>
        </div>
      )}

      <SubmitButton onClick={handleSplit} disabled={!file || isSplitting}>
        {isSplitting ? "분할 중..." : "PDF 분할하기"}
      </SubmitButton>
    </ToolPageShell>
  );
}

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Droplets } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { PageHeader } from "@/components/ui/PageHeader";
import { SliderField } from "@/components/ui/SliderField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TextField } from "@/components/ui/TextField";
import { ToolPageShell } from "@/components/ui/ToolPageShell";

export default function WatermarkPage() {
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
      setError("워터마크를 추가할 PDF 파일을 선택해주세요.");
      return;
    }
    if (text.trim() === "") {
      setError("워터마크 텍스트를 입력해주세요.");
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
        throw new Error(data?.error ?? "워터마크 추가 중 오류가 발생했습니다.");
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
      setError(
        e instanceof Error ? e.message : "워터마크 추가 중 오류가 발생했습니다.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolPageShell>
      <PageHeader
        icon={Droplets}
        title="워터마크 추가"
        description="모든 페이지에 대각선 텍스트 워터마크를 삽입합니다."
      />

      <FileDropzone
        rootProps={getRootProps()}
        inputProps={getInputProps()}
        isDragActive={isDragActive}
        fileName={file?.name}
      />

      <div className="mt-6 space-y-5">
        <TextField label="워터마크 텍스트" value={text} onChange={setText} />

        <SliderField
          label="투명도"
          valueLabel={`${Math.round(opacity * 100)}%`}
          min={5}
          max={100}
          value={Math.round(opacity * 100)}
          onChange={(value) => setOpacity(value / 100)}
        />

        <SliderField
          label="글자 크기"
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
        {isProcessing ? "적용 중..." : "워터마크 추가하기"}
      </SubmitButton>
    </ToolPageShell>
  );
}

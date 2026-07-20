import { File as FileIcon, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

type Props = {
  rootProps: DropzoneRootProps;
  inputProps: DropzoneInputProps;
  isDragActive: boolean;
  fileName?: string | null;
  placeholder?: string;
};

export function FileDropzone({
  rootProps,
  inputProps,
  isDragActive,
  fileName,
  placeholder,
}: Props) {
  const t = useTranslations("Common");
  const resolvedPlaceholder = placeholder ?? t("dropzonePlaceholder");

  return (
    <div
      {...rootProps}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-150 ${
        isDragActive
          ? "border-indigo-400 bg-indigo-50/70 dark:border-indigo-500 dark:bg-indigo-500/10"
          : "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-600 dark:hover:bg-indigo-500/5"
      }`}
    >
      <input {...inputProps} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-indigo-100 dark:bg-zinc-800 dark:group-hover:bg-indigo-500/20">
        {fileName ? (
          <FileIcon
            className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
            strokeWidth={1.75}
          />
        ) : (
          <UploadCloud
            className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
            strokeWidth={1.75}
          />
        )}
      </div>
      {fileName ? (
        <>
          <p className="max-w-full truncate text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {fileName}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t("dropzoneChangeHint")}
          </p>
        </>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {resolvedPlaceholder}
        </p>
      )}
    </div>
  );
}

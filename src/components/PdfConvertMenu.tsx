"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { HoverDropdown } from "@/components/HoverDropdown";
import { ToolLink } from "@/components/ToolLink";
import { tools } from "@/lib/tools";

const fromPdfTools = tools.filter(
  (tool) => tool.available && tool.slug.startsWith("pdf_to_"),
);
const toPdfTools = tools.filter(
  (tool) =>
    tool.available && tool.category !== "edit" && !tool.slug.startsWith("pdf_to_"),
);

export function PdfConvertMenu() {
  const t = useTranslations("Header");
  const tCategories = useTranslations("Categories");

  return (
    <HoverDropdown
      label={t("pdfConvert")}
      icon={<ArrowLeftRight className="h-4 w-4" strokeWidth={1.75} />}
      panelClassName="sm:w-[480px]"
    >
      {(close) => (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {tCategories("fromPdf")}
            </h3>
            <ul className="space-y-0.5">
              {fromPdfTools.map((tool) => (
                <ToolLink key={tool.slug} tool={tool} onNavigate={close} />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {tCategories("toPdf")}
            </h3>
            <ul className="space-y-0.5">
              {toPdfTools.map((tool) => (
                <ToolLink key={tool.slug} tool={tool} onNavigate={close} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </HoverDropdown>
  );
}

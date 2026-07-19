"use client";

import { LayoutGrid } from "lucide-react";
import { HoverDropdown } from "@/components/HoverDropdown";
import { ToolLink } from "@/components/ToolLink";
import { categoryMeta, tools } from "@/lib/tools";

const editTools = tools.filter((tool) => tool.available && tool.category === "edit");
const fromPdfTools = tools.filter(
  (tool) => tool.available && tool.slug.startsWith("pdf-to-"),
);
const toPdfTools = tools.filter(
  (tool) =>
    tool.available && tool.category !== "edit" && !tool.slug.startsWith("pdf-to-"),
);

export function NavMenu() {
  return (
    <HoverDropdown
      label="모든 도구"
      icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.75} />}
      panelClassName="sm:w-[720px]"
    >
      {(close) => (
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {categoryMeta.edit.label}
            </h3>
            <ul className="space-y-0.5">
              {editTools.map((tool) => (
                <ToolLink key={tool.slug} tool={tool} onNavigate={close} />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              PDF에서 변환
            </h3>
            <ul className="space-y-0.5">
              {fromPdfTools.map((tool) => (
                <ToolLink key={tool.slug} tool={tool} onNavigate={close} />
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              PDF로 변환
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

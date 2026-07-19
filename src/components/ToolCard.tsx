import Link from "next/link";
import type { CategoryMeta, Tool } from "@/lib/tools";

export function ToolCard({ tool, accent }: { tool: Tool; accent: CategoryMeta }) {
  const Icon = tool.icon;

  if (!tool.available) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl grayscale ${accent.iconBg} ${accent.iconBgDark}`}
        >
          <Icon
            className={`h-5 w-5 ${accent.iconText} ${accent.iconTextDark}`}
            strokeWidth={1.75}
          />
        </div>
        <h3 className="mt-3 font-semibold text-zinc-700 dark:text-zinc-300">
          {tool.name}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          {tool.description}
        </p>
        <span className="mt-3 inline-block rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          준비중
        </span>
      </div>
    );
  }

  return (
    <Link
      href={`/${tool.slug}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:shadow-black/20"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${accent.iconBg} ${accent.iconBgDark}`}
      >
        <Icon
          className={`h-5 w-5 ${accent.iconText} ${accent.iconTextDark}`}
          strokeWidth={1.75}
        />
      </div>
      <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-50">
        {tool.name}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {tool.description}
      </p>
    </Link>
  );
}

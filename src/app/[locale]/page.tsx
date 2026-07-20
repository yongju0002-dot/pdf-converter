import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/ToolCard";
import { categoryMeta, tools } from "@/lib/tools";

export default function Home() {
  const t = useTranslations("Home");
  const availableTools = tools.filter((tool) => tool.available);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
          {t("badge", { count: tools.length })}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {availableTools.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            accent={categoryMeta[tool.category]}
          />
        ))}
      </div>
    </div>
  );
}

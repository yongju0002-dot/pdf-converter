import { ToolCard } from "@/components/ToolCard";
import { categoryMeta, tools } from "@/lib/tools";

export default function Home() {
  const availableTools = tools.filter((tool) => tool.available);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
          ✨ {tools.length}개 도구, 전부 무료
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          모든 PDF 작업을 한곳에서
        </h1>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          병합, 분할, 압축, 변환까지 — 가입 없이 무료로 이용하세요.
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

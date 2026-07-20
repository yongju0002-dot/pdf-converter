import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categoryMeta, type Tool } from "@/lib/tools";

export function ToolLink({
  tool,
  onNavigate,
}: {
  tool: Tool;
  onNavigate: () => void;
}) {
  const t = useTranslations("Tools");
  const Icon = tool.icon;
  const meta = categoryMeta[tool.category];

  return (
    <li>
      <Link
        href={`/${tool.slug}`}
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.iconBg} ${meta.iconBgDark}`}
        >
          <Icon
            className={`h-3.5 w-3.5 ${meta.iconText} ${meta.iconTextDark}`}
            strokeWidth={1.75}
          />
        </span>
        {t(`${tool.slug}.name`)}
      </Link>
    </li>
  );
}

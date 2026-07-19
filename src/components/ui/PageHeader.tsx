import type { LucideIcon } from "lucide-react";
import { Callout } from "@/components/ui/Callout";

type Props = {
  icon: LucideIcon;
  iconBg?: string;
  iconText?: string;
  title: string;
  description: string;
  warning?: string;
};

export function PageHeader({
  icon: Icon,
  iconBg = "bg-indigo-50 dark:bg-indigo-500/10",
  iconText = "text-indigo-600 dark:text-indigo-400",
  title,
  description,
  warning,
}: Props) {
  return (
    <div className="mb-8">
      <div
        className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg}`}
      >
        <Icon className={`h-7 w-7 ${iconText}`} strokeWidth={1.75} />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {warning && (
        <div className="mt-4">
          <Callout variant="warning">{warning}</Callout>
        </div>
      )}
    </div>
  );
}

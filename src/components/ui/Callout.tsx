type Variant = "error" | "warning" | "success";

const variantStyles: Record<Variant, string> = {
  error:
    "border-red-100 bg-red-50 text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400",
  warning:
    "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400",
};

export function Callout({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`rounded-xl border px-4 py-2.5 text-sm leading-relaxed ${variantStyles[variant]}`}
    >
      {children}
    </p>
  );
}

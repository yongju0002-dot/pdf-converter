type Option<T extends string> = { value: T; label: string };

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
            value === option.value
              ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-500/5"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

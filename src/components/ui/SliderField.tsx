type Props = {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
};

export function SliderField({
  label,
  valueLabel,
  min,
  max,
  value,
  onChange,
  hint,
}: Props) {
  return (
    <div>
      <label className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <span>{label}</span>
        <span className="text-zinc-400 dark:text-zinc-500">{valueLabel}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full"
      />
      {hint && (
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}

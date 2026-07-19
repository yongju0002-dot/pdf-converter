import type { ButtonHTMLAttributes } from "react";

export function SubmitButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all duration-150 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 disabled:shadow-none dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 ${className}`}
    >
      {children}
    </button>
  );
}

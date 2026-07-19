"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  label: string;
  icon: ReactNode;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
};

export function HoverDropdown({ label, icon, panelClassName = "", children }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };
  // Doesn't clear closeTimer here (unlike openNow/closeSoon) so this stays a
  // plain state setter - it gets handed to `children` as a render-prop
  // callback, and referencing the ref there would break the rules of React.
  // A stale pending closeSoon timeout is harmless: it just calls
  // setOpen(false) again after this already has.
  const closeNow = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={openNow}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {icon}
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`fixed inset-x-4 top-[64px] z-20 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/10 sm:absolute sm:inset-x-auto sm:top-full sm:left-1/2 sm:mt-2 sm:-translate-x-1/2 sm:overflow-visible dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30 ${panelClassName}`}
        >
          {children(closeNow)}
        </div>
      )}
    </div>
  );
}

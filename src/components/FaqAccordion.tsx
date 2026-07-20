"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.q}
            className={`overflow-hidden rounded-2xl border transition-colors duration-150 ${
              isOpen
                ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/30 dark:bg-indigo-500/[0.07]"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-100">
                {item.q}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-150 ${
                  isOpen
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </span>
            </button>
            <div
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

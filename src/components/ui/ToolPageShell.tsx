export function ToolPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12 sm:py-16">
      {children}
    </div>
  );
}

import { cn } from "@/lib/utils";

export function BrandMark({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-xl ink-gradient text-primary-foreground shadow-soft"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" strokeWidth="2.2" stroke="currentColor">
          <path d="M4 12c0-4.5 3.5-8 8-8 2 0 3.5.6 4.5 1.8" strokeLinecap="round" />
          <path d="M20 12c0 4.5-3.5 8-8 8-2 0-3.5-.6-4.5-1.8" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      </span>
      {showWord && (
        <span className="font-display text-xl tracking-tight text-foreground">
          Reci<span className="text-primary">Peel</span>
        </span>
      )}
    </div>
  );
}

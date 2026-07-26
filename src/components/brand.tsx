import { cn } from "@/lib/utils";
import { ChefHat } from "lucide-react";

export function BrandMark({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105"
      >
        <ChefHat className="h-5 w-5 text-primary-foreground" />
      </span>
      {showWord && (
        <span className="font-display text-2xl tracking-tight text-foreground font-bold">
          Reci<span className="text-primary">Peel</span>
        </span>
      )}
    </div>
  );
}

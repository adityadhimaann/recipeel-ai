import { Loader2, ChefHat, Clock, Users, ArrowLeft } from "lucide-react";

export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="mx-auto w-full max-w-4xl px-6 py-8 flex-1">
        {/* Navigation Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-36 rounded-full bg-secondary/80 animate-pulse" />
          <div className="h-6 w-32 rounded-full bg-secondary/80 animate-pulse" />
        </div>

        {/* Recipe Title & Header Card Skeleton */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card mb-8 text-center sm:text-left space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 rounded-full bg-secondary animate-pulse" />
            <div className="h-6 w-36 rounded-full bg-primary-soft/50 animate-pulse" />
          </div>

          <div className="h-10 w-3/4 rounded-2xl bg-secondary animate-pulse" />
          <div className="h-4 w-1/2 rounded-xl bg-secondary/60 animate-pulse" />

          <div className="pt-4 border-t border-border/60 flex items-center gap-6">
            <div className="h-5 w-24 rounded-lg bg-secondary animate-pulse" />
            <div className="h-5 w-24 rounded-lg bg-secondary animate-pulse" />
            <div className="h-5 w-28 rounded-lg bg-secondary animate-pulse" />
          </div>
        </div>

        {/* Centered Loading Indicator Banner */}
        <div className="rounded-3xl border border-primary/30 bg-primary-soft/20 p-8 text-center shadow-card mb-8">
          <div className="relative mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary shadow-soft">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <ChefHat className="absolute h-5 w-5 text-primary/40" />
          </div>
          <h3 className="font-display text-xl text-foreground font-semibold">Opening Recipe...</h3>
          <p className="mt-1 text-xs text-muted-foreground">Fetching full ingredient lists, preparation steps, and dietary safety metrics.</p>
        </div>

        {/* Macro Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-4 text-center">
              <div className="h-3 w-16 mx-auto rounded-md bg-secondary animate-pulse mb-2" />
              <div className="h-7 w-20 mx-auto rounded-lg bg-secondary animate-pulse" />
            </div>
          ))}
        </div>

        {/* Ingredients Skeleton */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card mb-8 space-y-4">
          <div className="h-7 w-36 rounded-xl bg-secondary animate-pulse mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-2xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}

import { getRecipeById } from "@/app/actions/recipe-import";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Flame,
  Info,
  Scale,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { notFound } from "next/navigation";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRecipeById(id);

  if (!data || !data.recipe) {
    notFound();
  }

  const { recipe, ingredients, conflicts } = data;

  const totalCal = Number(recipe.totalCalories || 0);
  const totalProtein = Number(recipe.totalProteinG || 0);
  const totalCarbs = Number(recipe.totalCarbsG || 0);
  const totalFat = Number(recipe.totalFatG || 0);

  const origCal = Number(recipe.originalTotalCalories || totalCal + 50);
  const origProtein = Number(recipe.originalTotalProteinG || totalProtein);

  const substitutedIngredients = ingredients.filter((i) => i.isSubstituted);
  const hasSubstitutions = substitutedIngredients.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="mx-auto w-full max-w-4xl px-6 py-8 flex-1">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Saved to Library
          </span>
        </div>

        {/* Recipe Title & Header Card */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
              {recipe.sourcePlatform || "recipe"}
            </span>
            {hasSubstitutions && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> {substitutedIngredients.length} Ingredient Swap(s) Applied
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl text-foreground">{recipe.title}</h1>
          {recipe.description && (
            <p className="mt-2 text-sm text-muted-foreground">{recipe.description}</p>
          )}

          <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/60">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Clock className="h-4 w-4 text-primary" /> {recipe.cookTimeMinutes || 25} mins
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-4 w-4 text-primary" /> {recipe.servings || 4} servings
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <ChefHat className="h-4 w-4 text-primary" /> {ingredients.length} ingredients
            </span>
          </div>
        </div>

        {/* BEFORE & AFTER NUTRITION COMPARISON (IF SUBSTITUTIONS MADE) */}
        {hasSubstitutions && (
          <div className="rounded-3xl border border-primary/30 bg-primary-soft/30 p-6 shadow-card mb-8">
            <h2 className="font-display text-xl text-foreground mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Substitution & Safety Impact
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Here is how your dietary ingredient swaps affected total recipe nutrition:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Original Calories</span>
                <p className="mt-1 font-display text-lg font-semibold text-muted-foreground line-through">{origCal} kcal</p>
                <p className="font-display text-xl font-bold text-emerald-600">{totalCal} kcal</p>
                <span className="text-[10px] font-bold text-emerald-600">({totalCal - origCal} kcal)</span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Protein</span>
                <p className="mt-1 font-display text-xl font-bold text-primary">{totalProtein}g</p>
                <span className="text-[10px] text-muted-foreground">High Protein</span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Carbs</span>
                <p className="mt-1 font-display text-xl font-bold text-foreground">{totalCarbs}g</p>
                <span className="text-[10px] text-muted-foreground">Net Carbs</span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Fat</span>
                <p className="mt-1 font-display text-xl font-bold text-foreground">{totalFat}g</p>
                <span className="text-[10px] text-muted-foreground">Healthy Fats</span>
              </div>
            </div>
          </div>
        )}

        {/* INGREDIENTS LIST */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card mb-8">
          <h2 className="font-display text-2xl text-foreground mb-6">Ingredients</h2>
          <div className="divide-y divide-border/60">
            {ingredients.map((ing) => (
              <div key={ing.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {ing.name} {ing.quantity && <span className="text-muted-foreground">({ing.quantity} {ing.unit})</span>}
                  </span>
                </div>
                {ing.isSubstituted && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <Check className="h-3.5 w-3.5" /> (substituted from original)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
          <h2 className="font-display text-2xl text-foreground mb-6">Preparation Instructions</h2>
          <ol className="space-y-4 text-sm text-foreground list-decimal list-inside">
            {((recipe.instructions as string[]) || []).map((step, idx) => (
              <li key={idx} className="leading-relaxed pl-2">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}

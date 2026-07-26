"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  ShoppingBasket,
  ChefHat,
  Salad,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  Heart,
  Clock,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SampleRecipe {
  id: string;
  title: string;
  url: string;
  platform: "TikTok" | "Instagram Reel" | "YouTube Shorts";
  image: string;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: { label: string; type: "safe" | "warn" | "danger" }[];
  ingredients: { name: string; amount: string; swap?: string; swapDelta?: string; conflict?: string }[];
}

const SAMPLE_RECIPES: SampleRecipe[] = [
  {
    id: "salmon",
    title: "Honey Garlic Salmon Bowls",
    url: "https://tiktok.com/@chef/video/honey-garlic-salmon",
    platform: "TikTok",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    cookTime: 20,
    servings: 2,
    calories: 482,
    protein: 38,
    carbs: 42,
    fat: 18,
    tags: [
      { label: "✓ Pescatarian", type: "safe" },
      { label: "✓ Dairy-Free", type: "safe" },
      { label: "⚠ Soy Conflict", type: "warn" },
    ],
    ingredients: [
      { name: "Soy Sauce", amount: "2 tbsp", swap: "Tamari (Gluten-Free)", swapDelta: "-40 cal", conflict: "Contains Soy & Wheat" },
      { name: "Raw Salmon Fillet", amount: "1 lb" },
      { name: "Honey", amount: "1 tbsp" },
      { name: "Jasmine Rice", amount: "1 cup cooked" },
    ],
  },
  {
    id: "avocado",
    title: "Gluten-Free Poached Egg Avocado Toast",
    url: "https://instagram.com/reels/avocado-toast-gf",
    platform: "Instagram Reel",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    cookTime: 12,
    servings: 1,
    calories: 340,
    protein: 16,
    carbs: 28,
    fat: 19,
    tags: [
      { label: "✓ Vegetarian", type: "safe" },
      { label: "✓ Gluten-Free", type: "safe" },
      { label: "✓ Dairy-Free", type: "safe" },
    ],
    ingredients: [
      { name: "Gluten-Free Artisan Bread", amount: "2 slices" },
      { name: "Ripe Hass Avocado", amount: "1 whole" },
      { name: "Organic Eggs", amount: "2 poached" },
      { name: "Everything Bagel Seasoning", amount: "1 tsp" },
    ],
  },
  {
    id: "chicken",
    title: "High-Protein Chicken Teriyaki Meal Prep",
    url: "https://youtube.com/shorts/teriyaki-chicken-prep",
    platform: "YouTube Shorts",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",
    cookTime: 25,
    servings: 4,
    calories: 520,
    protein: 46,
    carbs: 54,
    fat: 12,
    tags: [
      { label: "✓ High Protein", type: "safe" },
      { label: "✓ Dairy-Free", type: "safe" },
      { label: "⚠ Peanut Allergy Warning", type: "danger" },
    ],
    ingredients: [
      { name: "Chicken Breast", amount: "1.5 lbs" },
      { name: "Peanut Oil", amount: "1 tbsp", swap: "Avocado Oil", swapDelta: "Allergy Safe", conflict: "Peanut Allergy Alert!" },
      { name: "Teriyaki Glaze", amount: "3 tbsp" },
      { name: "Steamed Broccoli & Rice", amount: "2 cups" },
    ],
  },
];

export default function Landing() {
  const [selectedDemo, setSelectedDemo] = useState<SampleRecipe>(SAMPLE_RECIPES[0]);
  const [appliedSwaps, setAppliedSwaps] = useState<Record<string, boolean>>({});

  function toggleSwap(ingName: string) {
    setAppliedSwaps((prev) => ({
      ...prev,
      [ingName]: !prev[ingName],
    }));
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6">
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 gap-12 pt-10 pb-20 md:grid-cols-2 md:items-center md:pt-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs">
              <ChefHat className="h-4 w-4" />
              AI Recipe Importer & Dietary Safety Screening
            </span>

            <h1 className="mt-6 font-display text-5xl leading-[1.08] text-foreground md:text-6xl font-bold">
              Cook it <em className="text-primary not-italic font-normal">your way</em> — safely, calmly, every week.
            </h1>

            <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
              Paste any TikTok, Instagram Reel, or YouTube Shorts link. ReciPeel extracts the recipe, screens ingredients against your allergies & dietary goals, and offers instant smart swaps with live macro previews.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth?mode=signup"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift active:scale-95"
              >
                Start Free Onboarding
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/auth?mode=signin"
                className="rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-surface-2 transition active:scale-95"
              >
                Sign In to Kitchen
              </Link>
            </div>

            {/* Trust points */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground border-t border-border/60 pt-6">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Hard Allergy Shields
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> 44+ Seeded Swaps
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> TDEE Macro Calculator
              </span>
            </div>
          </div>

          {/* INTERACTIVE LIVE DEMO PREVIEW CARD */}
          <div className="relative">
            {/* Suggestive Sample Link Selector Bar */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                Try Sample Import:
              </span>
              {SAMPLE_RECIPES.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => {
                    setSelectedDemo(rec);
                    setAppliedSwaps({});
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                    selectedDemo.id === rec.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {rec.platform}: {rec.title.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Card Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDemo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6 shadow-lift border border-border/80 rounded-3xl"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3 text-xs">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <Play className="h-3.5 w-3.5 text-primary fill-primary" />
                    <span className="truncate max-w-[220px]">{selectedDemo.url}</span>
                  </div>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-bold text-primary">
                    Live Demo
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display font-bold text-2xl text-foreground">{selectedDemo.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedDemo.cookTime} mins cook time · {selectedDemo.servings} servings
                      </p>
                    </div>
                  </div>

                  {/* Safety Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedDemo.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          t.type === "safe"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : t.type === "warn"
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-rose-500/15 text-rose-700"
                        }`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>

                  {/* Ingredient list with interactive swap toggle */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Ingredients & Smart Substitutions:
                    </p>
                    {selectedDemo.ingredients.map((ing, idx) => {
                      const isSwapped = appliedSwaps[ing.name];

                      return (
                        <div
                          key={idx}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-surface-2/80 px-3.5 py-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{ing.amount}</span>
                            <span className={isSwapped ? "line-through text-muted-foreground" : "text-foreground"}>
                              {ing.name}
                            </span>
                            {ing.swap && isSwapped && (
                              <span className="font-bold text-primary">→ {ing.swap}</span>
                            )}
                          </div>

                          {ing.swap && (
                            <button
                              onClick={() => toggleSwap(ing.name)}
                              className={`rounded-full px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                                isSwapped
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : "bg-primary-soft text-primary hover:bg-primary/20"
                              }`}
                            >
                              {isSwapped ? "✓ Swapped" : `Swap → ${ing.swap}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Macros grid */}
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                    <Stat label="Calories" value={`${selectedDemo.calories} cal`} />
                    <Stat label="Protein" value={`${selectedDemo.protein}g`} />
                    <Stat label="Carbs" value={`${selectedDemo.carbs}g`} />
                    <Stat label="Fat" value={`${selectedDemo.fat}g`} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute -inset-x-8 -bottom-8 -z-10 h-40 rounded-full bg-primary/15 blur-3xl" />
          </div>
        </section>

        {/* HOW IT WORKS 3-STEP WALKTHROUGH */}
        <section className="py-16 border-t border-border/60">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Simple 3-Step Process</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
              From TikTok video to safe weekly meal in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <WalkstepCard
              step="1"
              icon={<Play className="h-5 w-5 text-primary" />}
              title="Paste Video Link"
              body="Copy any TikTok, Reel or Shorts URL. ReciPeel automatically extracts ingredients, measurements, and cooking instructions."
            />
            <WalkstepCard
              step="2"
              icon={<ShieldCheck className="h-5 w-5 text-primary" />}
              title="Screen Allergies & Diets"
              body="Instantly flags RED hard allergy risks (peanuts, shellfish) and AMBER soft preference warnings (dairy, gluten, keto)."
            />
            <WalkstepCard
              step="3"
              icon={<Zap className="h-5 w-5 text-primary" />}
              title="Swap & Macro Track"
              body="Apply 1-click ingredient substitutions with live nutrition previews, save to your library, and plan your week."
            />
          </div>
        </section>

        {/* SUGGESTIVE COMMUNITY RECIPE SHOWCASE */}
        <section className="py-16 border-t border-border/60">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Popular Imports</span>
              <h2 className="mt-1 font-display text-3xl font-bold text-foreground">
                Explore popular community imports
              </h2>
            </div>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Browse complete library →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_RECIPES.map((rec) => (
              <div
                key={rec.id}
                className="group overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-card hover-lift transition"
              >
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-background/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-foreground shadow-xs">
                    {rec.platform}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition">
                    {rec.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {rec.cookTime}m</span>
                    <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-amber-500" /> {rec.calories} cal</span>
                    <span className="font-semibold text-primary">{rec.protein}g protein</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {rec.tags.map((t, idx) => (
                      <span key={idx} className="rounded-full bg-primary-soft/60 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION BANNER */}
        <section className="my-16 rounded-3xl border border-primary/30 bg-primary-soft p-10 text-center shadow-card relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow-xs">
              <ChefHat className="h-3.5 w-3.5" /> Get Started in 2 Minutes
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              Ready to import & screen your favorite recipes?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set up your diet profile once, then every TikTok, Reel, or recipe you import gets checked automatically.
            </p>
            <div className="pt-2">
              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-lift transition active:scale-95"
              >
                Start Onboarding Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ReciPeel · Cook it your way safely & calmly.
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2/90 border border-border/40 py-2">
      <div className="font-display text-sm font-bold text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function WalkstepCard({ step, icon, title, body }: { step: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 hover-lift transition shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft">{icon}</div>
        <span className="font-display text-2xl font-bold text-primary/30">0{step}</span>
      </div>
      <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

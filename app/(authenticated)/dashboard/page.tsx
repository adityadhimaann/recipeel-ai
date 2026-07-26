"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile } from "@/app/actions/profile";
import { ChefBot } from "@/components/chef-bot";
import { ShieldCheck, Activity, Salad, CalendarDays, ShoppingBasket, MapPin, ChefHat } from "lucide-react";
export default function Dashboard() {
  const [name, setName] = useState<string>("there");
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getProfile();
      if (data?.name) setName(data.name.split(" ")[0]);
      setOnboarded(data ? !!data.onboarded : false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="mt-1 font-display text-4xl text-foreground">Hi {name} 👋</h1>
          </div>
        </div>

        {onboarded === false && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary-soft p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-display text-lg">Finish setting up your diet profile</p>
                <p className="text-sm text-muted-foreground">Two minutes — then every recipe you import gets checked automatically.</p>
              </div>
            </div>
            <Link
              href="/onboarding"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-lift"
            >
              Start onboarding
            </Link>
          </div>
        )}

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/recipes/import" className="rounded-2xl border border-primary/40 bg-surface p-5 hover-lift transition group shadow-soft hover:shadow-lift">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">{<ChefHat className="h-5 w-5" />}</div>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-primary">Live Now</span>
            </div>
            <h3 className="mt-4 font-display text-lg group-hover:text-primary transition">Import a recipe</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paste a TikTok / Reel / YouTube URL or enter ingredients. AI checks dietary safety & swaps ingredients.</p>
          </Link>
          <Link href="/recipes" className="rounded-2xl border border-primary/40 bg-surface p-5 hover-lift transition group shadow-soft hover:shadow-lift">
            <div className="flex items-center justify-between">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">{<Salad className="h-5 w-5" />}</div>
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-primary">Live Now</span>
            </div>
            <h3 className="mt-4 font-display text-lg group-hover:text-primary transition">Recipe library</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse, filter by diet-safety, organize into folders, add tags, and favorite recipes.</p>
          </Link>
          <SoonCard icon={<CalendarDays className="h-5 w-5" />} title="Weekly planner" body="Drag recipes into breakfast, lunch, dinner and snacks." />
          <SoonCard icon={<ShoppingBasket className="h-5 w-5" />} title="Grocery list" body="Auto-generated from your plan, sorted by aisle." />
          <SoonCard icon={<MapPin className="h-5 w-5" />} title="Safe eats near me" body="Map of diet-safe stores and restaurants." />
          <SoonCard icon={<Activity className="h-5 w-5" />} title="Nutrition dashboard" body="Calories, macros, streaks and weekly trend." />
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Phase 1 shipped: schema, auth, and 42 seeded substitution rules. Onboarding + import loop next.
        </p>
      </main>

      {/* Floating SousChef AI Chatbot */}
      <ChefBot />
    </div>
  );
}

function SoonCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 hover-lift">
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Coming soon</span>
      </div>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

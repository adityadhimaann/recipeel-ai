import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/brand";
import { LogOut, Sparkles, Salad, CalendarDays, ShoppingBasket, MapPin, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your kitchen · ReciPeel" },
      { name: "description", content: "Your recipes, meal plan, grocery list and nutrition — all in one place." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState<string>("there");
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("name, onboarded").maybeSingle();
      if (data?.name) setName(data.name.split(" ")[0]);
      setOnboarded(!!data?.onboarded);
    })();
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <BrandMark />
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

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
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="font-display text-lg">Finish setting up your diet profile</p>
                <p className="text-sm text-muted-foreground">Two minutes — then every recipe you import gets checked automatically.</p>
              </div>
            </div>
            <Link
              to="/onboarding"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:shadow-lift"
            >
              Start onboarding
            </Link>
          </div>
        )}

        <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SoonCard icon={<ChefHat className="h-5 w-5" />} title="Import a recipe" body="Paste a TikTok / Reel / YouTube URL. AI extracts ingredients + steps." />
          <SoonCard icon={<Salad className="h-5 w-5" />} title="Recipe library" body="Browse, filter, favorite. Diet-safety badge on every card." />
          <SoonCard icon={<CalendarDays className="h-5 w-5" />} title="Weekly planner" body="Drag recipes into breakfast, lunch, dinner and snacks." />
          <SoonCard icon={<ShoppingBasket className="h-5 w-5" />} title="Grocery list" body="Auto-generated from your plan, sorted by aisle." />
          <SoonCard icon={<MapPin className="h-5 w-5" />} title="Safe eats near me" body="Map of diet-safe stores and restaurants." />
          <SoonCard icon={<Sparkles className="h-5 w-5" />} title="Nutrition dashboard" body="Calories, macros, streaks and weekly trend." />
        </section>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Phase 1 shipped: schema, auth, and 42 seeded substitution rules. Onboarding + import loop next.
        </p>
      </main>
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

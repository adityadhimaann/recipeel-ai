import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/brand";
import { ArrowRight, Sparkles, ShieldCheck, CalendarDays, ShoppingBasket } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReciPeel — Cook it your way" },
      { name: "description", content: "Import any recipe. Detect diet & allergy conflicts. Swap ingredients with confidence. Plan your week." },
      { property: "og:title", content: "ReciPeel — Cook it your way" },
      { property: "og:description", content: "AI recipe import, dietary safety and smart meal planning in one calm space." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BrandMark />
        <nav className="flex items-center gap-3 text-sm">
          {signedIn ? (
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Open app
            </button>
          ) : (
            <>
              <Link to="/auth" className="rounded-full px-4 py-2 text-foreground/80 hover:text-foreground">
                Sign in
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-full bg-primary px-5 py-2 font-medium text-primary-foreground transition hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* HERO */}
        <section className="grid grid-cols-1 gap-12 pt-12 pb-24 md:grid-cols-2 md:items-center md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI recipe import, without the guesswork
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground md:text-6xl">
              Cook it <em className="text-primary not-italic">your</em> way — safely, calmly, every week.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Paste any TikTok, Reel or YouTube Short. ReciPeel extracts the recipe, flags conflicts with your diet and allergies, and suggests smart swaps — with a live nutrition impact preview.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:shadow-lift"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link to="/auth" className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:bg-muted">
                I have an account
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-danger" />
                <span className="h-2 w-2 rounded-full bg-warn" />
                <span className="h-2 w-2 rounded-full bg-safe" />
                <span className="ml-2 text-muted-foreground">honey-garlic-salmon.tiktok</span>
              </div>
              <div className="mt-5 space-y-3">
                <p className="font-display text-2xl text-foreground">Honey Garlic Salmon Bowls</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-safe-soft px-2.5 py-1 text-safe">✓ Pescatarian</span>
                  <span className="rounded-full bg-safe-soft px-2.5 py-1 text-safe">✓ Dairy-free</span>
                  <span className="rounded-full bg-warn-soft px-2.5 py-1 text-warn-foreground">⚠ Contains soy</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                    <span>2 tbsp soy sauce</span>
                    <span className="text-xs text-primary">Swap → tamari</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                    <span>1 tbsp honey</span>
                    <span className="text-xs text-muted-foreground">—</span>
                  </li>
                  <li className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                    <span>1 lb salmon</span>
                    <span className="text-xs text-muted-foreground">—</span>
                  </li>
                </ul>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <Stat label="cal" value="482" />
                  <Stat label="P" value="38g" />
                  <Stat label="C" value="42g" />
                  <Stat label="F" value="18g" />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-x-8 -bottom-8 -z-10 h-40 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Paste-in import" body="TikTok, Instagram Reels, YouTube Shorts — or manual entry." />
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Diet & allergy safe" body="Hard vs soft conflicts, inline, with a 'why?' for every flag." />
          <Feature icon={<CalendarDays className="h-5 w-5" />} title="Weekly planner" body="Drag recipes into slots. Mobile swipes day-by-day." />
          <Feature icon={<ShoppingBasket className="h-5 w-5" />} title="Smart grocery" body="Aisle-grouped, unit-merged, with a store-walking sort." />
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ReciPeel · Cook it your way
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 py-2">
      <div className="font-display text-base text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 hover-lift">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</div>
      <h3 className="mt-4 font-display text-lg text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

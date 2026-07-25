import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile · ReciPeel" },
      { name: "description", content: "Tell us your diets, allergies, goal and macro targets." },
    ],
  }),
  component: OnboardingPlaceholder,
});

function OnboardingPlaceholder() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-6xl px-6 py-6"><BrandMark /></header>
      <main className="mx-auto flex max-w-xl flex-col items-start px-6 py-16">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">Phase 2 · coming next</span>
        <h1 className="mt-4 font-display text-4xl">Onboarding wizard</h1>
        <p className="mt-3 text-muted-foreground">
          The multi-step onboarding (diets → allergies → goal → skill → budget → macros) is the next thing to ship. For now, skip to the dashboard to preview what's built.
        </p>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
        >
          Skip to dashboard
        </button>
      </main>
    </div>
  );
}

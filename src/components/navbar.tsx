"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand";
import { ArrowLeft, ChefHat, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function Navbar({ activeMode }: { activeMode?: "signin" | "signup" | "forgot" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out.");
    router.replace("/auth");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand logo link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition hover:opacity-90"
        >
          <BrandMark />
        </Link>

        {/* Center navigation links */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className={`transition hover:text-primary ${
              pathname === "/" ? "text-primary font-semibold" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 transition hover:text-primary ${
              pathname.startsWith("/dashboard")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            <ChefHat className="h-4 w-4" />
            Kitchen Planner
          </Link>
          <Link
            href="/onboarding"
            className={`flex items-center gap-1.5 transition hover:text-primary ${
              pathname.startsWith("/onboarding")
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            Diet Setup
          </Link>
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {pathname === "/auth" ? (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          ) : signedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-primary-soft px-4 py-2 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                My Kitchen
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition hover:border-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/auth?mode=signin"
                className="rounded-full px-4 py-2 text-xs font-medium text-foreground/80 transition hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-soft transition hover:shadow-lift"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

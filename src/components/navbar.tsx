"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand";
import { ArrowLeft, ChefHat, LogOut, ShieldCheck, Salad, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar({ activeMode }: { activeMode?: "signin" | "signup" | "forgot" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const signedIn = !!session?.user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out.");
    router.replace("/auth");
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Kitchen Planner", icon: ChefHat },
    { href: "/recipes", label: "Library", icon: Salad },
    { href: "/onboarding", label: "Diet Setup", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        {/* Brand logo link */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 transition hover:opacity-90 active:scale-98"
        >
          <BrandMark />
        </Link>

        {/* Center navigation links with animated active pill */}
        <nav className="hidden items-center gap-1 rounded-full border border-border/40 bg-surface/60 p-1 text-sm font-medium md:flex shadow-2xs">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-full bg-primary-soft/80 border border-primary/20 shadow-2xs"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "opacity-70"}`} />}
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="flex items-center gap-3">
          {pathname === "/auth" ? (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground transition hover:border-muted-foreground hover:text-foreground active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          ) : signedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex rounded-full bg-primary-soft px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95"
              >
                My Kitchen
              </Link>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-muted-foreground hover:text-foreground cursor-pointer active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth?mode=signin"
                className="rounded-full px-4 py-2 text-xs font-medium text-foreground/80 transition hover:text-foreground active:scale-95"
              >
                Sign in
              </Link>
              <Link
                href="/auth?mode=signup"
                className="rounded-full bg-primary px-5 py-2 text-xs font-medium text-primary-foreground shadow-soft transition hover:shadow-lift active:scale-95"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-foreground md:hidden cursor-pointer active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation slide-down menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-md md:hidden px-6 py-4 space-y-2 shadow-card"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary-soft text-primary font-bold"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand";
import {
  ArrowLeft,
  ChefHat,
  LogOut,
  ShieldCheck,
  Salad,
  Menu,
  X,
  Bell,
  User,
  Settings,
  SlidersHorizontal,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar({ activeMode }: { activeMode?: "signin" | "signup" | "forgot" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const signedIn = !!session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out.");
    router.replace("/auth");
  }

  if (pathname === "/auth") return null;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Kitchen Planner", icon: ChefHat },
    { href: "/recipes", label: "Library", icon: Salad },
    { href: "/onboarding", label: "Diet Setup", icon: ShieldCheck },
  ];

  const userDisplayName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

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

        {/* Right CTA & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative grid h-9 w-9 place-items-center rounded-full border border-border/80 bg-surface text-foreground transition hover:border-primary hover:text-primary active:scale-95 cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 rounded-3xl border border-border bg-surface shadow-lift p-4 z-50 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Bell className="h-4 w-4 text-primary" /> Notifications
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setUnreadCount(0)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    <div className="flex items-start gap-2.5 rounded-2xl bg-primary-soft/40 p-2.5 border border-primary/10">
                      <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Allergy Screening Active</p>
                        <p className="text-muted-foreground text-[11px]">Hard allergy shields enabled for peanuts, shellfish & dairy.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-2xl bg-surface-2 p-2.5 border border-border/40">
                      <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">44+ Seeded Swaps Ready</p>
                        <p className="text-muted-foreground text-[11px]">Ingredient substitution engine updated with macro impact previews.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-2xl bg-surface-2 p-2.5 border border-border/40">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">TDEE Daily Target Active</p>
                        <p className="text-muted-foreground text-[11px]">Daily calories and macros calculated from your onboarding profile.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Signed In User Profile Dropdown or Auth Links */}
          {signedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-border/80 bg-surface p-1 pr-3 text-xs font-semibold text-foreground transition hover:border-primary cursor-pointer active:scale-95 shadow-2xs"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                  {userInitial}
                </span>
                <span className="max-w-[100px] truncate hidden sm:inline">{userDisplayName}</span>
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 rounded-3xl border border-border bg-surface shadow-lift p-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                      <p className="font-bold text-foreground truncate">{userDisplayName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/onboarding"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-primary-soft hover:text-primary transition font-medium"
                      >
                        <SlidersHorizontal className="h-4 w-4" /> Profile & Diet Settings
                      </Link>
                      <Link
                        href="/recipes"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-primary-soft hover:text-primary transition font-medium"
                      >
                        <BookOpen className="h-4 w-4" /> My Recipe Library
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-muted-foreground hover:bg-primary-soft hover:text-primary transition font-medium"
                      >
                        <ChefHat className="h-4 w-4" /> Kitchen Planner
                      </Link>
                    </div>

                    <div className="border-t border-border/60 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-rose-600 hover:bg-rose-500/10 transition font-medium cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

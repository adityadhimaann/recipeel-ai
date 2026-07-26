"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z.string().min(8, { message: "At least 8 characters" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Enter a name" }).max(80);

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modeParam = searchParams.get("mode");
  const initialMode = (modeParam === "signup" || modeParam === "forgot") ? modeParam : "signin";

  const [current, setCurrent] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: session } = useSession();

  useEffect(() => {
    if (modeParam === "signup" || modeParam === "forgot" || modeParam === "signin") {
      setCurrent(modeParam);
    }
  }, [modeParam]);

  useEffect(() => {
    if (session?.user && !loading) {
      if (current === "signup") {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [session, router, current, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (current === "forgot") {
      const p = emailSchema.safeParse(email);
      if (!p.success) return setErrors({ email: p.error.issues[0].message });
      setLoading(true);
      const { error } = await (authClient as any).forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message ?? "Failed to send reset link.");
      toast.success("Reset email sent. Check your inbox.");
      setCurrent("signin");
      return;
    }

    const ep = emailSchema.safeParse(email);
    const pp = passwordSchema.safeParse(password);
    const nextErrors: Record<string, string> = {};
    if (!ep.success) nextErrors.email = ep.error.issues[0].message;
    if (!pp.success) nextErrors.password = pp.error.issues[0].message;
    if (current === "signup") {
      const np = nameSchema.safeParse(name);
      if (!np.success) nextErrors.name = np.error.issues[0].message;
    }
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setLoading(true);
    try {
      if (current === "signup") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/onboarding",
        });
        if (error) throw error;
        toast.success("Welcome to ReciPeel — let's set up your profile.");
        router.replace("/onboarding");
      } else {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        router.replace("/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 md:grid-cols-2">
      {/* Left brand panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground md:flex md:flex-col md:justify-between md:p-10">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-black/10 blur-3xl" />
        <BrandMark className="relative z-10 [&_span]:!text-primary-foreground [&_span_span]:!text-primary-foreground/70" />
        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl leading-tight">
            &quot;Finally — a place where my allergies aren&apos;t an afterthought.&quot;
          </p>
          <p className="mt-4 text-sm opacity-80">
            Every ingredient is checked against your diets and allergies. Swap what you need, keep what you love, plan the whole week.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3 text-xs opacity-90">
          <Badge>Vegan-aware</Badge>
          <Badge>Allergy-safe</Badge>
          <Badge>Macro-tracked</Badge>
        </div>
      </aside>

      {/* Right form panel */}
      <section className="flex flex-col justify-center px-6 py-12 md:px-16 relative">
        <div className="mx-auto w-full max-w-sm">
          {/* Back to Home Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition mb-8 shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>

          <div className="inline-flex md:hidden mb-4">
            <BrandMark />
          </div>

          <h1 className="font-display text-3xl text-foreground">
            {current === "signup" && "Create your account"}
            {current === "signin" && "Welcome back"}
            {current === "forgot" && "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {current === "signup" && "Two minutes to set up your diet profile — then paste in your first recipe."}
            {current === "signin" && "Sign in to open your planner and grocery list."}
            {current === "forgot" && "We'll email you a link to set a new password."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {current === "signup" && (
              <Field label="Name" error={errors.name}>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Chen" autoComplete="name"
                  className={inputCls}
                />
              </Field>
            )}
            <Field label="Email" error={errors.email}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email"
                className={inputCls}
              />
            </Field>
            {current !== "forgot" && (
              <Field
                label="Password"
                error={errors.password}
                right={current === "signin" ? (
                  <button type="button" onClick={() => setCurrent("forgot")} className="text-xs text-primary hover:underline cursor-pointer">
                    Forgot?
                  </button>
                ) : null}
              >
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete={current === "signup" ? "new-password" : "current-password"}
                  className={inputCls}
                />
              </Field>
            )}

            <button
              type="submit" disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:shadow-lift disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  {current === "signup" && "Create account"}
                  {current === "signin" && "Sign in"}
                  {current === "forgot" && "Send reset link"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {current === "signin" && (
              <>New here? <button className="text-primary hover:underline cursor-pointer" onClick={() => setCurrent("signup")}>Create an account</button></>
            )}
            {current === "signup" && (
              <>Already have an account? <button className="text-primary hover:underline cursor-pointer" onClick={() => setCurrent("signin")}>Sign in</button></>
            )}
            {current === "forgot" && (
              <>Remembered it? <button className="text-primary hover:underline cursor-pointer" onClick={() => setCurrent("signin")}>Back to sign in</button></>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AuthForm />
    </Suspense>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15";

function Field({ label, error, right, children }: { label: string; error?: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {right}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-center backdrop-blur">{children}</span>;
}

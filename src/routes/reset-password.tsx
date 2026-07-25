import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandMark } from "@/components/brand";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password · ReciPeel" },
      { name: "description", content: "Choose a new password for your ReciPeel account." },
      { property: "og:title", content: "Set new password · ReciPeel" },
      { property: "og:description", content: "Complete your password reset." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = z.string().min(8).max(72).safeParse(password);
    if (!p.success) return setError("Password must be at least 8 characters.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <BrandMark />
        <h1 className="mt-8 font-display text-3xl text-foreground">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose a fresh password for your account.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}

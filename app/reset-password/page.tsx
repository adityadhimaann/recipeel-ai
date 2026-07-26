"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { BrandMark } from "@/components/brand";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const p = z.string().min(8).max(72).safeParse(password);
    if (!p.success) return setError("Password must be at least 8 characters.");
    setLoading(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setLoading(false);
    if (error) return toast.error(error.message ?? "Failed to update password.");
    toast.success("Password updated.");
    router.replace("/dashboard");
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

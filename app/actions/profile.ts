"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { profiles, userPreferences } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getProfile() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [prof] = await db
      .select({
        name: profiles.name,
        onboarded: profiles.onboarded,
      })
      .from(profiles)
      .where(eq(profiles.id, userId));

    const [prefs] = await db
      .select({ userId: userPreferences.userId })
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    // If profile exists and is onboarded, OR if user has saved preferences, treat as onboarded
    const isOnboarded = (prof ? !!prof.onboarded : false) || !!prefs;

    return {
      name: prof?.name || session?.user?.name || "Chef",
      onboarded: isOnboarded,
    };
  } catch (e) {
    console.error("Failed to fetch profile:", e);
    return { name: "Chef", onboarded: false };
  }
}

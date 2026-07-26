"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { userPreferences, profiles } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getSavedPreferences() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fallback to a mock session user if auth guard is bypassed during testing
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    const [prof] = await db
      .select({ onboarded: profiles.onboarded })
      .from(profiles)
      .where(eq(profiles.id, userId));

    return {
      preferences: prefs || null,
      onboarded: prof?.onboarded ?? false,
      userId,
    };
  } catch (e) {
    console.error("Error fetching preferences:", e);
    return { preferences: null, onboarded: false, userId };
  }
}

export async function saveStepPreferences(data: Partial<{
  dietTypes: string[];
  allergies: string[];
  fitnessGoal: "lose" | "maintain" | "gain" | "cut" | "bulk";
  cookingSkill: "beginner" | "intermediate" | "advanced";
  timeAvailabilityMinutes: number;
  budgetTier: "budget" | "moderate" | "premium";
  dailyCalorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  heightCm: string | number;
  weightKg: string | number;
  age: number;
  sex: string;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || "mock-demo-user-id";

  const cleanedData: any = { ...data };
  if (cleanedData.heightCm !== undefined) cleanedData.heightCm = String(cleanedData.heightCm);
  if (cleanedData.weightKg !== undefined) cleanedData.weightKg = String(cleanedData.weightKg);

  try {
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (existing) {
      await db
        .update(userPreferences)
        .set({
          ...cleanedData,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        userId,
        ...cleanedData,
      });
    }
    return { success: true };
  } catch (e) {
    console.error("Failed to save step preferences:", e);
    return { success: false, error: String(e) };
  }
}

export async function completeOnboarding(finalData: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    await saveStepPreferences(finalData);

    // Update profile onboarded status
    await db
      .insert(profiles)
      .values({
        id: userId,
        email: session?.user?.email || "demo@example.com",
        name: session?.user?.name || "Chef",
        onboarded: true,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: { onboarded: true, updatedAt: new Date() },
      });

    return { success: true };
  } catch (e) {
    console.error("Failed to complete onboarding:", e);
    return { success: false, error: String(e) };
  }
}

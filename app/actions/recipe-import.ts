"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  recipes,
  ingredients,
  ingredientNutrition,
  substitutionRules,
  recipeConflicts,
  userPreferences,
} from "@/lib/schema";
import { eq, inArray, sql } from "drizzle-orm";

export async function fetchUserPreferencesForImport() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || { dietTypes: [], allergies: [] };
  } catch (e) {
    console.error("Failed to fetch preferences for import:", e);
    return { dietTypes: [], allergies: [] };
  }
}

export async function getMatchingSubstitutionRules() {
  try {
    const rules = await db.select().from(substitutionRules);
    return rules;
  } catch (e) {
    console.error("Failed to fetch substitution rules:", e);
    return [];
  }
}

export type SaveRecipePayload = {
  title: string;
  description?: string;
  sourceUrl?: string;
  sourcePlatform?: "tiktok" | "instagram" | "youtube" | "manual";
  cookTimeMinutes?: number;
  servings?: number;
  instructions: string[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  originalTotalCalories: number;
  originalTotalProteinG: number;
  originalTotalCarbsG: number;
  originalTotalFatG: number;
  ingredients: {
    name: string;
    quantity?: number;
    unit?: string;
    aisle?: string;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    isSubstituted?: boolean;
    originalName?: string;
  }[];
  conflicts?: {
    ingredientIndex: number;
    conflictType: "allergy" | "diet";
    severity: "hard" | "soft";
    status: "unresolved" | "substituted" | "ignored";
    matchedTag?: string;
  }[];
};

export async function saveImportedRecipe(payload: SaveRecipePayload) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    // 1. Insert recipe
    const [newRecipe] = await db
      .insert(recipes)
      .values({
        userId,
        title: payload.title,
        description: payload.description || "",
        sourceUrl: payload.sourceUrl || "",
        sourcePlatform: payload.sourcePlatform || "manual",
        cookTimeMinutes: payload.cookTimeMinutes || 20,
        servings: payload.servings || 2,
        instructions: payload.instructions,
        totalCalories: payload.totalCalories,
        totalProteinG: String(payload.totalProteinG),
        totalCarbsG: String(payload.totalCarbsG),
        totalFatG: String(payload.totalFatG),
        originalTotalCalories: payload.originalTotalCalories,
        originalTotalProteinG: String(payload.originalTotalProteinG),
        originalTotalCarbsG: String(payload.originalTotalCarbsG),
        originalTotalFatG: String(payload.originalTotalFatG),
      })
      .returning({ id: recipes.id });

    const recipeId = newRecipe.id;

    // 2. Insert ingredients & nutrition
    const createdIngredientIds: string[] = [];

    for (let i = 0; i < payload.ingredients.length; i++) {
      const ing = payload.ingredients[i];
      const [insertedIng] = await db
        .insert(ingredients)
        .values({
          recipeId,
          userId,
          name: ing.name,
          quantity: ing.quantity ? String(ing.quantity) : null,
          unit: ing.unit || "",
          orderIndex: i,
          aisle: ing.aisle || "General",
          isSubstituted: !!ing.isSubstituted,
        })
        .returning({ id: ingredients.id });

      createdIngredientIds.push(insertedIng.id);

      await db.insert(ingredientNutrition).values({
        ingredientId: insertedIng.id,
        userId,
        calories: String(ing.calories || 0),
        proteinG: String(ing.proteinG || 0),
        carbsG: String(ing.carbsG || 0),
        fatG: String(ing.fatG || 0),
      });
    }

    // 3. Insert conflicts if any remain ignored
    if (payload.conflicts && payload.conflicts.length) {
      for (const conf of payload.conflicts) {
        const ingId = createdIngredientIds[conf.ingredientIndex];
        if (ingId) {
          await db.insert(recipeConflicts).values({
            recipeId,
            ingredientId: ingId,
            userId,
            conflictType: conf.conflictType,
            severity: conf.severity,
            status: conf.status,
            matchedTag: conf.matchedTag || "",
          });
        }
      }
    }

    return { success: true, recipeId };
  } catch (e: any) {
    console.error("Failed to save imported recipe:", e);
    return { success: false, error: e?.message || String(e) };
  }
}

export async function getRecipeById(recipeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [rec] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId));

    if (!rec) return null;

    const ingList = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        quantity: ingredients.quantity,
        unit: ingredients.unit,
        orderIndex: ingredients.orderIndex,
        aisle: ingredients.aisle,
        isSubstituted: ingredients.isSubstituted,
        calories: ingredientNutrition.calories,
        proteinG: ingredientNutrition.proteinG,
        carbsG: ingredientNutrition.carbsG,
        fatG: ingredientNutrition.fatG,
      })
      .from(ingredients)
      .leftJoin(
        ingredientNutrition,
        eq(ingredients.id, ingredientNutrition.ingredientId)
      )
      .where(eq(ingredients.recipeId, recipeId));

    const conflictsList = await db
      .select()
      .from(recipeConflicts)
      .where(eq(recipeConflicts.recipeId, recipeId));

    return {
      recipe: rec,
      ingredients: ingList,
      conflicts: conflictsList,
    };
  } catch (e) {
    console.error("Failed to get recipe by id:", e);
    return null;
  }
}

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  recipes,
  ingredients,
  favorites,
  folders,
  recipeFolders,
  recipeTags,
  recipeConflicts,
} from "@/lib/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function getLibraryRecipes() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    // 1. Fetch user's recipes
    const userRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId));

    if (userRecipes.length === 0) {
      return { recipes: [], foldersList: [], allTags: [] };
    }

    const recipeIds = userRecipes.map((r) => r.id);

    // 2. Fetch favorites
    const favs = await db
      .select({ recipeId: favorites.recipeId })
      .from(favorites)
      .where(eq(favorites.userId, userId));
    const favSet = new Set(favs.map((f) => f.recipeId));

    // 3. Fetch ingredients for search matching
    const ings = await db
      .select({ recipeId: ingredients.recipeId, name: ingredients.name })
      .from(ingredients)
      .where(inArray(ingredients.recipeId, recipeIds));

    const ingMap: Record<string, string[]> = {};
    for (const i of ings) {
      if (!ingMap[i.recipeId]) ingMap[i.recipeId] = [];
      ingMap[i.recipeId].push(i.name);
    }

    // 4. Fetch tags
    const tagsData = await db
      .select({ recipeId: recipeTags.recipeId, tag: recipeTags.tag })
      .from(recipeTags)
      .where(inArray(recipeTags.recipeId, recipeIds));

    const tagMap: Record<string, string[]> = {};
    const allTagsSet = new Set<string>();
    for (const t of tagsData) {
      if (!tagMap[t.recipeId]) tagMap[t.recipeId] = [];
      tagMap[t.recipeId].push(t.tag);
      allTagsSet.add(t.tag);
    }

    // 5. Fetch assigned folders
    const recFolders = await db
      .select({ recipeId: recipeFolders.recipeId, folderId: recipeFolders.folderId })
      .from(recipeFolders)
      .where(inArray(recipeFolders.recipeId, recipeIds));

    const folderMap: Record<string, string[]> = {};
    for (const rf of recFolders) {
      if (!folderMap[rf.recipeId]) folderMap[rf.recipeId] = [];
      folderMap[rf.recipeId].push(rf.folderId);
    }

    // 6. Fetch conflicts
    const confs = await db
      .select({
        recipeId: recipeConflicts.recipeId,
        status: recipeConflicts.status,
        severity: recipeConflicts.severity,
      })
      .from(recipeConflicts)
      .where(inArray(recipeConflicts.recipeId, recipeIds));

    const conflictMap: Record<string, number> = {};
    for (const c of confs) {
      if (c.status === "unresolved") {
        conflictMap[c.recipeId] = (conflictMap[c.recipeId] || 0) + 1;
      }
    }

    // 7. Assemble recipes list
    const enrichedRecipes = userRecipes.map((r) => ({
      ...r,
      isFavorite: favSet.has(r.id),
      ingredientNames: ingMap[r.id] || [],
      tags: tagMap[r.id] || [],
      folderIds: folderMap[r.id] || [],
      unresolvedConflicts: conflictMap[r.id] || 0,
    }));

    // 8. Fetch user folders
    const userFolders = await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId));

    return {
      recipes: enrichedRecipes,
      foldersList: userFolders,
      allTags: Array.from(allTagsSet),
    };
  } catch (e) {
    console.error("Failed to fetch library recipes:", e);
    return { recipes: [], foldersList: [], allTags: [] };
  }
}

export async function toggleFavoriteAction(recipeId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [existing] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId)));

    if (existing) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.recipeId, recipeId)));
      return { isFavorite: false };
    } else {
      await db.insert(favorites).values({
        userId,
        recipeId,
      });
      return { isFavorite: true };
    }
  } catch (e) {
    console.error("Failed to toggle favorite:", e);
    return { error: String(e) };
  }
}

export async function createFolderAction(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    const [newFolder] = await db
      .insert(folders)
      .values({
        userId,
        name,
      })
      .returning();
    return { success: true, folder: newFolder };
  } catch (e) {
    console.error("Failed to create folder:", e);
    return { success: false, error: String(e) };
  }
}

export async function assignFolderAction(recipeId: string, folderId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    await db
      .delete(recipeFolders)
      .where(and(eq(recipeFolders.userId, userId), eq(recipeFolders.recipeId, recipeId)));

    if (folderId !== "none") {
      await db.insert(recipeFolders).values({
        recipeId,
        folderId,
        userId,
      });
    }
    return { success: true };
  } catch (e) {
    console.error("Failed to assign folder:", e);
    return { success: false, error: String(e) };
  }
}

export async function addRecipeTagAction(recipeId: string, tag: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id || "mock-demo-user-id";

  try {
    await db.insert(recipeTags).values({
      recipeId,
      userId,
      tag: tag.trim().toLowerCase(),
    });
    return { success: true };
  } catch (e) {
    console.error("Failed to add tag:", e);
    return { success: false, error: String(e) };
  }
}

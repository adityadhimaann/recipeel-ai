"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  getLibraryRecipes,
  toggleFavoriteAction,
  createFolderAction,
  assignFolderAction,
  addRecipeTagAction,
} from "@/app/actions/recipe-library";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Filter,
  Folder,
  FolderPlus,
  Grid,
  Heart,
  List,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Users,
  Utensils,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

type LibraryRecipe = {
  id: string;
  title: string;
  description: string | null;
  sourcePlatform: string | null;
  cookTimeMinutes: number | null;
  servings: number | null;
  totalCalories: number | null;
  totalProteinG: string | number | null;
  totalCarbsG: string | number | null;
  totalFatG: string | number | null;
  isFavorite: boolean;
  ingredientNames: string[];
  tags: string[];
  folderIds: string[];
  unresolvedConflicts: number;
};

type FolderItem = {
  id: string;
  name: string;
  color: string | null;
};

export default function RecipeLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<LibraryRecipe[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Layout state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [safeOnly, setSafeOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [maxCookTime, setMaxCookTime] = useState<number | "any">("any");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New folder modal
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // New tag modal/input
  const [activeTagRecipeId, setActiveTagRecipeId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState("");

  // Folder assignment menu
  const [activeFolderRecipeId, setActiveFolderRecipeId] = useState<string | null>(null);

  // Load recipes & metadata on mount
  useEffect(() => {
    loadLibraryData();
  }, []);

  async function loadLibraryData() {
    setLoading(true);
    try {
      const data = await getLibraryRecipes();
      setRecipes(data.recipes as any);
      setFolders(data.foldersList as any);
      setAllTags(data.allTags || []);
    } catch (e) {
      console.error("Failed to load library:", e);
    } finally {
      setLoading(false);
    }
  }

  // Favorite toggle
  async function handleToggleFav(recipeId: string, e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r))
    );

    const res = await toggleFavoriteAction(recipeId);
    if (res.error) {
      toast.error("Failed to update favorite.");
      loadLibraryData();
    } else {
      toast.success(res.isFavorite ? "Added to favorites ❤️" : "Removed from favorites");
    }
  }

  // Create folder
  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const res = await createFolderAction(newFolderName.trim());
    if (res.success && res.folder) {
      setFolders((prev) => [...prev, res.folder as any]);
      setNewFolderName("");
      setShowNewFolderModal(false);
      toast.success("Folder created!");
    } else {
      toast.error("Failed to create folder.");
    }
  }

  // Assign recipe to folder
  async function handleAssignFolder(recipeId: string, folderId: string) {
    const res = await assignFolderAction(recipeId, folderId);
    if (res.success) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId
            ? { ...r, folderIds: folderId === "none" ? [] : [folderId] }
            : r
        )
      );
      setActiveFolderRecipeId(null);
      toast.success("Folder updated!");
    }
  }

  // Add tag to recipe
  async function handleAddTag(recipeId: string, e: React.FormEvent) {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    const cleanTag = newTagInput.trim().toLowerCase();
    const res = await addRecipeTagAction(recipeId, cleanTag);
    if (res.success) {
      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId
            ? { ...r, tags: Array.from(new Set([...r.tags, cleanTag])) }
            : r
        )
      );
      if (!allTags.includes(cleanTag)) setAllTags((prev) => [...prev, cleanTag]);
      setNewTagInput("");
      setActiveTagRecipeId(null);
      toast.success("Tag added!");
    }
  }

  // Clear all filters
  function clearFilters() {
    setSearchQuery("");
    setSafeOnly(false);
    setFavOnly(false);
    setMaxCookTime("any");
    setSelectedFolderId("all");
    setSelectedTag(null);
  }

  // FILTERING LOGIC
  const filteredRecipes = recipes.filter((r) => {
    // 1. Search Query (Title & Ingredient Names)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = r.title.toLowerCase().includes(q);
      const ingMatch = r.ingredientNames.some((ing) => ing.toLowerCase().includes(q));
      if (!titleMatch && !ingMatch) return false;
    }

    // 2. Safe Only Filter
    if (safeOnly && r.unresolvedConflicts > 0) return false;

    // 3. Favorites Only Filter
    if (favOnly && !r.isFavorite) return false;

    // 4. Max Cook Time Filter
    if (maxCookTime !== "any") {
      if ((r.cookTimeMinutes || 0) > maxCookTime) return false;
    }

    // 5. Folder Filter
    if (selectedFolderId !== "all") {
      if (!r.folderIds.includes(selectedFolderId)) return false;
    }

    // 6. Tag Filter
    if (selectedTag) {
      if (!r.tags.includes(selectedTag)) return false;
    }

    return true;
  });

  const isFilterActive =
    searchQuery || safeOnly || favOnly || maxCookTime !== "any" || selectedFolderId !== "all" || selectedTag;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition shadow-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <span className="text-xs font-semibold text-muted-foreground">• Library</span>
            </div>
            <h1 className="mt-2 font-display text-4xl text-foreground">Recipe Library</h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/recipes/import"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Import Recipe
            </Link>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <Sparkles className="mx-auto h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-sm font-medium">Loading your recipe collection...</p>
          </div>
        ) : recipes.length === 0 ? (
          /* TRUE EMPTY STATE (0 recipes total) */
          <div className="mx-auto max-w-md my-12 rounded-3xl border border-border bg-surface p-10 text-center shadow-card">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary mb-4">
              <Utensils className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl text-foreground">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Import your first recipe from TikTok, Instagram Reels, YouTube Shorts, or enter ingredients manually to get started!
            </p>
            <Link
              href="/recipes/import"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift cursor-pointer"
            >
              <Wand2 className="h-4 w-4" /> Import Your First Recipe
            </Link>
          </div>
        ) : (
          /* ACTIVE LIBRARY CONTENT */
          <div>
            {/* Search & Main Filter Controls Bar */}
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-card mb-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="flex-1 flex items-center gap-2 rounded-2xl border border-input bg-background px-4 py-3 shadow-xs focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by recipe title or ingredient (e.g., Salmon, Garlic)..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="inline-flex rounded-2xl border border-border bg-background p-1 shadow-xs self-start md:self-auto">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                      viewMode === "grid" ? "bg-surface text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Grid className="h-3.5 w-3.5" /> Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                      viewMode === "list" ? "bg-surface text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" /> List
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Diet Safe Only Toggle */}
                  <button
                    onClick={() => setSafeOnly(!safeOnly)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium transition cursor-pointer ${
                      safeOnly
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Diet-safe only
                  </button>

                  {/* Favorites Only Toggle */}
                  <button
                    onClick={() => setFavOnly(!favOnly)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium transition cursor-pointer ${
                      favOnly
                        ? "border-rose-500 bg-rose-500/15 text-rose-700 font-semibold"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${favOnly ? "fill-rose-500 text-rose-500" : ""}`} /> Favorites
                  </button>

                  {/* Cook Time Filter */}
                  <select
                    value={maxCookTime}
                    onChange={(e) => setMaxCookTime(e.target.value === "any" ? "any" : Number(e.target.value))}
                    className="rounded-full border border-border bg-background px-3 py-1.5 font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="any">Cook time: Any</option>
                    <option value="15">Under 15 min</option>
                    <option value="30">Under 30 min</option>
                    <option value="60">Under 60 min</option>
                  </select>

                  {/* Folder Selector */}
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="all">All Folders</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                {isFilterActive && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Clear filters
                  </button>
                )}
              </div>

              {/* Tags Row */}
              {allTags.length > 0 && (
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">Tags:</span>
                  {allTags.map((t) => {
                    const active = selectedTag === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTag(active ? null : t)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer ${
                          active
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <Tag className="h-3 w-3" /> #{t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Folder Header Actions & Info */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Showing {filteredRecipes.length} of {recipes.length} recipes
              </p>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                <FolderPlus className="h-3.5 w-3.5" /> New Folder
              </button>
            </div>

            {/* FILTER EMPTY STATE (0 results matching filter) */}
            {filteredRecipes.length === 0 ? (
              <div className="rounded-3xl border border-border bg-surface p-12 text-center shadow-card my-6">
                <Filter className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
                <h3 className="font-display text-xl text-foreground">No recipes match your filters</h3>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search terms or clearing active filter chips.</p>
                <button
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-lift transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRecipes.map((r) => {
                  const isSafe = r.unresolvedConflicts === 0;

                  return (
                    <div
                      key={r.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-card transition hover-lift hover:border-primary/40 cursor-pointer"
                    >
                      <Link href={`/recipes/${r.id}`} className="absolute inset-0 z-0" />

                      <div className="relative z-10">
                        {/* Top Card Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {isSafe ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                              <Check className="h-3 w-3" /> Safe for you
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
                              <AlertTriangle className="h-3 w-3" /> {r.unresolvedConflicts} conflict(s)
                            </span>
                          )}

                          {/* Favorite Button */}
                          <button
                            onClick={(e) => handleToggleFav(r.id, e)}
                            className="grid h-8 w-8 place-items-center rounded-full bg-background border border-border hover:border-rose-400 transition cursor-pointer"
                          >
                            <Heart
                              className={`h-4 w-4 transition ${
                                r.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Title & Description */}
                        <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition leading-snug">
                          {r.title}
                        </h3>
                        {r.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                        )}

                        {/* Tags */}
                        {r.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {r.tags.map((t) => (
                              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground font-medium">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Info & Controls */}
                      <div className="relative z-10 mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-primary" /> {r.cookTimeMinutes || 20}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-primary" /> {r.servings || 2}
                          </span>
                          <span className="font-semibold text-foreground">{r.totalCalories || 400} kcal</span>
                        </div>

                        {/* Folder / Tag Action Menu */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveFolderRecipeId(activeFolderRecipeId === r.id ? null : r.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
                            title="Assign to folder"
                          >
                            <Folder className="h-4 w-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveTagRecipeId(activeTagRecipeId === r.id ? null : r.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted cursor-pointer"
                            title="Add tag"
                          >
                            <Tag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Folder Assign Dropdown Popover */}
                      {activeFolderRecipeId === r.id && (
                        <div className="absolute right-4 bottom-14 z-20 w-48 rounded-2xl border border-border bg-surface p-2 shadow-lift">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">Assign to Folder</p>
                          <button
                            onClick={() => handleAssignFolder(r.id, "none")}
                            className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                          >
                            None (Remove folder)
                          </button>
                          {folders.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => handleAssignFolder(r.id, f.id)}
                              className="w-full text-left px-2 py-1.5 text-xs text-foreground font-medium hover:bg-primary-soft hover:text-primary rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Folder className="h-3.5 w-3.5 text-primary" /> {f.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Add Tag Popover */}
                      {activeTagRecipeId === r.id && (
                        <form
                          onSubmit={(e) => handleAddTag(r.id, e)}
                          className="absolute right-4 bottom-14 z-20 w-48 rounded-2xl border border-border bg-surface p-2 shadow-lift"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">Add Custom Tag</p>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={newTagInput}
                              onChange={(e) => setNewTagInput(e.target.value)}
                              placeholder="e.g. quick, dinner"
                              className="w-full rounded-xl border border-input bg-background px-2.5 py-1 text-xs outline-none focus:border-primary"
                            />
                            <button type="submit" className="rounded-xl bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground cursor-pointer">
                              Add
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-3">
                {filteredRecipes.map((r) => {
                  const isSafe = r.unresolvedConflicts === 0;
                  return (
                    <div
                      key={r.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 shadow-card hover:border-primary/40 transition cursor-pointer"
                    >
                      <Link href={`/recipes/${r.id}`} className="absolute inset-0 z-0" />

                      <div className="relative z-10 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary font-bold">
                          <ChefHat className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition">
                              {r.title}
                            </h3>
                            {isSafe ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                <Check className="h-3 w-3" /> Safe
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                <AlertTriangle className="h-3 w-3" /> {r.unresolvedConflicts} conflict(s)
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{r.cookTimeMinutes || 20} mins</span>
                            <span>{r.servings || 2} servings</span>
                            <span className="font-medium text-foreground">{r.totalCalories || 400} kcal</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={(e) => handleToggleFav(r.id, e)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-background border border-border hover:border-rose-400 transition cursor-pointer"
                        >
                          <Heart
                            className={`h-4 w-4 transition ${
                              r.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CREATE NEW FOLDER MODAL */}
        {showNewFolderModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs grid place-items-center p-4">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-lift">
              <h3 className="font-display text-xl text-foreground">Create New Folder</h3>
              <form onSubmit={handleCreateFolder} className="mt-4 space-y-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Weeknight Dinners, Breakfasts..."
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(false)}
                    className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-soft cursor-pointer"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

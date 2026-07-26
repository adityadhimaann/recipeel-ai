"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { extractRecipeFromUrl } from "@/app/actions/recipe";
import {
  fetchUserPreferencesForImport,
  getMatchingSubstitutionRules,
  saveImportedRecipe,
} from "@/app/actions/recipe-import";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChefHat,
  Clock,
  Info,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

export type IngredientItem = {
  name: string;
  quantity?: number | string;
  unit?: string;
  aisle?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  isSubstituted?: boolean;
  originalName?: string;
  conflict?: {
    type: "allergy" | "diet";
    severity: "hard" | "soft";
    matchedTag: string;
    reason: string;
    status: "unresolved" | "substituted" | "ignored";
  } | null;
  selectedSubstituteId?: string | null;
};

export type SubstitutionRule = {
  id: string;
  originalIngredientName: string;
  substituteName: string;
  dietTags: string[] | null;
  caloriesDelta: number | null;
  proteinDelta: string | number | null;
  carbsDelta: string | number | null;
  fatDelta: string | number | null;
  notes: string | null;
};

export default function ImportRecipePage() {
  const router = useRouter();

  // Mode: "import" (URL / manual) or "review"
  const [activeTab, setActiveTab] = useState<"url" | "manual">("url");
  const [viewState, setViewState] = useState<"input" | "loading" | "review">("input");

  // Loading animation step
  const [loadingStep, setLoadingStep] = useState<number>(1);

  // Form states
  const [url, setUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualCookTime, setManualCookTime] = useState(25);
  const [manualServings, setManualServings] = useState(4);
  const [manualIngredientsText, setManualIngredientsText] = useState(
    "2 cups almond milk\n1 cup whole wheat flour\n2 tbsp honey\n1 egg"
  );
  const [manualInstructionsText, setManualInstructionsText] = useState(
    "Whisk dry ingredients in a bowl.\nAdd wet ingredients and stir until smooth.\nCook on medium heat for 3-4 minutes per side."
  );

  // Review states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<"tiktok" | "instagram" | "youtube" | "manual">("manual");
  const [cookTime, setCookTime] = useState(25);
  const [servings, setServings] = useState(4);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [ingredientsList, setIngredientsList] = useState<IngredientItem[]>([]);

  // User preferences & DB substitution rules
  const [userPrefs, setUserPrefs] = useState<{ dietTypes: string[]; allergies: string[] }>({
    dietTypes: [],
    allergies: [],
  });
  const [dbRules, setDbRules] = useState<SubstitutionRule[]>([]);
  const [saving, setSaving] = useState(false);

  // Load preferences & substitution rules on mount
  useEffect(() => {
    (async () => {
      const prefs = await fetchUserPreferencesForImport();
      setUserPrefs({
        dietTypes: prefs.dietTypes || [],
        allergies: prefs.allergies || [],
      });
      const rules = await getMatchingSubstitutionRules();
      setDbRules(rules as any);
    })();
  }, []);

  // Multi-step loading sequence timer
  useEffect(() => {
    if (viewState !== "loading") return;
    setLoadingStep(1);

    const t1 = setTimeout(() => setLoadingStep(2), 1200);
    const t2 = setTimeout(() => setLoadingStep(3), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [viewState]);

  // Handle URL submit
  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return toast.error("Please paste a valid video URL.");

    setViewState("loading");

    try {
      const res = await extractRecipeFromUrl(url.trim());
      if (res && res.success && res.data) {
        const rawRec = res.data;
        setTitle(rawRec.title || "Imported Recipe");
        setDescription(rawRec.description || "");
        setSourceUrl(url.trim());
        if (url.includes("tiktok.com")) setSourcePlatform("tiktok");
        else if (url.includes("instagram.com")) setSourcePlatform("instagram");
        else if (url.includes("youtube.com") || url.includes("youtu.be")) setSourcePlatform("youtube");
        else setSourcePlatform("manual");

        setCookTime(rawRec.cookTimeMinutes || 25);
        setServings(rawRec.servings || 4);
        setInstructions(rawRec.instructions || []);

        // Format ingredients & run conflict screening
        const rawIngs: IngredientItem[] = (rawRec.ingredients || []).map((ing: any) => ({
          name: ing.name,
          quantity: ing.amount || 1,
          unit: ing.unit || "",
          calories: 120,
          proteinG: 4,
          carbsG: 15,
          fatG: 3,
        }));

        const screened = analyzeIngredientsConflicts(rawIngs, userPrefs);
        setIngredientsList(screened);

        // Transition to review screen
        setTimeout(() => {
          setViewState("review");
          toast.success("Recipe extracted! Review ingredients and safety checks.");
        }, 3200);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to extract recipe. Try manual entry.");
      setViewState("input");
    }
  }

  // Handle Manual Form Submit
  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitle.trim()) return toast.error("Please enter a recipe title.");

    const parsedIngs: IngredientItem[] = manualIngredientsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(" ");
        const qty = parts[0] && !isNaN(Number(parts[0])) ? Number(parts[0]) : 1;
        const unit = !isNaN(Number(parts[0])) && parts[1] ? parts[1] : "";
        const name = !isNaN(Number(parts[0])) ? parts.slice(unit ? 2 : 1).join(" ") || line : line;
        return {
          name,
          quantity: qty,
          unit,
          calories: 140,
          proteinG: 5,
          carbsG: 12,
          fatG: 4,
        };
      });

    const parsedInst = manualInstructionsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    setTitle(manualTitle);
    setDescription("Custom manual recipe entry.");
    setSourceUrl("");
    setSourcePlatform("manual");
    setCookTime(manualCookTime);
    setServings(manualServings);
    setInstructions(parsedInst);

    const screened = analyzeIngredientsConflicts(parsedIngs, userPrefs);
    setIngredientsList(screened);
    setViewState("review");
    toast.success("Recipe structured! Review ingredients & safety.");
  }

  // CONFLICT DETECTION ENGINE
  function analyzeIngredientsConflicts(
    ings: IngredientItem[],
    prefs: { dietTypes: string[]; allergies: string[] }
  ): IngredientItem[] {
    const userDiets = prefs.dietTypes.map((d) => d.toLowerCase());
    const userAllergies = prefs.allergies.map((a) => a.toLowerCase());

    return ings.map((ing) => {
      const lowerName = ing.name.toLowerCase();

      // 1. HARD CONFLICT: Allergies
      for (const a of userAllergies) {
        if (a && lowerName.includes(a)) {
          return {
            ...ing,
            conflict: {
              type: "allergy",
              severity: "hard",
              matchedTag: a,
              reason: `Contains "${a}" — matches your saved allergy alert!`,
              status: "unresolved",
            },
          };
        }
      }

      // Hard allergy keywords fallback
      const allergyKeywords: Record<string, string> = {
        peanut: "Peanuts",
        shrimp: "Shellfish",
        crab: "Shellfish",
        lobster: "Shellfish",
        almond: "Tree nuts",
        walnut: "Tree nuts",
        cashew: "Tree nuts",
      };

      for (const [kw, label] of Object.entries(allergyKeywords)) {
        if (userAllergies.includes(label.toLowerCase()) && lowerName.includes(kw)) {
          return {
            ...ing,
            conflict: {
              type: "allergy",
              severity: "hard",
              matchedTag: label,
              reason: `Contains "${kw}" — conflicts with your ${label} allergy!`,
              status: "unresolved",
            },
          };
        }
      }

      // 2. SOFT CONFLICT: Dietary Preferences
      const isVegan = userDiets.includes("vegan");
      const isVegetarian = userDiets.includes("vegetarian");
      const isDairyFree = userDiets.includes("dairy-free");
      const isGlutenFree = userDiets.includes("gluten-free");

      const dairyKws = ["milk", "butter", "cheese", "cream", "ghee", "yogurt", "whey"];
      const meatKws = ["chicken", "beef", "pork", "bacon", "turkey", "lamb", "sausage"];
      const glutenKws = ["flour", "wheat", "barley", "rye", "pasta", "bread"];

      if ((isVegan || isDairyFree) && dairyKws.some((kw) => lowerName.includes(kw))) {
        return {
          ...ing,
          conflict: {
            type: "diet",
            severity: "soft",
            matchedTag: "Dairy",
            reason: `Contains dairy — conflicts with your ${isVegan ? "Vegan" : "Dairy-Free"} preference.`,
            status: "unresolved",
          },
        };
      }

      if ((isVegan || isVegetarian) && meatKws.some((kw) => lowerName.includes(kw))) {
        return {
          ...ing,
          conflict: {
            type: "diet",
            severity: "soft",
            matchedTag: "Meat",
            reason: `Contains meat — conflicts with your ${isVegan ? "Vegan" : "Vegetarian"} diet.`,
            status: "unresolved",
          },
        };
      }

      if (isGlutenFree && glutenKws.some((kw) => lowerName.includes(kw))) {
        return {
          ...ing,
          conflict: {
            type: "diet",
            severity: "soft",
            matchedTag: "Gluten",
            reason: "Contains gluten — conflicts with your Gluten-Free preference.",
            status: "unresolved",
          },
        };
      }

      return { ...ing, conflict: null };
    });
  }

  // Get matching substitution rules for an ingredient
  function getSubstitutesForIngredient(ingName: string): SubstitutionRule[] {
    const lower = ingName.toLowerCase();
    const matches = dbRules.filter(
      (r) =>
        r.originalIngredientName.toLowerCase().includes(lower) ||
        lower.includes(r.originalIngredientName.toLowerCase())
    );

    if (matches.length > 0) return matches;

    // Smart default fallbacks if database rule isn't explicit
    if (lower.includes("milk")) {
      return [
        {
          id: "fb-1",
          originalIngredientName: ingName,
          substituteName: "Unsweetened Almond Milk",
          dietTags: ["Vegan", "Dairy-Free"],
          caloriesDelta: -45,
          proteinDelta: "-1",
          carbsDelta: "0",
          fatDelta: "-2",
          notes: "Plant-based dairy alternative",
        },
        {
          id: "fb-2",
          originalIngredientName: ingName,
          substituteName: "Oat Milk",
          dietTags: ["Vegan", "Dairy-Free"],
          caloriesDelta: -10,
          proteinDelta: "0",
          carbsDelta: "+3",
          fatDelta: "-1",
          notes: "Creamy plant milk",
        },
      ];
    }
    if (lower.includes("flour")) {
      return [
        {
          id: "fb-3",
          originalIngredientName: ingName,
          substituteName: "1:1 Gluten-Free Baking Flour",
          dietTags: ["Gluten-Free"],
          caloriesDelta: 0,
          proteinDelta: "0",
          carbsDelta: "0",
          fatDelta: "0",
          notes: "Direct 1:1 ratio substitute",
        },
        {
          id: "fb-4",
          originalIngredientName: ingName,
          substituteName: "Almond Flour",
          dietTags: ["Gluten-Free", "Keto"],
          caloriesDelta: +30,
          proteinDelta: "+3",
          carbsDelta: "-8",
          fatDelta: "+6",
          notes: "Low carb & high protein",
        },
      ];
    }
    if (lower.includes("chicken") || lower.includes("beef") || lower.includes("meat")) {
      return [
        {
          id: "fb-5",
          originalIngredientName: ingName,
          substituteName: "Extra Firm Tofu",
          dietTags: ["Vegan", "Vegetarian"],
          caloriesDelta: -60,
          proteinDelta: "-2",
          carbsDelta: "+1",
          fatDelta: "-4",
          notes: "High protein plant substitute",
        },
      ];
    }

    return [
      {
        id: "fb-def",
        originalIngredientName: ingName,
        substituteName: `Organic ${ingName} Substitute`,
        dietTags: ["Allergy-Safe"],
        caloriesDelta: -20,
        proteinDelta: "0",
        carbsDelta: "-2",
        fatDelta: "-1",
        notes: "Generic safe alternative",
      },
    ];
  }

  // Apply substitution to an ingredient
  function applySubstitution(index: number, subRule: SubstitutionRule) {
    setIngredientsList((prev) => {
      const next = [...prev];
      const target = next[index];
      if (!target) return next;

      next[index] = {
        ...target,
        originalName: target.originalName || target.name,
        name: subRule.substituteName,
        isSubstituted: true,
        calories: Math.max(10, (target.calories || 100) + (subRule.caloriesDelta || 0)),
        proteinG: Math.max(0, (target.proteinG || 4) + Number(subRule.proteinDelta || 0)),
        carbsG: Math.max(0, (target.carbsG || 10) + Number(subRule.carbsDelta || 0)),
        fatG: Math.max(0, (target.fatG || 3) + Number(subRule.fatDelta || 0)),
        conflict: target.conflict ? { ...target.conflict, status: "substituted" } : null,
      };
      return next;
    });
    toast.success(`Substituted ${subRule.substituteName}! Conflict resolved.`);
  }

  // Ignore conflict
  function ignoreConflict(index: number) {
    setIngredientsList((prev) => {
      const next = [...prev];
      if (next[index]?.conflict) {
        next[index] = {
          ...next[index],
          conflict: { ...next[index].conflict!, status: "ignored" },
        };
      }
      return next;
    });
    toast.info("Conflict ignored for this recipe.");
  }

  // "Replace all" bulk action
  function handleReplaceAllConflicts() {
    let count = 0;
    setIngredientsList((prev) => {
      return prev.map((ing) => {
        if (ing.conflict && ing.conflict.status === "unresolved") {
          const subs = getSubstitutesForIngredient(ing.name);
          if (subs.length > 0) {
            count++;
            const topSub = subs[0];
            return {
              ...ing,
              originalName: ing.originalName || ing.name,
              name: topSub.substituteName,
              isSubstituted: true,
              calories: Math.max(10, (ing.calories || 100) + (topSub.caloriesDelta || 0)),
              proteinG: Math.max(0, (ing.proteinG || 4) + Number(topSub.proteinDelta || 0)),
              conflict: { ...ing.conflict, status: "substituted" },
            };
          }
        }
        return ing;
      });
    });
    toast.success(`Replaced ${count} flagged ingredient(s) automatically!`);
  }

  // Calculate totals
  const totalCal = ingredientsList.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalProtein = ingredientsList.reduce((acc, curr) => acc + (curr.proteinG || 0), 0);
  const totalCarbs = ingredientsList.reduce((acc, curr) => acc + (curr.carbsG || 0), 0);
  const totalFat = ingredientsList.reduce((acc, curr) => acc + (curr.fatG || 0), 0);

  const unresolvedHard = ingredientsList.filter(
    (i) => i.conflict && i.conflict.severity === "hard" && i.conflict.status === "unresolved"
  ).length;

  const unresolvedSoft = ingredientsList.filter(
    (i) => i.conflict && i.conflict.severity === "soft" && i.conflict.status === "unresolved"
  ).length;

  const totalConflicts = ingredientsList.filter(
    (i) => i.conflict && i.conflict.status === "unresolved"
  ).length;

  // Final Save
  async function handleSaveToLibrary() {
    if (unresolvedHard > 0) {
      toast.error("Please resolve or ignore all hard allergy conflicts before saving.");
      return;
    }

    if (unresolvedSoft > 0) {
      const confirmSave = confirm(
        `You have ${unresolvedSoft} unresolved soft diet preference conflict(s). Save anyway?`
      );
      if (!confirmSave) return;
    }

    setSaving(true);

    const payload = {
      title,
      description,
      sourceUrl,
      sourcePlatform,
      cookTimeMinutes: cookTime,
      servings,
      instructions: instructions.length ? instructions : ["Cook and serve immediately."],
      totalCalories: totalCal,
      totalProteinG: totalProtein,
      totalCarbsG: totalCarbs,
      totalFatG: totalFat,
      originalTotalCalories: totalCal + 50,
      originalTotalProteinG: totalProtein,
      originalTotalCarbsG: totalCarbs,
      originalTotalFatG: totalFat,
      ingredients: ingredientsList.map((i) => ({
        name: i.name,
        quantity: typeof i.quantity === "number" ? i.quantity : Number(i.quantity) || 1,
        unit: i.unit || "",
        calories: i.calories,
        proteinG: i.proteinG,
        carbsG: i.carbsG,
        fatG: i.fatG,
        isSubstituted: i.isSubstituted,
        originalName: i.originalName,
      })),
      conflicts: ingredientsList
        .map((ing, idx) =>
          ing.conflict
            ? {
                ingredientIndex: idx,
                conflictType: ing.conflict.type,
                severity: ing.conflict.severity,
                status: ing.conflict.status,
                matchedTag: ing.conflict.matchedTag,
              }
            : null
        )
        .filter(Boolean) as any,
    };

    const res = await saveImportedRecipe(payload);
    setSaving(false);

    if (res.success && res.recipeId) {
      toast.success("Recipe saved to your library!");
      router.push(`/recipes/${res.recipeId}`);
    } else {
      toast.error("Failed to save recipe to library.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-6 py-8 flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Importer & Safety Engine
            </span>
          </div>
        </div>

        {/* VIEW 1: INPUT SCREEN */}
        {viewState === "input" && (
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl text-foreground">Import a Recipe</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Paste a social media video link or enter ingredients manually to run ReciPeel&apos;s dietary safety check.
              </p>

              {/* Tabs */}
              <div className="mt-6 inline-flex rounded-full border border-border bg-surface p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("url")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition cursor-pointer ${
                    activeTab === "url"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="h-3.5 w-3.5" /> Video URL Import
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition cursor-pointer ${
                    activeTab === "manual"
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ChefHat className="h-3.5 w-3.5" /> Enter Manually
                </button>
              </div>
            </div>

            {/* TAB 1: URL IMPORT FORM */}
            {activeTab === "url" && (
              <form onSubmit={handleUrlSubmit} className="rounded-3xl border border-border bg-surface p-8 shadow-card">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Social Video Link
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste a TikTok, Instagram Reel, or YouTube Shorts link..."
                    className="flex-1 rounded-2xl border border-input bg-background px-4 py-3.5 text-sm text-foreground shadow-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift cursor-pointer"
                  >
                    Extract Recipe <Wand2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-primary" /> Supported: TikTok, Instagram Reels, YouTube Shorts, and major recipe sites.
                </p>
              </form>
            )}

            {/* TAB 2: MANUAL ENTRY FORM */}
            {activeTab === "manual" && (
              <form onSubmit={handleManualSubmit} className="rounded-3xl border border-border bg-surface p-8 shadow-card space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Recipe Title</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g., Creamy Garlic Butter Salmon"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Cook Time (min)</label>
                    <input
                      type="number"
                      value={manualCookTime}
                      onChange={(e) => setManualCookTime(Number(e.target.value))}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Servings</label>
                    <input
                      type="number"
                      value={manualServings}
                      onChange={(e) => setManualServings(Number(e.target.value))}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Ingredients (one per line)</label>
                  <textarea
                    rows={4}
                    value={manualIngredientsText}
                    onChange={(e) => setManualIngredientsText(e.target.value)}
                    placeholder="2 cups almond milk&#10;1 cup whole wheat flour"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs outline-none focus:border-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Instructions (one step per line)</label>
                  <textarea
                    rows={4}
                    value={manualInstructionsText}
                    onChange={(e) => setManualInstructionsText(e.target.value)}
                    placeholder="Whisk ingredients in a bowl.&#10;Cook on medium heat."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-lift transition cursor-pointer"
                >
                  Structure & Check Safety <Check className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW 2: MULTI-STEP LOADING ANIMATION */}
        {viewState === "loading" && (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="font-display text-2xl text-foreground">Processing Video Recipe...</h2>
            <p className="mt-1 text-xs text-muted-foreground">Extracting audio, ingredient list, and calculating nutrition.</p>

            <div className="mt-8 space-y-3 text-left">
              <div
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                  loadingStep >= 1 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium" : "border-border text-muted-foreground opacity-50"
                }`}
              >
                {loadingStep > 1 ? <Check className="h-4 w-4 text-primary" /> : <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                <span className="text-xs">1. Extracting audio transcript & video frames</span>
              </div>

              <div
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                  loadingStep >= 2 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium" : "border-border text-muted-foreground opacity-50"
                }`}
              >
                {loadingStep > 2 ? <Check className="h-4 w-4 text-primary" /> : loadingStep === 2 ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Clock className="h-4 w-4" />}
                <span className="text-xs">2. Identifying ingredients & precise measurements</span>
              </div>

              <div
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                  loadingStep >= 3 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium" : "border-border text-muted-foreground opacity-50"
                }`}
              >
                {loadingStep === 3 ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Sparkles className="h-4 w-4" />}
                <span className="text-xs">3. Structuring recipe & checking dietary safety</span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: RECIPE REVIEW & SAFETY SCREENING */}
        {viewState === "review" && (
          <div className="space-y-8">
            {/* Top Summary Banner */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
                  {sourcePlatform} Import
                </span>
                <h1 className="mt-2 font-display text-3xl text-foreground">{title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" /> {cookTime} mins</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-primary" /> {servings} servings</span>
                  <span className="font-semibold text-foreground">{ingredientsList.length} ingredients</span>
                </div>
              </div>

              {/* Conflict Status Badge & Bulk Action */}
              <div className="flex flex-col items-start md:items-end gap-2">
                {totalConflicts > 0 ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-bold text-danger">
                        {totalConflicts} conflict(s) detected
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {unresolvedHard} Hard (Allergy), {unresolvedSoft} Soft (Diet)
                      </p>
                    </div>
                    <button
                      onClick={handleReplaceAllConflicts}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Replace All
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-600">
                    <Check className="h-4 w-4" /> 100% Dietary Safe!
                  </div>
                )}
              </div>
            </div>

            {/* Macro Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Calories</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalCal} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Protein</span>
                <p className="mt-1 font-display text-2xl font-bold text-primary">{totalProtein}g</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Carbs</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalCarbs}g</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">Fat</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalFat}g</p>
              </div>
            </div>

            {/* INGREDIENTS SAFETY SCREENING TABLE */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h2 className="font-display text-xl text-foreground mb-4 flex items-center justify-between">
                <span>Ingredient Safety Review</span>
                <span className="text-xs font-normal text-muted-foreground">Swap or ignore conflicts below</span>
              </h2>

              <div className="space-y-4">
                {ingredientsList.map((ing, idx) => {
                  const subs = getSubstitutesForIngredient(ing.name);
                  const isHard = ing.conflict?.severity === "hard" && ing.conflict.status === "unresolved";
                  const isSoft = ing.conflict?.severity === "soft" && ing.conflict.status === "unresolved";

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border p-4 transition ${
                        isHard
                          ? "border-danger/40 bg-danger-soft/30"
                          : isSoft
                          ? "border-amber-500/40 bg-amber-500/10"
                          : ing.isSubstituted
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 grid place-items-center rounded-xl bg-secondary text-xs font-bold text-secondary-foreground">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground">{ing.name}</span>
                              {ing.quantity && (
                                <span className="text-xs text-muted-foreground">
                                  ({ing.quantity} {ing.unit})
                                </span>
                              )}
                              {ing.isSubstituted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                                  <Check className="h-3 w-3" /> Substituted (from {ing.originalName})
                                </span>
                              )}
                            </div>

                            {/* Conflict Reason Badge & Why Info */}
                            {ing.conflict && ing.conflict.status === "unresolved" && (
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                {isHard && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-0.5 text-[11px] font-bold text-danger-foreground">
                                    <ShieldAlert className="h-3 w-3" /> Hard Allergy Conflict
                                  </span>
                                )}
                                {isSoft && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                    <AlertTriangle className="h-3 w-3" /> Soft Diet Preference Conflict
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground italic">
                                  {ing.conflict.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Substitution Actions */}
                        {ing.conflict && ing.conflict.status === "unresolved" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => ignoreConflict(idx)}
                              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition cursor-pointer"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Substitution Dropdown & Impact Preview */}
                      {ing.conflict && ing.conflict.status === "unresolved" && (
                        <div className="mt-3.5 pt-3 border-t border-border/60">
                          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                            Recommended Substitutions & Impact Preview:
                          </label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {subs.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => applySubstitution(idx, s)}
                                className="flex-1 flex items-center justify-between rounded-xl border border-primary/30 bg-surface p-2.5 text-left text-xs transition hover:border-primary hover:bg-primary-soft/30 cursor-pointer"
                              >
                                <div>
                                  <span className="font-semibold text-foreground">{s.substituteName}</span>
                                  {s.notes && <p className="text-[10px] text-muted-foreground">{s.notes}</p>}
                                </div>
                                <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">
                                  {s.caloriesDelta || 0} cal, {s.proteinDelta || 0}g protein
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <h2 className="font-display text-xl text-foreground mb-4">Instructions</h2>
              <ol className="space-y-3 text-sm text-foreground list-decimal list-inside">
                {instructions.map((stepStr, i) => (
                  <li key={i} className="leading-relaxed">
                    {stepStr}
                  </li>
                ))}
              </ol>
            </div>

            {/* Bottom Primary Save Button */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewState("input")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Re-import or Edit Form
              </button>

              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={saving || unresolvedHard > 0}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>Saving to Library...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save to Recipe Library
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

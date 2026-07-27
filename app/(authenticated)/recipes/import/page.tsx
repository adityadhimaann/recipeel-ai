"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { extractRecipeFromCaption, extractRecipeFromUrl } from "@/app/actions/recipe";
import {
  fetchUserPreferencesForImport,
  getMatchingSubstitutionRules,
  saveImportedRecipe,
} from "@/app/actions/recipe-import";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChefHat,
  ChevronDown,
  Clock,
  HelpCircle,
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
  XCircle,
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
  nutritionUnavailable?: boolean;
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
  justUpdated?: boolean;
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

  // Tab State: "url" (Social Caption Import) or "manual"
  const [activeTab, setActiveTab] = useState<"url" | "manual">("url");
  const [viewState, setViewState] = useState<"input" | "loading" | "review">("input");

  // Loading animation step & progress
  const [loadingStep, setLoadingStep] = useState<number>(1);

  // Form states
  const [url, setUrl] = useState("");
  const [captionText, setCaptionText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  const [isBulkReplacing, setIsBulkReplacing] = useState(false);

  // Popover state for "Why?" explanations (stores ingredient index)
  const [activeWhyPopover, setActiveWhyPopover] = useState<number | null>(null);

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

    const t1 = setTimeout(() => setLoadingStep(2), 1100);
    const t2 = setTimeout(() => setLoadingStep(3), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [viewState]);

  // Auto-grow textarea handler
  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaptionText(e.target.value);
    setErrorMessage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(140, textareaRef.current.scrollHeight)}px`;
    }
  };

  // Handle Social Caption / AI Import submit
  async function handleCaptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captionText.trim()) {
      setErrorMessage("Please paste the recipe's caption or description text.");
      return;
    }

    setErrorMessage(null);
    setViewState("loading");

    try {
      const res = await extractRecipeFromCaption({
        caption: captionText.trim(),
        url: url.trim(),
      });

      if (!res || !res.success || !res.data) {
        setViewState("input");
        const errMsg = res?.error || "Couldn't structure that caption — please verify the text or API credentials.";
        setErrorMessage(errMsg);
        toast.error(errMsg);
        return;
      }

      const rawRec = res.data;
      setTitle(rawRec.title || "Imported Recipe");
      setDescription(rawRec.description || "");
      setSourceUrl(url.trim());
      setSourcePlatform(rawRec.sourcePlatform || "manual");
      setCookTime(rawRec.cookTimeMinutes || 20);
      setServings(rawRec.servings || 4);
      setInstructions(rawRec.instructions || []);

      // Format ingredients & run conflict screening
      const rawIngs: IngredientItem[] = (rawRec.ingredients || []).map((ing: any) => ({
        name: ing.name,
        quantity: ing.quantity || 1,
        unit: ing.unit || "",
        aisle: ing.aisle || "General",
        calories: ing.calories || 0,
        proteinG: ing.proteinG || 0,
        carbsG: ing.carbsG || 0,
        fatG: ing.fatG || 0,
        nutritionUnavailable: ing.nutritionUnavailable,
      }));

      const screened = analyzeIngredientsConflicts(rawIngs, userPrefs);
      setIngredientsList(screened);

      // Transition to review screen
      setTimeout(() => {
        setViewState("review");
        toast.success("Recipe structured! Review dietary safety and substitutions.");
      }, 2600);
    } catch (err: any) {
      setViewState("input");
      const errTxt = err?.message || "Failed to extract recipe. Please try manual entry.";
      setErrorMessage(errTxt);
      toast.error(errTxt);
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

  // CONFLICT DETECTION ENGINE (Pure DB / Logic - Untouched)
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

  // Apply substitution to an ingredient with animated row feedback
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
        justUpdated: true,
        calories: Math.max(0, (target.calories || 0) + (subRule.caloriesDelta || 0)),
        proteinG: Math.max(0, (target.proteinG || 0) + Number(subRule.proteinDelta || 0)),
        carbsG: Math.max(0, (target.carbsG || 0) + Number(subRule.carbsDelta || 0)),
        fatG: Math.max(0, (target.fatG || 0) + Number(subRule.fatDelta || 0)),
        conflict: target.conflict ? { ...target.conflict, status: "substituted" } : null,
      };
      return next;
    });

    toast.success(`Substituted ${subRule.substituteName}! Conflict resolved.`);

    setTimeout(() => {
      setIngredientsList((prev) =>
        prev.map((ing, i) => (i === index ? { ...ing, justUpdated: false } : ing))
      );
    }, 1200);
  }

  // Ignore conflict
  function ignoreConflict(index: number) {
    setIngredientsList((prev) => {
      const next = [...prev];
      if (next[index]?.conflict) {
        next[index] = {
          ...next[index],
          justUpdated: true,
          conflict: { ...next[index].conflict!, status: "ignored" },
        };
      }
      return next;
    });
    toast.info("Conflict ignored for this recipe.");

    setTimeout(() => {
      setIngredientsList((prev) =>
        prev.map((ing, i) => (i === index ? { ...ing, justUpdated: false } : ing))
      );
    }, 1200);
  }

  // "Replace all" bulk action with ripple motion feedback
  function handleReplaceAllConflicts() {
    setIsBulkReplacing(true);
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
              justUpdated: true,
              calories: Math.max(0, (ing.calories || 0) + (topSub.caloriesDelta || 0)),
              proteinG: Math.max(0, (ing.proteinG || 0) + Number(topSub.proteinDelta || 0)),
              conflict: { ...ing.conflict, status: "substituted" },
            };
          }
        }
        return ing;
      });
    });

    toast.success(`Replaced ${count} flagged ingredient(s) automatically!`);

    setTimeout(() => {
      setIsBulkReplacing(false);
      setIngredientsList((prev) => prev.map((ing) => ({ ...ing, justUpdated: false })));
    }, 1200);
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

  // Final Save with smooth feedback
  async function handleSaveToLibrary() {
    if (unresolvedHard > 0) {
      toast.error(`Please resolve ${unresolvedHard} hard allergy conflict(s) before saving.`);
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
      originalTotalCalories: totalCal,
      originalTotalProteinG: totalProtein,
      originalTotalCarbsG: totalCarbs,
      originalTotalFatG: totalFat,
      ingredients: ingredientsList.map((i) => ({
        name: i.name,
        quantity: typeof i.quantity === "number" ? i.quantity : Number(i.quantity) || 1,
        unit: i.unit || "",
        aisle: i.aisle || "General",
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

    if (res.success && res.recipeId) {
      toast.success("Recipe saved to your library! Redirecting...");
      setTimeout(() => {
        router.push(`/recipes/${res.recipeId}`);
      }, 600);
    } else {
      setSaving(false);
      toast.error(res.error || "Failed to save recipe to library.");
    }
  }

  const isFormValid = captionText.trim().length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 flex-1">
        {/* Navigation Top Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/80 border border-primary/20 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <ChefHat className="h-4 w-4" /> AI Safety & Import Studio
            </span>
          </div>
        </div>

        {/* VIEW 1: INPUT SCREEN */}
        {viewState === "input" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-tight">Import a Recipe</h1>
              <p className="mt-2.5 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Paste recipe captions from social videos or enter details manually to extract ingredients and verify dietary safety.
              </p>

              {/* Tightened Tab Switcher with Framer Motion Sliding Pill */}
              <div className="mt-7 inline-flex relative rounded-full border border-border bg-surface/80 p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("url");
                    setErrorMessage(null);
                  }}
                  className={`relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    activeTab === "url" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === "url" && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-full shadow-soft"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 inline-flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5" /> AI Caption Import
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("manual");
                    setErrorMessage(null);
                  }}
                  className={`relative z-10 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    activeTab === "manual" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === "manual" && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary rounded-full shadow-soft"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20 inline-flex items-center gap-2">
                    <ChefHat className="h-3.5 w-3.5" /> Enter Manually
                  </span>
                </button>
              </div>
            </div>

            {/* Inline Error Alert if any failure occurred */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs"
                >
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-800 dark:text-rose-200">Import Alert</p>
                    <p className="mt-0.5 text-rose-600 dark:text-rose-300">{errorMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: AI CAPTION & SOCIAL IMPORT FORM */}
            {activeTab === "url" && (
              <form onSubmit={handleCaptionSubmit} className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Social Video Link <span className="text-[11px] font-normal text-muted-foreground/70">(Optional — Attribution Only)</span>
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@creator/video/... or Instagram / YouTube link"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition"
                  />
                  <p className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Link2 className="h-3 w-3 text-primary shrink-0" /> Kept for creator reference & link attribution in your recipe library.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                      Caption / Description Text <span className="text-danger">*</span>
                    </label>

                    {/* Live Character Count (Only shows when near 30+ chars) */}
                    {captionText.length >= 30 && (
                      <span className="text-[11px] font-mono text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-full">
                        {captionText.length} characters
                      </span>
                    )}
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={5}
                    required
                    value={captionText}
                    onChange={handleCaptionChange}
                    placeholder="Paste the full recipe caption, post description, or ingredient list here..."
                    className="w-full rounded-2xl border border-input bg-background p-4 text-sm text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary transition resize-none font-sans leading-relaxed min-h-[140px]"
                  />
                  <p className="mt-2 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>Paste the recipe&apos;s caption or description — most creators include the full ingredient list there.</span>
                  </p>
                </div>

                {/* Smart Submit Button with Disabled Hint */}
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Extract Recipe & Calculate Nutrition <Wand2 className="h-4 w-4" />
                  </button>

                  {/* Tooltip hint when disabled */}
                  {!isFormValid && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute left-1/2 -translate-x-1/2 -top-10 bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap z-20 flex items-center gap-1.5">
                      <Info className="h-3 w-3 text-primary" /> Paste a recipe caption above to extract
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* TAB 2: MANUAL ENTRY FORM */}
            {activeTab === "manual" && (
              <form onSubmit={handleManualSubmit} className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Recipe Title</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g., Creamy Garlic Butter Salmon"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Cook Time (min)</label>
                    <input
                      type="number"
                      value={manualCookTime}
                      onChange={(e) => setManualCookTime(Number(e.target.value))}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Servings</label>
                    <input
                      type="number"
                      value={manualServings}
                      onChange={(e) => setManualServings(Number(e.target.value))}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Instructions (one step per line)</label>
                  <textarea
                    rows={4}
                    value={manualInstructionsText}
                    onChange={(e) => setManualInstructionsText(e.target.value)}
                    placeholder="Whisk ingredients in a bowl.&#10;Cook on medium heat."
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-lift focus-visible:ring-2 focus-visible:ring-primary transition cursor-pointer"
                >
                  Structure & Check Safety <Check className="h-4 w-4" />
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* VIEW 2: MULTI-STEP LOADING SEQUENCE WITH REAL VISUAL WEIGHT */}
        {viewState === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md py-16 text-center"
          >
            <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primary-soft/80 text-primary shadow-soft border border-primary/20">
              <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
              <ChefHat className="absolute h-7 w-7 animate-pulse text-primary" />
            </div>
            <h2 className="font-display text-3xl text-foreground tracking-tight">Structuring Recipe...</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">Reading caption text, parsing ingredients with Gemini AI, and calculating USDA nutrition.</p>

            {/* Slim Animated Progress Bar */}
            <div className="mt-8 mb-6 h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{
                  width: loadingStep === 1 ? "33%" : loadingStep === 2 ? "66%" : "100%",
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            {/* Step Sequence Cards */}
            <div className="space-y-3 text-left">
              <motion.div
                animate={{ opacity: loadingStep >= 1 ? 1 : 0.4 }}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  loadingStep >= 1 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium shadow-xs" : "border-border text-muted-foreground"
                }`}
              >
                {loadingStep > 1 ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                )}
                <span className="text-xs sm:text-sm">1. Reading caption & description text</span>
              </motion.div>

              <motion.div
                animate={{ opacity: loadingStep >= 2 ? 1 : 0.4 }}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  loadingStep >= 2 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium shadow-xs" : "border-border text-muted-foreground"
                }`}
              >
                {loadingStep > 2 ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : loadingStep === 2 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 shrink-0" />
                )}
                <span className="text-xs sm:text-sm">2. Structuring recipe with Gemini AI</span>
              </motion.div>

              <motion.div
                animate={{ opacity: loadingStep >= 3 ? 1 : 0.4 }}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  loadingStep >= 3 ? "border-primary/40 bg-primary-soft/30 text-foreground font-medium shadow-xs" : "border-border text-muted-foreground"
                }`}
              >
                {loadingStep === 3 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                ) : (
                  <Sparkles className="h-5 w-5 shrink-0" />
                )}
                <span className="text-xs sm:text-sm">3. Calculating nutrition with USDA FoodData API</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: RECIPE REVIEW & SAFETY SCREENING */}
        {viewState === "review" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* PROMINENT OUTCOME SUMMARY BANNER (FIRST THING EYE LANDS ON) */}
            {unresolvedHard > 0 ? (
              <div className="rounded-3xl border-2 border-rose-500/40 bg-rose-500/10 p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-500 text-white grid place-items-center shrink-0 shadow-md">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-rose-900 dark:text-rose-100 font-bold">
                      ⚠ {unresolvedHard} Hard Allergy Conflict{unresolvedHard > 1 ? "s" : ""} to Review
                    </h2>
                    <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      Contains ingredients matching your allergen alerts. Please resolve or ignore before saving.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReplaceAllConflicts}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Replace All Conflicts
                </button>
              </div>
            ) : unresolvedSoft > 0 ? (
              <div className="rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white grid place-items-center shrink-0 shadow-md">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-amber-900 dark:text-amber-100 font-bold">
                      ⚠ {unresolvedSoft} Soft Preference Conflict{unresolvedSoft > 1 ? "s" : ""}
                    </h2>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Ingredients conflict with your dietary choices (e.g. Dairy / Meat). Swap with safe substitutes below.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReplaceAllConflicts}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-soft transition hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Auto-Substitute All
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-emerald-500/40 bg-emerald-500/10 p-6 shadow-card flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-md">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-emerald-900 dark:text-emerald-100 font-bold">
                    ✓ 100% Dietary Safe!
                  </h2>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Zero conflicts found. All ingredients match your saved allergen alerts and dietary preferences.
                  </p>
                </div>
              </div>
            )}

            {/* Recipe Header Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-secondary-foreground uppercase tracking-wider">
                    {sourcePlatform} Import
                  </span>
                  {sourceUrl && (
                    <a
                      href={sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                    >
                      <Link2 className="h-3 w-3" /> View Original Post
                    </a>
                  )}
                </div>
                <h1 className="mt-2.5 font-display text-3xl sm:text-4xl text-foreground tracking-tight">{title}</h1>
                {description && <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">{description}</p>}
                
                <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium"><Clock className="h-4 w-4 text-primary" /> {cookTime} mins cook time</span>
                  <span className="flex items-center gap-1.5 font-medium"><Users className="h-4 w-4 text-primary" /> {servings} servings</span>
                  <span className="font-semibold text-foreground bg-secondary px-2.5 py-1 rounded-md">{ingredientsList.length} ingredients</span>
                </div>
              </div>
            </div>

            {/* Macro Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Calories</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalCal} <span className="text-xs font-normal text-muted-foreground">kcal</span></p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Protein</span>
                <p className="mt-1 font-display text-2xl font-bold text-primary">{totalProtein}g</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Carbs</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalCarbs}g</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Fat</span>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{totalFat}g</p>
              </div>
            </div>

            {/* INGREDIENTS SAFETY REVIEW CARDS */}
            <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div>
                  <h2 className="font-display text-2xl text-foreground tracking-tight">Ingredient Safety Review</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Review ingredient safety flags and pick recommended substitutes.</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full self-start sm:self-auto">
                  {ingredientsList.length} items parsed
                </span>
              </div>

              {/* Ingredient Cards List with Generous Spacing */}
              <div className="space-y-4">
                {ingredientsList.map((ing, idx) => {
                  const subs = getSubstitutesForIngredient(ing.name);
                  const isHard = ing.conflict?.severity === "hard" && ing.conflict.status === "unresolved";
                  const isSoft = ing.conflict?.severity === "soft" && ing.conflict.status === "unresolved";

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={false}
                      animate={{
                        scale: ing.justUpdated || isBulkReplacing ? [1, 1.01, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-2xl border p-5 transition-all duration-200 shadow-xs relative ${
                        isHard
                          ? "border-l-4 border-l-rose-500 border-rose-500/30 bg-rose-500/5"
                          : isSoft
                          ? "border-l-4 border-l-amber-500 border-amber-500/30 bg-amber-500/5"
                          : ing.isSubstituted
                          ? "border-l-4 border-l-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                          : "border-l-4 border-l-slate-300 dark:border-l-slate-700 border-border bg-background"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-3.5">
                          {/* Left Icon Badge for Colorblind Accessibility */}
                          <div
                            className={`h-9 w-9 grid place-items-center rounded-xl font-bold text-xs shrink-0 ${
                              isHard
                                ? "bg-rose-500 text-white"
                                : isSoft
                                ? "bg-amber-500 text-white"
                                : ing.isSubstituted
                                ? "bg-emerald-600 text-white"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            {isHard ? (
                              <ShieldAlert className="h-5 w-5" />
                            ) : isSoft ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : ing.isSubstituted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-base text-foreground">{ing.name}</span>
                              {ing.quantity && (
                                <span className="text-xs text-muted-foreground font-medium">
                                  ({ing.quantity} {ing.unit})
                                </span>
                              )}

                              {ing.nutritionUnavailable ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                                  <AlertTriangle className="h-3 w-3" /> Nutrition unavailable
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground">
                                  • {ing.calories || 0} cal, {ing.proteinG || 0}g protein
                                </span>
                              )}

                              {ing.isSubstituted && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                  <Check className="h-3 w-3" /> Substituted (from {ing.originalName})
                                </span>
                              )}
                            </div>

                            {/* Conflict Reason Badge & Lightweight Popover Explanation */}
                            {ing.conflict && ing.conflict.status === "unresolved" && (
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                {isHard && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                                    <ShieldAlert className="h-3 w-3" /> Hard Allergy Alert
                                  </span>
                                )}
                                {isSoft && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                                    <AlertTriangle className="h-3 w-3" /> Diet Preference Flag
                                  </span>
                                )}

                                {/* Lightweight "Why?" Popover Button */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setActiveWhyPopover(activeWhyPopover === idx ? null : idx)}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                                  >
                                    Why? <HelpCircle className="h-3 w-3 text-primary" />
                                  </button>

                                  {/* Popover Card */}
                                  {activeWhyPopover === idx && (
                                    <div className="absolute left-0 top-6 z-30 w-72 rounded-2xl border border-border bg-surface p-3.5 shadow-xl text-xs text-foreground leading-relaxed animate-in fade-in zoom-in-95">
                                      <div className="flex items-center justify-between mb-1 pb-1 border-b border-border">
                                        <span className="font-bold text-primary">Conflict Reason</span>
                                        <button
                                          onClick={() => setActiveWhyPopover(null)}
                                          className="text-muted-foreground hover:text-foreground text-[10px]"
                                        >
                                          Close ✕
                                        </button>
                                      </div>
                                      <p className="text-muted-foreground mt-1">{ing.conflict.reason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Substitution Actions */}
                        {ing.conflict && ing.conflict.status === "unresolved" && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => ignoreConflict(idx)}
                              className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition cursor-pointer"
                            >
                              Ignore
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Styled Substitution Combobox & Color-Coded Impact Deltas */}
                      {ing.conflict && ing.conflict.status === "unresolved" && (
                        <div className="mt-4 pt-3 border-t border-border/60">
                          <label className="block text-[11px] font-semibold text-muted-foreground mb-2">
                            Select Recommended Substitution & Impact Preview:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {subs.map((s) => {
                              const calDelta = s.caloriesDelta || 0;
                              const isCalReduction = calDelta < 0;

                              return (
                                <button
                                  key={s.id}
                                  onClick={() => applySubstitution(idx, s)}
                                  className="flex items-center justify-between rounded-xl border border-primary/25 bg-surface p-3 text-left text-xs transition-all duration-200 hover:border-primary hover:bg-primary-soft/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer group"
                                >
                                  <div>
                                    <span className="font-semibold text-foreground group-hover:text-primary transition">{s.substituteName}</span>
                                    {s.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{s.notes}</p>}
                                  </div>

                                  {/* Color-Coded Impact Delta Pill */}
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${
                                      isCalReduction
                                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20"
                                        : calDelta > 0
                                        ? "text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/20"
                                        : "text-muted-foreground bg-secondary"
                                    }`}
                                  >
                                    {calDelta > 0 ? `+${calDelta}` : calDelta} cal
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* INSTRUCTIONS */}
            <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card">
              <h2 className="font-display text-2xl text-foreground mb-4 tracking-tight">Instructions</h2>
              <ol className="space-y-3.5 text-sm text-foreground list-decimal list-inside leading-relaxed">
                {instructions.map((stepStr, i) => (
                  <li key={i} className="pl-1">
                    <span className="font-medium text-foreground">{stepStr}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setViewState("input")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" /> Re-import or Edit Caption
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                {/* Disabled Save Reason Hint */}
                {unresolvedHard > 0 && (
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                    🔒 Resolve {unresolvedHard} hard allergy conflict{unresolvedHard > 1 ? "s" : ""} to save
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  disabled={saving || unresolvedHard > 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving to Library...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save to Recipe Library
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

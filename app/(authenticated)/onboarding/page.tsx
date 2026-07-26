"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSavedPreferences,
  saveStepPreferences,
  completeOnboarding,
} from "@/app/actions/onboarding";
import { Navbar } from "@/components/navbar";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Clock,
  DollarSign,
  Flame,
  Plus,
  Scale,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

const DIET_OPTIONS = [
  "No restrictions",
  "Vegan",
  "Vegetarian",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Pescatarian",
];

const COMMON_ALLERGENS = [
  "Peanuts",
  "Tree nuts",
  "Shellfish",
  "Dairy",
  "Eggs",
  "Soy",
  "Gluten",
  "Sesame",
];

const FITNESS_GOALS = [
  {
    id: "lose" as const,
    title: "Lose Weight",
    desc: "Burn fat safely with a moderate caloric deficit while maintaining muscle.",
    icon: Flame,
  },
  {
    id: "maintain" as const,
    title: "Maintain Weight",
    desc: "Keep current body weight with steady, balanced daily energy intake.",
    icon: Scale,
  },
  {
    id: "gain" as const,
    title: "Build Muscle / Bulk",
    desc: "Fuel muscle growth and recovery with higher protein & surplus calories.",
    icon: TrendingUp,
  },
  {
    id: "cut" as const,
    title: "General Health",
    desc: "Optimize energy levels, digestion, and long-term metabolic health.",
    icon: UserCheck,
  },
];

const COOKING_SKILLS = [
  {
    id: "beginner" as const,
    title: "Beginner",
    desc: "Simple recipes, basic prep, few ingredients.",
  },
  {
    id: "intermediate" as const,
    title: "Intermediate",
    desc: "Comfortable with standard techniques & timing.",
  },
  {
    id: "advanced" as const,
    title: "Advanced",
    desc: "Multi-step gourmet prep & advanced techniques.",
  },
];

const TIME_OPTIONS = [
  { id: 15, label: "Under 15 min", desc: "Express prep" },
  { id: 30, label: "15 – 30 min", desc: "Standard weeknight" },
  { id: 60, label: "30 – 60 min", desc: "Relaxed cooking" },
  { id: 999, label: "No limit", desc: "Unconstrained prep" },
];

const BUDGET_TIERS = [
  {
    id: "budget" as const,
    title: "Budget-Friendly",
    desc: "Affordable staples, bulk buys & low cost per serving.",
    tag: "$",
  },
  {
    id: "moderate" as const,
    title: "Moderate",
    desc: "Balanced mix of quality fresh ingredients & everyday value.",
    tag: "$$",
  },
  {
    id: "premium" as const,
    title: "Premium",
    desc: "Organic, artisanal produce, specialty items & prime cuts.",
    tag: "$$$",
  },
];

export default function OnboardingWizard() {
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Step 1: Diet
  const [dietTypes, setDietTypes] = useState<string[]>(["No restrictions"]);

  // Step 2: Allergies
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyQuery, setAllergyQuery] = useState<string>("");

  // Step 3: Fitness goal
  const [fitnessGoal, setFitnessGoal] = useState<"lose" | "maintain" | "gain" | "cut">("maintain");

  // Step 4: Cooking preferences
  const [cookingSkill, setCookingSkill] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [timeAvailable, setTimeAvailable] = useState<number>(30);

  // Step 5: Budget
  const [budgetTier, setBudgetTier] = useState<"budget" | "moderate" | "premium">("moderate");

  // Step 6: Macros & Calorie calculator
  const [calculateForMe, setCalculateForMe] = useState<boolean>(true);
  const [age, setAge] = useState<number>(28);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [sex, setSex] = useState<"male" | "female">("female");

  const [calories, setCalories] = useState<number>(2000);
  const [proteinG, setProteinG] = useState<number>(130);
  const [carbsG, setCarbsG] = useState<number>(220);
  const [fatG, setFatG] = useState<number>(65);

  // Load saved preferences on mount
  useEffect(() => {
    (async () => {
      try {
        const { preferences, onboarded } = await getSavedPreferences();
        if (onboarded) {
          // If already onboarded, user can still edit
        }
        if (preferences) {
          if (preferences.dietTypes?.length) setDietTypes(preferences.dietTypes);
          if (preferences.allergies?.length) setAllergies(preferences.allergies);
          if (preferences.fitnessGoal) setFitnessGoal(preferences.fitnessGoal as any);
          if (preferences.cookingSkill) setCookingSkill(preferences.cookingSkill as any);
          if (preferences.timeAvailabilityMinutes) setTimeAvailable(preferences.timeAvailabilityMinutes);
          if (preferences.budgetTier) setBudgetTier(preferences.budgetTier as any);
          if (preferences.dailyCalorieTarget) setCalories(preferences.dailyCalorieTarget);
          if (preferences.proteinTargetG) setProteinG(preferences.proteinTargetG);
          if (preferences.carbsTargetG) setCarbsG(preferences.carbsTargetG);
          if (preferences.fatTargetG) setFatG(preferences.fatTargetG);
          if (preferences.age) setAge(preferences.age);
          if (preferences.heightCm) setHeightCm(Number(preferences.heightCm));
          if (preferences.weightKg) setWeightKg(Number(preferences.weightKg));
          if (preferences.sex) setSex(preferences.sex as any);
        }
      } catch (err) {
        console.error("Failed loading preferences", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Compute calories & macros when calculator inputs change
  useEffect(() => {
    if (!calculateForMe) return;

    // Mifflin-St Jeor Formula
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
    const tdee = Math.round(bmr * 1.375); // Lightly active multiplier

    let targetCal = tdee;
    let pRatio = 0.25;
    let cRatio = 0.50;
    let fRatio = 0.25;

    if (fitnessGoal === "lose") {
      targetCal = Math.max(1200, tdee - 450);
      pRatio = 0.35;
      cRatio = 0.35;
      fRatio = 0.30;
    } else if (fitnessGoal === "gain") {
      targetCal = tdee + 350;
      pRatio = 0.30;
      cRatio = 0.45;
      fRatio = 0.25;
    } else if (fitnessGoal === "cut") {
      targetCal = Math.max(1300, tdee - 250);
      pRatio = 0.30;
      cRatio = 0.40;
      fRatio = 0.30;
    }

    setCalories(targetCal);
    setProteinG(Math.round((targetCal * pRatio) / 4));
    setCarbsG(Math.round((targetCal * cRatio) / 4));
    setFatG(Math.round((targetCal * fRatio) / 9));
  }, [calculateForMe, age, heightCm, weightKg, sex, fitnessGoal]);

  // Real-time persistence per step change
  async function triggerStepSave(updatedStep: number) {
    let payload: any = {};
    if (updatedStep === 1) payload = { dietTypes };
    else if (updatedStep === 2) payload = { allergies };
    else if (updatedStep === 3) payload = { fitnessGoal };
    else if (updatedStep === 4) payload = { cookingSkill, timeAvailabilityMinutes: timeAvailable };
    else if (updatedStep === 5) payload = { budgetTier };
    else if (updatedStep === 6) payload = { dailyCalorieTarget: calories, proteinTargetG: proteinG, carbsTargetG: carbsG, fatTargetG: fatG, age, heightCm, weightKg, sex };

    await saveStepPreferences(payload);
  }

  function handleNext() {
    triggerStepSave(step);
    if (step < 6) {
      setStep((s) => s + 1);
    }
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      const finalPayload = {
        dietTypes,
        allergies,
        fitnessGoal,
        cookingSkill,
        timeAvailabilityMinutes: timeAvailable,
        budgetTier,
        dailyCalorieTarget: calories,
        proteinTargetG: proteinG,
        carbsTargetG: carbsG,
        fatTargetG: fatG,
        age,
        heightCm,
        weightKg,
        sex,
      };
      await completeOnboarding(finalPayload);
      toast.success("Diet profile saved! Welcome to your kitchen.");
      router.replace("/dashboard");
    } catch (e) {
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Diet selection handlers
  function toggleDiet(diet: string) {
    if (diet === "No restrictions") {
      setDietTypes(["No restrictions"]);
      return;
    }
    const filtered = dietTypes.filter((d) => d !== "No restrictions");
    if (filtered.includes(diet)) {
      const next = filtered.filter((d) => d !== diet);
      setDietTypes(next.length ? next : ["No restrictions"]);
    } else {
      setDietTypes([...filtered, diet]);
    }
  }

  // Allergy handlers
  function toggleAllergy(allergen: string) {
    if (allergies.includes(allergen)) {
      setAllergies(allergies.filter((a) => a !== allergen));
    } else {
      setAllergies([...allergies, allergen]);
    }
  }

  function addCustomAllergy() {
    const trimmed = allergyQuery.trim();
    if (!trimmed) return;
    if (!allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
    }
    setAllergyQuery("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Sparkles className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-6 py-10 flex-1 flex flex-col justify-between">
        <div>
          {/* Progress Indicator Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="uppercase tracking-wider">Profile Setup</span>
              <span className="text-primary font-bold">Step {step} of 6</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: `${((step - 1) / 6) * 100}%` }}
                animate={{ width: `${(step / 6) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Step Animated Container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 1: DIETS */}
              {step === 1 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Dietary Preferences</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select any diets you follow. ReciPeel automatically flags ingredients that don&apos;t fit.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DIET_OPTIONS.map((d) => {
                      const selected = dietTypes.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDiet(d)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-medium transition cursor-pointer ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground shadow-soft"
                              : "border-border bg-surface text-foreground hover:border-muted-foreground"
                          }`}
                        >
                          <span>{d}</span>
                          {selected && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: ALLERGIES */}
              {step === 2 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Allergies & Intolerances</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Search or tap common allergens to ensure every recipe imported gets safety checked.
                  </p>

                  {/* Type-ahead search input */}
                  <div className="mt-6 flex items-center gap-2 rounded-2xl border border-input bg-surface px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={allergyQuery}
                      onChange={(e) => setAllergyQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomAllergy())}
                      placeholder="Search or add custom allergen (e.g., Avocado, Mustard)..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {allergyQuery.trim() && (
                      <button
                        onClick={addCustomAllergy}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </div>

                  {/* Selected Allergies Pills */}
                  {allergies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs font-medium text-muted-foreground self-center mr-1">Selected:</span>
                      {allergies.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-medium text-danger border border-danger/20"
                        >
                          {a}
                          <button onClick={() => toggleAllergy(a)} className="hover:opacity-75 cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Common Allergens Grid */}
                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Common Allergens
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {COMMON_ALLERGENS.map((a) => {
                        const selected = allergies.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() => toggleAllergy(a)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition cursor-pointer ${
                              selected
                                ? "border-danger bg-danger text-danger-foreground shadow-sm"
                                : "border-border bg-surface text-foreground hover:border-muted-foreground"
                            }`}
                          >
                            {selected && <Check className="h-3.5 w-3.5" />}
                            {a}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FITNESS GOAL */}
              {step === 3 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Primary Fitness Goal</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This tailors your macro distributions and recipe suggestions.
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {FITNESS_GOALS.map((g) => {
                      const selected = fitnessGoal === g.id;
                      const Icon = g.icon;
                      return (
                        <div
                          key={g.id}
                          onClick={() => setFitnessGoal(g.id)}
                          className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition hover-lift ${
                            selected
                              ? "border-2 border-primary bg-primary-soft/40 shadow-soft"
                              : "border-border bg-surface hover:border-muted-foreground"
                          }`}
                        >
                          <div>
                            <div
                              className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{g.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
                          </div>
                          {selected && (
                            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                              <Check className="h-4 w-4" /> Selected
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: COOKING PREFERENCES */}
              {step === 4 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Cooking Preferences</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tell us your experience level and how much time you usually have for meals.
                  </p>

                  {/* Skill level */}
                  <div className="mt-8">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                      <ChefHat className="h-4 w-4 text-primary" /> Cooking Skill Level
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {COOKING_SKILLS.map((sk) => {
                        const selected = cookingSkill === sk.id;
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            onClick={() => setCookingSkill(sk.id)}
                            className={`flex flex-col text-left rounded-2xl border p-4 transition cursor-pointer ${
                              selected
                                ? "border-2 border-primary bg-primary-soft/40 shadow-soft"
                                : "border-border bg-surface hover:border-muted-foreground"
                            }`}
                          >
                            <span className="font-display text-base font-semibold text-foreground">{sk.title}</span>
                            <span className="mt-1 text-xs text-muted-foreground leading-snug">{sk.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Available */}
                  <div className="mt-8">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                      <Clock className="h-4 w-4 text-primary" /> Max Prep & Cook Time
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {TIME_OPTIONS.map((t) => {
                        const selected = timeAvailable === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTimeAvailable(t.id)}
                            className={`flex flex-col text-center items-center justify-center rounded-2xl border p-3.5 transition cursor-pointer ${
                              selected
                                ? "border-2 border-primary bg-primary-soft/40 shadow-soft"
                                : "border-border bg-surface hover:border-muted-foreground"
                            }`}
                          >
                            <span className="font-display text-sm font-semibold text-foreground">{t.label}</span>
                            <span className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: BUDGET */}
              {step === 5 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Grocery Budget</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select the grocery tier that best aligns with your weekly shopping habits.
                  </p>

                  <div className="mt-8 space-y-4">
                    {BUDGET_TIERS.map((b) => {
                      const selected = budgetTier === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setBudgetTier(b.id)}
                          className={`flex cursor-pointer items-center justify-between rounded-2xl border p-5 transition hover-lift ${
                            selected
                              ? "border-2 border-primary bg-primary-soft/40 shadow-soft"
                              : "border-border bg-surface hover:border-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`grid h-10 w-10 place-items-center rounded-xl font-display font-bold text-sm ${
                                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {b.tag}
                            </div>
                            <div>
                              <h3 className="font-display text-lg font-semibold text-foreground">{b.title}</h3>
                              <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                            </div>
                          </div>
                          {selected && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 6: CALORIES & MACROS */}
              {step === 6 && (
                <div>
                  <h1 className="font-display text-3xl text-foreground">Daily Calorie & Macro Targets</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use our automatic Mifflin-St Jeor calculator or set your custom daily targets manually.
                  </p>

                  {/* Calculator Toggle */}
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-soft/30 p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Calculate for me</p>
                        <p className="text-xs text-muted-foreground">Estimates TDEE & macro breakdown based on your stats.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={calculateForMe}
                        onChange={(e) => setCalculateForMe(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Calculator Inputs (if toggle ON) */}
                  {calculateForMe && (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-border bg-surface p-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Sex</label>
                        <select
                          value={sex}
                          onChange={(e) => setSex(e.target.value as any)}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Age</label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Height (cm)</label>
                        <input
                          type="number"
                          value={heightCm}
                          onChange={(e) => setHeightCm(Number(e.target.value))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Editable Targets Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                      <label className="block text-xs font-semibold text-muted-foreground">Calories</label>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value))}
                        className="mt-2 w-full text-center font-display text-2xl font-bold text-foreground outline-none border-b border-transparent focus:border-primary"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase">kcal/day</span>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                      <label className="block text-xs font-semibold text-muted-foreground">Protein</label>
                      <input
                        type="number"
                        value={proteinG}
                        onChange={(e) => setProteinG(Number(e.target.value))}
                        className="mt-2 w-full text-center font-display text-2xl font-bold text-primary outline-none border-b border-transparent focus:border-primary"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase">grams/day</span>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                      <label className="block text-xs font-semibold text-muted-foreground">Carbs</label>
                      <input
                        type="number"
                        value={carbsG}
                        onChange={(e) => setCarbsG(Number(e.target.value))}
                        className="mt-2 w-full text-center font-display text-2xl font-bold text-foreground outline-none border-b border-transparent focus:border-primary"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase">grams/day</span>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
                      <label className="block text-xs font-semibold text-muted-foreground">Fat</label>
                      <input
                        type="number"
                        value={fatG}
                        onChange={(e) => setFatG(Number(e.target.value))}
                        className="mt-2 w-full text-center font-display text-2xl font-bold text-foreground outline-none border-b border-transparent focus:border-primary"
                      />
                      <span className="text-[10px] text-muted-foreground uppercase">grams/day</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Wizard Controls Footer */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-5 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground shadow-soft transition hover:shadow-lift cursor-pointer"
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-lift disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>Saving Profile...</>
                ) : (
                  <>
                    Complete Setup & Open Kitchen <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* De-emphasized testing skip link */}
          <div className="text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-[11px] text-muted-foreground/70 hover:text-muted-foreground underline cursor-pointer"
            >
              Skip to dashboard (demo preview mode)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

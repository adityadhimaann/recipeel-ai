"use server";

export type ExtractedIngredient = {
  name: string;
  quantity?: number;
  unit?: string;
  aisle?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
};

export type ExtractedRecipeResult = {
  title: string;
  description: string;
  sourceUrl: string;
  sourcePlatform: "tiktok" | "instagram" | "youtube" | "manual";
  cookTimeMinutes: number;
  servings: number;
  instructions: string[];
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  ingredients: ExtractedIngredient[];
};

export async function extractRecipeFromUrl(url: string): Promise<{
  success: boolean;
  data?: ExtractedRecipeResult;
  error?: string;
}> {
  if (!url || typeof url !== "string") {
    return { success: false, error: "Valid URL is required" };
  }

  // Multi-step simulated AI extraction latency
  await new Promise((res) => setTimeout(res, 800)); // Step 1: Scraping media transcript & metadata
  await new Promise((res) => setTimeout(res, 1000)); // Step 2: Parsing ingredients & instructions
  await new Promise((res) => setTimeout(res, 600)); // Step 3: Normalizing units & computing macros

  const platform: "tiktok" | "instagram" | "youtube" | "manual" = url.includes(
    "tiktok.com"
  )
    ? "tiktok"
    : url.includes("instagram.com")
    ? "instagram"
    : url.includes("youtube.com") || url.includes("youtu.be")
    ? "youtube"
    : "manual";

  return {
    success: true,
    data: {
      title: "Honey Garlic Salmon Bowls",
      description:
        "Crispy pan-seared salmon coated in a sticky honey garlic glaze, served over steamed rice with green onions.",
      sourceUrl: url,
      sourcePlatform: platform,
      cookTimeMinutes: 20,
      servings: 2,
      instructions: [
        "Cut fresh salmon fillet into 1-inch bite-sized cubes.",
        "Heat sesame oil in a skillet over medium-high heat and sear salmon cubes for 3-4 minutes until golden.",
        "Whisk together honey, soy sauce, minced garlic, and rice vinegar in a small bowl.",
        "Pour sauce into the skillet and toss until salmon is evenly glazed and sauce thickens.",
        "Serve immediately over fluffy jasmine rice with sliced cucumbers.",
      ],
      totalCalories: 482,
      totalProteinG: 38,
      totalCarbsG: 42,
      totalFatG: 18,
      ingredients: [
        {
          name: "salmon fillet",
          quantity: 1,
          unit: "lb",
          aisle: "Seafood",
          calories: 420,
          proteinG: 44,
          carbsG: 0,
          fatG: 24,
        },
        {
          name: "soy sauce",
          quantity: 2,
          unit: "tbsp",
          aisle: "Condiments",
          calories: 20,
          proteinG: 2,
          carbsG: 2,
          fatG: 0,
        },
        {
          name: "honey",
          quantity: 1,
          unit: "tbsp",
          aisle: "Baking",
          calories: 64,
          proteinG: 0,
          carbsG: 17,
          fatG: 0,
        },
        {
          name: "jasmine rice",
          quantity: 1,
          unit: "cup",
          aisle: "Grains",
          calories: 205,
          proteinG: 4,
          carbsG: 45,
          fatG: 0.5,
        },
      ],
    },
  };
}

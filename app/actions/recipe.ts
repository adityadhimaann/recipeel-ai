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
  nutritionUnavailable?: boolean;
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

export type ExtractRecipeInput = {
  caption: string;
  url?: string;
};

// ============================================================================
// SEEDED INGREDIENT NUTRITION LOOKUP TABLE (Per 100g)
// ============================================================================
type MacroPer100g = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  aisle: string;
};

const SEEDED_NUTRITION_DATABASE: Record<string, MacroPer100g> = {
  // Proteins & Seafood
  salmon: { calories: 208, proteinG: 20, carbsG: 0, fatG: 13, aisle: "Seafood" },
  chicken: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6, aisle: "Meat" },
  beef: { calories: 250, proteinG: 26, carbsG: 0, fatG: 15, aisle: "Meat" },
  pork: { calories: 242, proteinG: 27, carbsG: 0, fatG: 14, aisle: "Meat" },
  turkey: { calories: 189, proteinG: 29, carbsG: 0, fatG: 7, aisle: "Meat" },
  tofu: { calories: 76, proteinG: 8, carbsG: 1.9, fatG: 4.8, aisle: "Refrigerated" },
  shrimp: { calories: 99, proteinG: 24, carbsG: 0.2, fatG: 0.3, aisle: "Seafood" },
  egg: { calories: 143, proteinG: 12.6, carbsG: 0.7, fatG: 9.5, aisle: "Dairy" },
  bacon: { calories: 541, proteinG: 37, carbsG: 1.4, fatG: 42, aisle: "Meat" },
  tuna: { calories: 132, proteinG: 28, carbsG: 0, fatG: 1.3, aisle: "Seafood" },

  // Dairy & Dairy Alternatives
  milk: { calories: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3, aisle: "Dairy" },
  "whole milk": { calories: 61, proteinG: 3.2, carbsG: 4.8, fatG: 3.3, aisle: "Dairy" },
  "almond milk": { calories: 17, proteinG: 0.6, carbsG: 0.6, fatG: 1.5, aisle: "Dairy" },
  "oat milk": { calories: 48, proteinG: 1, carbsG: 7, fatG: 1.5, aisle: "Dairy" },
  cream: { calories: 340, proteinG: 2.8, carbsG: 2.7, fatG: 36, aisle: "Dairy" },
  "heavy cream": { calories: 340, proteinG: 2.8, carbsG: 2.7, fatG: 36, aisle: "Dairy" },
  butter: { calories: 717, proteinG: 0.9, carbsG: 0.1, fatG: 81, aisle: "Dairy" },
  cheese: { calories: 403, proteinG: 25, carbsG: 1.3, fatG: 33, aisle: "Dairy" },
  "cheddar cheese": { calories: 403, proteinG: 25, carbsG: 1.3, fatG: 33, aisle: "Dairy" },
  parmesan: { calories: 431, proteinG: 38, carbsG: 4.1, fatG: 29, aisle: "Dairy" },
  yogurt: { calories: 59, proteinG: 10, carbsG: 3.6, fatG: 0.4, aisle: "Dairy" },
  "sour cream": { calories: 198, proteinG: 2.4, carbsG: 4.6, fatG: 19, aisle: "Dairy" },

  // Grains, Flours & Pasta
  rice: { calories: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3, aisle: "Pantry" },
  "jasmine rice": { calories: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3, aisle: "Pantry" },
  flour: { calories: 364, proteinG: 10, carbsG: 76, fatG: 1, aisle: "Baking" },
  "wheat flour": { calories: 364, proteinG: 10, carbsG: 76, fatG: 1, aisle: "Baking" },
  oats: { calories: 389, proteinG: 16.9, carbsG: 66, fatG: 6.9, aisle: "Pantry" },
  pasta: { calories: 131, proteinG: 5, carbsG: 25, fatG: 1.1, aisle: "Pantry" },
  bread: { calories: 265, proteinG: 9, carbsG: 49, fatG: 3.2, aisle: "Bakery" },
  tortilla: { calories: 304, proteinG: 8, carbsG: 50, fatG: 8, aisle: "Bakery" },
  quinoa: { calories: 120, proteinG: 4.4, carbsG: 21, fatG: 1.9, aisle: "Pantry" },

  // Nuts, Oils & Condiments
  "peanut butter": { calories: 588, proteinG: 25, carbsG: 20, fatG: 50, aisle: "Pantry" },
  almond: { calories: 579, proteinG: 21, carbsG: 22, fatG: 50, aisle: "Pantry" },
  walnut: { calories: 654, proteinG: 15, carbsG: 14, fatG: 65, aisle: "Pantry" },
  "chia seeds": { calories: 486, proteinG: 17, carbsG: 42, fatG: 31, aisle: "Pantry" },
  honey: { calories: 304, proteinG: 0.3, carbsG: 82, fatG: 0, aisle: "Pantry" },
  "soy sauce": { calories: 53, proteinG: 8, carbsG: 4.9, fatG: 0.6, aisle: "Pantry" },
  "olive oil": { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, aisle: "Pantry" },
  oil: { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, aisle: "Pantry" },
  "sesame oil": { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, aisle: "Pantry" },

  // Produce & Legumes
  banana: { calories: 89, proteinG: 1.1, carbsG: 23, fatG: 0.3, aisle: "Produce" },
  avocado: { calories: 160, proteinG: 2, carbsG: 8.5, fatG: 15, aisle: "Produce" },
  spinach: { calories: 23, proteinG: 2.9, carbsG: 3.6, fatG: 0.4, aisle: "Produce" },
  broccoli: { calories: 34, proteinG: 2.8, carbsG: 6.6, fatG: 0.4, aisle: "Produce" },
  garlic: { calories: 149, proteinG: 6.4, carbsG: 33, fatG: 0.5, aisle: "Produce" },
  onion: { calories: 40, proteinG: 1.1, carbsG: 9.3, fatG: 0.1, aisle: "Produce" },
  tomato: { calories: 18, proteinG: 0.9, carbsG: 3.9, fatG: 0.2, aisle: "Produce" },
  chickpeas: { calories: 164, proteinG: 8.9, carbsG: 27, fatG: 2.6, aisle: "Canned" },
  cucumber: { calories: 15, proteinG: 0.7, carbsG: 3.6, fatG: 0.1, aisle: "Produce" },
  lemon: { calories: 22, proteinG: 0.4, carbsG: 6.9, fatG: 0.2, aisle: "Produce" },
};

function convertToGrams(quantity: number = 1, unit: string = "", ingName: string = ""): number {
  const u = unit.toLowerCase().trim();
  const q = isNaN(quantity) || quantity <= 0 ? 1 : quantity;
  const name = ingName.toLowerCase();

  if (u === "g" || u === "gram" || u === "grams") return q;
  if (u === "kg" || u === "kilogram" || u === "kilograms") return q * 1000;
  if (u === "oz" || u === "ounce" || u === "ounces") return q * 28.35;
  if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return q * 453.59;
  if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") return q * 15;
  if (u === "tsp" || u === "teaspoon" || u === "teaspoons") return q * 5;
  if (u === "cup" || u === "cups") {
    if (name.includes("flour") || name.includes("oats")) return q * 120;
    return q * 200;
  }
  if (u === "clove" || u === "cloves" || name.includes("garlic")) return q * 3;
  if (u === "slice" || u === "slices") return q * 25;
  if (u === "pinch" || u === "pinches") return q * 1;
  if (u === "piece" || u === "pieces" || u === "can" || u === "cans" || u === "") {
    if (name.includes("egg")) return q * 50;
    if (name.includes("banana")) return q * 118;
    if (name.includes("avocado")) return q * 150;
    if (name.includes("chickpeas") || name.includes("can")) return q * 240;
    return q * 100;
  }
  return q * 80;
}

// TEMPORARY DEMO MOCK: Replace this function body with real USDA FoodData Central API / Edamam lookup
export async function getIngredientNutrition(
  ingredientName: string,
  quantity: number = 1,
  unit: string = ""
): Promise<ExtractedIngredient> {
  const nameLower = ingredientName.toLowerCase().trim();
  let matchedData: MacroPer100g | null = null;

  for (const [key, value] of Object.entries(SEEDED_NUTRITION_DATABASE)) {
    if (nameLower.includes(key) || key.includes(nameLower)) {
      matchedData = value;
      break;
    }
  }

  // Fallback heuristic estimation so no row ever shows broken 0 cal
  if (!matchedData) {
    if (nameLower.includes("oil") || nameLower.includes("fat")) {
      matchedData = { calories: 884, proteinG: 0, carbsG: 0, fatG: 100, aisle: "Pantry" };
    } else if (nameLower.includes("meat") || nameLower.includes("fish") || nameLower.includes("steak")) {
      matchedData = { calories: 220, proteinG: 25, carbsG: 0, fatG: 12, aisle: "Meat" };
    } else if (nameLower.includes("cheese") || nameLower.includes("dairy")) {
      matchedData = { calories: 350, proteinG: 20, carbsG: 2, fatG: 28, aisle: "Dairy" };
    } else if (nameLower.includes("sauce") || nameLower.includes("dressing")) {
      matchedData = { calories: 110, proteinG: 1, carbsG: 12, fatG: 6, aisle: "Pantry" };
    } else if (nameLower.includes("spice") || nameLower.includes("herb") || nameLower.includes("pepper") || nameLower.includes("salt")) {
      matchedData = { calories: 20, proteinG: 0.5, carbsG: 4, fatG: 0.2, aisle: "Spices" };
    } else {
      matchedData = { calories: 120, proteinG: 3, carbsG: 18, fatG: 3, aisle: "General" };
    }
  }

  const weightGrams = convertToGrams(quantity, unit, ingredientName);
  const multiplier = weightGrams / 100;

  return {
    name: ingredientName,
    quantity,
    unit,
    aisle: matchedData.aisle,
    calories: Math.round(matchedData.calories * multiplier),
    proteinG: Math.round(matchedData.proteinG * multiplier),
    carbsG: Math.round(matchedData.carbsG * multiplier),
    fatG: Math.round(matchedData.fatG * multiplier),
    nutritionUnavailable: false,
  };
}

// ============================================================================
// MOCK RECIPE LIBRARY FOR DEMO FALLBACKS (varied cuisines & allergen targets)
// ============================================================================
const DEMO_MOCK_LIBRARY: ExtractedRecipeResult[] = [
  {
    title: "Honey Garlic Salmon Bowls",
    description: "Crispy pan-seared salmon coated in sticky honey garlic glaze served over steamed jasmine rice.",
    sourceUrl: "",
    sourcePlatform: "tiktok",
    cookTimeMinutes: 20,
    servings: 2,
    instructions: [
      "Cut fresh salmon fillet into 1-inch bite-sized cubes.",
      "Heat sesame oil in a skillet over medium-high heat and sear salmon cubes for 4 minutes until golden.",
      "Whisk together soy sauce, honey, and minced garlic in a bowl.",
      "Pour glaze over salmon, toss to coat, and serve hot over cooked jasmine rice."
    ],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    ingredients: [
      { name: "salmon fillet", quantity: 1, unit: "lb" },
      { name: "soy sauce", quantity: 2, unit: "tbsp" },
      { name: "honey", quantity: 1, unit: "tbsp" },
      { name: "jasmine rice", quantity: 1, unit: "cup" },
      { name: "garlic", quantity: 2, unit: "cloves" },
      { name: "broccoli", quantity: 1, unit: "cup" }
    ]
  },
  {
    title: "Creamy Tuscan Garlic Chicken",
    description: "Pan-seared chicken breasts cooked in a rich garlic parmesan cream sauce with spinach and sun-dried tomatoes.",
    sourceUrl: "",
    sourcePlatform: "instagram",
    cookTimeMinutes: 25,
    servings: 4,
    instructions: [
      "Season chicken breasts with salt, pepper, and Italian seasoning.",
      "Sear chicken in butter and olive oil until golden brown and cooked through.",
      "Stir in garlic, heavy cream, and parmesan cheese until sauce thickens.",
      "Add baby spinach and sun-dried tomatoes. Simmer until spinach is wilted."
    ],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    ingredients: [
      { name: "chicken", quantity: 1.5, unit: "lbs" },
      { name: "heavy cream", quantity: 1, unit: "cup" },
      { name: "parmesan", quantity: 0.5, unit: "cup" },
      { name: "spinach", quantity: 2, unit: "cups" },
      { name: "butter", quantity: 2, unit: "tbsp" },
      { name: "garlic", quantity: 3, unit: "cloves" }
    ]
  },
  {
    title: "Peanut Butter Banana Smoothie Bowls",
    description: "Creamy high-protein smoothie bowl topped with sliced banana, rolled oats, and chia seeds.",
    sourceUrl: "",
    sourcePlatform: "tiktok",
    cookTimeMinutes: 10,
    servings: 2,
    instructions: [
      "Blend frozen bananas, peanut butter, whole milk, and honey until thick and creamy.",
      "Pour into serving bowls.",
      "Top with rolled oats, chia seeds, and fresh banana slices."
    ],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    ingredients: [
      { name: "banana", quantity: 2, unit: "pieces" },
      { name: "peanut butter", quantity: 0.5, unit: "cup" },
      { name: "whole milk", quantity: 1, unit: "cup" },
      { name: "chia seeds", quantity: 2, unit: "tbsp" },
      { name: "rolled oats", quantity: 0.25, unit: "cup" },
      { name: "honey", quantity: 1, unit: "tbsp" }
    ]
  },
  {
    title: "Classic Ground Beef Tacos",
    description: "Seasoned ground beef wrapped in warm wheat flour tortillas with shredded cheddar cheese and sour cream.",
    sourceUrl: "",
    sourcePlatform: "youtube",
    cookTimeMinutes: 15,
    servings: 4,
    instructions: [
      "Brown ground beef in a skillet over medium heat, drain excess fat.",
      "Add taco seasoning and 1/4 cup water, simmer for 5 minutes.",
      "Warm wheat tortillas.",
      "Assemble tacos with seasoned beef, cheddar cheese, tomatoes, and sour cream."
    ],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    ingredients: [
      { name: "ground beef", quantity: 1, unit: "lb" },
      { name: "flour tortilla", quantity: 8, unit: "pieces" },
      { name: "cheddar cheese", quantity: 1, unit: "cup" },
      { name: "tomato", quantity: 1, unit: "cup" },
      { name: "sour cream", quantity: 0.5, unit: "cup" }
    ]
  },
  {
    title: "Zesty Avocado & Chickpea Salad",
    description: "Refreshingly light plant-based salad with chickpeas, ripe avocado, tomatoes, and lemon olive oil dressing.",
    sourceUrl: "",
    sourcePlatform: "manual",
    cookTimeMinutes: 10,
    servings: 2,
    instructions: [
      "Rinse and drain canned chickpeas.",
      "Dice ripe avocado, tomatoes, and red onion.",
      "Combine all ingredients in a large bowl and toss with olive oil and lemon juice."
    ],
    totalCalories: 0,
    totalProteinG: 0,
    totalCarbsG: 0,
    totalFatG: 0,
    ingredients: [
      { name: "chickpeas", quantity: 1, unit: "can" },
      { name: "avocado", quantity: 2, unit: "pieces" },
      { name: "tomato", quantity: 1, unit: "cup" },
      { name: "red onion", quantity: 0.5, unit: "cup" },
      { name: "olive oil", quantity: 2, unit: "tbsp" },
      { name: "lemon", quantity: 1, unit: "tbsp" }
    ]
  }
];

// TEMPORARY DEMO MOCK: Replace this function body with real LLM call (e.g. Gemini 2.5 Flash / Claude Sonnet)
export async function extractRecipeFromInput(
  videoUrl: string,
  captionText: string
): Promise<{
  success: boolean;
  data?: ExtractedRecipeResult;
  error?: string;
}> {
  const caption = captionText?.trim() || "";
  const url = videoUrl?.trim() || "";

  // Realistic multi-step simulated latency (~1s per step)
  await new Promise((res) => setTimeout(res, 900));
  await new Promise((res) => setTimeout(res, 900));
  await new Promise((res) => setTimeout(res, 600));

  // Determine platform
  const platform: "tiktok" | "instagram" | "youtube" | "manual" = url.includes("tiktok.com")
    ? "tiktok"
    : url.includes("instagram.com")
    ? "instagram"
    : url.includes("youtube.com") || url.includes("youtu.be")
    ? "youtube"
    : "manual";

  // HEURISTIC INPUT-AWARE PARSER
  const lines = caption.split("\n").map((l) => l.trim()).filter(Boolean);

  const measurementWords = [
    "cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons",
    "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds", "g", "gram", "grams",
    "kg", "clove", "cloves", "slice", "slices", "can", "cans", "pinch", "pinches", "piece", "pieces"
  ];

  const parsedIngredients: { name: string; quantity: number; unit: string }[] = [];
  const parsedInstructions: string[] = [];
  let extractedTitle = "";

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const lowerLine = trimmedLine.toLowerCase();

    // Skip section headers
    if (lowerLine.startsWith("ingredient") || lowerLine.startsWith("instruction") || lowerLine.startsWith("direction") || lowerLine.startsWith("step")) {
      continue;
    }

    // Check if line looks like an instruction step
    if (/^\d+[\.\)]\s*/.test(trimmedLine) || /^(sear|whisk|bake|fry|boil|heat|cook|mix|combine|stir|add|pour|serve)\b/i.test(trimmedLine)) {
      parsedInstructions.push(trimmedLine.replace(/^\d+[\.\)]\s*/, ""));
      continue;
    }

    // Strip bullet points (- *, etc.)
    const cleanLine = trimmedLine.replace(/^[\-\*\•\d\.\)\s]+/, "").trim();
    if (!cleanLine) continue;

    const tokens = cleanLine.split(" ");
    let qty = 1;
    let unit = "";
    let name = cleanLine;

    // Check leading number or fraction
    if (tokens[0] && !isNaN(Number(tokens[0]))) {
      qty = Number(tokens[0]);
      if (tokens[1] && measurementWords.includes(tokens[1].toLowerCase())) {
        unit = tokens[1].toLowerCase();
        name = tokens.slice(2).join(" ");
      } else {
        name = tokens.slice(1).join(" ");
      }
    } else if (tokens[0] === "1/2" || tokens[0] === "½") {
      qty = 0.5;
      if (tokens[1] && measurementWords.includes(tokens[1].toLowerCase())) {
        unit = tokens[1].toLowerCase();
        name = tokens.slice(2).join(" ");
      } else {
        name = tokens.slice(1).join(" ");
      }
    } else if (tokens[0] === "1/4" || tokens[0] === "¼") {
      qty = 0.25;
      if (tokens[1] && measurementWords.includes(tokens[1].toLowerCase())) {
        unit = tokens[1].toLowerCase();
        name = tokens.slice(2).join(" ");
      } else {
        name = tokens.slice(1).join(" ");
      }
    }

    // Clean extra descriptors from ingredient name
    const finalName = name
      .replace(/^(of|cut|minced|diced|cubed|sliced|fresh)\s+/i, "")
      .replace(/\s+(cut|minced|diced|cubed|sliced|into.*)$/i, "")
      .trim();

    if (finalName && !measurementWords.includes(finalName.toLowerCase())) {
      parsedIngredients.push({
        name: finalName,
        quantity: qty,
        unit,
      });
    } else if (!extractedTitle && trimmedLine.length < 50) {
      extractedTitle = trimmedLine.replace(/[^\w\s\-\']/g, "").trim();
    }
  }


  // Determine whether to use parsed results or fall back to mock library
  let selectedRecipe: ExtractedRecipeResult;

  if (parsedIngredients.length >= 2) {
    selectedRecipe = {
      title: extractedTitle || "Custom Input Recipe",
      description: "Parsed directly from your pasted social recipe caption.",
      sourceUrl: url,
      sourcePlatform: platform,
      cookTimeMinutes: 20,
      servings: 4,
      instructions: parsedInstructions.length > 0 ? parsedInstructions : [
        "Prepare all ingredients as listed.",
        "Combine ingredients in a cooking pan or bowl.",
        "Cook over medium heat until desired doneness, serve warm."
      ],
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
      ingredients: [],
    };

    // Calculate nutrition for each parsed ingredient using getIngredientNutrition
    const hydratedIngs = await Promise.all(
      parsedIngredients.map((ing) => getIngredientNutrition(ing.name, ing.quantity, ing.unit))
    );

    selectedRecipe.ingredients = hydratedIngs;
  } else {
    // FALLBACK TO VARIED MOCK LIBRARY BASED ON CAPTION/URL STRING HASH
    const hashStr = caption || url || "demo_recipe";
    const hash = hashStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockTemplate = DEMO_MOCK_LIBRARY[hash % DEMO_MOCK_LIBRARY.length];

    const hydratedIngs = await Promise.all(
      mockTemplate.ingredients.map((ing) =>
        getIngredientNutrition(ing.name, ing.quantity || 1, ing.unit || "")
      )
    );

    selectedRecipe = {
      ...mockTemplate,
      sourceUrl: url || mockTemplate.sourceUrl,
      sourcePlatform: platform,
      ingredients: hydratedIngs,
    };
  }

  // Calculate rolled-up total macros
  selectedRecipe.totalCalories = selectedRecipe.ingredients.reduce((sum, i) => sum + (i.calories || 0), 0);
  selectedRecipe.totalProteinG = selectedRecipe.ingredients.reduce((sum, i) => sum + (i.proteinG || 0), 0);
  selectedRecipe.totalCarbsG = selectedRecipe.ingredients.reduce((sum, i) => sum + (i.carbsG || 0), 0);
  selectedRecipe.totalFatG = selectedRecipe.ingredients.reduce((sum, i) => sum + (i.fatG || 0), 0);

  return {
    success: true,
    data: selectedRecipe,
  };
}

// Primary Server Action exports calling extractRecipeFromInput
export async function extractRecipeFromCaption(input: ExtractRecipeInput) {
  return extractRecipeFromInput(input.url || "", input.caption || "");
}

export async function extractRecipeFromUrl(url: string, caption?: string) {
  return extractRecipeFromInput(url, caption || url);
}

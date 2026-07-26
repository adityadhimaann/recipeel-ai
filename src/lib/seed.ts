import { db } from "./db";
import { substitutionRules, safeEatsPlaces } from "./schema";
import { count } from "drizzle-orm";

export const INITIAL_SUBSTITUTION_RULES = [
  // DAIRY
  { originalIngredientName: "milk", substituteName: "oat milk", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-20", proteinDelta: "-6", carbsDelta: "3", fatDelta: "-4", ratio: "1", notes: "Creamy, neutral. 1:1 swap." },
  { originalIngredientName: "milk", substituteName: "almond milk", dietTags: ["vegan", "dairy-free", "keto"], caloriesDelta: "-90", proteinDelta: "-7", carbsDelta: "-11", fatDelta: "-6", ratio: "1", notes: "Thinner texture, nutty." },
  { originalIngredientName: "milk", substituteName: "soy milk", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-15", proteinDelta: "0", carbsDelta: "4", fatDelta: "-3", ratio: "1", notes: "Closest protein match to dairy." },
  { originalIngredientName: "milk", substituteName: "coconut milk", dietTags: ["vegan", "dairy-free", "paleo"], caloriesDelta: "40", proteinDelta: "-6", carbsDelta: "-6", fatDelta: "6", ratio: "1", notes: "Rich, tropical note." },
  { originalIngredientName: "butter", substituteName: "olive oil", dietTags: ["vegan", "dairy-free", "mediterranean"], caloriesDelta: "20", proteinDelta: "-1", carbsDelta: "0", fatDelta: "3", ratio: "0.75", notes: "Use 3/4 the amount by volume." },
  { originalIngredientName: "butter", substituteName: "coconut oil", dietTags: ["vegan", "dairy-free", "paleo", "keto"], caloriesDelta: "15", proteinDelta: "-1", carbsDelta: "0", fatDelta: "2", ratio: "1", notes: "Solid at room temp, similar behavior." },
  { originalIngredientName: "butter", substituteName: "vegan butter", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-5", proteinDelta: "-1", carbsDelta: "0", fatDelta: "-1", ratio: "1", notes: "Direct 1:1 replacement." },
  { originalIngredientName: "heavy cream", substituteName: "coconut cream", dietTags: ["vegan", "dairy-free", "paleo"], caloriesDelta: "-30", proteinDelta: "-2", carbsDelta: "1", fatDelta: "-3", ratio: "1", notes: "Whip after chilling." },
  { originalIngredientName: "heavy cream", substituteName: "cashew cream", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-50", proteinDelta: "1", carbsDelta: "2", fatDelta: "-6", ratio: "1", notes: "Blend soaked cashews with water." },
  { originalIngredientName: "cheese", substituteName: "nutritional yeast", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-80", proteinDelta: "3", carbsDelta: "-2", fatDelta: "-8", ratio: "0.25", notes: "Cheesy, umami; use sparingly." },
  { originalIngredientName: "cheese", substituteName: "cashew cheese", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-40", proteinDelta: "-3", carbsDelta: "1", fatDelta: "-4", ratio: "1", notes: "Great melter." },
  { originalIngredientName: "yogurt", substituteName: "coconut yogurt", dietTags: ["vegan", "dairy-free", "paleo"], caloriesDelta: "-10", proteinDelta: "-5", carbsDelta: "0", fatDelta: "3", ratio: "1", notes: "Thick, tropical undertone." },
  { originalIngredientName: "yogurt", substituteName: "soy yogurt", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-15", proteinDelta: "-2", carbsDelta: "-1", fatDelta: "-1", ratio: "1", notes: "Protein-forward alternative." },
  { originalIngredientName: "sour cream", substituteName: "cashew sour cream", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-20", proteinDelta: "-1", carbsDelta: "1", fatDelta: "-2", ratio: "1", notes: "Blend cashews with lemon." },
  { originalIngredientName: "parmesan", substituteName: "nutritional yeast", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-70", proteinDelta: "2", carbsDelta: "-1", fatDelta: "-7", ratio: "0.5", notes: "Sprinkle as finishing." },
  // EGG
  { originalIngredientName: "egg", substituteName: "flax egg", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-30", proteinDelta: "-5", carbsDelta: "3", fatDelta: "-3", ratio: "1", notes: "1 tbsp flax + 3 tbsp water, rest 5 min." },
  { originalIngredientName: "egg", substituteName: "chia egg", dietTags: ["vegan", "dairy-free", "paleo"], caloriesDelta: "-30", proteinDelta: "-5", carbsDelta: "3", fatDelta: "-3", ratio: "1", notes: "1 tbsp chia + 3 tbsp water." },
  { originalIngredientName: "egg", substituteName: "mashed banana", dietTags: ["vegan", "dairy-free", "paleo"], caloriesDelta: "10", proteinDelta: "-6", carbsDelta: "20", fatDelta: "-5", ratio: "0.5", notes: "Best in sweet bakes; adds sweetness." },
  { originalIngredientName: "egg", substituteName: "applesauce", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-40", proteinDelta: "-6", carbsDelta: "10", fatDelta: "-5", ratio: "0.25", notes: "Neutral in muffins and quick breads." },
  { originalIngredientName: "egg", substituteName: "silken tofu", dietTags: ["vegan", "dairy-free"], caloriesDelta: "-30", proteinDelta: "-3", carbsDelta: "1", fatDelta: "-4", ratio: "0.25", notes: "Best for quiches and custards." },
  // GLUTEN
  { originalIngredientName: "all-purpose flour", substituteName: "almond flour", dietTags: ["gluten-free", "paleo", "keto"], caloriesDelta: "60", proteinDelta: "4", carbsDelta: "-15", fatDelta: "10", ratio: "1", notes: "Denser bake, more moisture." },
  { originalIngredientName: "all-purpose flour", substituteName: "oat flour", dietTags: ["gluten-free", "vegan"], caloriesDelta: "0", proteinDelta: "1", carbsDelta: "-2", fatDelta: "1", ratio: "1", notes: "Certify GF-labeled oats." },
  { originalIngredientName: "all-purpose flour", substituteName: "gluten-free 1:1 blend", dietTags: ["gluten-free"], caloriesDelta: "-5", proteinDelta: "-1", carbsDelta: "-1", fatDelta: "0", ratio: "1", notes: "Direct swap; add xanthan if not included." },
  { originalIngredientName: "bread crumbs", substituteName: "crushed almonds", dietTags: ["gluten-free", "paleo", "keto"], caloriesDelta: "80", proteinDelta: "3", carbsDelta: "-12", fatDelta: "12", ratio: "1", notes: "Great for crusts." },
  { originalIngredientName: "pasta", substituteName: "zucchini noodles", dietTags: ["gluten-free", "paleo", "keto", "low-carb"], caloriesDelta: "-180", proteinDelta: "-6", carbsDelta: "-38", fatDelta: "-1", ratio: "1", notes: "Salt and drain to reduce water." },
  { originalIngredientName: "pasta", substituteName: "chickpea pasta", dietTags: ["gluten-free", "vegan", "high-protein"], caloriesDelta: "-30", proteinDelta: "6", carbsDelta: "-8", fatDelta: "1", ratio: "1", notes: "Higher protein and fiber." },
  { originalIngredientName: "soy sauce", substituteName: "tamari", dietTags: ["gluten-free"], caloriesDelta: "0", proteinDelta: "0", carbsDelta: "0", fatDelta: "0", ratio: "1", notes: "Nearly identical, wheat-free." },
  { originalIngredientName: "soy sauce", substituteName: "coconut aminos", dietTags: ["gluten-free", "paleo", "soy-free"], caloriesDelta: "5", proteinDelta: "-1", carbsDelta: "2", fatDelta: "0", ratio: "1", notes: "Milder, slightly sweeter." },
  // MEAT / PROTEIN
  { originalIngredientName: "chicken breast", substituteName: "tofu", dietTags: ["vegan", "vegetarian", "dairy-free"], caloriesDelta: "-80", proteinDelta: "-15", carbsDelta: "3", fatDelta: "-2", ratio: "1", notes: "Press and marinate for texture." },
  { originalIngredientName: "chicken breast", substituteName: "tempeh", dietTags: ["vegan", "vegetarian"], caloriesDelta: "-40", proteinDelta: "-10", carbsDelta: "5", fatDelta: "1", ratio: "1", notes: "Firm bite, nutty flavor." },
  { originalIngredientName: "chicken breast", substituteName: "seitan", dietTags: ["vegan", "vegetarian"], caloriesDelta: "-20", proteinDelta: "-2", carbsDelta: "2", fatDelta: "-3", ratio: "1", notes: "Very meaty texture. Contains gluten." },
  { originalIngredientName: "ground beef", substituteName: "lentils", dietTags: ["vegan", "vegetarian", "dairy-free"], caloriesDelta: "-140", proteinDelta: "-15", carbsDelta: "20", fatDelta: "-15", ratio: "1", notes: "Rinse and drain well." },
  { originalIngredientName: "ground beef", substituteName: "plant-based mince", dietTags: ["vegan", "vegetarian", "dairy-free"], caloriesDelta: "-50", proteinDelta: "-3", carbsDelta: "3", fatDelta: "-6", ratio: "1", notes: "Direct 1:1 swap." },
  { originalIngredientName: "ground beef", substituteName: "mushrooms", dietTags: ["vegan", "vegetarian", "paleo"], caloriesDelta: "-200", proteinDelta: "-22", carbsDelta: "4", fatDelta: "-18", ratio: "1", notes: "Chop finely; deep umami." },
  { originalIngredientName: "bacon", substituteName: "coconut bacon", dietTags: ["vegan", "vegetarian", "dairy-free"], caloriesDelta: "-100", proteinDelta: "-8", carbsDelta: "3", fatDelta: "-8", ratio: "1", notes: "Smoked coconut flakes." },
  { originalIngredientName: "bacon", substituteName: "tempeh bacon", dietTags: ["vegan", "vegetarian"], caloriesDelta: "-80", proteinDelta: "-4", carbsDelta: "4", fatDelta: "-6", ratio: "1", notes: "Marinate and pan-fry." },
  { originalIngredientName: "fish", substituteName: "hearts of palm", dietTags: ["vegan", "vegetarian", "paleo"], caloriesDelta: "-100", proteinDelta: "-18", carbsDelta: "5", fatDelta: "-6", ratio: "1", notes: "Shreds like fish; brine-forward." },
  // SUGAR / SWEETENERS
  { originalIngredientName: "sugar", substituteName: "maple syrup", dietTags: ["vegan", "paleo", "refined-sugar-free"], caloriesDelta: "-15", proteinDelta: "0", carbsDelta: "-4", fatDelta: "0", ratio: "0.75", notes: "Reduce other liquids by ~3 tbsp/cup." },
  { originalIngredientName: "sugar", substituteName: "honey", dietTags: ["vegetarian", "paleo", "refined-sugar-free"], caloriesDelta: "-10", proteinDelta: "0", carbsDelta: "-3", fatDelta: "0", ratio: "0.75", notes: "Not vegan." },
  { originalIngredientName: "sugar", substituteName: "coconut sugar", dietTags: ["vegan", "paleo", "refined-sugar-free"], caloriesDelta: "-5", proteinDelta: "0", carbsDelta: "-1", fatDelta: "0", ratio: "1", notes: "Direct 1:1, slight caramel note." },
  // OIL / FAT
  { originalIngredientName: "vegetable oil", substituteName: "avocado oil", dietTags: ["paleo", "keto", "whole30"], caloriesDelta: "0", proteinDelta: "0", carbsDelta: "0", fatDelta: "0", ratio: "1", notes: "Higher smoke point, cleaner flavor." },
  { originalIngredientName: "vegetable oil", substituteName: "olive oil", dietTags: ["mediterranean", "paleo"], caloriesDelta: "0", proteinDelta: "0", carbsDelta: "0", fatDelta: "0", ratio: "1", notes: "Best for medium-heat cooking." },
  // NUTS
  { originalIngredientName: "peanut butter", substituteName: "sunflower seed butter", dietTags: ["nut-free", "vegan"], caloriesDelta: "-10", proteinDelta: "-3", carbsDelta: "2", fatDelta: "-1", ratio: "1", notes: "Perfect for nut allergies." },
  { originalIngredientName: "almond", substituteName: "pumpkin seeds", dietTags: ["nut-free", "vegan", "paleo"], caloriesDelta: "-10", proteinDelta: "3", carbsDelta: "2", fatDelta: "-4", ratio: "1", notes: "Similar crunch, nut-free." },
];

export const INITIAL_SAFE_EATS_PLACES = [
  { name: "Green Grove Market", kind: "grocery" as const, address: "412 Bedford Ave, Brooklyn, NY", lat: "40.7146", lng: "-73.9612", dietTags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "organic"], description: "Full plant-based grocery with dedicated GF aisle." },
  { name: "The Cutting Board", kind: "restaurant" as const, address: "88 W 3rd St, New York, NY", lat: "40.7305", lng: "-73.9995", dietTags: ["gluten-free", "dairy-free", "paleo"], description: "Chef-led, allergen-labeled menu." },
  { name: "Halal Guys Corner", kind: "restaurant" as const, address: "307 W 43rd St, New York, NY", lat: "40.7594", lng: "-73.9910", dietTags: ["halal"], description: "Certified halal Mediterranean." },
  { name: "Kosher Kitchen", kind: "restaurant" as const, address: "221 W 79th St, New York, NY", lat: "40.7833", lng: "-73.9803", dietTags: ["kosher", "vegetarian"], description: "OU-certified kosher dairy restaurant." },
  { name: "Keto Bar & Kitchen", kind: "restaurant" as const, address: "55 Gansevoort St, New York, NY", lat: "40.7397", lng: "-74.0084", dietTags: ["keto", "paleo", "low-carb", "gluten-free"], description: "No seed oils, no sugar. Grass-fed proteins." },
  { name: "Whole Roots Co-op", kind: "grocery" as const, address: "1102 8th Ave, Brooklyn, NY", lat: "40.6659", lng: "-73.9820", dietTags: ["vegan", "vegetarian", "gluten-free", "organic"], description: "Neighborhood co-op, allergen-forward." },
  { name: "Sprout Cafe", kind: "cafe" as const, address: "215 Smith St, Brooklyn, NY", lat: "40.6867", lng: "-73.9945", dietTags: ["vegan", "gluten-free", "dairy-free"], description: "Oat lattes, GF pastries baked daily." },
  { name: "Fig & Farro", kind: "restaurant" as const, address: "170 Grand St, New York, NY", lat: "40.7196", lng: "-73.9977", dietTags: ["vegan", "vegetarian", "mediterranean"], description: "Plant-forward Mediterranean small plates." },
  { name: "Union Sq Greenmarket", kind: "market" as const, address: "E 17th St & Broadway, New York, NY", lat: "40.7359", lng: "-73.9911", dietTags: ["organic", "vegan", "vegetarian", "paleo"], description: "Farmers market — seasonal, mostly whole foods." },
  { name: "Rise Bakehouse", kind: "cafe" as const, address: "44 Court St, Brooklyn, NY", lat: "40.6929", lng: "-73.9903", dietTags: ["gluten-free", "dairy-free"], description: "Dedicated gluten-free bakery." },
  { name: "Blue Ocean Sushi", kind: "restaurant" as const, address: "512 Amsterdam Ave, New York, NY", lat: "40.7857", lng: "-73.9760", dietTags: ["pescatarian", "gluten-free", "dairy-free"], description: "Tamari and GF soy on request." },
  { name: "Sabich House", kind: "restaurant" as const, address: "76 Orchard St, New York, NY", lat: "40.7181", lng: "-73.9905", dietTags: ["vegetarian", "vegan", "kosher", "mediterranean"], description: "Israeli sabich and mezze, plant-heavy." },
];

export async function seedDatabase() {
  const [subCount] = await db.select({ value: count() }).from(substitutionRules);
  if (Number(subCount.value) === 0) {
    console.log("Seeding substitution rules...");
    await db.insert(substitutionRules).values(INITIAL_SUBSTITUTION_RULES);
  }

  const [placeCount] = await db.select({ value: count() }).from(safeEatsPlaces);
  if (Number(placeCount.value) === 0) {
    console.log("Seeding safe eats places...");
    await db.insert(safeEatsPlaces).values(INITIAL_SAFE_EATS_PLACES);
  }
}

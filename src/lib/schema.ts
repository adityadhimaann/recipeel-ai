import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// =========================================================
// ENUMS
// =========================================================
export const sourcePlatformEnum = pgEnum("source_platform", [
  "tiktok",
  "instagram",
  "youtube",
  "manual",
]);

export const mealSlotEnum = pgEnum("meal_slot", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

export const conflictTypeEnum = pgEnum("conflict_type", [
  "allergy",
  "diet",
]);

export const conflictSeverityEnum = pgEnum("conflict_severity", [
  "hard",
  "soft",
]);

export const conflictStatusEnum = pgEnum("conflict_status", [
  "unresolved",
  "substituted",
  "ignored",
]);

export const fitnessGoalEnum = pgEnum("fitness_goal", [
  "lose",
  "maintain",
  "gain",
  "cut",
  "bulk",
]);

export const cookingSkillEnum = pgEnum("cooking_skill", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const budgetTierEnum = pgEnum("budget_tier", [
  "budget",
  "moderate",
  "premium",
]);

export const placeKindEnum = pgEnum("place_kind", [
  "grocery",
  "restaurant",
  "cafe",
  "market",
]);

// =========================================================
// BETTER AUTH CORE TABLES
// =========================================================
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =========================================================
// APPLICATION PROFILES
// =========================================================
export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email"),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  onboarded: boolean("onboarded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// USER PREFERENCES
// =========================================================
export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  dietTypes: text("diet_types")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  allergies: text("allergies")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  fitnessGoal: fitnessGoalEnum("fitness_goal"),
  cookingSkill: cookingSkillEnum("cooking_skill"),
  timeAvailabilityMinutes: integer("time_availability_minutes"),
  budgetTier: budgetTierEnum("budget_tier"),
  dailyCalorieTarget: integer("daily_calorie_target"),
  proteinTargetG: integer("protein_target_g"),
  carbsTargetG: integer("carbs_target_g"),
  fatTargetG: integer("fat_target_g"),
  heightCm: numeric("height_cm"),
  weightKg: numeric("weight_kg"),
  age: integer("age"),
  sex: text("sex"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// RECIPES
// =========================================================
export const recipes = pgTable("recipes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  sourceUrl: text("source_url"),
  sourcePlatform: sourcePlatformEnum("source_platform")
    .notNull()
    .default("manual"),
  title: text("title").notNull(),
  description: text("description"),
  instructions: text("instructions")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  cookTimeMinutes: integer("cook_time_minutes"),
  servings: integer("servings").notNull().default(1),
  imageUrl: text("image_url"),
  totalCalories: integer("total_calories"),
  totalProteinG: numeric("total_protein_g"),
  totalCarbsG: numeric("total_carbs_g"),
  totalFatG: numeric("total_fat_g"),
  originalTotalCalories: integer("original_total_calories"),
  originalTotalProteinG: numeric("original_total_protein_g"),
  originalTotalCarbsG: numeric("original_total_carbs_g"),
  originalTotalFatG: numeric("original_total_fat_g"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// INGREDIENTS
// =========================================================
export const ingredients = pgTable("ingredients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: numeric("quantity"),
  unit: text("unit"),
  orderIndex: integer("order_index").notNull().default(0),
  aisle: text("aisle"),
  originalIngredientId: text("original_ingredient_id"),
  isSubstituted: boolean("is_substituted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// INGREDIENT NUTRITION
// =========================================================
export const ingredientNutrition = pgTable("ingredient_nutrition", {
  ingredientId: text("ingredient_id")
    .primaryKey()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  calories: numeric("calories").notNull().default("0"),
  proteinG: numeric("protein_g").notNull().default("0"),
  carbsG: numeric("carbs_g").notNull().default("0"),
  fatG: numeric("fat_g").notNull().default("0"),
});

// =========================================================
// SUBSTITUTION RULES
// =========================================================
export const substitutionRules = pgTable("substitution_rules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  originalIngredientName: text("original_ingredient_name").notNull(),
  substituteName: text("substitute_name").notNull(),
  dietTags: text("diet_tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  caloriesDelta: numeric("calories_delta").notNull().default("0"),
  proteinDelta: numeric("protein_delta").notNull().default("0"),
  carbsDelta: numeric("carbs_delta").notNull().default("0"),
  fatDelta: numeric("fat_delta").notNull().default("0"),
  ratio: numeric("ratio").notNull().default("1"),
  notes: text("notes"),
});

// =========================================================
// RECIPE CONFLICTS
// =========================================================
export const recipeConflicts = pgTable("recipe_conflicts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: text("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  conflictType: conflictTypeEnum("conflict_type").notNull(),
  severity: conflictSeverityEnum("severity").notNull(),
  status: conflictStatusEnum("status").notNull().default("unresolved"),
  matchedTag: text("matched_tag"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// FOLDERS & RECIPE FOLDERS
// =========================================================
export const folders = pgTable("folders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const recipeFolders = pgTable(
  "recipe_folders",
  {
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    folderId: text("folder_id")
      .notNull()
      .references(() => folders.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.recipeId, table.folderId] }),
  ]
);

export const recipeTags = pgTable("recipe_tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tag: text("tag").notNull(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    recipeId: text("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.recipeId] }),
  ]
);

// =========================================================
// MEAL PLAN
// =========================================================
export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  recipeId: text("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  mealSlot: mealSlotEnum("meal_slot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// GROCERY
// =========================================================
export const groceryItems = pgTable("grocery_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: numeric("quantity"),
  unit: text("unit"),
  aisle: text("aisle"),
  isChecked: boolean("is_checked").notNull().default(false),
  weekOf: date("week_of").notNull(),
  sourceRecipeIds: text("source_recipe_ids")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// =========================================================
// NUTRITION LOGS
// =========================================================
export const nutritionLogs = pgTable("nutrition_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  calories: numeric("calories").notNull().default("0"),
  proteinG: numeric("protein_g").notNull().default("0"),
  carbsG: numeric("carbs_g").notNull().default("0"),
  fatG: numeric("fat_g").notNull().default("0"),
});

// =========================================================
// SAFE EATS PLACES
// =========================================================
export const safeEatsPlaces = pgTable("safe_eats_places", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  kind: placeKindEnum("kind").notNull(),
  address: text("address").notNull(),
  lat: numeric("lat").notNull(),
  lng: numeric("lng").notNull(),
  dietTags: text("diet_tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  description: text("description"),
});

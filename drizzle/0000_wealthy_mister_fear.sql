CREATE TYPE "public"."budget_tier" AS ENUM('budget', 'moderate', 'premium');--> statement-breakpoint
CREATE TYPE "public"."conflict_severity" AS ENUM('hard', 'soft');--> statement-breakpoint
CREATE TYPE "public"."conflict_status" AS ENUM('unresolved', 'substituted', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."conflict_type" AS ENUM('allergy', 'diet');--> statement-breakpoint
CREATE TYPE "public"."cooking_skill" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."fitness_goal" AS ENUM('lose', 'maintain', 'gain', 'cut', 'bulk');--> statement-breakpoint
CREATE TYPE "public"."meal_slot" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TYPE "public"."place_kind" AS ENUM('grocery', 'restaurant', 'cafe', 'market');--> statement-breakpoint
CREATE TYPE "public"."source_platform" AS ENUM('tiktok', 'instagram', 'youtube', 'manual');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_recipe_id_pk" PRIMARY KEY("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "folders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grocery_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ingredient_name" text NOT NULL,
	"quantity" numeric,
	"unit" text,
	"aisle" text,
	"is_checked" boolean DEFAULT false NOT NULL,
	"week_of" date NOT NULL,
	"source_recipe_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredient_nutrition" (
	"ingredient_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"calories" numeric DEFAULT '0' NOT NULL,
	"protein_g" numeric DEFAULT '0' NOT NULL,
	"carbs_g" numeric DEFAULT '0' NOT NULL,
	"fat_g" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric,
	"unit" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"aisle" text,
	"original_ingredient_id" text,
	"is_substituted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_plan_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"recipe_id" text NOT NULL,
	"date" date NOT NULL,
	"meal_slot" "meal_slot" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"calories" numeric DEFAULT '0' NOT NULL,
	"protein_g" numeric DEFAULT '0' NOT NULL,
	"carbs_g" numeric DEFAULT '0' NOT NULL,
	"fat_g" numeric DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text,
	"avatar_url" text,
	"onboarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_conflicts" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"user_id" text NOT NULL,
	"conflict_type" "conflict_type" NOT NULL,
	"severity" "conflict_severity" NOT NULL,
	"status" "conflict_status" DEFAULT 'unresolved' NOT NULL,
	"matched_tag" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_folders" (
	"recipe_id" text NOT NULL,
	"folder_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "recipe_folders_recipe_id_folder_id_pk" PRIMARY KEY("recipe_id","folder_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"recipe_id" text NOT NULL,
	"user_id" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_url" text,
	"source_platform" "source_platform" DEFAULT 'manual' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"instructions" text[] DEFAULT '{}'::text[] NOT NULL,
	"cook_time_minutes" integer,
	"servings" integer DEFAULT 1 NOT NULL,
	"image_url" text,
	"total_calories" integer,
	"total_protein_g" numeric,
	"total_carbs_g" numeric,
	"total_fat_g" numeric,
	"original_total_calories" integer,
	"original_total_protein_g" numeric,
	"original_total_carbs_g" numeric,
	"original_total_fat_g" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "safe_eats_places" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" "place_kind" NOT NULL,
	"address" text NOT NULL,
	"lat" numeric NOT NULL,
	"lng" numeric NOT NULL,
	"diet_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "substitution_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"original_ingredient_name" text NOT NULL,
	"substitute_name" text NOT NULL,
	"diet_tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"calories_delta" numeric DEFAULT '0' NOT NULL,
	"protein_delta" numeric DEFAULT '0' NOT NULL,
	"carbs_delta" numeric DEFAULT '0' NOT NULL,
	"fat_delta" numeric DEFAULT '0' NOT NULL,
	"ratio" numeric DEFAULT '1' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"diet_types" text[] DEFAULT '{}'::text[] NOT NULL,
	"allergies" text[] DEFAULT '{}'::text[] NOT NULL,
	"fitness_goal" "fitness_goal",
	"cooking_skill" "cooking_skill",
	"time_availability_minutes" integer,
	"budget_tier" "budget_tier",
	"daily_calorie_target" integer,
	"protein_target_g" integer,
	"carbs_target_g" integer,
	"fat_target_g" integer,
	"height_cm" numeric,
	"weight_kg" numeric,
	"age" integer,
	"sex" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD CONSTRAINT "grocery_items_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_nutrition" ADD CONSTRAINT "ingredient_nutrition_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_nutrition" ADD CONSTRAINT "ingredient_nutrition_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_logs" ADD CONSTRAINT "nutrition_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_conflicts" ADD CONSTRAINT "recipe_conflicts_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_conflicts" ADD CONSTRAINT "recipe_conflicts_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_conflicts" ADD CONSTRAINT "recipe_conflicts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_folders" ADD CONSTRAINT "recipe_folders_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_folders" ADD CONSTRAINT "recipe_folders_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_folders" ADD CONSTRAINT "recipe_folders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
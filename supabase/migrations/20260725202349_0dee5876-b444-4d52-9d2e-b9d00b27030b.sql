
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.source_platform AS ENUM ('tiktok','instagram','youtube','manual');
CREATE TYPE public.meal_slot AS ENUM ('breakfast','lunch','dinner','snack');
CREATE TYPE public.conflict_type AS ENUM ('allergy','diet');
CREATE TYPE public.conflict_severity AS ENUM ('hard','soft');
CREATE TYPE public.conflict_status AS ENUM ('unresolved','substituted','ignored');
CREATE TYPE public.fitness_goal AS ENUM ('lose','maintain','gain','cut','bulk');
CREATE TYPE public.cooking_skill AS ENUM ('beginner','intermediate','advanced');
CREATE TYPE public.budget_tier AS ENUM ('budget','moderate','premium');
CREATE TYPE public.place_kind AS ENUM ('grocery','restaurant','cafe','market');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- USER PREFERENCES
-- =========================================================
CREATE TABLE public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  diet_types TEXT[] NOT NULL DEFAULT '{}',
  allergies TEXT[] NOT NULL DEFAULT '{}',
  fitness_goal public.fitness_goal,
  cooking_skill public.cooking_skill,
  time_availability_minutes INT,
  budget_tier public.budget_tier,
  daily_calorie_target INT,
  protein_target_g INT,
  carbs_target_g INT,
  fat_target_g INT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  age INT,
  sex TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs" ON public.user_preferences FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER touch_prefs BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================================
-- RECIPES
-- =========================================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url TEXT,
  source_platform public.source_platform NOT NULL DEFAULT 'manual',
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT[] NOT NULL DEFAULT '{}',
  cook_time_minutes INT,
  servings INT NOT NULL DEFAULT 1,
  image_url TEXT,
  total_calories INT,
  total_protein_g NUMERIC,
  total_carbs_g NUMERIC,
  total_fat_g NUMERIC,
  original_total_calories INT,
  original_total_protein_g NUMERIC,
  original_total_carbs_g NUMERIC,
  original_total_fat_g NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipes" ON public.recipes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER touch_recipes BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX recipes_user_idx ON public.recipes(user_id, created_at DESC);

-- =========================================================
-- INGREDIENTS
-- =========================================================
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  order_index INT NOT NULL DEFAULT 0,
  aisle TEXT,
  original_ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE SET NULL,
  is_substituted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredients TO authenticated;
GRANT ALL ON public.ingredients TO service_role;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ingredients" ON public.ingredients FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ingredients_recipe_idx ON public.ingredients(recipe_id, order_index);

-- =========================================================
-- INGREDIENT NUTRITION
-- =========================================================
CREATE TABLE public.ingredient_nutrition (
  ingredient_id UUID PRIMARY KEY REFERENCES public.ingredients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ingredient_nutrition TO authenticated;
GRANT ALL ON public.ingredient_nutrition TO service_role;
ALTER TABLE public.ingredient_nutrition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ing nutrition" ON public.ingredient_nutrition FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- SUBSTITUTION RULES (global, readable by all authenticated users)
-- =========================================================
CREATE TABLE public.substitution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_ingredient_name TEXT NOT NULL,
  substitute_name TEXT NOT NULL,
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  calories_delta NUMERIC NOT NULL DEFAULT 0,
  protein_delta NUMERIC NOT NULL DEFAULT 0,
  carbs_delta NUMERIC NOT NULL DEFAULT 0,
  fat_delta NUMERIC NOT NULL DEFAULT 0,
  ratio NUMERIC NOT NULL DEFAULT 1,
  notes TEXT
);
GRANT SELECT ON public.substitution_rules TO authenticated;
GRANT ALL ON public.substitution_rules TO service_role;
ALTER TABLE public.substitution_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub rules read all" ON public.substitution_rules FOR SELECT TO authenticated USING (true);
CREATE INDEX sub_rules_orig_idx ON public.substitution_rules(lower(original_ingredient_name));

-- =========================================================
-- RECIPE CONFLICTS
-- =========================================================
CREATE TABLE public.recipe_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conflict_type public.conflict_type NOT NULL,
  severity public.conflict_severity NOT NULL,
  status public.conflict_status NOT NULL DEFAULT 'unresolved',
  matched_tag TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_conflicts TO authenticated;
GRANT ALL ON public.recipe_conflicts TO service_role;
ALTER TABLE public.recipe_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conflicts" ON public.recipe_conflicts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX conflicts_recipe_idx ON public.recipe_conflicts(recipe_id);

-- =========================================================
-- FOLDERS, RECIPE_FOLDERS, TAGS, FAVORITES
-- =========================================================
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.folders TO authenticated;
GRANT ALL ON public.folders TO service_role;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own folders" ON public.folders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recipe_folders (
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  folder_id UUID NOT NULL REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, folder_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_folders TO authenticated;
GRANT ALL ON public.recipe_folders TO service_role;
ALTER TABLE public.recipe_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipe_folders" ON public.recipe_folders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_tags TO authenticated;
GRANT ALL ON public.recipe_tags TO service_role;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipe_tags" ON public.recipe_tags FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX recipe_tags_recipe_idx ON public.recipe_tags(recipe_id);

CREATE TABLE public.favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own favorites" ON public.favorites FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- MEAL PLAN
-- =========================================================
CREATE TABLE public.meal_plan_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_slot public.meal_slot NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plan_entries TO authenticated;
GRANT ALL ON public.meal_plan_entries TO service_role;
ALTER TABLE public.meal_plan_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meal plan" ON public.meal_plan_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX meal_plan_user_date_idx ON public.meal_plan_entries(user_id, date);

-- =========================================================
-- GROCERY
-- =========================================================
CREATE TABLE public.grocery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC,
  unit TEXT,
  aisle TEXT,
  is_checked BOOLEAN NOT NULL DEFAULT false,
  week_of DATE NOT NULL,
  source_recipe_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grocery_items TO authenticated;
GRANT ALL ON public.grocery_items TO service_role;
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own grocery" ON public.grocery_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX grocery_user_week_idx ON public.grocery_items(user_id, week_of);

-- =========================================================
-- NUTRITION LOGS
-- =========================================================
CREATE TABLE public.nutrition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories NUMERIC NOT NULL DEFAULT 0,
  protein_g NUMERIC NOT NULL DEFAULT 0,
  carbs_g NUMERIC NOT NULL DEFAULT 0,
  fat_g NUMERIC NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_logs TO authenticated;
GRANT ALL ON public.nutrition_logs TO service_role;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nutrition logs" ON public.nutrition_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- SAFE EATS PLACES (global mock geodata)
-- =========================================================
CREATE TABLE public.safe_eats_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind public.place_kind NOT NULL,
  address TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  diet_tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT
);
GRANT SELECT ON public.safe_eats_places TO authenticated;
GRANT ALL ON public.safe_eats_places TO service_role;
ALTER TABLE public.safe_eats_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "safe eats read all" ON public.safe_eats_places FOR SELECT TO authenticated USING (true);

-- =========================================================
-- SEED: SUBSTITUTION RULES (~40 realistic swaps)
-- diet_tags describe which diets the SUBSTITUTE is compatible with
-- =========================================================
INSERT INTO public.substitution_rules (original_ingredient_name, substitute_name, diet_tags, calories_delta, protein_delta, carbs_delta, fat_delta, ratio, notes) VALUES
-- DAIRY
('milk','oat milk',ARRAY['vegan','dairy-free'],-20,-6,3,-4,1,'Creamy, neutral. 1:1 swap.'),
('milk','almond milk',ARRAY['vegan','dairy-free','keto'],-90,-7,-11,-6,1,'Thinner texture, nutty.'),
('milk','soy milk',ARRAY['vegan','dairy-free'],-15,0,4,-3,1,'Closest protein match to dairy.'),
('milk','coconut milk',ARRAY['vegan','dairy-free','paleo'],40,-6,-6,6,1,'Rich, tropical note.'),
('butter','olive oil',ARRAY['vegan','dairy-free','mediterranean'],20,-1,0,3,0.75,'Use 3/4 the amount by volume.'),
('butter','coconut oil',ARRAY['vegan','dairy-free','paleo','keto'],15,-1,0,2,1,'Solid at room temp, similar behavior.'),
('butter','vegan butter',ARRAY['vegan','dairy-free'],-5,-1,0,-1,1,'Direct 1:1 replacement.'),
('heavy cream','coconut cream',ARRAY['vegan','dairy-free','paleo'],-30,-2,1,-3,1,'Whip after chilling.'),
('heavy cream','cashew cream',ARRAY['vegan','dairy-free'],-50,1,2,-6,1,'Blend soaked cashews with water.'),
('cheese','nutritional yeast',ARRAY['vegan','dairy-free'],-80,3,-2,-8,0.25,'Cheesy, umami; use sparingly.'),
('cheese','cashew cheese',ARRAY['vegan','dairy-free'],-40,-3,1,-4,1,'Great melter.'),
('yogurt','coconut yogurt',ARRAY['vegan','dairy-free','paleo'],-10,-5,0,3,1,'Thick, tropical undertone.'),
('yogurt','soy yogurt',ARRAY['vegan','dairy-free'],-15,-2,-1,-1,1,'Protein-forward alternative.'),
('sour cream','cashew sour cream',ARRAY['vegan','dairy-free'],-20,-1,1,-2,1,'Blend cashews with lemon.'),
('parmesan','nutritional yeast',ARRAY['vegan','dairy-free'],-70,2,-1,-7,0.5,'Sprinkle as finishing.'),
-- EGG
('egg','flax egg',ARRAY['vegan','dairy-free'],-30,-5,3,-3,1,'1 tbsp flax + 3 tbsp water, rest 5 min.'),
('egg','chia egg',ARRAY['vegan','dairy-free','paleo'],-30,-5,3,-3,1,'1 tbsp chia + 3 tbsp water.'),
('egg','mashed banana',ARRAY['vegan','dairy-free','paleo'],10,-6,20,-5,0.5,'Best in sweet bakes; adds sweetness.'),
('egg','applesauce',ARRAY['vegan','dairy-free'],-40,-6,10,-5,0.25,'Neutral in muffins and quick breads.'),
('egg','silken tofu',ARRAY['vegan','dairy-free'],-30,-3,1,-4,0.25,'Best for quiches and custards.'),
-- GLUTEN
('all-purpose flour','almond flour',ARRAY['gluten-free','paleo','keto'],60,4,-15,10,1,'Denser bake, more moisture.'),
('all-purpose flour','oat flour',ARRAY['gluten-free','vegan'],0,1,-2,1,1,'Certify GF-labeled oats.'),
('all-purpose flour','gluten-free 1:1 blend',ARRAY['gluten-free'],-5,-1,-1,0,1,'Direct swap; add xanthan if not included.'),
('bread crumbs','crushed almonds',ARRAY['gluten-free','paleo','keto'],80,3,-12,12,1,'Great for crusts.'),
('pasta','zucchini noodles',ARRAY['gluten-free','paleo','keto','low-carb'],-180,-6,-38,-1,1,'Salt and drain to reduce water.'),
('pasta','chickpea pasta',ARRAY['gluten-free','vegan','high-protein'],-30,6,-8,1,1,'Higher protein and fiber.'),
('soy sauce','tamari',ARRAY['gluten-free'],0,0,0,0,1,'Nearly identical, wheat-free.'),
('soy sauce','coconut aminos',ARRAY['gluten-free','paleo','soy-free'],5,-1,2,0,1,'Milder, slightly sweeter.'),
-- MEAT / PROTEIN
('chicken breast','tofu',ARRAY['vegan','vegetarian','dairy-free'],-80,-15,3,-2,1,'Press and marinate for texture.'),
('chicken breast','tempeh',ARRAY['vegan','vegetarian'],-40,-10,5,1,1,'Firm bite, nutty flavor.'),
('chicken breast','seitan',ARRAY['vegan','vegetarian'],-20,-2,2,-3,1,'Very meaty texture. Contains gluten.'),
('ground beef','lentils',ARRAY['vegan','vegetarian','dairy-free'],-140,-15,20,-15,1,'Rinse and drain well.'),
('ground beef','plant-based mince',ARRAY['vegan','vegetarian','dairy-free'],-50,-3,3,-6,1,'Direct 1:1 swap.'),
('ground beef','mushrooms',ARRAY['vegan','vegetarian','paleo'],-200,-22,4,-18,1,'Chop finely; deep umami.'),
('bacon','coconut bacon',ARRAY['vegan','vegetarian','dairy-free'],-100,-8,3,-8,1,'Smoked coconut flakes.'),
('bacon','tempeh bacon',ARRAY['vegan','vegetarian'],-80,-4,4,-6,1,'Marinate and pan-fry.'),
('fish','hearts of palm',ARRAY['vegan','vegetarian','paleo'],-100,-18,5,-6,1,'Shreds like fish; brine-forward.'),
-- SUGAR / SWEETENERS
('sugar','maple syrup',ARRAY['vegan','paleo','refined-sugar-free'],-15,0,-4,0,0.75,'Reduce other liquids by ~3 tbsp/cup.'),
('sugar','honey',ARRAY['vegetarian','paleo','refined-sugar-free'],-10,0,-3,0,0.75,'Not vegan.'),
('sugar','coconut sugar',ARRAY['vegan','paleo','refined-sugar-free'],-5,0,-1,0,1,'Direct 1:1, slight caramel note.'),
-- OIL / FAT
('vegetable oil','avocado oil',ARRAY['paleo','keto','whole30'],0,0,0,0,1,'Higher smoke point, cleaner flavor.'),
('vegetable oil','olive oil',ARRAY['mediterranean','paleo'],0,0,0,0,1,'Best for medium-heat cooking.'),
-- NUTS (allergy)
('peanut butter','sunflower seed butter',ARRAY['nut-free','vegan'],-10,-3,2,-1,1,'Perfect for nut allergies.'),
('almond','pumpkin seeds',ARRAY['nut-free','vegan','paleo'],-10,3,2,-4,1,'Similar crunch, nut-free.');

-- =========================================================
-- SEED: SAFE EATS PLACES (NYC-ish coords, mock)
-- =========================================================
INSERT INTO public.safe_eats_places (name, kind, address, lat, lng, diet_tags, description) VALUES
('Green Grove Market','grocery','412 Bedford Ave, Brooklyn, NY',40.7146,-73.9612,ARRAY['vegan','vegetarian','gluten-free','dairy-free','organic'],'Full plant-based grocery with dedicated GF aisle.'),
('The Cutting Board','restaurant','88 W 3rd St, New York, NY',40.7305,-73.9995,ARRAY['gluten-free','dairy-free','paleo'],'Chef-led, allergen-labeled menu.'),
('Halal Guys Corner','restaurant','307 W 43rd St, New York, NY',40.7594,-73.9910,ARRAY['halal'],'Certified halal Mediterranean.'),
('Kosher Kitchen','restaurant','221 W 79th St, New York, NY',40.7833,-73.9803,ARRAY['kosher','vegetarian'],'OU-certified kosher dairy restaurant.'),
('Keto Bar & Kitchen','restaurant','55 Gansevoort St, New York, NY',40.7397,-74.0084,ARRAY['keto','paleo','low-carb','gluten-free'],'No seed oils, no sugar. Grass-fed proteins.'),
('Whole Roots Co-op','grocery','1102 8th Ave, Brooklyn, NY',40.6659,-73.9820,ARRAY['vegan','vegetarian','gluten-free','organic'],'Neighborhood co-op, allergen-forward.'),
('Sprout Cafe','cafe','215 Smith St, Brooklyn, NY',40.6867,-73.9945,ARRAY['vegan','gluten-free','dairy-free'],'Oat lattes, GF pastries baked daily.'),
('Fig & Farro','restaurant','170 Grand St, New York, NY',40.7196,-73.9977,ARRAY['vegan','vegetarian','mediterranean'],'Plant-forward Mediterranean small plates.'),
('Union Sq Greenmarket','market','E 17th St & Broadway, New York, NY',40.7359,-73.9911,ARRAY['organic','vegan','vegetarian','paleo'],'Farmers market — seasonal, mostly whole foods.'),
('Rise Bakehouse','cafe','44 Court St, Brooklyn, NY',40.6929,-73.9903,ARRAY['gluten-free','dairy-free'],'Dedicated gluten-free bakery.'),
('Blue Ocean Sushi','restaurant','512 Amsterdam Ave, New York, NY',40.7857,-73.9760,ARRAY['pescatarian','gluten-free','dairy-free'],'Tamari and GF soy on request.'),
('Sabich House','restaurant','76 Orchard St, New York, NY',40.7181,-73.9905,ARRAY['vegetarian','vegan','kosher','mediterranean'],'Israeli sabich and mezze, plant-heavy.');

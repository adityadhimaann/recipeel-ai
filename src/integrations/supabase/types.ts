export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      favorites: {
        Row: {
          created_at: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          aisle: string | null
          created_at: string
          id: string
          ingredient_name: string
          is_checked: boolean
          quantity: number | null
          source_recipe_ids: string[]
          unit: string | null
          user_id: string
          week_of: string
        }
        Insert: {
          aisle?: string | null
          created_at?: string
          id?: string
          ingredient_name: string
          is_checked?: boolean
          quantity?: number | null
          source_recipe_ids?: string[]
          unit?: string | null
          user_id: string
          week_of: string
        }
        Update: {
          aisle?: string | null
          created_at?: string
          id?: string
          ingredient_name?: string
          is_checked?: boolean
          quantity?: number | null
          source_recipe_ids?: string[]
          unit?: string | null
          user_id?: string
          week_of?: string
        }
        Relationships: []
      }
      ingredient_nutrition: {
        Row: {
          calories: number
          carbs_g: number
          fat_g: number
          ingredient_id: string
          protein_g: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          ingredient_id: string
          protein_g?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          fat_g?: number
          ingredient_id?: string
          protein_g?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredient_nutrition_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: true
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          aisle: string | null
          created_at: string
          id: string
          is_substituted: boolean
          name: string
          order_index: number
          original_ingredient_id: string | null
          quantity: number | null
          recipe_id: string
          unit: string | null
          user_id: string
        }
        Insert: {
          aisle?: string | null
          created_at?: string
          id?: string
          is_substituted?: boolean
          name: string
          order_index?: number
          original_ingredient_id?: string | null
          quantity?: number | null
          recipe_id: string
          unit?: string | null
          user_id: string
        }
        Update: {
          aisle?: string | null
          created_at?: string
          id?: string
          is_substituted?: boolean
          name?: string
          order_index?: number
          original_ingredient_id?: string | null
          quantity?: number | null
          recipe_id?: string
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_original_ingredient_id_fkey"
            columns: ["original_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          meal_slot: Database["public"]["Enums"]["meal_slot"]
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          meal_slot: Database["public"]["Enums"]["meal_slot"]
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          meal_slot?: Database["public"]["Enums"]["meal_slot"]
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_entries_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number
          carbs_g: number
          date: string
          fat_g: number
          id: string
          protein_g: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          date: string
          fat_g?: number
          id?: string
          protein_g?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          date?: string
          fat_g?: number
          id?: string
          protein_g?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          onboarded?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      recipe_conflicts: {
        Row: {
          conflict_type: Database["public"]["Enums"]["conflict_type"]
          created_at: string
          id: string
          ingredient_id: string
          matched_tag: string | null
          recipe_id: string
          severity: Database["public"]["Enums"]["conflict_severity"]
          status: Database["public"]["Enums"]["conflict_status"]
          user_id: string
        }
        Insert: {
          conflict_type: Database["public"]["Enums"]["conflict_type"]
          created_at?: string
          id?: string
          ingredient_id: string
          matched_tag?: string | null
          recipe_id: string
          severity: Database["public"]["Enums"]["conflict_severity"]
          status?: Database["public"]["Enums"]["conflict_status"]
          user_id: string
        }
        Update: {
          conflict_type?: Database["public"]["Enums"]["conflict_type"]
          created_at?: string
          id?: string
          ingredient_id?: string
          matched_tag?: string | null
          recipe_id?: string
          severity?: Database["public"]["Enums"]["conflict_severity"]
          status?: Database["public"]["Enums"]["conflict_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_conflicts_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_conflicts_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_folders: {
        Row: {
          folder_id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          folder_id: string
          recipe_id: string
          user_id: string
        }
        Update: {
          folder_id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_folders_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_folders_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_tags: {
        Row: {
          id: string
          recipe_id: string
          tag: string
          user_id: string
        }
        Insert: {
          id?: string
          recipe_id: string
          tag: string
          user_id: string
        }
        Update: {
          id?: string
          recipe_id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_tags_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          instructions: string[]
          original_total_calories: number | null
          original_total_carbs_g: number | null
          original_total_fat_g: number | null
          original_total_protein_g: number | null
          servings: number
          source_platform: Database["public"]["Enums"]["source_platform"]
          source_url: string | null
          title: string
          total_calories: number | null
          total_carbs_g: number | null
          total_fat_g: number | null
          total_protein_g: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string[]
          original_total_calories?: number | null
          original_total_carbs_g?: number | null
          original_total_fat_g?: number | null
          original_total_protein_g?: number | null
          servings?: number
          source_platform?: Database["public"]["Enums"]["source_platform"]
          source_url?: string | null
          title: string
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          instructions?: string[]
          original_total_calories?: number | null
          original_total_carbs_g?: number | null
          original_total_fat_g?: number | null
          original_total_protein_g?: number | null
          servings?: number
          source_platform?: Database["public"]["Enums"]["source_platform"]
          source_url?: string | null
          title?: string
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fat_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      safe_eats_places: {
        Row: {
          address: string
          description: string | null
          diet_tags: string[]
          id: string
          kind: Database["public"]["Enums"]["place_kind"]
          lat: number
          lng: number
          name: string
        }
        Insert: {
          address: string
          description?: string | null
          diet_tags?: string[]
          id?: string
          kind: Database["public"]["Enums"]["place_kind"]
          lat: number
          lng: number
          name: string
        }
        Update: {
          address?: string
          description?: string | null
          diet_tags?: string[]
          id?: string
          kind?: Database["public"]["Enums"]["place_kind"]
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
      substitution_rules: {
        Row: {
          calories_delta: number
          carbs_delta: number
          diet_tags: string[]
          fat_delta: number
          id: string
          notes: string | null
          original_ingredient_name: string
          protein_delta: number
          ratio: number
          substitute_name: string
        }
        Insert: {
          calories_delta?: number
          carbs_delta?: number
          diet_tags?: string[]
          fat_delta?: number
          id?: string
          notes?: string | null
          original_ingredient_name: string
          protein_delta?: number
          ratio?: number
          substitute_name: string
        }
        Update: {
          calories_delta?: number
          carbs_delta?: number
          diet_tags?: string[]
          fat_delta?: number
          id?: string
          notes?: string | null
          original_ingredient_name?: string
          protein_delta?: number
          ratio?: number
          substitute_name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          age: number | null
          allergies: string[]
          budget_tier: Database["public"]["Enums"]["budget_tier"] | null
          carbs_target_g: number | null
          cooking_skill: Database["public"]["Enums"]["cooking_skill"] | null
          daily_calorie_target: number | null
          diet_types: string[]
          fat_target_g: number | null
          fitness_goal: Database["public"]["Enums"]["fitness_goal"] | null
          height_cm: number | null
          protein_target_g: number | null
          sex: string | null
          time_availability_minutes: number | null
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string[]
          budget_tier?: Database["public"]["Enums"]["budget_tier"] | null
          carbs_target_g?: number | null
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null
          daily_calorie_target?: number | null
          diet_types?: string[]
          fat_target_g?: number | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          height_cm?: number | null
          protein_target_g?: number | null
          sex?: string | null
          time_availability_minutes?: number | null
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string[]
          budget_tier?: Database["public"]["Enums"]["budget_tier"] | null
          carbs_target_g?: number | null
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null
          daily_calorie_target?: number | null
          diet_types?: string[]
          fat_target_g?: number | null
          fitness_goal?: Database["public"]["Enums"]["fitness_goal"] | null
          height_cm?: number | null
          protein_target_g?: number | null
          sex?: string | null
          time_availability_minutes?: number | null
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      budget_tier: "budget" | "moderate" | "premium"
      conflict_severity: "hard" | "soft"
      conflict_status: "unresolved" | "substituted" | "ignored"
      conflict_type: "allergy" | "diet"
      cooking_skill: "beginner" | "intermediate" | "advanced"
      fitness_goal: "lose" | "maintain" | "gain" | "cut" | "bulk"
      meal_slot: "breakfast" | "lunch" | "dinner" | "snack"
      place_kind: "grocery" | "restaurant" | "cafe" | "market"
      source_platform: "tiktok" | "instagram" | "youtube" | "manual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      budget_tier: ["budget", "moderate", "premium"],
      conflict_severity: ["hard", "soft"],
      conflict_status: ["unresolved", "substituted", "ignored"],
      conflict_type: ["allergy", "diet"],
      cooking_skill: ["beginner", "intermediate", "advanced"],
      fitness_goal: ["lose", "maintain", "gain", "cut", "bulk"],
      meal_slot: ["breakfast", "lunch", "dinner", "snack"],
      place_kind: ["grocery", "restaurant", "cafe", "market"],
      source_platform: ["tiktok", "instagram", "youtube", "manual"],
    },
  },
} as const

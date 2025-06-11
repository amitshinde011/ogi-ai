export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_comparisons: {
        Row: {
          before_assessment_id: string | null
          created_at: string
          final_assessment_id: string | null
          id: string
          shared_to_community: boolean | null
          shared_to_social: boolean | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          before_assessment_id?: string | null
          created_at?: string
          final_assessment_id?: string | null
          id?: string
          shared_to_community?: boolean | null
          shared_to_social?: boolean | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          before_assessment_id?: string | null
          created_at?: string
          final_assessment_id?: string | null
          id?: string
          shared_to_community?: boolean | null
          shared_to_social?: boolean | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_comparisons_before_assessment_id_fkey"
            columns: ["before_assessment_id"]
            isOneToOne: false
            referencedRelation: "journey_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_comparisons_final_assessment_id_fkey"
            columns: ["final_assessment_id"]
            isOneToOne: false
            referencedRelation: "final_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_comparisons_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_comment_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "community_post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          likes_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_wellness: {
        Row: {
          created_at: string
          date: string
          id: string
          meditation_completed: boolean | null
          meditation_minutes: number | null
          surya_namaskar_count: number | null
          updated_at: string
          user_id: string
          water_litres: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          meditation_completed?: boolean | null
          meditation_minutes?: number | null
          surya_namaskar_count?: number | null
          updated_at?: string
          user_id: string
          water_litres?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          meditation_completed?: boolean | null
          meditation_minutes?: number | null
          surya_namaskar_count?: number | null
          updated_at?: string
          user_id?: string
          water_litres?: number | null
        }
        Relationships: []
      }
      final_assessments: {
        Row: {
          assessment_type: string | null
          climb_mountain_comfort: string | null
          comments: string | null
          created_at: string
          current_health_conditions: string | null
          full_body_photo_url: string | null
          id: string
          run_10km_comfort: string | null
          subscription_id: string | null
          user_id: string
          walk_10km_comfort: string | null
        }
        Insert: {
          assessment_type?: string | null
          climb_mountain_comfort?: string | null
          comments?: string | null
          created_at?: string
          current_health_conditions?: string | null
          full_body_photo_url?: string | null
          id?: string
          run_10km_comfort?: string | null
          subscription_id?: string | null
          user_id: string
          walk_10km_comfort?: string | null
        }
        Update: {
          assessment_type?: string | null
          climb_mountain_comfort?: string | null
          comments?: string | null
          created_at?: string
          current_health_conditions?: string | null
          full_body_photo_url?: string | null
          id?: string
          run_10km_comfort?: string | null
          subscription_id?: string | null
          user_id?: string
          walk_10km_comfort?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "final_assessments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_assessments: {
        Row: {
          assessment_type: string | null
          climb_mountain_comfort: string | null
          comments: string | null
          created_at: string | null
          current_health_conditions: string | null
          full_body_photo_url: string | null
          id: string
          run_10km_comfort: string | null
          subscription_id: string | null
          user_id: string | null
          walk_10km_comfort: string | null
        }
        Insert: {
          assessment_type?: string | null
          climb_mountain_comfort?: string | null
          comments?: string | null
          created_at?: string | null
          current_health_conditions?: string | null
          full_body_photo_url?: string | null
          id?: string
          run_10km_comfort?: string | null
          subscription_id?: string | null
          user_id?: string | null
          walk_10km_comfort?: string | null
        }
        Update: {
          assessment_type?: string | null
          climb_mountain_comfort?: string | null
          comments?: string | null
          created_at?: string | null
          current_health_conditions?: string | null
          full_body_photo_url?: string | null
          id?: string
          run_10km_comfort?: string | null
          subscription_id?: string | null
          user_id?: string | null
          walk_10km_comfort?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_assessments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_tracking: {
        Row: {
          calories: number | null
          created_at: string
          date: string
          food_item: string
          id: string
          meal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          date?: string
          food_item: string
          id?: string
          meal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          date?: string
          food_item?: string
          id?: string
          meal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          benefits: string[] | null
          created_at: string | null
          description: string | null
          duration_days: number
          features: string[] | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          duration_days: number
          features?: string[] | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          benefits?: string[] | null
          created_at?: string | null
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string
          cook_time: string | null
          created_at: string
          details: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          instructions: string[] | null
          name: string
          nutrition: Json | null
          package: string | null
          rating: number | null
          servings: number | null
          tips: string[] | null
          updated_at: string
        }
        Insert: {
          category: string
          cook_time?: string | null
          created_at?: string
          details?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          name: string
          nutrition?: Json | null
          package?: string | null
          rating?: number | null
          servings?: number | null
          tips?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          cook_time?: string | null
          created_at?: string
          details?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          instructions?: string[] | null
          name?: string
          nutrition?: Json | null
          package?: string | null
          rating?: number | null
          servings?: number | null
          tips?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      steps_tracking: {
        Row: {
          created_at: string
          date: string
          id: string
          steps_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          steps_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          steps_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          before_assessment_completed: boolean | null
          created_at: string | null
          id: string
          intro_video_watched: boolean | null
          journey_started: boolean | null
          profile_completed: boolean | null
          subscription_selected: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          before_assessment_completed?: boolean | null
          created_at?: string | null
          id?: string
          intro_video_watched?: boolean | null
          journey_started?: boolean | null
          profile_completed?: boolean | null
          subscription_selected?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          before_assessment_completed?: boolean | null
          created_at?: string | null
          id?: string
          intro_video_watched?: boolean | null
          journey_started?: boolean | null
          profile_completed?: boolean | null
          subscription_selected?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          gender: string | null
          health_issues: string | null
          height: number | null
          id: string
          name: string | null
          physical_activity_basic: string | null
          physical_activity_intense: string | null
          physical_activity_medium: string | null
          profile_photo_url: string | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          gender?: string | null
          health_issues?: string | null
          height?: number | null
          id?: string
          name?: string | null
          physical_activity_basic?: string | null
          physical_activity_intense?: string | null
          physical_activity_medium?: string | null
          profile_photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          gender?: string | null
          health_issues?: string | null
          height?: number | null
          id?: string
          name?: string | null
          physical_activity_basic?: string | null
          physical_activity_intense?: string | null
          physical_activity_medium?: string | null
          profile_photo_url?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          payment_status: string | null
          program_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_status?: string | null
          program_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_status?: string | null
          program_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

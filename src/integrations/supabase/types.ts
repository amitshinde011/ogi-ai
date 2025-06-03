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

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
      comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
          user_avatar: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
          user_avatar?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string | null
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
          updated_at: string
          user_id: string
          user_name: string | null
          user_profile_picture_url: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id: string
          user_name?: string | null
          user_profile_picture_url?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          likes_count?: number | null
          updated_at?: string
          user_id?: string
          user_name?: string | null
          user_profile_picture_url?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          code: string
          created_at: string
          discount_percentage: number
          id: string
          is_active: boolean
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_percentage: number
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
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
      followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      likes: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          message_text: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          message_text: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_text?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          post_id: string | null
          recipient_id: string
          sender_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          recipient_id: string
          sender_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          post_id?: string | null
          recipient_id?: string
          sender_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          gateway_session_id: string | null
          gateway_transaction_id: string | null
          id: string
          payment_gateway: string
          program_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          gateway_session_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_gateway: string
          program_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          gateway_session_id?: string | null
          gateway_transaction_id?: string | null
          id?: string
          payment_gateway?: string
          program_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          comment_count: number | null
          created_at: string | null
          id: string
          image_url: string
          like_count: number | null
          meal_type: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string
          image_url: string
          like_count?: number | null
          meal_type?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          comment_count?: number | null
          created_at?: string | null
          id?: string
          image_url?: string
          like_count?: number | null
          meal_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          price_inr: number | null
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
          price_inr?: number | null
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
          price_inr?: number | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          category: string
          cloudflare_image_id: string
          cook_time: string | null
          created_at: string
          details: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          ingredients: string | null
          instructions: string | null
          name: string
          nutrition: Json | null
          package: string | null
          rating: number | null
          servings: number | null
          tips: string | null
          updated_at: string
        }
        Insert: {
          category: string
          cloudflare_image_id: string
          cook_time?: string | null
          created_at?: string
          details?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          name: string
          nutrition?: Json | null
          package?: string | null
          rating?: number | null
          servings?: number | null
          tips?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cloudflare_image_id?: string
          cook_time?: string | null
          created_at?: string
          details?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          instructions?: string | null
          name?: string
          nutrition?: Json | null
          package?: string | null
          rating?: number | null
          servings?: number | null
          tips?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_package_fkey"
            columns: ["package"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      user_saved_recipes: {
        Row: {
          created_at: string
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipe_id?: string
          user_id?: string
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

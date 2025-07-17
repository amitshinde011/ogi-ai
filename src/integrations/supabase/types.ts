export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
            referencedRelation: "user_program_summary"
            referencedColumns: ["subscription_id"]
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
      automation_activity_log: {
        Row: {
          activity_type: string
          automation_user_id: string | null
          created_at: string | null
          id: string
          target_comment_id: number | null
          target_post_id: number | null
        }
        Insert: {
          activity_type: string
          automation_user_id?: string | null
          created_at?: string | null
          id?: string
          target_comment_id?: number | null
          target_post_id?: number | null
        }
        Update: {
          activity_type?: string
          automation_user_id?: string | null
          created_at?: string | null
          id?: string
          target_comment_id?: number | null
          target_post_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_activity_log_automation_user_id_fkey"
            columns: ["automation_user_id"]
            isOneToOne: false
            referencedRelation: "automation_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_activity_log_target_comment_id_fkey"
            columns: ["target_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_activity_log_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "community_feed_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_activity_log_target_post_id_fkey"
            columns: ["target_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_captions: {
        Row: {
          created_at: string | null
          id: string
          meal_type: string
          persona_type: string
          template_text: string
          variables: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          meal_type: string
          persona_type: string
          template_text: string
          variables?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          meal_type?: string
          persona_type?: string
          template_text?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      automation_comments: {
        Row: {
          comment_type: string
          context_tags: string[] | null
          created_at: string | null
          id: string
          persona_type: string
          template_text: string
        }
        Insert: {
          comment_type: string
          context_tags?: string[] | null
          created_at?: string | null
          id?: string
          persona_type: string
          template_text: string
        }
        Update: {
          comment_type?: string
          context_tags?: string[] | null
          created_at?: string | null
          id?: string
          persona_type?: string
          template_text?: string
        }
        Relationships: []
      }
      automation_meal_content: {
        Row: {
          created_at: string | null
          cuisine_type: string
          dietary_tags: string[] | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          meal_type: string
        }
        Insert: {
          created_at?: string | null
          cuisine_type: string
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          meal_type: string
        }
        Update: {
          created_at?: string | null
          cuisine_type?: string
          dietary_tags?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          meal_type?: string
        }
        Relationships: []
      }
      automation_users: {
        Row: {
          created_at: string | null
          cuisine_specialty: string[] | null
          id: string
          is_active: boolean | null
          name: string
          persona_type: string
          profile_photo_url: string | null
          timezone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cuisine_specialty?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          persona_type: string
          profile_photo_url?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cuisine_specialty?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          persona_type?: string
          profile_photo_url?: string | null
          timezone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string | null
          created_at: string | null
          id: number
          parent_comment_id: number | null
          post_id: number | null
          text: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string | null
          id?: never
          parent_comment_id?: number | null
          post_id?: number | null
          text: string
        }
        Update: {
          author_id?: string | null
          created_at?: string | null
          id?: never
          parent_comment_id?: number | null
          post_id?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_feed_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "user_program_summary"
            referencedColumns: ["subscription_id"]
          },
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
            referencedRelation: "user_program_summary"
            referencedColumns: ["subscription_id"]
          },
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
          post_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_feed_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
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
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: number
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: number
          reason?: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: number
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_feed_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          caption: string | null
          category: string | null
          comment_count: number
          created_at: string | null
          id: number
          image_url: string
          is_reported: boolean
          like_count: number
          report_count: number
          report_threshold_reached: boolean
        }
        Insert: {
          author_id?: string | null
          caption?: string | null
          category?: string | null
          comment_count?: number
          created_at?: string | null
          id?: never
          image_url: string
          is_reported?: boolean
          like_count?: number
          report_count?: number
          report_threshold_reached?: boolean
        }
        Update: {
          author_id?: string | null
          caption?: string | null
          category?: string | null
          comment_count?: number
          created_at?: string | null
          id?: never
          image_url?: string
          is_reported?: boolean
          like_count?: number
          report_count?: number
          report_threshold_reached?: boolean
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
      community_feed_view: {
        Row: {
          author_avatar: string | null
          author_id: string | null
          author_name: string | null
          caption: string | null
          category: string | null
          comment_count: number | null
          created_at: string | null
          id: number | null
          image_url: string | null
          is_reported: boolean | null
          like_count: number | null
          report_count: number | null
          report_threshold_reached: boolean | null
        }
        Relationships: []
      }
      daily_activity_summary: {
        Row: {
          date: string | null
          has_breakfast: boolean | null
          has_dinner: boolean | null
          has_kanji: boolean | null
          has_lunch: boolean | null
          has_salad_bowl: boolean | null
          last_updated: string | null
          meals_logged: number | null
          meditation_completed: boolean | null
          steps_count: number | null
          surya_namaskar_count: number | null
          user_id: string | null
          walk_score: number | null
          water_litres: number | null
        }
        Relationships: []
      }
      user_program_summary: {
        Row: {
          days_completed: number | null
          duration_days: number | null
          end_date: string | null
          is_completed: boolean | null
          is_current: boolean | null
          last_updated: string | null
          program_name: string | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      weekly_progress_summary: {
        Row: {
          avg_steps: number | null
          avg_water: number | null
          days_tracked: number | null
          days_with_meals: number | null
          last_updated: string | null
          meditation_days: number | null
          step_goal_days: number | null
          total_steps: number | null
          total_water: number | null
          user_id: string | null
          week_start: string | null
          yoga_days: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_streaks: {
        Args: { p_user_id: string; p_start_date?: string }
        Returns: {
          current_streak: number
          best_streak: number
          active_days: number
        }[]
      }
      get_community_feed: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          id: number
          image_url: string
          caption: string
          category: string
          created_at: string
          like_count: number
          comment_count: number
          author_id: string
          author_name: string
          author_avatar: string
          user_has_liked: boolean
          report_count: number
          is_reported: boolean
          report_threshold_reached: boolean
          user_has_reported: boolean
        }[]
      }
      get_home_data: {
        Args: { p_user_id: string; p_date: string }
        Returns: {
          meals_logged: number
          water_litres: number
          surya_namaskar_count: number
          meditation_completed: boolean
          steps_count: number
          walk_score: number
          has_breakfast: boolean
          has_lunch: boolean
          has_dinner: boolean
          has_salad_bowl: boolean
          has_kanji: boolean
        }[]
      }
      get_journey_progress_data: {
        Args: { p_user_id: string; p_start_date: string; p_end_date: string }
        Returns: {
          daily_points: Json
          total_points: number
          max_possible_points: number
          average_score: number
        }[]
      }
      get_optimized_weekly_data: {
        Args: { p_user_id: string; p_weeks_back?: number }
        Returns: {
          week_data: Json
          streak_data: Json
        }[]
      }
      get_progress_data: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_weekly_progress: {
        Args: { p_user_id: string; p_weeks_back?: number }
        Returns: {
          week_start: string
          days_tracked: number
          days_with_meals: number
          meditation_days: number
          yoga_days: number
          step_goal_days: number
          avg_water: number
          avg_steps: number
          total_steps: number
          total_water: number
        }[]
      }
      refresh_activity_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_activity_views_batch: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_community_feed_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scheduled_community_feed_refresh: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      scheduled_view_refresh: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      upsert_wellness_data: {
        Args: {
          p_user_id: string
          p_date: string
          p_water_litres?: number
          p_surya_namaskar_count?: number
          p_meditation_completed?: boolean
          p_meditation_minutes?: number
        }
        Returns: {
          id: string
          water_litres: number
          surya_namaskar_count: number
          meditation_completed: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

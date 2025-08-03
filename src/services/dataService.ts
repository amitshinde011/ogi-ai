import { supabase } from '@/integrations/supabase/client';

// Consolidated data service for better architecture
export class DataService {
  // User Profile operations
  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Wellness data operations
  static async getDailyWellness(userId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_wellness')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async upsertDailyWellness(userId: string, date: string, updates: any) {
    const { data, error } = await supabase
      .rpc('upsert_wellness_data', {
        p_user_id: userId,
        p_date: date,
        p_water_litres: updates.water_litres,
        p_surya_namaskar_count: updates.surya_namaskar_count,
        p_meditation_completed: updates.meditation_completed,
        p_meditation_minutes: updates.meditation_minutes
      });
    
    if (error) throw error;
    return data;
  }

  // Meal tracking operations
  static async getMealsByDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from('meal_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async addMeal(userId: string, meal: any) {
    const { data, error } = await supabase
      .from('meal_tracking')
      .insert({
        user_id: userId,
        ...meal
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteMeal(mealId: string) {
    const { error } = await supabase
      .from('meal_tracking')
      .delete()
      .eq('id', mealId);
    
    if (error) throw error;
  }

  // Steps tracking operations
  static async getStepsForDate(userId: string, date: string) {
    const { data, error } = await supabase
      .from('steps_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async upsertSteps(userId: string, date: string, stepsCount: number) {
    const { data, error } = await supabase
      .from('steps_tracking')
      .upsert({
        user_id: userId,
        date,
        steps_count: stepsCount
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Home data operations - consolidated
  static async getHomeData(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_home_data', {
          p_user_id: userId,
          p_date: date
        });
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching home data:', error);
      return null;
    }
  }

  // Progress data operations
  static async getProgressData(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_progress_data', {
          p_user_id: userId
        });
      
      if (error) throw error;
      return data || { weekly_data: [], journey_data: {} };
    } catch (error) {
      console.error('Error fetching progress data:', error);
      return { weekly_data: [], journey_data: {} };
    }
  }

  // User program operations
  static async getUserProgram(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        program:programs(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  // Community posts operations
  static async getCommunityPosts(userId: string, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .rpc('get_community_feed', {
          p_user_id: userId,
          p_limit: limit,
          p_offset: offset
        });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching community posts:', error);
      return [];
    }
  }

  static async createPost(userId: string, postData: any) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        ...postData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async toggleLike(userId: string, postId: number) {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    
    if (existingLike) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      
      if (error) throw error;
      return false;
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId
        });
      
      if (error) throw error;
      return true;
    }
  }

  // Recipe operations
  static async getRecipes(category?: string) {
    let query = supabase
      .from('recipes')
      .select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getSavedRecipes(userId: string) {
    const { data, error } = await supabase
      .from('user_saved_recipes')
      .select(`
        recipe:recipes(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map(item => item.recipe).filter(Boolean) || [];
  }

  static async toggleSaveRecipe(userId: string, recipeId: string) {
    // Check if recipe is saved
    const { data: savedRecipe } = await supabase
      .from('user_saved_recipes')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();
    
    if (savedRecipe) {
      // Remove from saved
      const { error } = await supabase
        .from('user_saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);
      
      if (error) throw error;
      return false;
    } else {
      // Add to saved
      const { error } = await supabase
        .from('user_saved_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipeId
        });
      
      if (error) throw error;
      return true;
    }
  }

  // Notifications operations
  static async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:user_profiles!notifications_sender_id_fkey(
          id,
          name,
          profile_photo_url
        ),
        post:posts(id, caption)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data || [];
  }

  static async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  // Assessment operations
  static async getAssessments(userId: string) {
    const [beforeAssessment, finalAssessment] = await Promise.all([
      supabase
        .from('journey_assessments')
        .select('*')
        .eq('user_id', userId)
        .eq('assessment_type', 'before')
        .maybeSingle(),
      supabase
        .from('final_assessments')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
    ]);
    
    return {
      before: beforeAssessment.data,
      final: finalAssessment.data
    };
  }

  // Batch operations for better performance
  static async batchUpdateWellness(operations: Array<{ userId: string; date: string; data: any }>) {
    const results = [];
    
    for (const op of operations) {
      try {
        const result = await this.upsertDailyWellness(op.userId, op.date, op.data);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }
    
    return results;
  }
  
  static async batchUpdateMeals(meals: Array<{ userId: string; meal: any }>) {
    const results = [];
    
    for (const mealData of meals) {
      try {
        const result = await this.addMeal(mealData.userId, mealData.meal);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }
    
    return results;
  }

  // Analytics and caching
  static async getCachedData(key: string, fetcher: () => Promise<any>, ttlMs = 300000) {
    const cacheKey = `cache_${key}_${Date.now() - (Date.now() % ttlMs)}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    
    const data = await fetcher();
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      // Clean old cache entries
      Object.keys(localStorage)
        .filter(k => k.startsWith('cache_') && k !== cacheKey)
        .forEach(k => localStorage.removeItem(k));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
    
    return data;
  }
}
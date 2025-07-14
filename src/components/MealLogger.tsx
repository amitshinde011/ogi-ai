
import React, { useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/social/CreatePostModal';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useUserProgram } from '@/hooks/useUserProgram';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalDateString } from '@/utils/dateUtils';
import { toast } from '@/hooks/use-toast';

const MealLogger = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { createPost, fetchDiscoverFeed } = useSocialPosts();
  const { data: userProgram } = useUserProgram();
  const { isCompleted } = useProgramCompletion();
  const { user } = useAuth();

  const handleCreateMealPost = async (imageUrl: string, caption: string, mealType?: string) => {
    if (!user || !mealType) {
      console.log('⚠️ MealLogger: Missing user or mealType');
      return false;
    }

    try {
      // First, log the meal to the meal_tracking table
      const today = getLocalDateString();
      const { data: mealData, error: mealError } = await supabase
        .from('meal_tracking')
        .insert({
          user_id: user.id,
          date: today,
          meal_type: mealType,
          food_item: caption || 'Meal logged from social post'
        })
        .select()
        .single();

      if (mealError) {
        console.error('❌ MealLogger: Error logging meal:', mealError);
        toast({ title: "Failed to log meal", variant: "destructive" });
        return false;
      }

      console.log('✅ MealLogger: Meal logged successfully:', mealData);

      // Then create the social post
      const success = await createPost(imageUrl, caption, mealType);
      if (success) {
        fetchDiscoverFeed(); // Refresh feeds
        
        // Dispatch event to notify home page to refresh meal data
        const event = new CustomEvent('mealLogged', {
          detail: { mealType, mealData }
        });
        window.dispatchEvent(event);
        console.log('📢 MealLogger: mealLogged event dispatched for:', mealType);
        
        toast({ title: "Meal logged and shared successfully!" });
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ MealLogger: Error in handleCreateMealPost:', error);
      toast({ title: "Failed to log meal", variant: "destructive" });
      return false;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Share Your Meal</h3>
          <Camera className="w-5 h-5 text-sage" />
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          Document your wellness journey by sharing your healthy meals with the community
        </p>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          disabled={!userProgram || isCompleted}
          className="w-full bg-sage hover:bg-sage/90 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {!userProgram || isCompleted ? 'Subscription Required' : 'Log Your Meal'}
        </Button>
      </div>

      {userProgram && !isCompleted && (
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreatePost={handleCreateMealPost}
          showMealTypeSelection={true}
        />
      )}
    </>
  );
};

export default MealLogger;

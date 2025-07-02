
import React, { useState } from 'react';
import { Camera, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/components/social/CreatePostModal';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { useUserProgram } from '@/hooks/useUserProgram';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';

const MealLogger = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { createPost, fetchDiscoverFeed } = useSocialPosts();
  const { data: userProgram } = useUserProgram();
  const { isCompleted } = useProgramCompletion();

  const handleCreateMealPost = async (imageUrl: string, caption: string, mealType?: string) => {
    const success = await createPost(imageUrl, caption, mealType);
    if (success) {
      fetchDiscoverFeed(); // Refresh feeds
    }
    return success;
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

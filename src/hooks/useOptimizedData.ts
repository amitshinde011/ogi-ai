import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Optimized home data hook with caching
export const useOptimizedHomeData = (date: string = new Date().toISOString().split('T')[0]) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['homeData', user?.id, date],
    queryFn: () => DataService.getHomeData(user?.id!, date),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Optimized progress data hook
export const useOptimizedProgressData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['progressData', user?.id],
    queryFn: () => DataService.getProgressData(user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

// Optimized wellness tracking hooks
export const useOptimizedWellnessData = (date: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['wellnessData', user?.id, date],
    queryFn: () => DataService.getDailyWellness(user?.id!, date),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useUpdateWellness = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ date, updates }: { date: string; updates: any }) => 
      DataService.upsertDailyWellness(user?.id!, date, updates),
    onSuccess: (data, variables) => {
      // Invalidate and update cache
      queryClient.invalidateQueries({ queryKey: ['wellnessData', user?.id, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['progressData', user?.id] });
      
      toast.success('Progress updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating wellness data:', error);
      toast.error('Failed to update progress. Please try again.');
    },
  });
};

// Optimized meal tracking hooks
export const useOptimizedMealData = (date: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mealData', user?.id, date],
    queryFn: () => DataService.getMealsByDate(user?.id!, date),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useAddMeal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meal: any) => DataService.addMeal(user?.id!, meal),
    onSuccess: (data, variables) => {
      const date = variables.date || new Date().toISOString().split('T')[0];
      
      // Update cache optimistically
      queryClient.invalidateQueries({ queryKey: ['mealData', user?.id, date] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id, date] });
      queryClient.invalidateQueries({ queryKey: ['progressData', user?.id] });
      
      toast.success('Meal logged successfully!');
    },
    onError: (error) => {
      console.error('Error adding meal:', error);
      toast.error('Failed to log meal. Please try again.');
    },
  });
};

export const useDeleteMeal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mealId: string) => DataService.deleteMeal(mealId),
    onSuccess: (data, mealId) => {
      const today = new Date().toISOString().split('T')[0];
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['mealData', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id, today] });
      queryClient.invalidateQueries({ queryKey: ['progressData', user?.id] });
      
      toast.success('Meal removed successfully!');
    },
    onError: (error) => {
      console.error('Error deleting meal:', error);
      toast.error('Failed to remove meal. Please try again.');
    },
  });
};

// Optimized steps tracking hooks
export const useOptimizedStepsData = (date: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['stepsData', user?.id, date],
    queryFn: () => DataService.getStepsForDate(user?.id!, date),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useUpdateSteps = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ date, stepsCount }: { date: string; stepsCount: number }) => 
      DataService.upsertSteps(user?.id!, date, stepsCount),
    onSuccess: (data, variables) => {
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['stepsData', user?.id, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['homeData', user?.id, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['progressData', user?.id] });
      
      toast.success('Steps updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating steps:', error);
      toast.error('Failed to update steps. Please try again.');
    },
  });
};

// Optimized community hooks
export const useOptimizedCommunityFeed = (limit = 10, offset = 0) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['communityFeed', user?.id, limit, offset],
    queryFn: () => DataService.getCommunityPosts(user?.id!, limit, offset),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreatePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postData: any) => DataService.createPost(user?.id!, postData),
    onSuccess: () => {
      // Invalidate community feed to show new post
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    },
  });
};

export const useToggleLike = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => DataService.toggleLike(user?.id!, postId),
    onSuccess: () => {
      // Invalidate community feed to update like counts
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like. Please try again.');
    },
  });
};

// Optimized recipe hooks
export const useOptimizedRecipes = (category?: string) => {
  return useQuery({
    queryKey: ['recipes', category],
    queryFn: () => DataService.getRecipes(category),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};

export const useOptimizedSavedRecipes = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['savedRecipes', user?.id],
    queryFn: () => DataService.getSavedRecipes(user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useToggleSaveRecipe = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipeId: string) => DataService.toggleSaveRecipe(user?.id!, recipeId),
    onSuccess: () => {
      // Invalidate saved recipes to update the list
      queryClient.invalidateQueries({ queryKey: ['savedRecipes', user?.id] });
      toast.success('Recipe saved status updated!');
    },
    onError: (error) => {
      console.error('Error toggling save recipe:', error);
      toast.error('Failed to update recipe. Please try again.');
    },
  });
};

// Optimized user profile hooks
export const useOptimizedUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => DataService.getUserProfile(user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useUpdateUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: any) => DataService.updateUserProfile(user?.id!, updates),
    onSuccess: () => {
      // Update user profile cache
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    },
  });
};

// Optimized notifications hooks
export const useOptimizedNotifications = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => DataService.getNotifications(user?.id!),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
  });
};

// Batch operations hooks
export const useBatchUpdateWellness = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operations: Array<{ date: string; data: any }>) => 
      DataService.batchUpdateWellness(
        operations.map(op => ({ userId: user?.id!, ...op }))
      ),
    onSuccess: () => {
      // Invalidate all wellness-related queries
      queryClient.invalidateQueries({ queryKey: ['wellnessData'] });
      queryClient.invalidateQueries({ queryKey: ['homeData'] });
      queryClient.invalidateQueries({ queryKey: ['progressData'] });
      
      toast.success('Batch update completed successfully!');
    },
    onError: (error) => {
      console.error('Error in batch update:', error);
      toast.error('Failed to complete batch update. Please try again.');
    },
  });
};
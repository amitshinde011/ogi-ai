
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useSavedRecipes = () => {
  const queryClient = useQueryClient();

  // Get saved recipe IDs for current user
  const { data: savedRecipeIds = [], isLoading } = useQuery({
    queryKey: ['saved-recipes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_saved_recipes')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved recipes:', error);
        return [];
      }

      return data.map(item => item.recipe_id);
    },
  });

  // Save recipe mutation
  const saveRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_saved_recipes')
        .insert({
          user_id: user.id,
          recipe_id: recipeId
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
  });

  // Unsave recipe mutation
  const unsaveRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_saved_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-recipes'] });
    },
  });

  const saveRecipe = async (recipeId: string) => {
    if (!savedRecipeIds.includes(recipeId)) {
      await saveRecipeMutation.mutateAsync(recipeId);
    }
  };

  const unsaveRecipe = async (recipeId: string) => {
    await unsaveRecipeMutation.mutateAsync(recipeId);
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  return {
    savedRecipeIds,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    isLoading
  };
};

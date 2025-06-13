
import { useState, useEffect } from 'react';

// For now, using localStorage to simulate saved recipes functionality
// This can be replaced with actual database calls later
export const useSavedRecipes = () => {
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);

  // Load saved recipes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedRecipes');
    if (saved) {
      setSavedRecipeIds(JSON.parse(saved));
    }
  }, []);

  // Save recipes to localStorage whenever the list changes
  useEffect(() => {
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipeIds));
  }, [savedRecipeIds]);

  const saveRecipe = async (recipeId: string) => {
    if (!savedRecipeIds.includes(recipeId)) {
      setSavedRecipeIds(prev => [...prev, recipeId]);
    }
  };

  const unsaveRecipe = async (recipeId: string) => {
    setSavedRecipeIds(prev => prev.filter(id => id !== recipeId));
  };

  const isRecipeSaved = (recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  };

  return {
    savedRecipeIds,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved
  };
};

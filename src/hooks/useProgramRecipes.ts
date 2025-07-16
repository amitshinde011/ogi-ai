
import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRecipes } from '@/hooks/useRecipes';

export const useProgramRecipes = (userProgram: any) => {
  const { data: allRecipes, isLoading: recipesLoading } = useRecipes();
  const isInitialLoad = useRef(true);

  // Filter recipes based on user's current program
  const programRecipes = React.useMemo(() => {
    if (!allRecipes || !Array.isArray(allRecipes)) return [];
    
    // If user has no active program, show no recipes
    if (!userProgram) return [];
    
    // Filter recipes that belong to the user's current program
    const filtered = allRecipes.filter(recipe => 
      recipe.package === userProgram.program_id
    );
    
    // Remove duplicates by recipe id
    const uniqueRecipes = filtered.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );
    
    return uniqueRecipes;
  }, [allRecipes, userProgram]);

  // Get categories from program-specific recipes
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['program-recipe-categories', userProgram?.program_id],
    queryFn: async () => {
      if (!userProgram) return [];
      
      const { data, error } = await supabase
        .from('recipes')
        .select('category')
        .eq('package', userProgram.program_id)
        .order('category');

      if (error) throw error;

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      return uniqueCategories;
    },
    enabled: !!userProgram,
    refetchOnWindowFocus: false, // Prevent refetch on tab focus
  });

  // Only show loading for initial load
  const isLoading = isInitialLoad.current && (recipesLoading || categoriesLoading);
  
  // Mark initial load as complete when both queries finish
  if (isInitialLoad.current && !recipesLoading && !categoriesLoading) {
    isInitialLoad.current = false;
  }

  return {
    programRecipes,
    categories,
    isLoading,
  };
};

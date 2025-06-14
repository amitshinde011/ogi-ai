
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRecipeCategories = () => {
  return useQuery({
    queryKey: ['recipe-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('category')
        .order('category');

      if (error) {
        throw error;
      }

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      return uniqueCategories;
    },
  });
};

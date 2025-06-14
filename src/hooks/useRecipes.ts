
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Recipe {
  id: string;
  name: string;
  package?: string;
  category: string;
  details?: string;
  image_url?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  rating?: number;
  ingredients?: string; // Changed from string[] to string
  instructions?: string; // Changed from string[] to string
  nutrition?: any;
  tips?: string; // Changed from string[] to string
  created_at: string;
  updated_at: string;
}

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Recipe[];
    },
  });
};

export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Recipe;
    },
    enabled: !!id,
  });
};


import React from 'react';
import { Heart, Clock, Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { useQuery } from '@tanstack/react-query';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

const SavedRecipes = () => {
  const { savedRecipeIds, isLoading: savedRecipesLoading } = useSavedRecipes();

  // Helper function to get Cloudflare image URL
  const getCloudflareImageUrl = (imageId: string | null | undefined) => {
    if (!imageId) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300';
    }
    
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) {
      return imageId;
    }
    
    // Construct Cloudflare Images URL
    return `https://imagedelivery.net/your-account-hash/${imageId}/public`;
  };

  // Fetch the actual recipe data for saved recipes
  const { data: savedRecipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['saved-recipes-data', savedRecipeIds],
    queryFn: async () => {
      if (savedRecipeIds.length === 0) return [];

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .in('id', savedRecipeIds);

      if (error) {
        console.error('Error fetching saved recipes data:', error);
        return [];
      }

      return data || [];
    },
    enabled: savedRecipeIds.length > 0,
  });

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const isLoading = savedRecipesLoading || recipesLoading;

  if (isLoading) {
    return (
      <Layout>
        <Header title="Saved Recipes" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <Layout>
        <Header title="Saved Recipes" showBack />
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Please log in</h3>
            <p className="text-gray-500 mb-6">You need to be logged in to view your saved recipes.</p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Saved Recipes" showBack />
      
      <div className="max-w-md mx-auto p-4">
        {savedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No saved recipes yet</h3>
            <p className="text-gray-500 mb-6">Start saving your favorite recipes to access them easily here!</p>
            <Link 
              to="/recipes" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {savedRecipes.length} saved recipe{savedRecipes.length !== 1 ? 's' : ''}
            </p>
            
            {savedRecipes.map((recipe) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img
                        src={getCloudflareImageUrl(recipe.image_url)}
                        alt={recipe.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{recipe.name}</h3>
                        {recipe.package && (
                          <p className="text-xs text-indigo-600 mb-2">From: {recipe.package}</p>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            <span>{recipe.cook_time || '30 min'}</span>
                          </div>
                          <div className="flex items-center">
                            <Users size={12} className="mr-1" />
                            <span>{recipe.servings || 2}</span>
                          </div>
                          <div className="flex items-center">
                            <Star size={12} className="mr-1 text-yellow-500" fill="currentColor" />
                            <span>{recipe.rating || 4.5}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Heart size={16} className="text-red-500" fill="currentColor" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedRecipes;

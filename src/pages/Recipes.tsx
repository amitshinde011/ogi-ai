
import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import RecipeSearchWithSuggestions from '@/components/RecipeSearchWithSuggestions';
import { useRecipes } from '@/hooks/useRecipes';
import { useRecipeCategories } from '@/hooks/useRecipeCategories';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: allRecipes, isLoading: recipesLoading } = useRecipes();
  const { savedRecipeIds } = useSavedRecipes();

  // Get user's current program
  const { data: userProgram, isLoading: programLoading } = useQuery({
    queryKey: ['user-current-program'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*, programs(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('end_date', today)
        .maybeSingle();

      return subscription;
    },
  });

  // Filter recipes based on user's current program
  const programRecipes = React.useMemo(() => {
    if (!allRecipes) return [];
    
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
  });

  // Create category options with 'all' as the first option
  const categoryOptions = ['all', ...categories];

  // Filter recipes based on search and category
  const filteredRecipes = React.useMemo(() => {
    if (!programRecipes) return [];
    
    const filtered = programRecipes.filter(recipe => {
      const matchesSearch = searchTerm === '' || 
                           recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || recipe.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
    
    return filtered;
  }, [programRecipes, searchTerm, selectedCategory]);

  const isLoading = recipesLoading || programLoading || categoriesLoading;

  if (isLoading) {
    return (
      <Layout>
        <Header title="Recipes" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // Show message if user has no active program
  if (!userProgram) {
    return (
      <Layout>
        <Header title="Recipes" />
        <div className="max-w-md mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You need an active program to view recipes.</p>
            <Link to="/subscriptions">
              <Button>Browse Programs</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        title="Recipes" 
        rightElement={
          <Link to="/saved-recipes">
            <Button variant="ghost" size="sm" className="p-2">
              <Heart size={20} className={savedRecipeIds.length > 0 ? 'text-red-500 fill-current' : 'text-gray-400'} />
              {savedRecipeIds.length > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {savedRecipeIds.length}
                </span>
              )}
            </Button>
          </Link>
        }
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Program Info */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-indigo-900 mb-1">{userProgram.programs?.name}</h3>
            <p className="text-sm text-indigo-600">Program recipes available below</p>
          </CardContent>
        </Card>

        {/* Quick Access to Saved Recipes */}
        {savedRecipeIds.length > 0 && (
          <Link to="/saved-recipes">
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart size={20} className="text-red-500 fill-current mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Saved Recipes</h3>
                      <p className="text-sm text-gray-600">{savedRecipeIds.length} recipe{savedRecipeIds.length !== 1 ? 's' : ''} saved</p>
                    </div>
                  </div>
                  <div className="text-red-500 text-sm font-medium">View All →</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Search Bar with Suggestions */}
        <RecipeSearchWithSuggestions 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categoryOptions.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={recipe.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600'}
                      alt={recipe.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {savedRecipeIds.includes(recipe.id) && (
                      <div className="absolute top-3 right-3">
                        <Heart size={16} className="text-red-500 fill-current" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/60 text-white px-2 py-1 rounded-full text-xs capitalize">
                        {recipe.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recipe.details || 'A delicious and healthy recipe'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{recipe.cook_time || '30 min'}</span>
                      <div className="flex items-center">
                        <span className="mr-1">⭐</span>
                        <span>{recipe.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && programRecipes.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found matching your criteria.</p>
          </div>
        )}

        {programRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes available for your current program yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;


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
import { Link } from 'react-router-dom';

const Recipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: recipes, isLoading, error } = useRecipes();
  const { data: categories = [], isLoading: categoriesLoading } = useRecipeCategories();
  const { savedRecipeIds } = useSavedRecipes();

  // Create category options with 'all' as the first option
  const categoryOptions = ['all', ...categories];

  // Add debugging and remove duplicates
  const filteredRecipes = React.useMemo(() => {
    if (!recipes) return [];
    
    console.log('Total recipes loaded:', recipes.length);
    console.log('Search term:', searchTerm);
    console.log('Selected category:', selectedCategory);
    
    // Remove duplicates first by recipe id
    const uniqueRecipes = recipes.filter((recipe, index, self) => 
      index === self.findIndex(r => r.id === recipe.id)
    );
    
    console.log('Unique recipes after deduplication:', uniqueRecipes.length);
    
    const filtered = uniqueRecipes.filter(recipe => {
      const matchesSearch = searchTerm === '' || 
                           recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || recipe.category.toLowerCase() === selectedCategory.toLowerCase();
      
      const result = matchesSearch && matchesCategory;
      
      if (searchTerm && result) {
        console.log('Recipe matches search:', recipe.name, recipe.id);
      }
      
      return result;
    });
    
    console.log('Filtered recipes count:', filtered.length);
    return filtered;
  }, [recipes, searchTerm, selectedCategory]);

  if (isLoading || categoriesLoading) {
    return (
      <Layout>
        <Header title="Recipes" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Header title="Recipes" />
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load recipes. Please try again later.</p>
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
                    {recipe.package && (
                      <p className="text-sm text-indigo-600 mb-2">From: {recipe.package}</p>
                    )}
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

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No recipes found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;

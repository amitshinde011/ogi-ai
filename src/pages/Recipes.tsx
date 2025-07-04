
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Layout from '@/components/Layout';
import RecipeSearchWithSuggestions from '@/components/RecipeSearchWithSuggestions';
import ProgramInfoCard from '@/components/recipes/ProgramInfoCard';
import SavedRecipesCard from '@/components/recipes/SavedRecipesCard';
import CategoryFilter from '@/components/recipes/CategoryFilter';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { useUserProgram } from '@/hooks/useUserProgram';
import { useProgramRecipes } from '@/hooks/useProgramRecipes';
import { useProgramCompletion } from '@/hooks/useProgramCompletion';
import { Link } from 'react-router-dom';
import { useSubscriptionBanner } from '@/hooks/useSubscriptionBanner';

const Recipes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { savedRecipeIds } = useSavedRecipes();
  const { data: userProgram, isLoading: programLoading } = useUserProgram();
  const { programRecipes, categories, isLoading: recipesLoading } = useProgramRecipes(userProgram);
  const { isCompleted } = useProgramCompletion();
  const { showBanner } = useSubscriptionBanner();

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

  const isLoading = programLoading || recipesLoading;

  if (isLoading) {
    return (
      <Layout>
        <Header title="Recipes" />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} strokeWidth={1.5} className="text-indigo-600 animate-spin" />
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
              <Heart size={20} strokeWidth={1.5} className={savedRecipeIds.length > 0 ? 'text-red-500 fill-current' : 'text-gray-400'} />
              {savedRecipeIds.length > 0 && (
                <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {savedRecipeIds.length}
                </span>
              )}
            </Button>
          </Link>
        }
      />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        <ProgramInfoCard programName={userProgram.programs?.name} />
        <SavedRecipesCard savedRecipesCount={savedRecipeIds.length} />
        
        <RecipeSearchWithSuggestions 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <RecipeGrid 
          recipes={filteredRecipes}
          savedRecipeIds={savedRecipeIds}
          totalProgramRecipes={programRecipes?.length || 0}
        />
      </div>
    </Layout>
  );
};

export default Recipes;


import React from 'react';
import { Recipe } from '@/hooks/useRecipes';
import RecipeCard from './RecipeCard';

interface RecipeGridProps {
  recipes: Recipe[];
  savedRecipeIds: string[];
  totalProgramRecipes: number;
}

const RecipeGrid = ({ recipes, savedRecipeIds, totalProgramRecipes }: RecipeGridProps) => {
  if (recipes.length === 0 && totalProgramRecipes > 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recipes found matching your criteria.</p>
      </div>
    );
  }

  if (totalProgramRecipes === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recipes available for your current program yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          isSaved={savedRecipeIds.includes(recipe.id)}
        />
      ))}
    </div>
  );
};

export default RecipeGrid;

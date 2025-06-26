
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Recipe } from '@/hooks/useRecipes';
import { getCloudflareImageUrl } from '@/utils/cloudflareImages';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
}

const RecipeCard = ({ recipe, isSaved }: RecipeCardProps) => {
  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="relative">
            <img
              src={getCloudflareImageUrl(recipe.image_url)}
              alt={recipe.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {isSaved && (
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
  );
};

export default RecipeCard;

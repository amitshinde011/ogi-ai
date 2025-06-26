import React from 'react';
import { Clock, Users, Star, Heart, Share, ChefHat, Utensils, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useParams } from 'react-router-dom';
import { useRecipe } from '@/hooks/useRecipes';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { toast } from '@/hooks/use-toast';
import { getCloudflareImageUrl } from '@/utils/cloudflareImages';

const RecipeDetail = () => {
  const { id } = useParams();
  const { data: recipe, isLoading, error } = useRecipe(id || '');
  const { saveRecipe, unsaveRecipe, isRecipeSaved } = useSavedRecipes();

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    
    try {
      if (isRecipeSaved(recipe.id)) {
        await unsaveRecipe(recipe.id);
        toast({ title: "Recipe removed! 🗑️", description: "Recipe removed from your saved recipes." });
      } else {
        await saveRecipe(recipe.id);
        toast({ title: "Recipe saved! ❤️", description: "You can find it in your saved recipes." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save recipe. Please try again.", variant: "destructive" });
    }
  };

  const handleLikeRecipe = () => {
    toast({ title: "Recipe liked! 👍", description: "Thank you for your feedback!" });
  };

  const handleShareRecipe = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.name,
        text: `Check out this delicious recipe: ${recipe?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied! 📋", description: "Recipe link copied to clipboard." });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-sage/10">
        <Header title="Recipe" showBack />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-sage/10">
        <Header title="Recipe" showBack />
        <div className="text-center py-12">
          <p className="text-red-600">Recipe not found or failed to load.</p>
        </div>
      </div>
    );
  }

  // Helper function to split semicolon-separated text into array
  const parseTextField = (text: string | null): string[] => {
    if (!text) return [];
    return text.split(';').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Parse the text fields
  const ingredientsList = parseTextField(recipe.ingredients);
  const instructionsList = parseTextField(recipe.instructions);
  const tipsList = parseTextField(recipe.tips);

  // Helper function to get nutrition values that exist
  const getNutritionItems = () => {
    const nutrition = recipe.nutrition || {};
    const items = [];
    
    if (nutrition.calories) {
      items.push({ label: 'Calories', value: nutrition.calories });
    }
    if (nutrition.protein) {
      items.push({ label: 'Protein', value: nutrition.protein });
    }
    if (nutrition.carbs) {
      items.push({ label: 'Carbs', value: nutrition.carbs });
    }
    if (nutrition.fat) {
      items.push({ label: 'Fat', value: nutrition.fat });
    }
    if (nutrition.fiber) {
      items.push({ label: 'Fiber', value: nutrition.fiber });
    }
    
    return items;
  };

  const nutritionItems = getNutritionItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-sage/10 no-yellow">
      <Header title="Recipe" showBack />
      
      <div className="max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative">
          <img
            src={getCloudflareImageUrl(recipe.cloudflare_image_id, recipe.image_url)}
            alt={recipe.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full bg-white/90"
              onClick={handleLikeRecipe}
            >
              <Heart size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="rounded-full bg-white/90"
              onClick={handleShareRecipe}
            >
              <Share size={16} />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Recipe Info */}
          <Card>
            <CardContent className="p-4">
              <h1 className="text-2xl font-bold text-primary mb-2">{recipe.name}</h1>
              {recipe.package && (
                <p className="text-sm text-sage font-medium mb-2">From: {recipe.package}</p>
              )}
              <p className="text-muted-foreground mb-4">{recipe.details || 'A delicious and healthy recipe'}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-muted-foreground" />
                    <span>{recipe.cook_time || '30 min'}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1 text-muted-foreground" />
                    <span>{recipe.servings || 2} servings</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="text-amber-500 mr-1" size={16} fill="currentColor" />
                  <span className="font-medium">{recipe.rating || 4.5}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Facts - only show if there are nutrition items */}
          {nutritionItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary mb-4">Nutrition per serving</h3>
                <div className={`grid gap-3 ${nutritionItems.length === 1 ? 'grid-cols-1' : nutritionItems.length === 2 ? 'grid-cols-2' : nutritionItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {nutritionItems.map((item, index) => (
                    <div key={index} className="text-center p-3 bg-sage/5 rounded-lg">
                      <div className="text-lg font-bold text-primary">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ingredients */}
          {ingredientsList.length > 0 && (
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <ChefHat className="text-green-600" size={20} />
                  </div>
                  <h3 className="font-bold text-xl text-primary">Ingredients</h3>
                </div>
                <div className="space-y-4">
                  {ingredientsList.map((ingredient, index) => (
                    <div key={index} className="flex items-start bg-gray-50 p-4 rounded-xl">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed font-medium">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          {instructionsList.length > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Utensils className="text-blue-600" size={20} />
                  </div>
                  <h3 className="font-bold text-xl text-primary">Instructions</h3>
                </div>
                <div className="space-y-6">
                  {instructionsList.map((instruction, index) => (
                    <div key={index} className="flex">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-xl border border-blue-100">{instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips - replace yellow with orange/amber theme */}
          {tipsList.length > 0 && (
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-5">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Lightbulb className="text-orange-600" size={20} />
                  </div>
                  <h3 className="font-bold text-xl text-primary">Tips & Variations</h3>
                </div>
                <div className="space-y-4">
                  {tipsList.map((tip, index) => (
                    <div key={index} className="flex items-start bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                        <Lightbulb size={12} className="text-white" />
                      </div>
                      <span className="text-gray-700 leading-relaxed font-medium">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="pb-4">
            <Button 
              className={`w-full rounded-xl ${isRecipeSaved(recipe.id) ? 'bg-red-500 hover:bg-red-600' : 'gradient-sage'} text-white`}
              onClick={handleSaveRecipe}
            >
              {isRecipeSaved(recipe.id) ? 'Remove from Saved' : 'Save Recipe'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;

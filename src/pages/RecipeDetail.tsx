
import React from 'react';
import { Clock, Users, Star, Heart, Share } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useParams } from 'react-router-dom';

const RecipeDetail = () => {
  const { id } = useParams();

  // Mock recipe data - in real app would fetch from database
  const recipe = {
    id,
    title: 'Quinoa Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    cookTime: '25 min',
    prepTime: '15 min',
    servings: 2,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 124,
    description: 'A nutritious and colorful bowl packed with quinoa, fresh vegetables, and a delicious tahini dressing. Perfect for a healthy lunch or dinner.',
    ingredients: [
      '1 cup quinoa',
      '2 cups vegetable broth',
      '1 cup chickpeas, drained',
      '1 cup cherry tomatoes, halved',
      '1 cucumber, diced',
      '1 avocado, sliced',
      '1/4 cup red onion, thinly sliced',
      '2 tbsp olive oil',
      '2 tbsp lemon juice',
      '2 tbsp tahini',
      '1 tbsp maple syrup',
      'Salt and pepper to taste',
      'Fresh herbs for garnish'
    ],
    instructions: [
      'Rinse quinoa and cook in vegetable broth according to package instructions.',
      'While quinoa cooks, prepare all vegetables and slice avocado.',
      'In a small bowl, whisk together tahini, lemon juice, maple syrup, and a pinch of salt.',
      'Divide cooked quinoa between two bowls.',
      'Arrange chickpeas, tomatoes, cucumber, avocado, and onion on top.',
      'Drizzle with tahini dressing and garnish with fresh herbs.',
      'Serve immediately and enjoy!'
    ],
    nutrition: {
      calories: 485,
      protein: 18,
      carbs: 62,
      fat: 22,
      fiber: 12
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-sage/10">
      <Header title="Recipe" showBack />
      
      <div className="max-w-md mx-auto">
        {/* Hero Image */}
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button size="sm" variant="secondary" className="rounded-full bg-white/90">
              <Heart size={16} />
            </Button>
            <Button size="sm" variant="secondary" className="rounded-full bg-white/90">
              <Share size={16} />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Recipe Info */}
          <Card>
            <CardContent className="p-4">
              <h1 className="text-2xl font-bold text-primary mb-2">{recipe.title}</h1>
              <p className="text-muted-foreground mb-4">{recipe.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-muted-foreground" />
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1 text-muted-foreground" />
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Star className="text-yellow-500 mr-1" size={16} fill="currentColor" />
                  <span className="font-medium">{recipe.rating}</span>
                  <span className="text-muted-foreground text-sm ml-1">({recipe.reviews})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Facts */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-3">Nutrition per serving</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-sage/5 rounded-lg">
                  <div className="text-lg font-bold text-primary">{recipe.nutrition.calories}</div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>
                <div className="text-center p-3 bg-sage/5 rounded-lg">
                  <div className="text-lg font-bold text-primary">{recipe.nutrition.protein}g</div>
                  <div className="text-sm text-muted-foreground">Protein</div>
                </div>
                <div className="text-center p-3 bg-sage/5 rounded-lg">
                  <div className="text-lg font-bold text-primary">{recipe.nutrition.carbs}g</div>
                  <div className="text-sm text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-3 bg-sage/5 rounded-lg">
                  <div className="text-lg font-bold text-primary">{recipe.nutrition.fat}g</div>
                  <div className="text-sm text-muted-foreground">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-3">Ingredients</h3>
              <div className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-sage rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-sm">{ingredient}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-primary mb-3">Instructions</h3>
              <div className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pb-4">
            <Button className="flex-1 rounded-xl gradient-sage text-white">
              Start Cooking
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl border-sage text-sage hover:bg-sage/5">
              Save Recipe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;

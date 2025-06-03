
import React, { useState } from 'react';
import { Clock, Users, Star, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';

interface Recipe {
  id: string;
  title: string;
  image: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  category: string;
  description: string;
}

const Recipes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Vegetarian', 'Vegan'];

  const recipes: Recipe[] = [
    {
      id: '1',
      title: 'Quinoa Buddha Bowl',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      cookTime: '25 min',
      servings: 2,
      difficulty: 'Easy',
      rating: 4.8,
      category: 'Lunch',
      description: 'Nutritious and colorful bowl packed with protein and vegetables'
    },
    {
      id: '2',
      title: 'Avocado Toast Supreme',
      image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400',
      cookTime: '10 min',
      servings: 1,
      difficulty: 'Easy',
      rating: 4.6,
      category: 'Breakfast',
      description: 'Perfect morning fuel with healthy fats and fiber'
    },
    {
      id: '3',
      title: 'Mediterranean Chickpea Salad',
      image: 'https://images.unsplash.com/photo-1545093149-618ce3bcf49d?w=400',
      cookTime: '15 min',
      servings: 4,
      difficulty: 'Easy',
      rating: 4.7,
      category: 'Lunch',
      description: 'Fresh and filling salad with Mediterranean flavors'
    },
    {
      id: '4',
      title: 'Grilled Salmon with Vegetables',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      cookTime: '30 min',
      servings: 2,
      difficulty: 'Medium',
      rating: 4.9,
      category: 'Dinner',
      description: 'Omega-rich salmon with roasted seasonal vegetables'
    }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Layout>
      <Header title="Healthy Recipes" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-sage/10 text-primary hover:bg-sage/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Card 
              key={recipe.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            >
              <div className="flex">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-24 h-24 object-cover"
                />
                <CardContent className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-primary text-sm leading-tight">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center ml-2">
                      <Star className="text-yellow-500 mr-1" size={12} fill="currentColor" />
                      <span className="text-xs text-muted-foreground">{recipe.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-muted-foreground">
                      <Clock size={12} className="mr-1" />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users size={12} className="mr-1" />
                      <span>{recipe.servings}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-sage" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">No recipes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;

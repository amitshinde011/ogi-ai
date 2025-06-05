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

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Drinks', 'Vegetarian', 'Vegan'];

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
    },
    {
      id: '5',
      title: 'Tangy Mango Lassi',
      image: '/lovable-uploads/357954c3-c7da-4458-b37b-02c7f7ad3659.png',
      cookTime: '20 min',
      servings: 2,
      difficulty: 'Easy',
      rating: 4.7,
      category: 'Drinks',
      description: 'A salty, refreshing summer drink with a bright twist of raw mango and spices'
    }
  ];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-700 bg-green-100 border border-green-200';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
      case 'Hard': return 'text-red-700 bg-red-100 border border-red-200';
      default: return 'text-slate-700 bg-slate-100 border border-slate-200';
    }
  };

  return (
    <Layout>
      <Header title="Healthy Recipes" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl bg-white border-slate-300 text-slate-900 placeholder:text-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-indigo-300'
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
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white border-slate-200"
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
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center ml-2">
                      <Star className="text-yellow-500 mr-1" size={12} fill="currentColor" />
                      <span className="text-xs text-slate-600">{recipe.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-slate-600">
                      <Clock size={12} className="mr-1" />
                      <span>{recipe.cookTime}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Users size={12} className="mr-1" />
                      <span>{recipe.servings}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
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
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No recipes found</h3>
            <p className="text-slate-600">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;

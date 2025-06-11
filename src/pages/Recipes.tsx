
import React, { useState } from 'react';
import { Clock, Users, Star, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import RecipeImport from '@/components/RecipeImport';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/hooks/useRecipes';

const Recipes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showImport, setShowImport] = useState(false);

  const { data: recipes = [], isLoading, error } = useRecipes();

  // Get unique categories from recipes
  const categories = ['All', ...new Set(recipes.map(recipe => recipe.category))];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  if (showImport) {
    return (
      <Layout>
        <Header title="Import Recipes" showBack />
        <div className="p-4">
          <Button 
            onClick={() => setShowImport(false)} 
            variant="outline" 
            className="mb-4"
          >
            Back to Recipes
          </Button>
          <RecipeImport />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header 
        title="Healthy Recipes" 
        rightElement={
          <Button 
            size="sm" 
            onClick={() => setShowImport(true)}
            className="gradient-sage text-white"
          >
            <Plus size={16} />
          </Button>
        }
      />
      
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-slate-600 mt-2">Loading recipes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load recipes. Please try again.</p>
          </div>
        )}

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
                  src={recipe.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400'}
                  alt={recipe.name}
                  className="w-24 h-24 object-cover"
                />
                <CardContent className="flex-1 p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center ml-2">
                      <Star className="text-yellow-500 mr-1" size={12} fill="currentColor" />
                      <span className="text-xs text-slate-600">{recipe.rating || 4.5}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                    {recipe.details || 'Delicious and healthy recipe'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-slate-600">
                      <Clock size={12} className="mr-1" />
                      <span>{recipe.cook_time || '30 min'}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Users size={12} className="mr-1" />
                      <span>{recipe.servings || 2}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty || 'Easy')}`}>
                      {recipe.difficulty || 'Easy'}
                    </span>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredRecipes.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-500" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No recipes found</h3>
            <p className="text-slate-600 mb-4">Try adjusting your search or category filter</p>
            <Button onClick={() => setShowImport(true)} className="gradient-sage text-white">
              Import Your Recipes
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipes;

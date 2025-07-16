
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SavedRecipesCardProps {
  savedRecipesCount: number;
}

const SavedRecipesCard = ({ savedRecipesCount }: SavedRecipesCardProps) => {
  if (savedRecipesCount === 0) return null;

  return (
    <Link to="/saved-recipes">
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:shadow-md transition-shadow max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart size={20} className="text-red-500 fill-current mr-3" />
              <div>
                <h3 className="font-semibold text-gray-900">Saved Recipes</h3>
                <p className="text-sm text-gray-600">
                  {savedRecipesCount} recipe{savedRecipesCount !== 1 ? 's' : ''} saved
                </p>
              </div>
            </div>
            <div className="text-red-500 text-sm font-medium">View All →</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SavedRecipesCard;

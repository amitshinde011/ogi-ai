
import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }: CategoryFilterProps) => {
  const categoryOptions = ['all', ...categories];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categoryOptions.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect(category)}
          className="whitespace-nowrap capitalize"
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;

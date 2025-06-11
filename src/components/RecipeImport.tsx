
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet } from 'lucide-react';

const RecipeImport = () => {
  const [csvData, setCsvData] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please paste your CSV data');
      return;
    }

    setIsImporting(true);
    try {
      // Parse CSV data (assuming comma-separated values)
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected headers: name, package, category, details, image
      const recipes = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          name: values[0] || '',
          package: values[1] || null,
          category: values[2] || 'Other',
          details: values[3] || null,
          image_url: values[4] || null,
        };
      }).filter(recipe => recipe.name); // Filter out empty rows

      console.log('Importing recipes:', recipes);

      // Insert recipes into database
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipes);

      if (error) {
        throw error;
      }

      toast.success(`Successfully imported ${recipes.length} recipes!`);
      setCsvData('');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import recipes. Please check your data format.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="text-sage" size={24} />
          Import Recipes from Spreadsheet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">Expected format (comma-separated):</p>
          <code className="bg-muted p-2 rounded block">
            name,package,category,details,image_url<br/>
            Recipe Name,Package Name,Category,Recipe Details,Image URL
          </code>
        </div>
        
        <Textarea
          placeholder="Paste your CSV data here..."
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          rows={8}
          className="font-mono text-sm"
        />
        
        <Button 
          onClick={handleImport}
          disabled={isImporting || !csvData.trim()}
          className="w-full gradient-sage text-white"
        >
          <Upload size={16} className="mr-2" />
          {isImporting ? 'Importing...' : 'Import Recipes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeImport;


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, TrendingUp } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/upload')}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Camera className="text-primary" size={24} />
          </div>
          <h3 className="font-semibold text-primary">Log Meal</h3>
          <p className="text-sm text-muted-foreground">Upload your meal photo</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/community')}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="text-primary" size={24} />
          </div>
          <h3 className="font-semibold text-primary">Community</h3>
          <p className="text-sm text-muted-foreground">See others' journeys</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;

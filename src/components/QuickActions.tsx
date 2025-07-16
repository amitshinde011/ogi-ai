
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Users, ArrowRight } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
      <Card className="interactive shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => navigate('/upload')}>
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <Camera className="text-white" size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Log Meal</h3>
          <p className="text-sm text-slate-600 mb-2">Upload your meal photo</p>
          <ArrowRight className="text-indigo-600 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
        </CardContent>
      </Card>

      <Card className="interactive shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer group" 
            onClick={() => navigate('/community')}>
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <Users className="text-white" size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Community</h3>
          <p className="text-sm text-slate-600 mb-2">See others' journeys</p>
          <ArrowRight className="text-green-600 mx-auto opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, X } from 'lucide-react';

interface CompletedSubscription {
  id: string;
  programs: {
    name: string;
  };
}

interface AchievementBannerProps {
  completedSubscription: CompletedSubscription;
  onClose: () => void;
}

export const AchievementBanner: React.FC<AchievementBannerProps> = ({
  completedSubscription,
  onClose
}) => {
  return (
    <Card className="mb-6 bg-gradient-sage text-white border-none max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">Congratulations! 🎉</h3>
              <p className="text-white/90">
                You've successfully completed your {completedSubscription.programs?.name} journey! 
                Ready to start your next transformation?
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

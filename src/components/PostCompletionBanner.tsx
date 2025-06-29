
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';

interface PostCompletionBannerProps {
  completedProgramName?: string;
}

const PostCompletionBanner = ({ completedProgramName }: PostCompletionBannerProps) => {
  const navigate = useNavigate();

  const handleStartNewJourney = () => {
    navigate('/subscriptions');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg border-0 mx-4 mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold mb-1">
                🎉 {completedProgramName ? `${completedProgramName} Completed!` : 'Program Completed!'}
              </h3>
              <p className="text-white/90 text-sm">
                Ready for your next transformation? Start a new wellness journey today!
              </p>
            </div>
          </div>
          <Button
            onClick={handleStartNewJourney}
            className="bg-white text-purple-600 hover:bg-white/90 font-semibold flex-shrink-0 ml-4"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            New Journey
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCompletionBanner;

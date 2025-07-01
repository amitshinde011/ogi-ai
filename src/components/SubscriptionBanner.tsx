
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubscriptionBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white p-4 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <h3 className="font-bold text-sm text-white">No Active Subscription</h3>
          </div>
          <p className="text-xs text-white/90">
            Subscribe to a wellness program to continue your journey
          </p>
        </div>
        <Button
          onClick={() => navigate('/subscriptions')}
          variant="secondary"
          size="sm"
          className="ml-4 bg-white text-purple-600 hover:bg-gray-100 font-semibold"
        >
          Subscribe
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionBanner;

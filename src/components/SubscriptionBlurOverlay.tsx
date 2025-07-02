import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

interface SubscriptionBlurOverlayProps {
  children: React.ReactNode;
}

const SubscriptionBlurOverlay: React.FC<SubscriptionBlurOverlayProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
        <div className="text-center p-8 max-w-sm mx-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-sage/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-sage" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Subscription Required
          </h3>
          <p className="text-gray-600 mb-6">
            To access this page and unlock all features, you need an active subscription.
          </p>
          <Button 
            onClick={() => navigate('/subscriptions')}
            className="w-full bg-sage hover:bg-sage/90"
          >
            Subscribe Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBlurOverlay;
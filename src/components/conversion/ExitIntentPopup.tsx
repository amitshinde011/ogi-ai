import React, { useState, useEffect } from 'react';
import { X, Gift, Timer, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ExitIntentPopupProps {
  onSignup: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onSignup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSignup = () => {
    onSignup();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-red-50 via-white to-red-50 p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-12 h-12 text-red-500" />
            </div>

            <Badge className="bg-red-500 text-white hover:bg-red-600 animate-pulse">
              <Timer className="w-3 h-3 mr-1" />
              WAIT! Special Offer
            </Badge>

            <h2 className="text-2xl font-bold text-gray-900">
              Don't Miss Out!
            </h2>
            
            <p className="text-gray-600">
              Before you go, get an <span className="font-bold text-red-600">extra 10% OFF</span> your first program!
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                🎁 Limited Time: Use code <span className="font-bold bg-red-200 px-2 py-1 rounded">WELCOME10</span>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Valid for the next 15 minutes only!
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSignup}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3"
                size="lg"
              >
                Claim My Discount Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                No thanks, I'll pay full price
              </Button>
            </div>

            <p className="text-xs text-gray-400">
              * Offer expires in 15 minutes and cannot be combined with other discounts
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
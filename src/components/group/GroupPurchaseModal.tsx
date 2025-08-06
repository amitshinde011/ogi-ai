import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useGroupPurchase } from '@/hooks/useGroupPurchase';
import { Users, Clock, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Program {
  id: string;
  name: string;
  price: number;
  price_inr: number;
  duration_days: number;
}

interface GroupPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  program: Program;
  isIndiaUser: boolean;
}

export const GroupPurchaseModal: React.FC<GroupPurchaseModalProps> = ({
  open,
  onClose,
  program,
  isIndiaUser
}) => {
  const [selectedSize, setSelectedSize] = useState(3);
  const [inviteLink, setInviteLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { createGroupPurchase, loading } = useGroupPurchase();
  const { toast } = useToast();

  const currency = isIndiaUser ? 'INR' : 'USD';
  const basePrice = isIndiaUser ? program.price_inr : program.price;
  const symbol = currency === 'INR' ? '₹' : '$';

  const getGroupDiscount = (size: number): number => {
    if (size >= 6) return 50;
    if (size >= 5) return 45;
    if (size >= 4) return 40;
    if (size >= 3) return 35;
    if (size >= 2) return 30;
    return 0;
  };

  const discount = getGroupDiscount(selectedSize);
  const discountedPrice = basePrice * (1 - discount / 100);
  const savings = basePrice - discountedPrice;

  const handleCreateGroup = async () => {
    const result = await createGroupPurchase(program.id, selectedSize, currency);
    if (result.success && result.inviteLink) {
      setInviteLink(result.inviteLink);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link Copied! 📋",
        description: "Share this link with your friends to start saving together.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my ${program.name} group purchase!`,
          text: `Get ${discount}% off when we reach ${selectedSize} people. Only 7 days to join!`,
          url: inviteLink,
        });
      } catch (error) {
        copyInviteLink();
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {inviteLink ? '🎉 Group Created!' : '🤝 Start Group Purchase'}
          </DialogTitle>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
              <p className="text-muted-foreground text-sm">
                Create a group and invite friends to unlock progressive discounts!
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Choose your group size:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[2, 3, 4, 5, 6].map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="flex flex-col h-auto p-3"
                  >
                    <span className="font-semibold">
                      {size === 6 ? '6+' : size} people
                    </span>
                    <span className="text-xs">
                      {getGroupDiscount(size)}% off
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Group Size:</span>
                  <span className="font-semibold">
                    {selectedSize === 6 ? '6+' : selectedSize} people
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {discount}% OFF
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Original Price:</span>
                  <span className="line-through text-muted-foreground">
                    {symbol}{basePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Your Price:</span>
                  <span className="text-primary">
                    {symbol}{discountedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You Save:</span>
                  <span className="font-semibold">
                    {symbol}{savings.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleCreateGroup}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              {loading ? 'Creating Group...' : 'Create Group Purchase'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Group Purchase Created!</h3>
              <p className="text-muted-foreground text-sm">
                Share this link with {selectedSize - 1} friends to unlock your {discount}% discount
              </p>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expires in 7 days</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current group size: 1/{selectedSize}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <div className="bg-background border rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Invite Link:</div>
                <div className="text-sm font-mono break-all bg-muted p-2 rounded text-xs">
                  {inviteLink}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  className="flex-1"
                  disabled={copied}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  onClick={shareInviteLink}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
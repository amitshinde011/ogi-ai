import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupPurchase, GroupPurchase } from '@/hooks/useGroupPurchase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Loader from '@/components/ui/loader';
import Header from '@/components/Header';
import { Users, Clock, Gift, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const JoinGroup = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getGroupPurchase, joinGroupPurchase, loading } = useGroupPurchase();
  const [groupPurchase, setGroupPurchase] = useState<GroupPurchase | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (inviteCode) {
      loadGroupPurchase();
    }
  }, [inviteCode]);

  const loadGroupPurchase = async () => {
    if (!inviteCode) return;
    
    const result = await getGroupPurchase(inviteCode);
    if (result.success && result.groupPurchase) {
      setGroupPurchase(result.groupPurchase);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/login', { state: { returnTo: `/join-group/${inviteCode}` } });
      return;
    }

    if (!inviteCode) return;

    setJoining(true);
    const result = await joinGroupPurchase(inviteCode);
    if (result.success && result.groupPurchase) {
      setGroupPurchase(result.groupPurchase);
      // Navigate to payment after successful join
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            program: result.groupPurchase?.programs,
            groupPurchase: result.groupPurchase 
          }
        });
      }, 2000);
    }
    setJoining(false);
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours <= 0) return 'Expired';
    if (hours < 24) return `${hours} hours left`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader size="lg" className="mx-auto" />
          <p className="text-gray-600 font-medium">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!groupPurchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Header title="Group Purchase" showBack={true} />
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">Invalid Invite</h2>
            <p className="text-muted-foreground mb-6">
              This group purchase link is invalid or has expired.
            </p>
            <Button onClick={() => navigate('/subscriptions')}>
              Browse Programs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = (groupPurchase.current_size / groupPurchase.target_size) * 100;
  const currency = groupPurchase.currency;
  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header title="Join Group Purchase" showBack={true} />
      
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-3xl font-bold mb-2">
            Join the {groupPurchase.programs?.name} Group!
          </h1>
          <p className="text-muted-foreground">
            Get {groupPurchase.discount_percentage}% off when this group is complete
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Current Members:</span>
              <Badge variant="secondary">
                {groupPurchase.current_size}/{groupPurchase.target_size} people
              </Badge>
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{groupPurchase.spots_remaining} spots remaining</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span>Original Price:</span>
              <span className="line-through text-muted-foreground">
                {symbol}{groupPurchase.base_price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Group Discount:</span>
              <Badge className="bg-green-100 text-green-800">
                {groupPurchase.discount_percentage}% OFF
              </Badge>
            </div>
            
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Your Price:</span>
              <span className="text-primary">
                {symbol}{groupPurchase.discounted_price.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-green-600">
              <span>You Save:</span>
              <span className="font-semibold">
                {symbol}{(groupPurchase.base_price - groupPurchase.discounted_price).toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-medium">Time Remaining</span>
            </div>
            <p className="text-muted-foreground">
              {formatTimeRemaining(groupPurchase.hours_remaining || 0)}
            </p>
          </CardContent>
        </Card>

        {groupPurchase.is_expired ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">This group purchase has expired.</p>
            <Button onClick={() => navigate('/subscriptions')} variant="outline">
              Browse Other Programs
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Button 
              onClick={handleJoinGroup}
              disabled={joining || groupPurchase.current_size >= groupPurchase.target_size}
              className="w-full"
              size="lg"
            >
              {joining ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Joining Group...
                </>
              ) : groupPurchase.current_size >= groupPurchase.target_size ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Group is Full
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Join Group & Save {groupPurchase.discount_percentage}%
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            {!user && (
              <p className="text-center text-sm text-muted-foreground">
                You'll need to sign in to join this group
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGroup;
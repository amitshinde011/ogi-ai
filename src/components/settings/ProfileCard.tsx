
import React from 'react';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '@/components/ui/user-avatar';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
  userId?: string;
}

interface ProfileCardProps {
  userProfile: UserProfile;
}

const ProfileCard = ({ userProfile }: ProfileCardProps) => {
  const navigate = useNavigate();

  console.log('📋 ProfileCard: Rendering with profile:', userProfile);

  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <UserAvatar
              src={userProfile.avatar}
              alt={userProfile.name}
              fallbackText={userProfile.name?.charAt(0)}
              userId={userProfile.userId || userProfile.id}
              size="xl"
              className="shadow-md"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile-edit')}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
            >
              <Pencil size={16} strokeWidth={1.5} />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-slate-900 truncate">{userProfile.name}</h3>
            <p className="text-slate-600 text-sm truncate">{userProfile.email}</p>
            {userProfile.age && userProfile.gender && (
              <p className="text-slate-500 text-sm mt-1">
                {userProfile.age} years • {userProfile.gender}
              </p>
            )}
            {userProfile.weight && userProfile.height && (
              <p className="text-slate-500 text-sm">
                {userProfile.weight}kg • {userProfile.height}cm
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;

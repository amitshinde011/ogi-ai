
import React from 'react';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
}

interface ProfileCardProps {
  userProfile: UserProfile;
}

const ProfileCard = ({ userProfile }: ProfileCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20">
              <img
                src={userProfile.avatar}
                alt="Profile"
                className="w-full h-full rounded-2xl shadow-md object-cover"
              />
            </div>
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


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Target, Star, Zap, Users } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const JourneyStart = () => {
  const navigate = useNavigate();
  const { updateOnboardingState } = useOnboarding();

  const handleStartJourney = async () => {
    await updateOnboardingState({ journey_started: true });
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 md:p-6 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6 md:space-y-8">
        {/* Hero Section */}
        <Card className="bg-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-6 md:pb-8 px-4 md:px-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-full mx-auto flex items-center justify-center mb-6 md:mb-8 shadow-2xl animate-pulse">
              <Trophy className="text-white" size={48} />
            </div>
            <CardTitle className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
              Your Journey Begins Now!
            </CardTitle>
            <p className="text-lg md:text-2xl text-slate-600 font-medium px-2">
              Welcome to your personalized wellness transformation
            </p>
          </CardHeader>
          <CardContent className="space-y-8 md:space-y-10 p-4 md:p-8">
            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-4 md:p-6 text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl text-slate-900">Daily Tracking</h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">Monitor your wellness progress with intuitive daily tracking tools</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-4 md:p-6 text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl text-slate-900">Guided Activities</h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">Follow personalized routines designed for your specific goals</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <CardContent className="p-4 md:p-6 text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg md:text-xl text-slate-900">Community Support</h3>
                  <p className="text-sm md:text-base text-slate-600 leading-relaxed">Connect with like-minded people on similar journeys</p>
                </CardContent>
              </Card>
            </div>

            {/* Success Tips */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
              <CardContent className="p-4 md:p-8">
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg mx-auto sm:mx-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-4 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-indigo-900 text-center sm:text-left">Keys to Success</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Stay consistent with daily activities</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Track your progress honestly</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Engage with the community</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Follow guided routines</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Stay committed to your program</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm md:text-base text-indigo-800 font-semibold leading-relaxed">Celebrate small victories</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <div className="text-center px-4">
              <Button 
                onClick={handleStartJourney}
                size="lg"
                className="h-16 md:h-20 px-8 md:px-16 rounded-3xl font-bold text-lg md:text-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Trophy className="w-6 h-6 md:w-8 md:h-8 mr-3 md:mr-4" />
                <span className="text-base md:text-xl">Enter My Wellness Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JourneyStart;

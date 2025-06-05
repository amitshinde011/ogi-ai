
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';

const ProgramComplete = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Header title="Congratulations!" />
      
      <div className="min-h-screen bg-gradient-peaceful p-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center bg-gradient-sage text-white animate-scale-in">
            <CardContent className="p-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Trophy className="w-24 h-24 text-yellow-300 animate-pastel-float" />
                  <Sparkles className="w-8 h-8 text-yellow-200 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mb-4">You Did It!</h1>
              <p className="text-lg mb-6 text-white/90">
                Congratulations on completing your wellness journey! 
                You've made incredible progress and should be proud of your dedication.
              </p>
              
              <div className="flex items-center justify-center space-x-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-300 fill-current" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-white">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-4 text-primary">
                Complete Your Final Assessment
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Help us track your amazing transformation by completing a final assessment. 
                You'll be able to see your before and after comparison and share your success!
              </p>
              
              <Button 
                className="w-full bg-gradient-sage text-white hover:opacity-90 transition-opacity"
                onClick={() => navigate('/final-assessment')}
              >
                Start Final Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProgramComplete;

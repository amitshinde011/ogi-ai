
import React, { useState } from 'react';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress as ProgressBar } from '@/components/ui/progress';
import Layout from '@/components/Layout';
import Header from '@/components/Header';

const Progress = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Mock data for progress tracking
  const weeklyData = [
    { day: 'Mon', meals: 3, steps: 8500, score: 4 },
    { day: 'Tue', meals: 2, steps: 6200, score: 3 },
    { day: 'Wed', meals: 3, steps: 9800, score: 5 },
    { day: 'Thu', meals: 3, steps: 7300, score: 4 },
    { day: 'Fri', meals: 1, steps: 4500, score: 2 },
    { day: 'Sat', meals: 2, steps: 12000, score: 5 },
    { day: 'Sun', meals: 3, steps: 10500, score: 4 }
  ];

  const monthlyStats = {
    totalMeals: 78,
    avgSteps: 8200,
    avgScore: 3.8,
    streak: 12,
    bestDay: 'Wednesday',
    improvement: 15
  };

  const achievements = [
    { title: '7-Day Streak', description: 'Logged meals for 7 consecutive days', earned: true, icon: '🔥' },
    { title: 'Early Bird', description: 'Logged breakfast 10 times', earned: true, icon: '🌅' },
    { title: 'Step Master', description: 'Walked 10,000+ steps in a day', earned: true, icon: '👟' },
    { title: 'Perfect Week', description: 'Complete all meals for a week', earned: false, icon: '⭐' },
    { title: 'Community Star', description: 'Get 50 likes on your posts', earned: false, icon: '💫' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-500';
    if (score >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Layout>
      <Header title="Your Progress" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto">
        {/* Period Selector */}
        <div className="flex bg-sage/10 rounded-xl p-1">
          {['week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {period === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        {selectedPeriod === 'week' ? (
          <>
            {/* Weekly Overview */}
            <Card className="bg-gradient-sage text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">This Week's Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm opacity-90">Meals Logged</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">57K</div>
                    <div className="text-sm opacity-90">Steps Walked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">3.9</div>
                    <div className="text-sm opacity-90">Avg Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary mb-4">Daily Breakdown</h3>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 text-sm font-medium">{day.day}</div>
                        <div className="flex items-center ml-4">
                          <div className="flex">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-3 h-3 rounded-full mr-1 ${
                                  i < day.meals ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            {day.meals}/3 meals
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-muted-foreground">
                          {day.steps.toLocaleString()} steps
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${getScoreColor(day.score)}`}>
                          {day.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Monthly Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="text-primary mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-primary">{monthlyStats.totalMeals}</div>
                  <div className="text-sm text-muted-foreground">Total Meals</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="text-primary mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-primary">{monthlyStats.avgSteps.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Avg Daily Steps</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="text-primary mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-primary">{monthlyStats.streak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="text-primary mx-auto mb-2" size={24} />
                  <div className="text-2xl font-bold text-primary">{monthlyStats.avgScore}</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Progress */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-primary mb-4">Monthly Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Meal Goal</span>
                      <span>87%</span>
                    </div>
                    <ProgressBar value={87} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Step Goal (10K)</span>
                      <span>82%</span>
                    </div>
                    <ProgressBar value={82} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Walk Challenge</span>
                      <span>76%</span>
                    </div>
                    <ProgressBar value={76} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Achievements */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-primary mb-4">Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg border ${
                    achievement.earned
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-2xl mr-3">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Progress;

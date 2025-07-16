
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Target,
  Flame,
  Star,
  Activity
} from 'lucide-react';

interface WeeklyProgressData {
  totalScore: number;
  averageScore: number;
  streak: number;
  activeDays: number;
  dailyScores: number[];
  suggestions: string[];
}

interface WeeklyProgressProps {
  data: WeeklyProgressData;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ data }) => {
  const getDayLabels = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      labels.push(days[date.getDay()]);
    }
    
    return labels;
  };

  const chartData = data.dailyScores.map((score, index) => ({
    day: getDayLabels()[index],
    score: Math.round(score),
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getPerformanceMessage = () => {
    if (data.averageScore >= 80) return 'Excellent performance this week!';
    if (data.averageScore >= 60) return 'Good progress, keep it up!';
    return 'Let\'s focus on consistency this week!';
  };

  return (
    <div className="space-y-4">
      {/* Weekly Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weekly Score Circle */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg max-w-md mx-auto">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-gray-800">Weekly Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-28 h-28 mb-4">
              <CircularProgressbar
                value={data.averageScore}
                text={`${Math.round(data.averageScore)}%`}
                styles={buildStyles({
                  textSize: '18px',
                  pathColor: getScoreColor(data.averageScore),
                  textColor: 'hsl(var(--foreground))',
                  trailColor: 'hsl(var(--muted))',
                })}
              />
            </div>
            <p className="text-sm text-gray-600 text-center font-medium">
              {getPerformanceMessage()}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <Card className="bg-white border-0 shadow-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={20} />
              Weekly Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Activity size={16} className="text-green-500" />
                Active Days
              </span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{data.activeDays}/7</span>
                <div className="w-16">
                  <Progress value={(data.activeDays / 7) * 100} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Flame size={16} className="text-orange-500" />
                Best Streak
              </span>
              <span className="font-semibold text-gray-800">{data.streak} days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Target size={16} className="text-blue-500" />
                Total Points
              </span>
              <span className="font-semibold text-gray-800">{Math.round(data.totalScore)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Scores Chart */}
      <Card className="bg-white border-0 shadow-sm max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Daily Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  domain={[0, 100]}
                />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--success))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 max-w-md mx-auto">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star size={18} className="text-blue-600" />
            Weekly Suggestions
          </h3>
          <div className="space-y-2">
            {data.suggestions.map((suggestion, index) => (
              <p key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                {suggestion}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProgress;


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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Score */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Weekly Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-6">
            <div className="w-24 h-24 mb-4">
              <CircularProgressbar
                value={data.averageScore}
                text={`${Math.round(data.averageScore)}%`}
                styles={buildStyles({
                  textSize: '20px',
                  pathColor: getScoreColor(data.averageScore),
                  textColor: 'hsl(var(--foreground))',
                  trailColor: 'hsl(var(--muted))',
                })}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {getPerformanceMessage()}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Stats */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar size={18} />
              Weekly Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity size={14} className="text-green-500" />
                Active Days
              </span>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{data.activeDays}/7</span>
                <div className="w-12 h-2">
                  <Progress value={(data.activeDays / 7) * 100} className="h-2" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Flame size={14} className="text-orange-500" />
                Best Streak
              </span>
              <span className="font-semibold text-foreground">{data.streak} days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Target size={14} className="text-blue-500" />
                Total Points
              </span>
              <span className="font-semibold text-foreground">{Math.round(data.totalScore)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Daily Performance</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProgress;

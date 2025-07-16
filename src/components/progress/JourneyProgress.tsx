
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  Star,
  Activity
} from 'lucide-react';

interface JourneyProgressData {
  totalDays: number;
  completedDays: number;
  activeDays: number;
  averageScore: number;
  totalScore: number;
  programName: string;
  startDate: string;
  endDate: string;
  currentStreak: number;
  bestStreak: number;
  milestones: Array<{
    day: number;
    score: number;
    cumulativeScore: number;
    date: string;
  }>;
  suggestions: string[];
}

interface JourneyProgressProps {
  data: JourneyProgressData;
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({ data }) => {
  const progressPercentage = (data.completedDays / data.totalDays) * 100;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not Set';
    try {
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  const getJourneyMessage = () => {
    const percentage = progressPercentage;
    if (percentage >= 100) return 'Journey Complete! Congratulations!';
    if (percentage >= 75) return 'Almost there! Final stretch ahead!';
    if (percentage >= 50) return 'Great progress! Halfway milestone reached!';
    if (percentage >= 25) return 'Building momentum! Keep it up!';
    return 'Journey just started! Stay consistent!';
  };

  const chartData = data.milestones.map((milestone) => ({
    day: milestone.day,
    points: milestone.score, // Daily points, not cumulative
    date: milestone.date
  }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Journey Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Journey Score */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Journey Score</CardTitle>
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
              Average performance across milestones
            </p>
          </CardContent>
        </Card>

        {/* Journey Stats */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar size={18} />
              Journey Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Target size={14} className="text-blue-500" />
                Completion
              </span>
              <span className="font-semibold text-foreground">{Math.round(progressPercentage)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity size={14} className="text-green-500" />
                Active Days
              </span>
              <span className="font-semibold text-foreground">{data.activeDays} / {data.totalDays}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                Days Remaining
              </span>
              <span className="font-semibold text-foreground">
                {Math.max(0, data.totalDays - data.completedDays)} days
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-orange-500" />
                Current Streak
              </span>
              <span className="font-semibold text-foreground">{data.currentStreak} days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Award size={14} className="text-yellow-500" />
                Best Streak
              </span>
              <span className="font-semibold text-foreground">{data.bestStreak} days</span>
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

      {/* Daily Points Chart */}
      {data.milestones.length > 0 && (
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp size={18} />
              Daily Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    domain={[0, 80]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JourneyProgress;

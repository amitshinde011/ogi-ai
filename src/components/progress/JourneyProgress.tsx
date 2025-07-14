
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
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
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
    <div className="space-y-6">
      {/* Journey Overview */}
      <Card className="bg-gradient-to-br from-sage to-sage/90 text-white border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Activity size={24} />
            {data.programName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span>Started: {formatDate(data.startDate)}</span>
            <span>Ends: {formatDate(data.endDate)}</span>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Journey Progress</span>
              <span>{data.completedDays} / {data.totalDays} days</span>
            </div>
            <Progress value={progressPercentage} className="bg-white/30 h-3" />
          </div>
          
          <p className="text-white/90 text-sm font-medium">
            {getJourneyMessage()}
          </p>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overall Score */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold text-gray-800">Journey Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-28 h-28 mb-4">
              <CircularProgressbar
                value={data.averageScore}
                text={`${Math.round(data.averageScore)}%`}
                styles={buildStyles({
                  textSize: '18px',
                  pathColor: getScoreColor(data.averageScore),
                  textColor: '#374151',
                  trailColor: '#F3F4F6',
                })}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Average performance across milestones
            </p>
          </CardContent>
        </Card>

        {/* Journey Stats */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Award size={20} />
              Journey Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Target size={16} className="text-primary" />
                Completion
              </span>
              <span className="font-semibold text-gray-800">{Math.round(progressPercentage)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Activity size={16} className="text-sage" />
                Active Days
              </span>
              <span className="font-semibold text-gray-800">{data.activeDays} / {data.totalDays}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                Days Remaining
              </span>
              <span className="font-semibold text-gray-800">
                {Math.max(0, data.totalDays - data.completedDays)} days
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" />
                Current Streak
              </span>
              <span className="font-semibold text-gray-800">{data.currentStreak} days</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Award size={16} className="text-yellow-500" />
                Best Streak
              </span>
              <span className="font-semibold text-gray-800">{data.bestStreak} days</span>
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

      {/* Milestone Progress Chart */}
      {data.milestones.length > 0 && (
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} />
              Daily Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    label={{ value: 'Day', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' } }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    label={{ value: 'Points Earned', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' } }}
                    domain={[0, 70]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke={getScoreColor(data.averageScore)}
                    strokeWidth={3}
                    dot={{ fill: getScoreColor(data.averageScore), strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: getScoreColor(data.averageScore) }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journey Suggestions */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star size={18} className="text-green-600" />
            Journey Insights
          </h3>
          <div className="space-y-2">
            {data.suggestions.map((suggestion, index) => (
              <p key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                {suggestion}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JourneyProgress;

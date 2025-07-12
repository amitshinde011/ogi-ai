
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
  averageScore: number;
  totalScore: number;
  programName: string;
  startDate: string;
  endDate: string;
  milestones: Array<{
    day: number;
    score: number;
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
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
    day: `Day ${milestone.day}`,
    score: Math.round(milestone.score),
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
              <span className="text-sm text-gray-600">Completion</span>
              <span className="font-semibold text-gray-800">{Math.round(progressPercentage)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Days Remaining</span>
              <span className="font-semibold text-gray-800">
                {Math.max(0, data.totalDays - data.completedDays)} days
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Target size={16} className="text-blue-500" />
                Total Points
              </span>
              <span className="font-semibold text-gray-800">{Math.round(data.totalScore)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Milestones</span>
              <span className="font-semibold text-gray-800">{data.milestones.length}</span>
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
              Milestone Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    domain={[0, 100]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#10B981' }}
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

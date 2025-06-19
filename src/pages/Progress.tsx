
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Trophy, Activity, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ProgramData {
  id: string;
  name: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  status: string;
  progress_percentage: number;
  days_completed: number;
}

const ProgressPage = () => {
  const navigate = useNavigate();
  const [currentProgram, setCurrentProgram] = useState<ProgramData | null>(null);
  const [historicalPrograms, setHistoricalPrograms] = useState<ProgramData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Fetch all user subscriptions with program details
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          start_date,
          end_date,
          status,
          programs (
            name,
            duration_days
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!subscriptions) return;

      const programsData: ProgramData[] = subscriptions.map(sub => {
        const startDate = new Date(sub.start_date);
        const endDate = new Date(sub.end_date);
        const todayDate = new Date(today);
        
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysCompleted = Math.max(0, Math.ceil((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        const progressPercentage = Math.min(100, (daysCompleted / totalDays) * 100);

        return {
          id: sub.id,
          name: sub.programs?.name || 'Unknown Program',
          duration_days: sub.programs?.duration_days || totalDays,
          start_date: sub.start_date,
          end_date: sub.end_date,
          status: sub.status,
          progress_percentage: progressPercentage,
          days_completed: Math.min(daysCompleted, totalDays)
        };
      });

      // Separate current and historical programs
      const current = programsData.find(p => p.status === 'active' && new Date(p.end_date) >= new Date(today));
      const historical = programsData.filter(p => p.status !== 'active' || new Date(p.end_date) < new Date(today));

      setCurrentProgram(current || null);
      setHistoricalPrograms(historical);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string, endDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = new Date(endDate) < new Date(today);
    
    if (isCompleted) {
      return <Badge className="bg-green-500">Completed</Badge>;
    } else if (status === 'active') {
      return <Badge className="bg-blue-500">In Progress</Badge>;
    } else {
      return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <Header title="Progress" />
        <div className="min-h-screen bg-light-gray flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Your Progress" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
        {/* Current Program */}
        {currentProgram && (
          <Card className="bg-gradient-sage text-white border-gray-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Current Program</CardTitle>
                <Activity className="w-6 h-6" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-bold text-xl">{currentProgram.name}</h3>
                <p className="text-white/90">
                  Day {currentProgram.days_completed} of {currentProgram.duration_days}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(currentProgram.progress_percentage)}%</span>
                </div>
                <Progress value={currentProgram.progress_percentage} className="bg-gray-300" />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span>Started: {formatDate(currentProgram.start_date)}</span>
                </div>
                <span>Ends: {formatDate(currentProgram.end_date)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Current Program */}
        {!currentProgram && (
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-primary mb-2">No Active Program</h3>
              <p className="text-gray-600 mb-4">Start your wellness journey today!</p>
              <Button 
                onClick={() => navigate('/subscriptions')}
                className="bg-gradient-sage text-white"
              >
                Browse Programs
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Historical Programs */}
        {historicalPrograms.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">Program History</h2>
            {historicalPrograms.map((program) => (
              <Card key={program.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary">{program.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(program.start_date)} - {formatDate(program.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(program.status, program.end_date)}
                      {program.progress_percentage >= 100 && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{Math.round(program.progress_percentage)}%</span>
                    </div>
                    <Progress value={program.progress_percentage} className="h-2" />
                    <p className="text-xs text-gray-500">
                      {program.days_completed} of {program.duration_days} days completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Historical Programs */}
        {historicalPrograms.length === 0 && !currentProgram && (
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-primary mb-2">No Program History</h3>
              <p className="text-gray-600">Your completed programs will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ProgressPage;

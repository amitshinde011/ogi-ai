
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import CurrentProgramCard from '@/components/progress/CurrentProgramCard';
import NoProgramCard from '@/components/progress/NoProgramCard';
import ProgramHistorySection from '@/components/progress/ProgramHistorySection';
import DailyActivityProgress from '@/components/progress/DailyActivityProgress';
import SubscriptionBanner from '@/components/SubscriptionBanner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar, TrendingUp } from 'lucide-react';
import { useSubscriptionBanner } from '@/hooks/useSubscriptionBanner';
import { calculateProgramProgress } from '@/utils/dateUtils';
import { useTodayActivity } from '@/hooks/useTodayActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const { showBanner } = useSubscriptionBanner();
  const { activityData, loading: activityLoading } = useTodayActivity();

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
        const { totalDays, daysCompleted, progressPercentage, isCompleted } = 
          calculateProgramProgress(sub.start_date, sub.end_date);

        return {
          id: sub.id,
          name: sub.programs?.name || 'Unknown Program',
          duration_days: sub.programs?.duration_days || totalDays,
          start_date: sub.start_date,
          end_date: sub.end_date,
          status: sub.status,
          progress_percentage: progressPercentage,
          days_completed: daysCompleted
        };
      });

      // Separate current and historical programs
      const current = programsData.find(p => {
        if (p.status !== 'active') return false;
        const endDate = new Date(p.end_date);
        const todayDate = new Date(today);
        return todayDate <= endDate; // Program is current until end date (inclusive)
      });
      
      const historical = programsData.filter(p => p.id !== current?.id);

      setCurrentProgram(current || null);
      setHistoricalPrograms(historical);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryItemClick = (programId: string) => {
    navigate('/comparison', { state: { subscriptionId: programId } });
  };

  if (loading || activityLoading) {
    return (
      <Layout>
        <Header title="Progress" />
        {showBanner && <SubscriptionBanner />}
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} strokeWidth={1.5} className="text-sage animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Your Progress" />
      {showBanner && <SubscriptionBanner />}
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-4 max-w-4xl mx-auto">
          <Tabs defaultValue="today" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar size={16} />
                Today's Activity
              </TabsTrigger>
              <TabsTrigger value="program" className="flex items-center gap-2">
                <TrendingUp size={16} />
                Program Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <DailyActivityProgress activityData={activityData} />
            </TabsContent>

            <TabsContent value="program" className="space-y-6">
              {/* Current Program or No Program */}
              {currentProgram ? (
                <CurrentProgramCard program={currentProgram} />
              ) : (
                <NoProgramCard />
              )}

              {/* Program History */}
              <ProgramHistorySection 
                programs={historicalPrograms} 
                onItemClick={handleHistoryItemClick}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressPage;

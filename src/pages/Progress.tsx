
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import CurrentProgramCard from '@/components/progress/CurrentProgramCard';
import NoProgramCard from '@/components/progress/NoProgramCard';
import ProgramHistorySection from '@/components/progress/ProgramHistorySection';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <Layout>
        <Header title="Progress" />
        <div className="min-h-screen bg-light-gray flex items-center justify-center">
          <Loader2 size={32} strokeWidth={1.5} className="text-sage animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Your Progress" />
      
      <div className="p-4 space-y-6 max-w-md mx-auto bg-light-gray min-h-screen">
        {/* Current Program or No Program */}
        {currentProgram ? (
          <CurrentProgramCard program={currentProgram} />
        ) : (
          <NoProgramCard />
        )}

        {/* Program History */}
        <ProgramHistorySection programs={historicalPrograms} />
      </div>
    </Layout>
  );
};

export default ProgressPage;

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReportData {
  hasReported: boolean;
  reportCount: number;
  userReport?: {
    reason: string;
    description?: string;
    created_at: string;
  };
}

export const useReportPost = (postId: number, initialReportCount = 0) => {
  const [reportData, setReportData] = useState<ReportData>({
    hasReported: false,
    reportCount: initialReportCount
  });
  const [loading, setLoading] = useState(true);

  const fetchReportStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Only check if user has already reported this post - report count comes from props
      const { data: userReport } = await supabase
        .from('post_reports')
        .select('reason, description, created_at')
        .eq('post_id', postId)
        .eq('reporter_id', user.id)
        .maybeSingle();

      setReportData({
        hasReported: !!userReport,
        reportCount: initialReportCount,
        userReport: userReport || undefined
      });
    } catch (error) {
      console.error('Error fetching report status:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (reason: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to report posts.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason,
          description: description?.trim() || null
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already reported",
            description: "You have already reported this post.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return false;
      } else {
        toast({
          title: "Report submitted",
          description: "Thank you for reporting this post. We'll review it shortly.",
        });
        
        // Update report data optimistically
        setReportData(prev => ({
          ...prev,
          hasReported: true,
          reportCount: prev.reportCount + 1
        }));
        return true;
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error submitting report",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const removeReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('post_reports')
        .delete()
        .eq('post_id', postId)
        .eq('reporter_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Report removed",
        description: "Your report has been removed.",
      });
      
      // Update report data optimistically
      setReportData(prev => ({
        ...prev,
        hasReported: false,
        reportCount: Math.max(0, prev.reportCount - 1)
      }));
      return true;
    } catch (error) {
      console.error('Error removing report:', error);
      toast({
        title: "Error removing report",
        description: "There was an error removing your report. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReportStatus();
  }, [postId]);

  // Update report count when initial count changes
  useEffect(() => {
    setReportData(prev => ({
      ...prev,
      reportCount: initialReportCount
    }));
  }, [initialReportCount]);

  return {
    reportData,
    loading,
    submitReport,
    removeReport,
    refreshReportStatus: fetchReportStatus
  };
};
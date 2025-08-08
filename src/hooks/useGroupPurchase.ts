import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GroupPurchase {
  id: string;
  organizer_id: string;
  program_id: string;
  target_size: number;
  current_size: number;
  discount_percentage: number;
  base_price: number;
  discounted_price: number;
  currency: string;
  status: string;
  invite_code: string;
  expires_at: string;
  hours_remaining?: number;
  is_expired?: boolean;
  participants_count?: number;
  spots_remaining?: number;
  programs?: {
    name: string;
    duration_days: number;
    description?: string;
    features?: string[];
  };
}

export const useGroupPurchase = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createGroupPurchase = async (
    programId: string, 
    targetSize: number, 
    currency: string = 'USD'
  ): Promise<{ success: boolean; groupPurchase?: GroupPurchase; inviteLink?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-group-purchase', {
        body: {
          program_id: programId,
          target_size: targetSize,
          currency: currency
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Group Purchase Created! 🎉",
          description: "Share the invite link with your friends to unlock group discounts.",
        });
        return {
          success: true,
          groupPurchase: data.group_purchase,
          inviteLink: data.invite_link
        };
      } else {
        throw new Error(data.error || 'Failed to create group purchase');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const joinGroupPurchase = async (inviteCode: string): Promise<{ success: boolean; groupPurchase?: GroupPurchase; message?: string }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('join-group-purchase', {
        body: { invite_code: inviteCode }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Joined Group! 🎉",
          description: data.message,
        });
        return {
          success: true,
          groupPurchase: data.group_purchase,
          message: data.message
        };
      } else {
        throw new Error(data.error || 'Failed to join group');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getGroupPurchase = async (inviteCode: string): Promise<{ success: boolean; groupPurchase?: GroupPurchase }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-group-purchase', {
        body: { invite_code: inviteCode }
      });

      if (error) throw error;

      if (data.success) {
        return {
          success: true,
          groupPurchase: data.group_purchase
        };
      } else {
        throw new Error(data.error || 'Failed to get group purchase');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createGroupPurchase,
    joinGroupPurchase,
    getGroupPurchase
  };
};
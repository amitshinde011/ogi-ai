import { supabase } from '@/integrations/supabase/client';

class CommunityFeedRefreshService {
  private static instance: CommunityFeedRefreshService;
  private channel: any = null;
  private isListening = false;

  private constructor() {}

  public static getInstance(): CommunityFeedRefreshService {
    if (!CommunityFeedRefreshService.instance) {
      CommunityFeedRefreshService.instance = new CommunityFeedRefreshService();
    }
    return CommunityFeedRefreshService.instance;
  }

  public startListening() {
    if (this.isListening) return;

    console.log('🎧 Starting community feed refresh listener...');
    
    this.channel = supabase
      .channel('refresh_community_feed')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts'
      }, () => {
        this.refreshMaterializedView();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles'
      }, () => {
        this.refreshMaterializedView();
      })
      .subscribe();

    this.isListening = true;
  }

  public stopListening() {
    if (!this.isListening || !this.channel) return;

    console.log('🔇 Stopping community feed refresh listener...');
    supabase.removeChannel(this.channel);
    this.channel = null;
    this.isListening = false;
  }

  private async refreshMaterializedView() {
    try {
      console.log('🔄 Triggering materialized view refresh...');
      
      // Call the edge function to refresh the materialized view
      const { data, error } = await supabase.functions.invoke('refresh-community-feed', {
        body: { 
          timestamp: new Date().toISOString(),
          trigger: 'background_service'
        }
      });

      if (error) {
        console.error('❌ Error calling refresh edge function:', error);
        return;
      }

      console.log('✅ Materialized view refresh triggered successfully:', data);
    } catch (error) {
      console.error('❌ Error in refresh service:', error);
    }
  }

  public async manualRefresh() {
    console.log('🔄 Manual refresh triggered...');
    await this.refreshMaterializedView();
  }
}

export const communityFeedRefreshService = CommunityFeedRefreshService.getInstance();
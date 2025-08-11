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

    // Materialized view was removed — realtime refresh listener is no longer needed
    console.log('🎧 Community feed now uses direct tables; refresh listener disabled.');
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
    // No-op: materialized view has been removed; the app reads directly from tables
    console.log('ℹ️ Skipping MV refresh — using direct table queries now.');
    return;
  }

  public async manualRefresh() {
    console.log('🔄 Manual refresh triggered...');
    await this.refreshMaterializedView();
  }
}

export const communityFeedRefreshService = CommunityFeedRefreshService.getInstance();
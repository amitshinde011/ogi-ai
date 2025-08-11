
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Users, Settings, Activity, AlertCircle, Download } from 'lucide-react';
import { convertImageElementToWebP } from '@/utils/imageConversion';

interface AutomationUser {
  id: string;
  name: string;
  persona_type: string;
  timezone: string;
  is_active: boolean;
  user_id: string;
}

interface AutomationActivity {
  id: string;
  automation_user_id: string;
  activity_type: string;
  created_at: string;
  automation_users: { name: string };
}

export default function AdminAutomation() {
  const [automationUsers, setAutomationUsers] = useState<AutomationUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<AutomationActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [converting, setConverting] = useState(false);
  const [jpegPosts, setJpegPosts] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch automation users
      const { data: users, error: usersError } = await supabase
        .from('automation_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setAutomationUsers(users || []);

      // Fetch recent activity
      const { data: activity, error: activityError } = await supabase
        .from('automation_activity_log')
        .select(`
          *,
          automation_users!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activityError) throw activityError;
      setRecentActivity(activity || []);

      // Fetch JPEG posts for conversion
      const { data: jpegPostsData } = await supabase
        .from('posts')
        .select('*')
        .like('image_url', '%.jpg')
        .order('created_at', { ascending: false });

      setJpegPosts(jpegPostsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch automation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerManualPosting = async () => {
    try {
      setTriggering(true);
      
      const { data, error } = await supabase.functions.invoke('automation-posting-bot', {
        body: { manual_trigger: true }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Manual posting triggered. Created ${data.stats?.posts_created || 0} posts`,
      });

      // Refresh data after triggering
      setTimeout(fetchData, 2000);

    } catch (error) {
      console.error('Error triggering posting:', error);
      toast({
        title: "Error",
        description: "Failed to trigger manual posting",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  const triggerCleanupBot = async () => {
    try {
      const { error } = await supabase.functions.invoke('automation-cleanup');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Cleanup bot triggered successfully",
      });

    } catch (error) {
      console.error('Error triggering cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to trigger cleanup bot",
        variant: "destructive",
      });
    }
  };

  const triggerEngagementBot = async () => {
    try {
      const { error } = await supabase.functions.invoke('automation-engagement-bot');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Engagement bot triggered successfully",
      });

    } catch (error) {
      console.error('Error triggering engagement:', error);
      toast({
        title: "Error",
        description: "Failed to trigger engagement bot",
        variant: "destructive",
      });
    }
  };

  const refreshCommunityFeed = async () => {
    // Materialized view has been removed; feed is sourced directly from tables now
    toast({
      title: "No refresh needed",
      description: "Community feed updates in real-time from tables.",
    });
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchData();

    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const convertJpegToWebP = async () => {
    if (jpegPosts.length === 0) {
      toast({
        title: "Info",
        description: "No JPEG images found to convert",
      });
      return;
    }

    setConverting(true);

    try {
      const jpegPostsToConvert = jpegPosts.filter(post => 
        post.image_url.match(/\.(jpg|jpeg)$/i)
      );

      if (jpegPostsToConvert.length === 0) {
        toast({
          title: "Info",
          description: "No JPEG posts found to convert",
        });
        setConverting(false);
        return;
      }

      let converted = 0;
      let failed = 0;

      for (const post of jpegPostsToConvert) {
        try {
          // Download the original JPEG image
          const response = await fetch(post.image_url);
          if (!response.ok) throw new Error('Failed to download image');
          
          const imageBlob = await response.blob();
          
          // Create image element for conversion
          const img = document.createElement('img');
          img.src = URL.createObjectURL(imageBlob);
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Convert to WebP using browser API
          const webpBlob = await convertImageElementToWebP(img, 0.8);
          
          // Generate WebP filename
          const originalFilename = post.image_url.split('/').pop();
          const webpFilename = originalFilename?.replace(/\.(jpg|jpeg)$/i, '.webp') || `converted-${Date.now()}.webp`;
          
          // Upload WebP to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bot-posts')
            .upload(webpFilename, webpBlob, {
              contentType: 'image/webp',
              cacheControl: '3600'
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('bot-posts')
            .getPublicUrl(webpFilename);

          // Update post with WebP URL
          const { error: updateError } = await supabase
            .from('posts')
            .update({ image_url: publicUrl })
            .eq('id', post.id);

          if (updateError) throw updateError;

          // Delete the old JPEG image from storage
          const oldImagePath = post.image_url.split('/').pop();
          if (oldImagePath) {
            const { error: deleteError } = await supabase.storage
              .from('bot-posts')
              .remove([oldImagePath]);
            
            if (deleteError) {
              console.warn(`Failed to delete old image ${oldImagePath}:`, deleteError);
            }
          }

          converted++;
          console.log(`✅ Converted post ${post.id}`);
          
          // Clean up object URL
          URL.revokeObjectURL(img.src);
          
        } catch (error) {
          failed++;
          console.error(`❌ Failed to convert post ${post.id}:`, error);
        }
      }

      toast({
        title: "Conversion Complete",
        description: `${converted} images converted, ${failed} failed`,
      });
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Conversion process error:', error);
      toast({
        title: "Error",
        description: "Conversion process failed",
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Management</h1>
          <p className="text-muted-foreground">Manage automation users and posting system</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={refreshCommunityFeed} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Feed
          </Button>
          <Button onClick={triggerManualPosting} disabled={triggering}>
            {triggering ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Trigger Manual Post
          </Button>
          <Button onClick={triggerEngagementBot} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Engagement Bot
          </Button>
          <Button onClick={triggerCleanupBot} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Cleanup Bot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users ({automationUsers.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {automationUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{user.persona_type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Timezone:</span> {user.timezone}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {user.user_id?.slice(0, 8)}...
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    className="w-full mt-4"
                    variant={user.is_active ? "destructive" : "default"}
                    size="sm"
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
              <CardDescription>Latest automation activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    No recent activity found
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{activity.automation_users.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Activity: {activity.activity_type}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure automation system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Active Automation Users</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {automationUsers.filter(u => u.is_active).length} out of {automationUsers.length} users are active
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        automationUsers.forEach(user => {
                          if (!user.is_active) {
                            toggleUserStatus(user.id, false);
                          }
                        });
                      }}
                    >
                      Activate All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        automationUsers.forEach(user => {
                          if (user.is_active) {
                            toggleUserStatus(user.id, true);
                          }
                        });
                      }}
                    >
                      Deactivate All
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Data Management</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Refresh system data and clear caches
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={convertJpegToWebP}
                      disabled={converting || jpegPosts.length === 0}
                    >
                      {converting ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Convert to WebP ({jpegPosts.length})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

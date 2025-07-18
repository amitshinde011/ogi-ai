import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Play, Users, BarChart3, Database, RefreshCw, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertToWebP } from '@/utils/imageConversion';
import { toast } from 'sonner';

interface AutomationStats {
  activeUsers: number;
  totalPosts: number;
  todayPosts: number;
  totalLikes: number;
  totalComments: number;
  lastActivity: string;
}

interface AutomationUser {
  id: string;
  name: string;
  persona_type: string;
  is_active: boolean;
  created_at: string;
}

export default function AutomationAdmin() {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [users, setUsers] = useState<AutomationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [jpegPosts, setJpegPosts] = useState<any[]>([]);
  const { toast: useToastHook } = useToast();

  const fetchStats = async () => {
    try {
      const { data: activeUsersData } = await supabase
        .from('automation_users')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      const { data: totalPostsData } = await supabase
        .from('posts')
        .select('id, created_at, author_id', { count: 'exact' })
        .in('author_id', activeUsersData?.map(u => u.user_id) || []);

      const today = new Date().toISOString().split('T')[0];
      const { data: todayPostsData } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .in('author_id', activeUsersData?.map(u => u.user_id) || [])
        .gte('created_at', today);

      const { data: activityData } = await supabase
        .from('automation_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch JPEG posts for conversion
      const { data: jpegPostsData } = await supabase
        .from('posts')
        .select('*')
        .like('image_url', '%.jpg')
        .order('created_at', { ascending: false });

      setStats({
        activeUsers: activeUsersData?.length || 0,
        totalPosts: totalPostsData?.length || 0,
        todayPosts: todayPostsData?.length || 0,
        totalLikes: 0, // Would need to join with likes table
        totalComments: 0, // Would need to join with comments table  
        lastActivity: activityData?.[0]?.created_at || 'Never'
      });

      setUsers(activeUsersData || []);
      setJpegPosts(jpegPostsData || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      useToastHook({
        title: "Error",
        description: "Failed to fetch automation statistics",
        variant: "destructive"
      });
    }
  };

  const triggerFunction = async (functionName: string) => {
    setLoading(true);
    try {
      const body = functionName === 'automation-posting-bot' ? { manual_trigger: true } : {};
      const { error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;
      
      useToastHook({
        title: "Success",
        description: `${functionName} triggered successfully`,
      });
      
      // Refresh stats after triggering
      setTimeout(fetchStats, 2000);
    } catch (error) {
      console.error(`Error triggering ${functionName}:`, error);
      useToastHook({
        title: "Error",
        description: `Failed to trigger ${functionName}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const convertJpegToWebP = async () => {
    if (jpegPosts.length === 0) {
      toast("No JPEG images found to convert");
      return;
    }

    setConverting(true);

    try {
      const postIds = jpegPosts
        .filter(post => post.image_url.match(/\.(jpg|jpeg)$/i))
        .map(post => post.id);

      if (postIds.length === 0) {
        toast("No JPEG posts found to convert");
        setConverting(false);
        return;
      }

      // Call the Edge Function with service role permissions
      const { data, error } = await supabase.functions.invoke('convert-image-to-webp', {
        body: { post_ids: postIds }
      });

      if (error) throw error;

      const results = data.results || [];
      const converted = results.filter((r: any) => r.status === 'success').length;
      const failed = results.filter((r: any) => r.status === 'error').length;
      const skipped = results.filter((r: any) => r.status === 'skipped').length;

      toast(`Conversion complete: ${converted} succeeded, ${failed} failed, ${skipped} skipped`);
      
      // Log results for debugging
      results.forEach((result: any) => {
        if (result.status === 'success') {
          console.log(`✅ Converted post ${result.post_id}`);
        } else if (result.status === 'error') {
          console.error(`❌ Failed to convert post ${result.post_id}:`, result.error);
        }
      });

      // Refresh data
      fetchStats();
      
    } catch (error) {
      console.error('Conversion process error:', error);
      toast("Conversion process failed");
    } finally {
      setConverting(false);
    }
  };

  const setupAutomation = async () => {
    setLoading(true);
    try {
      // Create automation users first
      await supabase.functions.invoke('create-automation-users');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then populate content
      await supabase.functions.invoke('populate-content-library');
      
      useToastHook({
        title: "Success",
        description: "Automation system setup completed",
      });
      
      setTimeout(fetchStats, 3000);
    } catch (error) {
      console.error('Error setting up automation:', error);
      useToastHook({
        title: "Error", 
        description: "Failed to setup automation system",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation Admin</h1>
          <p className="text-muted-foreground">Monitor and test the automation system</p>
        </div>
        <Button onClick={fetchStats} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Posts</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayPosts || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {stats?.lastActivity ? new Date(stats.lastActivity).toLocaleString() : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {stats?.activeUsers === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No automation users found. Click "Setup Automation" to initialize the system.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Setup</CardTitle>
                <CardDescription>Initialize the automation system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={setupAutomation} 
                  disabled={loading}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Setup Automation System
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Triggers</CardTitle>
                <CardDescription>Test individual functions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => triggerFunction('automation-posting-bot')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Posting Bot
                </Button>
                
                <Button 
                  onClick={() => triggerFunction('automation-engagement-bot')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Engagement Bot
                </Button>
                
                <Button 
                  onClick={() => triggerFunction('automation-cleanup')} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Trigger Cleanup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Image Conversion
                </CardTitle>
                <CardDescription>
                  Convert existing JPEG images to WebP format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {jpegPosts.length} JPEG images found
                  </Badge>
                  <Button 
                    onClick={convertJpegToWebP}
                    disabled={converting || jpegPosts.length === 0}
                    variant="default"
                    className="w-full"
                  >
                    {converting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Convert to WebP
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will convert all JPEG images to WebP format, re-upload them, and update the database records.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Users</CardTitle>
              <CardDescription>Manage programmatic users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.persona_type} • Created {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No automation users found. Run setup to create them.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Monitor automation system activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity logs will be displayed here. Check the Supabase dashboard for detailed logs.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
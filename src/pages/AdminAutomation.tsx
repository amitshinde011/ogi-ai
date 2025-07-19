import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Users, Settings, Activity, AlertCircle } from 'lucide-react';

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

  const refreshCommunityFeed = async () => {
    try {
      const { error } = await supabase.functions.invoke('refresh-community-feed');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Community feed refreshed successfully",
      });

    } catch (error) {
      console.error('Error refreshing feed:', error);
      toast({
        title: "Error",
        description: "Failed to refresh community feed",
        variant: "destructive",
      });
    }
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
        <div className="flex gap-2">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
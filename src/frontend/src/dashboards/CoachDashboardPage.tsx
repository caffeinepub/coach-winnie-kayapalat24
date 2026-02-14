import { useGetAllMembers, useGetAllFollowupTasks, useGetAllDailyCheckins } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CoachDashboardPage() {
  const { data: members = [] } = useGetAllMembers();
  const { data: tasks = [] } = useGetAllFollowupTasks();
  const { data: dailyCheckins = [] } = useGetAllDailyCheckins();
  const navigate = useNavigate();

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const activeThisWeek = new Set(
    dailyCheckins.filter((c) => Number(c.date) / 1_000_000 > oneWeekAgo).map((c) => c.memberId)
  ).size;

  const overdueTasks = tasks.filter((t) => t.status === 'overdue').length;
  const dueToday = tasks.filter((t) => t.status === 'dueToday').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coach Dashboard</h1>
        <p className="text-muted-foreground">Overview of your members and follow-ups</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeThisWeek}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate({ to: '/coach/members' })}>
              <Users className="mr-2 h-4 w-4" />
              View All Members
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => navigate({ to: '/coach/tasks' })}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Follow-up Tasks
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate({ to: '/coach/announcements/new' })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Send Announcement
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyCheckins.slice(0, 5).map((checkin) => {
                const member = members.find((m) => m.id === checkin.memberId);
                return (
                  <div key={checkin.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member?.name || 'Unknown'}</span>
                    <Badge variant="outline">Daily Check-in</Badge>
                  </div>
                );
              })}
              {dailyCheckins.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

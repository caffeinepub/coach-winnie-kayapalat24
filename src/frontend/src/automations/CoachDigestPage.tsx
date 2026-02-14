import { useGetAllFollowupTasks, useGetAllMembers } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function CoachDigestPage() {
  const { data: tasks = [] } = useGetAllFollowupTasks();
  const { data: members = [] } = useGetAllMembers();
  const navigate = useNavigate();

  const overdueTasks = tasks.filter((t) => t.status === 'overdue');
  const dueToday = tasks.filter((t) => t.status === 'dueToday');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coach Digest</h1>
        <p className="text-muted-foreground">Daily summary of follow-ups and priorities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Follow-ups</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled for today</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Priority Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueTasks.slice(0, 5).map((task) => {
            const member = members.find((m) => m.id === task.memberId);
            return (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{member?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Overdue</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate({ to: `/coach/members/${task.memberId}` })}
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}

          {overdueTasks.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Great job! No overdue follow-ups.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

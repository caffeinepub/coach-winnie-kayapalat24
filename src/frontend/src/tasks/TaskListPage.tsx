import { useGetAllFollowupTasks, useCompleteTask } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import TaskStatusPill from './TaskStatusPill';

export default function TaskListPage() {
  const { data: tasks = [] } = useGetAllFollowupTasks();
  const completeTask = useCompleteTask();
  const navigate = useNavigate();

  const dueToday = tasks.filter((t) => t.status === 'dueToday');
  const overdue = tasks.filter((t) => t.status === 'overdue');
  const completed = tasks.filter((t) => t.status === 'completed');

  const handleComplete = async (taskId: string) => {
    await completeTask.mutateAsync(taskId);
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TaskStatusPill status={task.status} />
              <span className="text-sm text-muted-foreground">
                {new Date(Number(task.dueDate) / 1_000_000).toLocaleDateString()}
              </span>
            </div>
            <p className="font-medium">{task.description}</p>
          </div>
          <div className="flex gap-2">
            {task.status !== 'completed' && (
              <Button size="sm" onClick={() => handleComplete(task.id)} disabled={completeTask.isPending}>
                <CheckCircle className="mr-1 h-3 w-3" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Follow-up Tasks</h1>
        <p className="text-muted-foreground">Manage member follow-ups and check-ins</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueToday.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dueToday">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dueToday">Due Today ({dueToday.length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({overdue.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="dueToday" className="space-y-4">
          {dueToday.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {dueToday.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No tasks due today</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          {overdue.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {overdue.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No overdue tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {completed.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {completed.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No completed tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

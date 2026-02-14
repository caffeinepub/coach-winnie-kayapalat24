import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '../backend';

interface TaskStatusPillProps {
  status: TaskStatus;
}

export default function TaskStatusPill({ status }: TaskStatusPillProps) {
  const variants = {
    dueToday: { variant: 'default' as const, label: 'Due Today' },
    overdue: { variant: 'destructive' as const, label: 'Overdue' },
    completed: { variant: 'secondary' as const, label: 'Completed' },
  };

  const config = variants[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

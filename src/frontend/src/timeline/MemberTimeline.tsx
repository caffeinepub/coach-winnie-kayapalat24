import { useGetAllDailyCheckins, useGetAllWeeklyCheckins, useGetAllCoachNotes, useGetAllMessageLogs, useGetAllAnnouncements } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MessageSquare, Bell, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MemberTimelineProps {
  memberId: string;
}

type TimelineItem = {
  id: string;
  type: 'daily' | 'weekly' | 'note' | 'message' | 'announcement';
  timestamp: number;
  title: string;
  content: string;
  icon: typeof CheckCircle;
};

export default function MemberTimeline({ memberId }: MemberTimelineProps) {
  const { data: dailyCheckins = [] } = useGetAllDailyCheckins();
  const { data: weeklyCheckins = [] } = useGetAllWeeklyCheckins();
  const { data: coachNotes = [] } = useGetAllCoachNotes();
  const { data: messageLogs = [] } = useGetAllMessageLogs();
  const { data: announcements = [] } = useGetAllAnnouncements();
  const [filter, setFilter] = useState<string>('all');

  const items: TimelineItem[] = [
    ...dailyCheckins
      .filter((c) => c.memberId === memberId)
      .map((c) => ({
        id: c.id,
        type: 'daily' as const,
        timestamp: Number(c.date) / 1_000_000,
        title: 'Daily Check-in',
        content: `Compliance: ${c.complianceScore}/5, Mood: ${c.moodScore}/5`,
        icon: CheckCircle,
      })),
    ...weeklyCheckins
      .filter((c) => c.memberId === memberId)
      .map((c) => ({
        id: c.id,
        type: 'weekly' as const,
        timestamp: Number(c.date) / 1_000_000,
        title: 'Weekly Check-in',
        content: `Weight: ${c.weight} kg`,
        icon: Calendar,
      })),
    ...coachNotes
      .filter((n) => n.memberId === memberId)
      .map((n) => ({
        id: n.id,
        type: 'note' as const,
        timestamp: Number(n.timestamp) / 1_000_000,
        title: 'Coach Note',
        content: n.content,
        icon: FileText,
      })),
    ...messageLogs
      .filter((m) => m.memberId === memberId)
      .map((m) => ({
        id: m.id,
        type: 'message' as const,
        timestamp: Number(m.timestamp) / 1_000_000,
        title: 'WhatsApp Message',
        content: `Template: ${m.templateId} - ${m.status}`,
        icon: MessageSquare,
      })),
    ...announcements.map((a) => ({
      id: a.id,
      type: 'announcement' as const,
      timestamp: a.scheduledTime ? Number(a.scheduledTime) / 1_000_000 : Date.now(),
      title: a.title,
      content: a.content,
      icon: Bell,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Timeline</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('daily')}
            >
              Check-ins
            </Button>
            <Button
              variant={filter === 'message' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('message')}
            >
              Messages
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex gap-3 border-l-2 border-muted pl-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No timeline items</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

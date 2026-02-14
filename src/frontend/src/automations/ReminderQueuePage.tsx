import { useGetAllMembers, useGetAllDailyCheckins } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, User } from 'lucide-react';
import WhatsAppActions from '../messaging/WhatsAppActions';

export default function ReminderQueuePage() {
  const { data: members = [] } = useGetAllMembers();
  const { data: dailyCheckins = [] } = useGetAllDailyCheckins();

  const today = new Date().setHours(0, 0, 0, 0);
  const todayCheckins = new Set(
    dailyCheckins
      .filter((c) => new Date(Number(c.date) / 1_000_000).setHours(0, 0, 0, 0) === today)
      .map((c) => c.memberId)
  );

  const needsReminder = members.filter(
    (m) =>
      m.consentStatus === 'active' &&
      (m.reminderPreference === 'daily' || m.reminderPreference === 'both') &&
      !todayCheckins.has(m.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reminder Queue</h1>
        <p className="text-muted-foreground">Members who need daily check-in reminders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Pending Reminders ({needsReminder.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {needsReminder.map((member) => (
              <div key={member.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.programType}</p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    No check-in today
                  </Badge>
                </div>
                <WhatsAppActions member={member} />
              </div>
            ))}

            {needsReminder.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">All members have checked in today!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

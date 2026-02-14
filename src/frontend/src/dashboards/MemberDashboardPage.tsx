import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetMemberProfile, useGetAllDailyCheckins, useGetAllWeeklyCheckins, useGetAllAnnouncements } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MemberDashboardPage() {
  const { userProfile } = useCurrentUser();
  const { data: memberProfile } = useGetMemberProfile(userProfile?.memberId);
  const { data: dailyCheckins = [] } = useGetAllDailyCheckins();
  const { data: weeklyCheckins = [] } = useGetAllWeeklyCheckins();
  const { data: announcements = [] } = useGetAllAnnouncements();
  const navigate = useNavigate();

  const myCheckins = dailyCheckins.filter((c) => c.memberId === userProfile?.memberId);
  const streak = myCheckins.length;

  const latestWeekly = weeklyCheckins
    .filter((c) => c.memberId === userProfile?.memberId)
    .sort((a, b) => Number(b.date) - Number(a.date))[0];

  const weightChange = latestWeekly && memberProfile
    ? ((latestWeekly.weight - memberProfile.startingWeight) / memberProfile.startingWeight * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userProfile?.name}!</h1>
        <p className="text-muted-foreground">Keep up the great work on your wellness journey 🌿</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in Streak</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weightChange ? `${weightChange}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestWeekly ? `${latestWeekly.weight} kg` : memberProfile ? `${memberProfile.currentWeight} kg` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              size="lg"
              onClick={() => navigate({ to: '/member/checkin/daily' })}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Daily Check-in
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate({ to: '/member/checkin/weekly' })}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Weekly Check-in
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => navigate({ to: '/member/profile' })}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((announcement) => (
                <div key={announcement.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{announcement.title}</span>
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-sm text-muted-foreground">No updates yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

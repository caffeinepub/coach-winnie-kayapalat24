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

  // Display weight: prefer latest weekly check-in, otherwise use profile currentWeight
  const currentWeight = latestWeekly ? latestWeekly.weight : memberProfile?.currentWeight;

  const weightChange = currentWeight && memberProfile
    ? ((currentWeight - memberProfile.startingWeight) / memberProfile.startingWeight * 100).toFixed(1)
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
              {currentWeight ? `${currentWeight} kg` : 'N/A'}
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
            <Button className="w-full" onClick={() => navigate({ to: '/member/checkin/daily' })}>
              Daily Check-in
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate({ to: '/member/checkin/weekly' })}>
              Weekly Check-in
            </Button>
            <Button className="w-full" variant="outline" onClick={() => navigate({ to: '/member/profile' })}>
              View Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Latest Announcements</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="border-l-2 border-primary pl-3">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                  </div>
                ))}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate({ to: '/member/announcements' })}
                >
                  View all announcements →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {memberProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Starting Weight</span>
                <span className="font-medium">{memberProfile.startingWeight} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Weight</span>
                <span className="font-medium">{currentWeight ? `${currentWeight} kg` : 'N/A'}</span>
              </div>
              {memberProfile.targetWeight && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Target Weight</span>
                  <span className="font-medium">{memberProfile.targetWeight} kg</span>
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Change</span>
                  <Badge variant={weightChange && parseFloat(weightChange) < 0 ? 'default' : 'secondary'}>
                    {weightChange ? `${weightChange}%` : 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

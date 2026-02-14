import { useGetAllAnnouncements } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

export default function AnnouncementsFeedPage() {
  const { data: announcements = [] } = useGetAllAnnouncements();

  const publishedAnnouncements = announcements.filter((a) => a.published);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Updates & Announcements</h1>
        <p className="text-muted-foreground">Stay informed with the latest news</p>
      </div>

      <div className="space-y-4">
        {publishedAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {announcement.targetSegment}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}

        {publishedAnnouncements.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No announcements yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

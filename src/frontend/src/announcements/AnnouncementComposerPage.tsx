import { useState } from 'react';
import { useCreateAnnouncement } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function AnnouncementComposerPage() {
  const createAnnouncement = useCreateAnnouncement();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetSegment: 'all',
    published: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createAnnouncement.mutateAsync({
      id: `announcement_${Date.now()}`,
      title: formData.title,
      content: formData.content,
      targetSegment: formData.targetSegment,
      published: formData.published,
      scheduledTime: undefined,
      image: undefined,
    });

    navigate({ to: '/coach/dashboard' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Announcement</h1>
        <p className="text-muted-foreground">Send updates to your members</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Weekly Motivation"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Your message to members..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment">Target Segment</Label>
              <Select
                value={formData.targetSegment}
                onValueChange={(value) => setFormData({ ...formData, targetSegment: value })}
              >
                <SelectTrigger id="segment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  <SelectItem value="active">Active Members</SelectItem>
                  <SelectItem value="overdue">Overdue Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={createAnnouncement.isPending}>
              {createAnnouncement.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Announcement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

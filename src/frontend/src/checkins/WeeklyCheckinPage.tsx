import { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSubmitWeeklyCheckin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function WeeklyCheckinPage() {
  const { userProfile } = useCurrentUser();
  const submitCheckin = useSubmitWeeklyCheckin();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    weight: 0,
    waist: '',
    hip: '',
    chest: '',
    wins: '',
    struggles: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.memberId) return;

    await submitCheckin.mutateAsync({
      id: `weekly_${Date.now()}`,
      memberId: userProfile.memberId,
      date: BigInt(Date.now() * 1_000_000),
      weight: formData.weight,
      waist: formData.waist ? Number(formData.waist) : undefined,
      hip: formData.hip ? Number(formData.hip) : undefined,
      chest: formData.chest ? Number(formData.chest) : undefined,
      wins: formData.wins || undefined,
      struggles: formData.struggles || undefined,
      photos: undefined,
    });

    navigate({ to: '/member/dashboard' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Weekly Check-in</h1>
        <p className="text-muted-foreground">Update your measurements and progress</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="waist">Waist (cm)</Label>
                <Input
                  id="waist"
                  type="number"
                  step="0.1"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hip">Hip (cm)</Label>
                <Input
                  id="hip"
                  type="number"
                  step="0.1"
                  value={formData.hip}
                  onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chest">Chest (cm)</Label>
                <Input
                  id="chest"
                  type="number"
                  step="0.1"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wins">Wins This Week</Label>
              <Textarea
                id="wins"
                placeholder="What went well?"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="struggles">Struggles This Week</Label>
              <Textarea
                id="struggles"
                placeholder="What was challenging?"
                value={formData.struggles}
                onChange={(e) => setFormData({ ...formData, struggles: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitCheckin.isPending}>
              {submitCheckin.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Check-in
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

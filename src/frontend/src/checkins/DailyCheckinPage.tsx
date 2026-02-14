import { useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSubmitDailyCheckin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function DailyCheckinPage() {
  const { userProfile } = useCurrentUser();
  const submitCheckin = useSubmitDailyCheckin();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    waterIntake: 2,
    workoutMinutes: 0,
    steps: 0,
    sleepHours: 7,
    moodScore: 3,
    digestionScore: 3,
    complianceScore: 3,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.memberId) return;

    await submitCheckin.mutateAsync({
      id: `daily_${Date.now()}`,
      memberId: userProfile.memberId,
      date: BigInt(Date.now() * 1_000_000),
      waterIntake: formData.waterIntake,
      workoutMinutes: BigInt(formData.workoutMinutes),
      steps: BigInt(formData.steps),
      sleepHours: formData.sleepHours,
      moodScore: BigInt(formData.moodScore),
      digestionScore: BigInt(formData.digestionScore),
      complianceScore: BigInt(formData.complianceScore),
      notes: formData.notes || undefined,
    });

    navigate({ to: '/member/dashboard' });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Daily Check-in</h1>
        <p className="text-muted-foreground">Track your daily progress in under 30 seconds</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Today's Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="water">Water Intake (liters)</Label>
              <Input
                id="water"
                type="number"
                step="0.1"
                value={formData.waterIntake}
                onChange={(e) => setFormData({ ...formData, waterIntake: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workout">Workout Minutes</Label>
              <Input
                id="workout"
                type="number"
                value={formData.workoutMinutes}
                onChange={(e) => setFormData({ ...formData, workoutMinutes: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps">Steps</Label>
              <Input
                id="steps"
                type="number"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep Hours</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                value={formData.sleepHours}
                onChange={(e) => setFormData({ ...formData, sleepHours: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mood Score: {formData.moodScore}/5</Label>
              <Slider
                value={[formData.moodScore]}
                onValueChange={([value]) => setFormData({ ...formData, moodScore: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Digestion Score: {formData.digestionScore}/5</Label>
              <Slider
                value={[formData.digestionScore]}
                onValueChange={([value]) => setFormData({ ...formData, digestionScore: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Compliance Score: {formData.complianceScore}/5</Label>
              <Slider
                value={[formData.complianceScore]}
                onValueChange={([value]) => setFormData({ ...formData, complianceScore: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="How are you feeling today?"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

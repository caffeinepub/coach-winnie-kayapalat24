import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure app defaults and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Times (India Timezone)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dailyTime">Daily Check-in Reminder</Label>
            <Input id="dailyTime" type="time" defaultValue="20:00" />
            <p className="text-xs text-muted-foreground">Default: 8:00 PM IST</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="digestTime">Coach Digest Time</Label>
            <Input id="digestTime" type="time" defaultValue="21:00" />
            <p className="text-xs text-muted-foreground">Default: 9:00 PM IST</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Follow-up Frequency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Days between follow-ups</Label>
            <Input id="frequency" type="number" defaultValue="7" />
            <p className="text-xs text-muted-foreground">Default: 7 days (weekly)</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

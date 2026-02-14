import { useState } from 'react';
import { useCreateMember, useUpdateMember } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Gender, ReminderPreference, ConsentStatus, type MemberProfile } from '../backend';

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: MemberProfile;
}

export default function MemberFormDialog({ open, onOpenChange, member }: MemberFormDialogProps) {
  const [formData, setFormData] = useState<Partial<MemberProfile>>(
    member || {
      name: '',
      age: 0n,
      gender: Gender.female,
      heightCm: 0,
      whatsappPhone: '',
      startingWeight: 0,
      currentWeight: 0,
      programType: 'fat loss',
      noSnacks: false,
      reminderPreference: ReminderPreference.daily,
      consentStatus: ConsentStatus.pending,
    }
  );

  const createMember = useCreateMember();
  const updateMember = useUpdateMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const profile: MemberProfile = {
      id: member?.id || `member_${Date.now()}`,
      name: formData.name || '',
      age: BigInt(formData.age || 0),
      gender: (formData.gender || Gender.female),
      heightCm: Number(formData.heightCm) || 0,
      whatsappPhone: formData.whatsappPhone || '',
      startingWeight: Number(formData.startingWeight) || 0,
      currentWeight: Number(formData.currentWeight) || 0,
      programType: formData.programType || 'fat loss',
      noSnacks: formData.noSnacks || false,
      reminderPreference: (formData.reminderPreference || ReminderPreference.daily),
      consentStatus: (formData.consentStatus || ConsentStatus.pending),
      consentTimestamp: formData.consentStatus === ConsentStatus.active ? BigInt(Date.now() * 1_000_000) : undefined,
      waistCircumference: formData.waistCircumference ? Number(formData.waistCircumference) : undefined,
      hipCircumference: formData.hipCircumference ? Number(formData.hipCircumference) : undefined,
      chestCircumference: formData.chestCircumference ? Number(formData.chestCircumference) : undefined,
      targetWeight: formData.targetWeight ? Number(formData.targetWeight) : undefined,
      targetDate: formData.targetDate ? BigInt(formData.targetDate) : undefined,
      trfWindowStart: undefined,
      trfWindowEnd: undefined,
    };

    if (member) {
      await updateMember.mutateAsync({ id: member.id, profile });
    } else {
      await createMember.mutateAsync(profile);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Member' : 'Add New Member'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                value={Number(formData.age)}
                onChange={(e) => setFormData({ ...formData, age: BigInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as Gender })}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.male}>Male</SelectItem>
                  <SelectItem value={Gender.female}>Female</SelectItem>
                  <SelectItem value={Gender.other}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp Phone *</Label>
              <Input
                id="phone"
                value={formData.whatsappPhone}
                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                placeholder="+91XXXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program Type *</Label>
              <Input
                id="program"
                value={formData.programType}
                onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                placeholder="e.g., fat loss, muscle gain"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startWeight">Starting Weight (kg) *</Label>
              <Input
                id="startWeight"
                type="number"
                step="0.1"
                value={formData.startingWeight}
                onChange={(e) => setFormData({ ...formData, startingWeight: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg) *</Label>
              <Input
                id="currentWeight"
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight (kg)</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={formData.targetWeight || ''}
                onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder">Reminder Preference</Label>
              <Select
                value={formData.reminderPreference}
                onValueChange={(value) => setFormData({ ...formData, reminderPreference: value as ReminderPreference })}
              >
                <SelectTrigger id="reminder">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReminderPreference.daily}>Daily</SelectItem>
                  <SelectItem value={ReminderPreference.weekly}>Weekly</SelectItem>
                  <SelectItem value={ReminderPreference.both}>Both</SelectItem>
                  <SelectItem value={ReminderPreference.none}>None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consent">Consent Status</Label>
              <Select
                value={formData.consentStatus}
                onValueChange={(value) => setFormData({ ...formData, consentStatus: value as ConsentStatus })}
              >
                <SelectTrigger id="consent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ConsentStatus.active}>Active</SelectItem>
                  <SelectItem value={ConsentStatus.pending}>Pending</SelectItem>
                  <SelectItem value={ConsentStatus.optedOut}>Opted Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="noSnacks"
                checked={formData.noSnacks}
                onCheckedChange={(checked) => setFormData({ ...formData, noSnacks: checked })}
              />
              <Label htmlFor="noSnacks">No Snacks Preference</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMember.isPending || updateMember.isPending}>
              {(createMember.isPending || updateMember.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : member ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

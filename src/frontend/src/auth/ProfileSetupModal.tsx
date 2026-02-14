import { useState } from 'react';
import { useSaveUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { UserRole } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<UserRole>(UserRole.coach);
  const [memberId, setMemberId] = useState('');
  const saveProfile = useSaveUserProfile();

  const isMember = accountType === UserRole.member;
  const isFormValid = name.trim() && (!isMember || memberId.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    await saveProfile.mutateAsync({
      name: name.trim(),
      role: accountType,
      memberId: isMember ? memberId.trim() : undefined,
    });
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Let's set up your profile</DialogTitle>
          <DialogDescription>Tell us a bit about yourself to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountType">Account Type</Label>
            <Select value={accountType} onValueChange={(value) => setAccountType(value as UserRole)}>
              <SelectTrigger id="accountType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.coach}>Coach</SelectItem>
                <SelectItem value={UserRole.assistantCoach}>Assistant Coach</SelectItem>
                <SelectItem value={UserRole.member}>Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isMember && (
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID</Label>
              <Input
                id="memberId"
                placeholder="Enter your member ID"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={saveProfile.isPending || !isFormValid}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

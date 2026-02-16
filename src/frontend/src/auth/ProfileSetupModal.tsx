import { useState, useEffect } from 'react';
import { useSaveUserProfile, useSwitchMember } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { UserRole } from '../backend';
import { getLoginIntent, clearLoginIntent } from './loginIntent';
import { useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfileSetupModal() {
  const navigate = useNavigate();
  const loginIntent = getLoginIntent();
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<UserRole>(
    loginIntent === 'member' ? UserRole.member : UserRole.coach
  );
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const saveProfile = useSaveUserProfile();
  const switchMember = useSwitchMember();

  const isMember = accountType === UserRole.member;
  const isFormValid = name.trim() && (!isMember || whatsappPhone.trim());

  useEffect(() => {
    // Clear validation error when phone changes
    if (validationError) {
      setValidationError(null);
    }
  }, [whatsappPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      if (isMember) {
        // For members, use switchMember to link via WhatsApp phone
        await switchMember.mutateAsync({
          whatsappPhone: whatsappPhone.trim(),
        });
      } else {
        // For coaches, save profile directly
        await saveProfile.mutateAsync({
          name: name.trim(),
          role: accountType,
          memberId: undefined,
        });
      }

      // Clear login intent after successful setup
      clearLoginIntent();

      // Navigate to appropriate dashboard
      if (accountType === UserRole.member) {
        navigate({ to: '/' });
      } else {
        navigate({ to: '/coach/dashboard' });
      }
    } catch (error: any) {
      console.error('Profile setup error:', error);
      // Display backend error message directly
      const errorMessage = error.message || 'Failed to complete setup. Please try again.';
      setValidationError(errorMessage);
    }
  };

  const isPending = saveProfile.isPending || switchMember.isPending;
  const hasError = saveProfile.isError || switchMember.isError;

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
              <Label htmlFor="whatsappPhone">WhatsApp Phone Number</Label>
              <Input
                id="whatsappPhone"
                placeholder="Enter your WhatsApp phone number"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the phone number your coach has on file for you.
              </p>
            </div>
          )}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          {hasError && !validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to complete setup. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isPending || !isFormValid}>
            {isPending ? (
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

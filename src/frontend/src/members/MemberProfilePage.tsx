import { useParams } from '@tanstack/react-router';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetMemberProfile, useUpdateCurrentWeight } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Calendar, TrendingUp, Edit, Scale, Loader2 } from 'lucide-react';
import { useState } from 'react';
import MemberFormDialog from './MemberFormDialog';
import MemberTimeline from '../timeline/MemberTimeline';
import WhatsAppActions from '../messaging/WhatsAppActions';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MemberProfilePage() {
  const params = useParams({ strict: false });
  const { userProfile, isCoach, isMember } = useCurrentUser();
  const memberId = params.memberId || userProfile?.memberId;
  const { data: member } = useGetMemberProfile(memberId);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const updateWeightMutation = useUpdateCurrentWeight();

  const isOwnProfile = isMember && userProfile?.memberId === memberId;

  if (!member) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Member not found</p>
      </div>
    );
  }

  const bmi = member.currentWeight / Math.pow(member.heightCm / 100, 2);

  const handleWeightUpdate = async () => {
    setErrorMessage('');
    const weight = parseFloat(newWeight);
    
    if (isNaN(weight) || weight <= 0) {
      setErrorMessage('Please enter a valid weight');
      return;
    }

    try {
      await updateWeightMutation.mutateAsync({
        memberId: member.id,
        newWeight: weight,
      });
      setShowWeightForm(false);
      setNewWeight('');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update weight');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">{member.programType}</p>
        </div>
        {isCoach && (
          <Button onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{member.whatsappPhone}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{member.gender}</span>
              <span className="text-sm text-muted-foreground">• {Number(member.age)} years</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Weight:</span>
              <span className="text-sm font-medium">{member.currentWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Height:</span>
              <span className="text-sm font-medium">{member.heightCm} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">BMI:</span>
              <span className="text-sm font-medium">{bmi.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Target Weight:</span>
              <span className="text-sm font-medium">{member.targetWeight ? `${member.targetWeight} kg` : 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Starting:</span>
              <span className="text-sm font-medium">{member.startingWeight} kg</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {((member.currentWeight - member.startingWeight) / member.startingWeight * 100).toFixed(1)}% change
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Update Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showWeightForm ? (
              <Button onClick={() => setShowWeightForm(true)} variant="outline">
                Update Current Weight
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Current weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Enter your current weight"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    disabled={updateWeightMutation.isPending}
                  />
                </div>
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleWeightUpdate}
                    disabled={updateWeightMutation.isPending}
                  >
                    {updateWeightMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowWeightForm(false);
                      setNewWeight('');
                      setErrorMessage('');
                    }}
                    disabled={updateWeightMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preferences & Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Reminder Preference:</span>
            <Badge variant="outline" className="capitalize">{member.reminderPreference}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Consent Status:</span>
            <Badge variant={member.consentStatus === 'active' ? 'default' : 'secondary'} className="capitalize">
              {member.consentStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">No Snacks:</span>
            <Badge variant={member.noSnacks ? 'default' : 'outline'}>{member.noSnacks ? 'Yes' : 'No'}</Badge>
          </div>
        </CardContent>
      </Card>

      {isCoach && <WhatsAppActions member={member} />}

      <MemberTimeline memberId={member.id} />

      {isCoach && <MemberFormDialog open={showEditDialog} onOpenChange={setShowEditDialog} member={member} />}
    </div>
  );
}

import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Heart } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState('coach');

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-background to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Coach Winnie</CardTitle>
          <CardDescription>Kayapalat24 - Your wellness journey partner</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coach">Coach</TabsTrigger>
              <TabsTrigger value="member">Member</TabsTrigger>
            </TabsList>
            <TabsContent value="coach" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in as a coach or admin to manage members and follow-ups.
              </p>
              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Coach'
                )}
              </Button>
            </TabsContent>
            <TabsContent value="member" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in as a member to track your progress and receive updates.
              </p>
              <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In as Member'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

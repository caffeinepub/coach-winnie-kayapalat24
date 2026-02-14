import { ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Home, Users, CheckSquare, Bell, MessageSquare, BarChart3, Settings, LogOut, User, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { isCoachStaffRole, getRoleLabel } from '../utils/roles';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { identity, clear } = useInternetIdentity();
  const { userProfile } = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isCoach = isCoachStaffRole(userProfile?.role);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const coachNavItems = [
    { icon: Home, label: 'Dashboard', path: '/coach/dashboard' },
    { icon: Users, label: 'Members', path: '/coach/members' },
    { icon: CheckSquare, label: 'Follow-ups', path: '/coach/tasks' },
    { icon: Bell, label: 'Reminders', path: '/coach/reminders' },
    { icon: MessageSquare, label: 'Announcements', path: '/coach/announcements/new' },
    { icon: BarChart3, label: 'Reports', path: '/coach/reports' },
    { icon: Settings, label: 'Settings', path: '/coach/settings' },
  ];

  const memberNavItems = [
    { icon: Home, label: 'Dashboard', path: '/member/dashboard' },
    { icon: User, label: 'Profile', path: '/member/profile' },
    { icon: CheckSquare, label: 'Daily Check-in', path: '/member/checkin/daily' },
    { icon: MessageSquare, label: 'Updates', path: '/member/announcements' },
  ];

  const navItems = isCoach ? coachNavItems : memberNavItems;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-full flex-col">
                  <div className="border-b p-4">
                    <h2 className="text-lg font-semibold text-primary">Coach Winnie</h2>
                    <p className="text-sm text-muted-foreground">Kayapalat24</p>
                  </div>
                  <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate({ to: item.path })}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold text-primary">Coach Winnie</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(userProfile?.role)}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate({ to: item.path })}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="ml-64 flex-1 p-6">{children}</main>
      </div>

      {/* Mobile Content */}
      <main className="md:hidden p-4">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:ml-64">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Coach Winnie. Built with <Heart className="inline h-3 w-3 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

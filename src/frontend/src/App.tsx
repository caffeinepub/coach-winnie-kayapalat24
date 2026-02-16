import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCurrentUser } from './hooks/useCurrentUser';
import LoginPage from './auth/LoginPage';
import CoachDashboardPage from './dashboards/CoachDashboardPage';
import MemberDashboardPage from './dashboards/MemberDashboardPage';
import MemberListPage from './members/MemberListPage';
import MemberProfilePage from './members/MemberProfilePage';
import DailyCheckinPage from './checkins/DailyCheckinPage';
import WeeklyCheckinPage from './checkins/WeeklyCheckinPage';
import TaskListPage from './tasks/TaskListPage';
import AnnouncementComposerPage from './announcements/AnnouncementComposerPage';
import AnnouncementsFeedPage from './announcements/AnnouncementsFeedPage';
import ReminderQueuePage from './automations/ReminderQueuePage';
import CoachDigestPage from './automations/CoachDigestPage';
import ReportsExportPage from './reports/ReportsExportPage';
import SettingsPage from './settings/SettingsPage';
import AppLayout from './components/AppLayout';
import { Loader2 } from 'lucide-react';
import ProfileSetupModal from './auth/ProfileSetupModal';
import { isCoachStaffRole } from './utils/roles';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { userProfile, isLoading: profileLoading, isFetched } = useCurrentUser();

  if (isInitializing || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

function IndexComponent() {
  const { identity } = useInternetIdentity();
  const { userProfile, isLoading } = useCurrentUser();

  if (!identity) {
    return <LoginPage />;
  }

  if (isLoading || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Route based on role
  if (isCoachStaffRole(userProfile.role)) {
    return <CoachDashboardPage />;
  }

  return <MemberDashboardPage />;
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const coachDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/dashboard',
  component: CoachDashboardPage,
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/members',
  component: MemberListPage,
});

const memberProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/members/$memberId',
  component: MemberProfilePage,
});

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/tasks',
  component: TaskListPage,
});

const announcementComposerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/announcements/compose',
  component: AnnouncementComposerPage,
});

const reminderQueueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/automations/reminders',
  component: ReminderQueuePage,
});

const coachDigestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/automations/digest',
  component: CoachDigestPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/coach/reports',
  component: ReportsExportPage,
});

const memberDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/member/dashboard',
  component: MemberDashboardPage,
});

const memberProfilePageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/member/profile',
  component: MemberProfilePage,
});

const dailyCheckinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/member/checkin/daily',
  component: DailyCheckinPage,
});

const weeklyCheckinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/member/checkin/weekly',
  component: WeeklyCheckinPage,
});

const announcementsFeedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/member/announcements',
  component: AnnouncementsFeedPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  coachDashboardRoute,
  membersRoute,
  memberProfileRoute,
  tasksRoute,
  announcementComposerRoute,
  reminderQueueRoute,
  coachDigestRoute,
  reportsRoute,
  memberDashboardRoute,
  memberProfilePageRoute,
  dailyCheckinRoute,
  weeklyCheckinRoute,
  announcementsFeedRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  MemberProfile,
  DailyCheckin,
  WeeklyCheckin,
  FollowupTask,
  CoachNote,
  MessageLog,
  Announcement,
  UserProfile,
  TaskStatus,
} from '../backend';

// Members
export function useGetAllMembers() {
  const { actor, isFetching } = useActor();

  return useQuery<MemberProfile[]>({
    queryKey: ['members'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMemberProfile(memberId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<MemberProfile | null>({
    queryKey: ['member', memberId],
    queryFn: async () => {
      if (!actor || !memberId) return null;
      try {
        return await actor.getMemberProfile(memberId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!memberId,
  });
}

export function useCreateMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: MemberProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createMemberProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, profile }: { id: string; profile: MemberProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMemberProfile(id, profile);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member', variables.id] });
    },
  });
}

// Daily Check-ins
export function useGetAllDailyCheckins() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyCheckin[]>({
    queryKey: ['dailyCheckins'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDailyCheckins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitDailyCheckin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkin: DailyCheckin) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDailyCheckin(checkin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyCheckins'] });
    },
  });
}

// Weekly Check-ins
export function useGetAllWeeklyCheckins() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyCheckin[]>({
    queryKey: ['weeklyCheckins'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWeeklyCheckins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitWeeklyCheckin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkin: WeeklyCheckin) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitWeeklyCheckin(checkin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyCheckins'] });
    },
  });
}

// Follow-up Tasks
export function useGetAllFollowupTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<FollowupTask[]>({
    queryKey: ['followupTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFollowupTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFollowupTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: FollowupTask) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createFollowupTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followupTasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateTaskStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followupTasks'] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followupTasks'] });
    },
  });
}

// Coach Notes
export function useGetAllCoachNotes() {
  const { actor, isFetching } = useActor();

  return useQuery<CoachNote[]>({
    queryKey: ['coachNotes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCoachNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCoachNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: CoachNote) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addCoachNote(note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachNotes'] });
    },
  });
}

// Message Logs
export function useGetAllMessageLogs() {
  const { actor, isFetching } = useActor();

  return useQuery<MessageLog[]>({
    queryKey: ['messageLogs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessageLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: MessageLog) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logMessage(log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messageLogs'] });
    },
  });
}

// Announcements
export function useGetAllAnnouncements() {
  const { actor, isFetching } = useActor();

  return useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnnouncements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: Announcement) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createAnnouncement(announcement);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// User Profile
export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

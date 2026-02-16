import { useActor } from './useActor';
import { useQuery } from '@tanstack/react-query';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile } from '../backend';
import { isCoachStaffRole, isMemberRole } from '../utils/roles';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error: any) {
        // Handle authorization errors gracefully for first-time users
        if (error.message?.includes('Unauthorized') || error.message?.includes('Only users')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    userProfile: query.data,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
    isCoach: isCoachStaffRole(query.data?.role),
    isMember: isMemberRole(query.data?.role),
  };
}

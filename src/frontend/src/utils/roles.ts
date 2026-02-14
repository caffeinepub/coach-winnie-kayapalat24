import { UserRole } from '../backend';

/**
 * Check if a role is a coach staff role (coach or assistantCoach)
 */
export function isCoachStaffRole(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === UserRole.coach || role === UserRole.assistantCoach;
}

/**
 * Check if a role is a member role
 */
export function isMemberRole(role: UserRole | undefined): boolean {
  if (!role) return false;
  return role === UserRole.member;
}

/**
 * Get a human-readable label for a role
 */
export function getRoleLabel(role: UserRole | undefined): string {
  if (!role) return 'Member';
  
  switch (role) {
    case UserRole.coach:
      return 'Coach';
    case UserRole.assistantCoach:
      return 'Assistant Coach';
    case UserRole.member:
      return 'Member';
    default:
      return 'Member';
  }
}

import { UserDto } from '@/types/api';

export const SUPER_ADMIN_ROLES = ['ADMIN', 'YK', 'DK'];

// Role -> Event Type Name mapping
// Note: These keys must match the roles defined in backend/config
// The values must match the Event Type Names in the database
export const LEADER_ROLE_EVENT_TYPE_MAPPING: Record<string, string> = {
  GECEKODU: 'Gecekodu',
  GECEKODU_LEADER: 'Gecekodu',
  AGC: 'AGC',
  AGC_LEADER: 'AGC',
  BIZBIZE: 'Bizbize',
  BIZBIZE_LEADER: 'Bizbize',
  // Add other mappings as needed
};

export function hasRole(user: UserDto | null, roles: string | string[]): boolean {
  if (!user || !user.roles) return false;
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  return user.roles.some((userRole) => rolesToCheck.includes(userRole));
}

export function isSuperAdmin(user: UserDto | null): boolean {
  return hasRole(user, SUPER_ADMIN_ROLES);
}

export function getLeaderEventType(user: UserDto | null): string | null {
  return null;
}

export function canAccessPage(user: UserDto | null, path: string): boolean {
  if (!user) return false;
  return true;
}

export function canManageModule(
  user: UserDto | null,
  module:
    | 'users'
    | 'events'
    | 'event-types'
    | 'competitors'
    | 'seasons'
    | 'sessions'
    | 'announcements'
    | 'images',
): boolean {
  if (!user) return false;
  return true;
}

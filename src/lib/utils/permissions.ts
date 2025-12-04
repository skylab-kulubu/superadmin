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
  if (!user || !user.roles) return null;

  // Check if user has any leader role
  for (const role of user.roles) {
    if (LEADER_ROLE_EVENT_TYPE_MAPPING[role]) {
      return LEADER_ROLE_EVENT_TYPE_MAPPING[role];
    }
  }
  return null;
}

export function canAccessPage(user: UserDto | null, path: string): boolean {
  if (!user) return false;

  // Super admins can access everything
  if (isSuperAdmin(user)) return true;

  // Basic USER role restrictions
  const isBasicUser = user.roles.length === 1 && user.roles[0] === 'USER';
  if (isBasicUser) {
    // Basic users can only access waiting room
    return path === '/waiting-room';
  }

  // Define access rules for other roles
  // Leaders can access specific modules
  const hasLeaderRole = Object.keys(LEADER_ROLE_EVENT_TYPE_MAPPING).some((r) =>
    user.roles.includes(r),
  );

  if (hasLeaderRole) {
    // Leaders can access:
    // - Dashboard (view only, limited content)
    // - Events (create/edit own type)
    // - Competitors (create/edit own type)
    // - Sessions (create/edit own type)
    // - QR
    // - Waiting Room
    const allowedPaths = [
      '/dashboard',
      '/events',
      '/competitors',
      '/sessions',
      '/qr',
      '/waiting-room',
    ];

    return allowedPaths.some((allowed) => path === allowed || path.startsWith(allowed + '/'));
  }

  return false;
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
  if (isSuperAdmin(user)) return true;

  // Specific logic for leaders
  const leaderEventType = getLeaderEventType(user);
  if (leaderEventType) {
    if (module === 'events' || module === 'competitors' || module === 'sessions') {
      return true; // They can manage, but with restrictions (handled in components)
    }
  }

  return false;
}

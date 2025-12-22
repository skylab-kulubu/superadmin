import { UserDto } from '@/types/api';

// Süper admin rolleri - tam yetki
export const SUPER_ADMIN_ROLES = ['ADMIN', 'YK', 'DK'];

// Etkinlik tipi rolleri - kendi tiplerini yönetebilir
export const EVENT_TYPE_ROLES = ['GECEKODU', 'AGC', 'BIZBIZE'];
export const LEADER_ROLES = ['GECEKODU_LEADER', 'AGC_LEADER', 'BIZBIZE_LEADER'];

// Role -> Event Type Name mapping
export const ROLE_TO_EVENT_TYPE: Record<string, string> = {
  GECEKODU: 'Gecekodu',
  GECEKODU_LEADER: 'Gecekodu',
  AGC: 'AGC',
  AGC_LEADER: 'AGC',
  BIZBIZE: 'Bizbize',
  BIZBIZE_LEADER: 'Bizbize',
};

// Sayfa erişim tanımları - hangi roller hangi sayfalara erişebilir
// null = herkes (giriş yapmış), empty array = kimse
const PAGE_ACCESS: Record<string, string[] | null> = {
  '/dashboard': null, // Herkes (USER hariç, onlar waiting-room'a yönlendiriliyor)
  '/users': ['ADMIN', 'YK', 'DK'],
  '/events': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/event-types': ['ADMIN', 'YK', 'DK'],
  '/competitors': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/seasons': ['ADMIN', 'YK', 'DK'],
  '/sessions': [
    'ADMIN',
    'YK',
    'DK',
    'GECEKODU',
    'AGC',
    'BIZBIZE',
    'GECEKODU_LEADER',
    'AGC_LEADER',
    'BIZBIZE_LEADER',
  ],
  '/announcements': ['ADMIN', 'YK', 'DK'],
  '/images': ['ADMIN', 'YK', 'DK'],
  '/qr': null, // Herkes
  '/waiting-room': null, // Herkes
};

/**
 * Kullanıcının belirtilen rollerden birine sahip olup olmadığını kontrol eder
 */
export function hasRole(user: UserDto | null, roles: string | string[]): boolean {
  if (!user?.roles?.length) return false;
  const rolesToCheck = Array.isArray(roles) ? roles : [roles];
  return user.roles.some((userRole) => rolesToCheck.includes(userRole));
}

/**
 * Kullanıcının süper admin olup olmadığını kontrol eder (ADMIN, YK, DK)
 */
export function isSuperAdmin(user: UserDto | null): boolean {
  return hasRole(user, SUPER_ADMIN_ROLES);
}

/**
 * Kullanıcının etkinlik tipi rolüne göre yönetebileceği EventType adını döndürür
 * Süper adminler için null döner (hepsini yönetebilir)
 * Etkinlik tipi rolü yoksa null döner
 */
export function getLeaderEventType(user: UserDto | null): string | null {
  if (!user?.roles?.length) return null;

  // Süper adminler tüm etkinlik tiplerini yönetebilir
  if (isSuperAdmin(user)) return null;

  // Kullanıcının etkinlik tipi rolünü bul
  for (const role of user.roles) {
    if (ROLE_TO_EVENT_TYPE[role]) {
      return ROLE_TO_EVENT_TYPE[role];
    }
  }

  return null;
}

/**
 * Kullanıcının belirli bir sayfaya erişip erişemeyeceğini kontrol eder
 * Optimize: Sadece basit role array kontrolü yapar
 */
export function canAccessPage(user: UserDto | null, path: string): boolean {
  if (!user?.roles?.length) return false;

  // Sadece USER rolü varsa sadece waiting-room'a erişebilir
  if (user.roles.length === 1 && user.roles[0] === 'USER') {
    return path === '/waiting-room';
  }

  // Path'in base kısmını al (/events/123/edit -> /events)
  const basePath = '/' + (path.split('/')[1] || '');

  const allowedRoles = PAGE_ACCESS[basePath];

  // null = herkes erişebilir
  if (allowedRoles === null) return true;

  // undefined = tanımlanmamış sayfa, varsayılan olarak erişime izin ver
  if (allowedRoles === undefined) return true;

  // Rol kontrolü
  return user.roles.some((role) => allowedRoles.includes(role));
}

/**
 * Kullanıcının belirli bir modülü yönetip yönetemeyeceğini kontrol eder
 */
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
  return canAccessPage(user, `/${module}`);
}

/**
 * Kullanıcının belirli bir etkinlik tipini yönetip yönetemeyeceğini kontrol eder
 * Optimize: Minimum hesaplama ile sonuç döndürür
 */
export function canManageEventType(
  user: UserDto | null,
  eventTypeName: string | undefined,
): boolean {
  if (!user?.roles?.length) return false;

  // Süper adminler her şeyi yönetebilir
  if (isSuperAdmin(user)) return true;

  // Etkinlik tipi belirtilmemişse erişime izin ver (liste sayfaları için)
  if (!eventTypeName) return true;

  // Kullanıcının rolüne göre etkinlik tipi kontrolü
  const userEventType = getLeaderEventType(user);

  // Etkinlik tipi rolü yoksa erişim yok
  if (!userEventType) return false;

  // Kendi tipini mi yönetmeye çalışıyor?
  return userEventType.toLowerCase() === eventTypeName.toLowerCase();
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  HiOutlineCalendar,
  HiOutlineCalendarDays,
  HiOutlineChartBar,
  HiOutlineMegaphone,
  HiOutlineMicrophone,
  HiOutlinePhoto,
  HiOutlineQrCode,
  HiOutlineTag,
  HiOutlineTrophy,
  HiOutlineUser,
  HiOutlineUsers,
} from 'react-icons/hi2';
import type { UserDto } from '@/types/api';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/users', label: 'Kullanıcılar', icon: HiOutlineUsers },
  { href: '/events', label: 'Etkinlikler', icon: HiOutlineCalendar },
  { href: '/event-types', label: 'Etkinlik Tipleri', icon: HiOutlineTag },
  { href: '/competitors', label: 'Yarışmacılar', icon: HiOutlineUser },
  { href: '/seasons', label: 'Sezonlar', icon: HiOutlineCalendarDays },
  { href: '/sessions', label: 'Oturumlar', icon: HiOutlineMicrophone },
  { href: '/announcements', label: 'Duyurular', icon: HiOutlineMegaphone },
  { href: '/images', label: 'Resimler', icon: HiOutlinePhoto },
  { href: '/qr', label: 'QR Kodlar', icon: HiOutlineQrCode },
];

type SidebarProps = {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleNavigate = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const renderUserSection = (showDetails: boolean) => {
    if (loading) {
      return (
        <div className={`flex items-center gap-3 ${showDetails ? '' : 'justify-center'}`}>
          <div className="bg-dark-700 h-10 w-10 flex-shrink-0 animate-pulse rounded-full" />
          {showDetails && (
            <div className="min-w-0 flex-1">
              <div className="bg-dark-700 mb-1.5 h-4 animate-pulse rounded" />
              <div className="bg-dark-700 h-3 w-2/3 animate-pulse rounded" />
            </div>
          )}
        </div>
      );
    }

    if (!user) {
      return (
        <div className={`flex items-center gap-3 ${showDetails ? '' : 'justify-center'}`}>
          <div className="bg-dark-700 h-10 w-10 flex-shrink-0 rounded-full" />
          {showDetails && (
            <div className="min-w-0 flex-1">
              <p className="text-light/60 truncate text-xs">Kullanıcı bilgisi yüklenemedi</p>
            </div>
          )}
        </div>
      );
    }

    const initials = user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';

    return (
      <div className={`flex items-center gap-3 ${showDetails ? '' : 'justify-center'}`}>
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="bg-brand text-dark flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
            {initials}
          </div>
        )}
        {showDetails && (
          <div className="min-w-0 flex-1">
            <p className="text-light truncate text-sm font-medium">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username}
            </p>
            <p className="text-light/60 truncate text-xs">{user.email}</p>
          </div>
        )}
      </div>
    );
  };

  const renderMenu = (showLabels: boolean) => (
    <div className="flex h-full flex-col">
      <div
        className={`border-dark-700 flex items-center border-b p-4 ${
          showLabels ? 'justify-start' : 'justify-center'
        }`}
      >
        {showLabels ? (
          <img
            src="/logoyatay.png"
            alt="Skylab Admin"
            className="h-12 w-auto origin-left transition-all"
          />
        ) : (
          <img src="/logo.png" alt="Skylab Admin" className="h-12 w-12 object-contain" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            const linkClasses = [
              'flex items-center rounded-lg text-sm font-medium transition-colors',
              showLabels ? 'gap-3 px-4 py-2 justify-start' : 'justify-center py-2',
              isActive ? 'bg-brand text-light' : 'text-light hover:bg-dark-800 hover:text-brand',
            ].join(' ');

            return (
              <li key={item.href}>
                <Link href={item.href} className={linkClasses} onClick={handleNavigate}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {showLabels && <span className="whitespace-nowrap">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-dark-700 border-t p-3">{renderUserSection(showLabels)}</div>
    </div>
  );

  return (
    <>
      <aside
        className={`bg-dark text-light hidden h-full flex-col transition-[width] duration-300 ease-out lg:flex ${
          isDesktopExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsDesktopExpanded(true)}
        onMouseLeave={() => setIsDesktopExpanded(false)}
      >
        {renderMenu(isDesktopExpanded)}
      </aside>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="bg-dark/60 absolute inset-0" onClick={onMobileClose} role="presentation" />
      </div>

      <aside
        className={`bg-dark text-light fixed inset-y-0 left-0 z-50 flex h-full w-64 transform flex-col shadow-lg transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderMenu(true)}
      </aside>
    </>
  );
}

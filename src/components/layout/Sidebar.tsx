'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getOAuth2LogoutUrl } from '@/lib/auth/oauth2';
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineTrophy,
  HiOutlineCalendar,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineCalendarDays,
  HiOutlineMicrophone,
  HiOutlineMegaphone,
  HiOutlinePhoto,
  HiOutlineQrCode
} from 'react-icons/hi2';
import { HiOutlineLogout } from 'react-icons/hi';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBar },
  { href: '/users', label: 'Kullanıcılar', icon: HiOutlineUsers },
  { href: '/competitions', label: 'Yarışmalar', icon: HiOutlineTrophy },
  { href: '/events', label: 'Etkinlikler', icon: HiOutlineCalendar },
  { href: '/event-types', label: 'Etkinlik Tipleri', icon: HiOutlineTag },
  { href: '/competitors', label: 'Yarışmacılar', icon: HiOutlineUser },
  { href: '/seasons', label: 'Sezonlar', icon: HiOutlineCalendarDays },
  { href: '/sessions', label: 'Oturumlar', icon: HiOutlineMicrophone },
  { href: '/announcements', label: 'Duyurular', icon: HiOutlineMegaphone },
  { href: '/images', label: 'Resimler', icon: HiOutlinePhoto },
  { href: '/qr', label: 'QR Kodlar', icon: HiOutlineQrCode },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // LocalStorage'ı önce temizle
      localStorage.removeItem('auth_token');
      
      // Logout endpoint'ini çağır
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error('Logout response not ok:', response.status);
      }
      
      // Cookie'lerin silinmesi için bekleme
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // OAuth sağlayıcısından da çıkış yapmak için logout URL'ine git
      // Post-logout redirect URI olarak login sayfasını kullan
      const postLogoutRedirectUri = `${window.location.origin}/login?logout=${Date.now()}`;
      const logoutUrl = getOAuth2LogoutUrl(postLogoutRedirectUri);
      
      // OAuth logout URL'ine git
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile login'e yönlendir
      localStorage.removeItem('auth_token');
      window.location.replace(`/login?logout=${Date.now()}`);
    }
  };

  return (
    <div className="h-screen w-64 bg-lacivert text-pembe flex flex-col">
      <div className="p-6 border-b border-lacivert-700">
        <h1 className="text-xl font-bold text-yesil">Skylab Admin</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-pembe-300 text-yesil'
                      : 'text-pembe hover:text-yesil'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-lacivert-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-pembe-400 hover:bg-pembe-500 text-red-600 hover:text-red-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <HiOutlineLogout className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const publicRoutes = ['/login', '/api/auth'];
  const pathname = request.nextUrl.pathname;
  
  // Public route'lar için izin ver
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Token yoksa login'e yönlendir
  if (!token) {
    // Ana sayfa (/) için direkt login'e yönlendir (dashboard'a redirect olmasın)
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Diğer sayfalar için login'e yönlendir
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Token geçerliliği client-side'da kontrol edilecek
  // Middleware'de her istekte backend'e istek göndermek performans sorunu yaratabilir
  // Bu yüzden token varlığını kontrol edip, geçerlilik kontrolünü client-side'a bırakıyoruz
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};


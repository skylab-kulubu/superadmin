import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  // Cookie'yi kontrol et
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  // Token yoksa login'e yönlendir (middleware zaten yapıyor ama ekstra güvenlik için)
  if (!token) {
    redirect('/login');
  }
  
  // Token varsa dashboard'a yönlendir
  redirect('/dashboard');
}

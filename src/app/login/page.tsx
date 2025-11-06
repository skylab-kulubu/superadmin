'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getOAuth2AuthUrl } from '@/lib/auth/oauth2';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const details = searchParams.get('details');
  const logout = searchParams.get('logout');
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Eğer hata varsa veya logout parametresi varsa OAuth'a yönlendirme
    if (error || logout) {
      return;
    }

    // Sadece bir kez yönlendir
    if (!hasRedirected) {
      setHasRedirected(true);
      window.location.href = getOAuth2AuthUrl();
    }
  }, [error, logout, hasRedirected]);

  // Hata durumunda kullanıcıya göster
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-lacivert border border-pembe-200 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-yesil">Giriş Hatası</h1>
          <p className="text-pembe mb-4">
            {error === 'token_exchange_failed' 
              ? 'Token değişimi başarısız oldu. Lütfen tekrar deneyin.'
              : error === 'no_code'
              ? 'Authorization kodu alınamadı. Lütfen tekrar deneyin.'
              : `Hata: ${error}`
            }
          </p>
          {details && (
            <div className="mb-4 p-3 bg-lacivert rounded text-sm text-left text-pembe opacity-80 break-all border border-pembe-200">
              <strong>Detay:</strong> {details}
            </div>
          )}
          <button
            onClick={() => {
              setHasRedirected(false);
              window.location.href = getOAuth2AuthUrl();
            }}
            className="px-4 py-2 bg-pembe text-lacivert rounded hover:bg-pembe-300 font-medium"
          >
            Tekrar Dene
          </button>
          <div className="mt-4">
            <button
              onClick={() => {
                router.push('/login');
              }}
              className="px-4 py-2 bg-pembe-300 text-lacivert rounded hover:bg-pembe-400 text-sm"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logout durumunda kullanıcıya göster
  if (logout) {
    const handleLogin = async () => {
      try {
        // LocalStorage'ı temizle
        localStorage.removeItem('auth_token');
        
        // Cookie'leri kesinlikle temizlemek için logout endpoint'ini tekrar çağır
        const logoutResponse = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {
          // Hata olsa bile devam et
        });
        
        console.log('Logout response:', logoutResponse?.status);
        
        // Cookie'lerin temizlenmesi için bekleme
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // OAuth URL'ini al
        const oauthUrl = getOAuth2AuthUrl();
        console.log('Redirecting to OAuth URL:', oauthUrl);
        
        // External URL'e git - bu middleware'i bypass eder
        // window.location.href kullan (external URL olduğu için middleware intercept edemez)
        window.location.href = oauthUrl;
      } catch (error) {
        console.error('Login redirect error:', error);
        // Hata olsa bile OAuth'a git
        const oauthUrl = getOAuth2AuthUrl();
        console.log('Fallback redirect to OAuth URL:', oauthUrl);
        window.location.href = oauthUrl;
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-lacivert border border-pembe-200 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-yesil">Başarıyla Çıkış Yaptınız</h1>
          <p className="text-pembe mb-4">
            Güvenli bir şekilde çıkış yaptınız. Tekrar giriş yapmak için lütfen aşağıdaki butona tıklayın.
          </p>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-pembe text-lacivert rounded hover:bg-pembe-300 font-medium"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-yesil">Yönlendiriliyor...</h1>
        <p className="text-pembe opacity-60">Giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-yesil">Yükleniyor...</h1>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


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
      <div className="bg-light flex min-h-screen items-center justify-center">
        <div className="bg-light border-dark-200 max-w-md rounded-lg border p-6 text-center">
          <h1 className="text-brand mb-4 text-2xl font-bold">Giriş Hatası</h1>
          <p className="text-dark mb-4">
            {error === 'token_exchange_failed'
              ? 'Token değişimi başarısız oldu. Lütfen tekrar deneyin.'
              : error === 'no_code'
                ? 'Authorization kodu alınamadı. Lütfen tekrar deneyin.'
                : error === 'config_missing'
                  ? 'OAuth2 konfigürasyonu eksik (Client ID). Lütfen yönetici ile iletişime geçin.'
                  : `Hata: ${error}`}
          </p>
          {details && (
            <div className="bg-light text-dark border-dark-200 mb-4 rounded border p-3 text-left text-sm break-all opacity-80">
              <strong>Detay:</strong> {details}
            </div>
          )}
          <button
            onClick={() => {
              setHasRedirected(false);
              window.location.href = getOAuth2AuthUrl();
            }}
            className="bg-brand text-light hover:bg-brand-600 rounded px-4 py-2 font-medium"
          >
            Tekrar Dene
          </button>
          <div className="mt-4">
            <button
              onClick={() => {
                router.push('/login');
              }}
              className="bg-dark-200 text-light hover:bg-dark-300 rounded px-4 py-2 text-sm"
            >
              Sayfayı Yenile
            </button>
          </div>
          <div className="border-dark-200 mt-6 border-t pt-4">
            <details className="text-left">
              <summary className="text-dark cursor-pointer text-xs opacity-50 hover:opacity-100">
                Debug Bilgisi
              </summary>
              <div className="bg-dark-100 text-dark mt-2 rounded p-2 font-mono text-xs break-all">
                <p>
                  <strong>Auth URL:</strong> {getOAuth2AuthUrl()}
                </p>
              </div>
            </details>
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
        await new Promise((resolve) => setTimeout(resolve, 300));

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
      <div className="bg-light flex min-h-screen items-center justify-center">
        <div className="bg-light border-dark-200 max-w-md rounded-lg border p-6 text-center">
          <h1 className="text-brand mb-4 text-2xl font-bold">Başarıyla Çıkış Yaptınız</h1>
          <p className="text-dark mb-4">
            Güvenli bir şekilde çıkış yaptınız. Tekrar giriş yapmak için lütfen aşağıdaki butona
            tıklayın.
          </p>
          <button
            onClick={handleLogin}
            className="bg-brand text-light hover:bg-brand-600 rounded px-4 py-2 font-medium"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-brand mb-4 text-2xl font-bold">Yönlendiriliyor...</h1>
        <p className="text-dark opacity-60">Giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-light flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-brand mb-4 text-2xl font-bold">Yükleniyor...</h1>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

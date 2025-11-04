'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getOAuth2AuthUrl } from '@/lib/auth/oauth2';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const details = searchParams.get('details');
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Eğer hata varsa OAuth'a yönlendirme
    if (error) {
      return;
    }

    // Sadece bir kez yönlendir
    if (!hasRedirected) {
      setHasRedirected(true);
      window.location.href = getOAuth2AuthUrl();
    }
  }, [error, hasRedirected]);

  // Hata durumunda kullanıcıya göster
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-red-800">Giriş Hatası</h1>
          <p className="text-gray-700 mb-4">
            {error === 'token_exchange_failed' 
              ? 'Token değişimi başarısız oldu. Lütfen tekrar deneyin.'
              : error === 'no_code'
              ? 'Authorization kodu alınamadı. Lütfen tekrar deneyin.'
              : `Hata: ${error}`
            }
          </p>
          {details && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-left text-gray-600 break-all">
              <strong>Detay:</strong> {details}
            </div>
          )}
          <button
            onClick={() => {
              setHasRedirected(false);
              window.location.href = getOAuth2AuthUrl();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
          <div className="mt-4">
            <button
              onClick={() => {
                router.push('/login');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Yönlendiriliyor...</h1>
        <p className="text-gray-600">Giriş sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Yükleniyor...</h1>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}


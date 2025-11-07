'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { eventsApi } from '@/lib/api/events';
import { imagesApi } from '@/lib/api/images';
import Link from 'next/link';

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; name?: string; id?: string }[]>([]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await eventsApi.getAll({ includeImages: true });
      const list = (res.data || []).flatMap((ev) => {
        const fromCover = ev.coverImageUrl ? [{ url: ev.coverImageUrl, name: `${ev.name} - kapak` }] : [];
        const fromImages = (ev.imageUrls || []).map((u) => ({ url: u, name: ev.name }));
        return [...fromCover, ...fromImages];
      });
      // LocalStorage'dan yüklenen görselleri ekle
      let uploaded: { url: string; name?: string; id?: string }[] = [];
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('uploaded_images') : null;
        if (raw) {
          const parsed: { id: string; fileUrl: string; fileName: string }[] = JSON.parse(raw);
          uploaded = parsed.map((p) => ({ url: p.fileUrl, name: p.fileName, id: p.id }));
        }
      } catch {}
      const combined = [...uploaded, ...list];
      // URL'e göre tekrarlı olanları kaldır
      const seen = new Set<string>();
      const unique = combined.filter((it) => {
        if (seen.has(it.url)) return false;
        seen.add(it.url);
        return true;
      });
      setImages(unique);
    } catch (e: any) {
      setError(e?.message || 'Görseller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string, url?: string) => {
    if (!id) return; // yalnızca bizim yüklediklerimizi silebiliriz
    const ok = window.confirm('Bu resmi silmek istediğinize emin misiniz?');
    if (!ok) return;
    try {
      await imagesApi.delete(id);
      try {
        const raw = localStorage.getItem('uploaded_images');
        if (raw) {
          const parsed: { id: string; fileUrl: string; fileName: string }[] = JSON.parse(raw);
          const next = parsed.filter((p) => p.id !== id && p.fileUrl !== url);
          localStorage.setItem('uploaded_images', JSON.stringify(next));
        }
      } catch {}
      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (e) {
      alert('Silme işlemi başarısız');
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Resimler"
          description="Yüklenen tüm görselleri görüntüleyin ve yönetin"
          actions={(
            <Link href="/images/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Resim
                </span>
              </Button>
            </Link>
          )}
        />

        {error && (
          <div className="bg-light border border-dark-200 rounded-lg p-4 mb-6 text-dark">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-dark opacity-60">Yükleniyor...</div>
        ) : images.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center text-dark opacity-60">
            Henüz resim bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.url} className="border border-dark-200 rounded-lg overflow-hidden bg-light">
                <div className="aspect-[4/3] bg-dark-200">
                  <img
                    src={img.url}
                    alt={img.name || 'image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 border-t border-dark-200">
                  <div className="text-sm text-dark truncate" title={img.name || ''}>{img.name || 'Görsel'}</div>
                  <div className="mt-3 flex justify-between items-center">
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-dark hover:text-brand text-sm"
                    >
                      Görüntüle
                    </a>
                    {img.id ? (
                      <button
                        onClick={() => handleDelete(img.id, img.url)}
                        className="text-dark hover:text-brand text-sm"
                      >
                        Sil
                      </button>
                    ) : (
                      <span className="text-dark opacity-60 text-sm">Etkinlik</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}






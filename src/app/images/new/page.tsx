'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { FileUpload } from '@/components/forms/FileUpload';
import { Form } from '@/components/forms/Form';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { imagesApi } from '@/lib/api/images';
import type { UploadImageResponseDto } from '@/types/api';

const uploadSchema = z.object({
  image: z.instanceof(File),
});

export default function NewImagePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: z.infer<typeof uploadSchema>) => {
    setUploading(true);
    setError(null);
    try {
      const res = await imagesApi.upload(data.image);
      const uploaded = res.data as UploadImageResponseDto;
      try {
        const key = 'uploaded_images';
        const existingRaw = localStorage.getItem(key);
        const existing: UploadImageResponseDto[] = existingRaw ? JSON.parse(existingRaw) : [];
        const next = [uploaded, ...existing.filter((x) => x.fileUrl !== uploaded.fileUrl)];
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      router.push('/images');
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Resim yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Yeni Resim</h1>
        </div>

        {error && (
          <div className="bg-lacivert border border-pembe-200 rounded-lg p-4 mb-6 text-pembe">
            {error}
          </div>
        )}

        <div className="bg-lacivert border border-pembe-200 rounded-lg p-6">
          <Form schema={uploadSchema} onSubmit={handleSubmit}>
            {() => (
              <>
                <FileUpload name="image" label="Resim" accept="image/*" required />
                <div className="mt-6 flex items-center gap-3">
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => router.back()}>
                    İptal
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </AppShell>
  );
}



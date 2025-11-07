'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <div className="space-y-6">
        <PageHeader
          title="Yeni Resim"
          description="Sisteme yeni resim yükleyin"
        />

        <div className="max-w-3xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
          <Form schema={uploadSchema} onSubmit={handleSubmit}>
            {() => (
              <>
                <div className="space-y-5">
                  <div>
                <FileUpload name="image" label="Resim" accept="image/*" required />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                  <Button type="button" variant="secondary" onClick={() => router.back()} className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                    İptal
                  </Button>
                  <Button type="submit" disabled={uploading} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
        </div>
      </div>
    </AppShell>
  );
}



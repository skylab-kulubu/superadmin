'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="space-y-6">
      <PageHeader title="Yeni Resim" description="Sisteme yeni resim yükleyin" />

      <div className="mx-auto max-w-3xl space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
        )}

        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form schema={uploadSchema} onSubmit={handleSubmit}>
            {() => (
              <>
                <div className="space-y-5">
                  <div>
                    <FileUpload name="image" label="Resim" accept="image/*" required />
                  </div>
                </div>
                <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
                  >
                    {uploading ? 'Yükleniyor...' : 'Yükle'}
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

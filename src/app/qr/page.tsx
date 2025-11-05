'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { qrCodesApi } from '@/lib/api/qr-codes';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/forms/TextField';
import { Form } from '@/components/forms/Form';
import { z } from 'zod';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const qrSchema = z.object({
  url: z.string().url('Geçerli bir URL girin'),
  width: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(100).max(1000)),
  height: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(100).max(1000)),
});

export default function QRPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: z.infer<typeof qrSchema>) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await qrCodesApi.generateQRCode(data.url, data.width, data.height);
      const url = URL.createObjectURL(blob);
      setQrCode(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'QR oluşturma sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <ErrorBoundary>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">QR Kod Oluştur</h1>
        <Form
          schema={qrSchema}
          onSubmit={handleGenerate}
          defaultValues={{ url: 'https://example.com', width: 300, height: 300 }}
        >
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="url" label="URL" type="url" required />
                <TextField name="width" label="Genişlik" type="number" required />
                <TextField name="height" label="Yükseklik" type="number" required />
              </div>
              <div className="mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
                </Button>
              </div>
            </>
          )}
        </Form>
        {error && (
          <div className="mt-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        
        {qrCode && (
          <div className="mt-6">
            <img
              src={qrCode}
              alt="QR Code"
              className="border rounded-lg"
              onError={() => setError('QR görseli yüklenemedi')}
            />
            <div className="mt-4">
              <a href={qrCode} download="qrcode.png">
                <Button variant="secondary">İndir</Button>
              </a>
            </div>
          </div>
        )}
      </div>
      </ErrorBoundary>
    </AppShell>
  );
}



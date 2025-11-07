'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { qrCodesApi } from '@/lib/api/qr-codes';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/forms/TextField';
import { Form } from '@/components/forms/Form';
import { Toggle } from '@/components/forms/Toggle';
import { z } from 'zod';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const qrSchema = z.object({
  url: z.string().min(1, 'URL gereklidir').url('Geçerli bir URL girin'),
  withLogo: z.boolean().default(true),
});

type QRFormData = z.infer<typeof qrSchema>;

export default function QRPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (data: QRFormData) => {
    setLoading(true);
    setError(null);
    try {
      const width = 300;
      const height = 300;
      
      const blob = data.withLogo 
        ? await qrCodesApi.generateQRCodeWithLogo(data.url, width, height, 50)
        : await qrCodesApi.generateQRCode(data.url, width, height);
      const url = URL.createObjectURL(blob);
      setQrCode(url);
      
      // Otomatik indirme
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'QR oluşturma sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <ErrorBoundary>
      <div className="space-y-6">
        <PageHeader
          title="QR Kodlar"
          description="Bağlantılarınız için hızlıca QR kod oluşturun"
        />
        <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form
          schema={qrSchema}
          onSubmit={handleGenerate}
          defaultValues={{ url: '', withLogo: true }}
        >
          {(methods) => {
            const formErrors = methods.formState.errors;
            
            return (
              <>
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-2">Form hataları:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {Object.entries(formErrors).map(([key, error]) => (
                        <li key={key}>
                          {key}: {error?.message as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="space-y-4">
                  <TextField name="url" label="URL" type="url" required placeholder="https://example.com" />
                  <Toggle name="withLogo" label="Logo" />
                </div>
                <div className="mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
        </div>
        {error && (
          <div className="p-3 rounded-md border border-red-300 bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        
        {qrCode && (
          <div>
            <img
              src={qrCode}
              alt="QR Code"
              className="border rounded-lg mx-auto"
              onError={() => setError('QR görseli yüklenemedi')}
            />
          </div>
        )}
        </div>
      </div>
      </ErrorBoundary>
    </AppShell>
  );
}



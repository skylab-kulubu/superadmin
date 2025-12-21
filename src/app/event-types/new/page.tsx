'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';
import { ALLOWED_ROLES } from '@/config/roles';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  authorizedRoles: z.array(z.string()).optional(),
});

const DEFAULT_AUTHORIZED_ROLES = ['ADMIN', 'YK', 'DK'];

export default function NewEventTypePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        const selectedRoles = data.authorizedRoles || [];
        // ADMIN, YK, DK rollerini otomatik ekle
        const finalRoles = Array.from(new Set([...DEFAULT_AUTHORIZED_ROLES, ...selectedRoles]));

        await eventTypesApi.create({
          name: data.name,
          authorizedRoles: finalRoles,
        });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type creation error:', error);
        alert(
          'Etkinlik tipi oluşturulurken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  // Listelenecek roller (Varsayılan roller hariç)
  const displayableRoles = ALLOWED_ROLES.filter((role) => !DEFAULT_AUTHORIZED_ROLES.includes(role));

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Etkinlik Tipi" description="Sisteme yeni etkinlik tipi ekleyin" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={eventTypeSchema}
            onSubmit={handleSubmit}
            defaultValues={{ name: '', authorizedRoles: [] }}
          >
            {(methods) => {
              const formErrors = methods.formState.errors;
              return (
                <>
                  {Object.keys(formErrors).length > 0 && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-medium text-red-800">Form hataları:</p>
                      <ul className="list-inside list-disc text-sm text-red-600">
                        {Object.entries(formErrors).map(([key, error]) => (
                          <li key={key}>
                            {key}: {error?.message as string}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="space-y-5">
                    <div>
                      <TextField
                        name="name"
                        label="Ad"
                        required
                        placeholder="Workshop, Seminer, vb."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-dark-900 text-sm font-medium">
                        Ekstra Yetkili Roller (Opsiyonel)
                      </label>
                      <p className="text-dark-500 mb-2 text-xs">
                        * ADMIN, YK ve DK rolleri otomatik olarak yetkilidir.
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {displayableRoles.map((role) => (
                          <label
                            key={role}
                            className="flex cursor-pointer items-center gap-2 rounded border border-transparent p-2 transition-colors hover:border-gray-200 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              value={role}
                              {...methods.register('authorizedRoles')}
                              className="text-brand focus:ring-brand h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-dark-700 text-sm">{role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/event-types"
                      variant="secondary"
                      className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
                    >
                      {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </div>
                </>
              );
            }}
          </Form>
        </div>
      </div>
    </div>
  );
}

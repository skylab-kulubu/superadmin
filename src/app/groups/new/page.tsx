'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { groupsApi } from '@/lib/api/groups';

const groupSchema = z.object({
  groupName: z.string().min(2, 'Grup adı en az 2 karakter olmalı'),
});

export default function NewGroupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (data: z.infer<typeof groupSchema>) => {
    startTransition(async () => {
      try {
        await groupsApi.create({ groupName: data.groupName });
        alert('Grup başarıyla oluşturuldu');
        router.refresh();
        // No list page to redirect to, so maybe just stay here or go back to home?
        // router.push('/');
      } catch (error) {
        console.error('Group creation error:', error);
        alert(
          'Grup oluşturulurken hata: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Grup" description="Yeni bir grup oluşturun" />

      <div className="mx-auto max-w-xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form schema={groupSchema} onSubmit={handleSubmit}>
            {() => (
              <div className="space-y-4">
                <TextField
                  name="groupName"
                  label="Grup Adı"
                  required
                  placeholder="Geliştirme Ekibi"
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Oluşturuluyor...' : 'Oluştur'}
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { z } from 'zod';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventTypeDto, UserDto } from '@/types/api';
import { ALLOWED_ROLES } from '@/config/roles';

import { Modal } from '@/components/ui/Modal';
import { HiOutlineTrash } from 'react-icons/hi2';

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  // competitive removed as it depends on backend support, absent in UpdateEventTypeRequest
  authorizedRoles: z.array(z.string()).optional(),
});

const DEFAULT_AUTHORIZED_ROLES = ['ADMIN', 'YK', 'DK'];

function CoordinatorsList({ eventTypeName }: { eventTypeName: string }) {
  const [coordinators, setCoordinators] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventTypesApi
      .getCoordinators(eventTypeName)
      .then((res) => {
        if (res.success && res.data) {
          // data is UserDto[]
          setCoordinators(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [eventTypeName]);

  if (loading) return <div className="text-dark-500 text-sm">Yükleniyor...</div>;

  if (coordinators.length === 0) {
    return <div className="text-dark-500 text-sm italic">Atanmış koordinatör bulunmuyor.</div>;
  }

  return (
    <ul className="space-y-2">
      {coordinators.map((user) => (
        <li
          key={user.id}
          className="bg-light border-dark-100 flex items-center gap-3 rounded-md border p-3"
        >
          <div className="flex-1">
            <div className="text-dark-900 font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-dark-500 text-xs">{user.email}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function EditEventTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [eventType, setEventType] = useState<EventTypeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      eventTypesApi
        .getById(id)
        .then((response) => {
          if (response.success && response.data) {
            setEventType(response.data);
          } else {
            setError('Etkinlik tipi bulunamadı');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Event type fetch error:', err);
          setError('Etkinlik tipi yüklenirken hata oluştu');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof eventTypeSchema>) => {
    startTransition(async () => {
      try {
        const selectedRoles = data.authorizedRoles || [];
        const finalRoles = Array.from(new Set([...DEFAULT_AUTHORIZED_ROLES, ...selectedRoles]));

        await eventTypesApi.update(id, {
          name: data.name,
          authorizedRoles: finalRoles,
        });
        router.push('/event-types');
      } catch (error) {
        console.error('Event type update error:', error);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await eventTypesApi.delete(id);
      if (response.success) {
        router.push('/event-types');
      } else {
        console.error('Delete failed:', response);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Listelenecek roller (Varsayılan roller hariç)
  const displayableRoles = ALLOWED_ROLES.filter((role) => !DEFAULT_AUTHORIZED_ROLES.includes(role));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !eventType) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Etkinlik tipi bulunamadı'}</p>
          <Button href="/event-types" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Tipi Düzenle"
        description={eventType.name}
        actions={
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center !border-0 !bg-transparent !px-3 !py-3 hover:!bg-transparent"
            aria-label="Etkinlik tipini sil"
          >
            <HiOutlineTrash className="text-danger h-5 w-5" />
          </Button>
        }
      />

      {/* Coordinators Section */}
      <div className="mx-auto mb-8 max-w-2xl">
        <h3 className="text-dark-800 mb-4 text-lg font-semibold">Koordinatörler</h3>
        <CoordinatorsList eventTypeName={eventType.name} />
      </div>

      <div className="mx-auto max-w-2xl">
        <Form
          schema={eventTypeSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            name: eventType.name,
            authorizedRoles: eventType.authorizedRoles
              ? eventType.authorizedRoles.filter((r) => !DEFAULT_AUTHORIZED_ROLES.includes(r))
              : [],
          }}
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
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />

                  <div className="space-y-2 border-t border-gray-100 pt-4">
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
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                  <Button href="/event-types" variant="secondary">
                    İptal
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
      </div>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Etkinlik Tipini Sil"
      >
        <p>
          <strong>{eventType.name}</strong> etkinlik tipini silmek istediğinizden emin misiniz? Bu
          işlem geri alınamaz.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
        </div>
      </Modal>
    </div>
  );
}

'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventsApi } from '@/lib/api/events';
import type { SessionDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';

const sessionSchema = z.object({
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  speakerName: z.string().optional(),
  speakerLinkedin: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  orderIndex: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val ? parseInt(val) : undefined)),
  sessionType: z
    .enum([
      'WORKSHOP',
      'PRESENTATION',
      'PANEL',
      'KEYNOTE',
      'NETWORKING',
      'OTHER',
      'CTF',
      'HACKATHON',
      'JAM',
    ])
    .optional(),
});

export default function EditSessionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">
            Oturum düzenleme özelliği şu anda kullanılamıyor (API kaldırıldı).
          </p>
          <Button href="/sessions" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

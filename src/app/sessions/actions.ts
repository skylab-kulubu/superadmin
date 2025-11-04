'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListSessionDto,
  DataResultSessionDto,
  CreateSessionRequest,
} from '@/types/api';

export async function getSessions(params?: { includeEvent?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    
    const endpoint = qs ? `/api/sessions/?${qs}` : `/api/sessions/`;
    const response = await serverFetch<DataResultListSessionDto>(endpoint);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getSessions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Oturumlar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createSession(formData: FormData) {
  const data: CreateSessionRequest = {
    eventId: formData.get('eventId') as string,
    title: formData.get('title') as string,
    speakerName: formData.get('speakerName') as string || undefined,
    speakerLinkedin: formData.get('speakerLinkedin') as string || undefined,
    description: formData.get('description') as string || undefined,
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string || undefined,
    orderIndex: parseInt(formData.get('orderIndex') as string) || undefined,
    sessionType: formData.get('sessionType') as any,
  };

  try {
    await serverFetch<DataResultSessionDto>('/api/sessions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createSession error:', error);
    throw error;
  }
}

export async function deleteSession(id: string) {
  try {
    await serverFetch(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteSession error:', error);
    throw error;
  }
}

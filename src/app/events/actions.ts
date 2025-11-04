'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListEventDto,
  DataResultEventDto,
  CreateEventRequest,
} from '@/types/api';

export async function getEvents(params?: {
  includeEventType?: boolean;
  includeSession?: boolean;
  includeCompetitors?: boolean;
  includeImages?: boolean;
  includeSeason?: boolean;
  includeCompetition?: boolean;
}) {
  try {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    
    const response = await serverFetch<DataResultListEventDto>(
      `/api/events/${qs ? `?${qs}` : ''}`
    );
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getEvents error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Etkinlikler yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getEventById(id: string) {
  try {
    const response = await serverFetch<DataResultEventDto>(`/api/events/${id}`);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getEventById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Etkinlik yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createEvent(formData: FormData) {
  const coverImage = formData.get('coverImage') as File;
  const data: CreateEventRequest = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || undefined,
    location: formData.get('location') as string || undefined,
    eventTypeId: formData.get('eventTypeId') as string,
    formUrl: formData.get('formUrl') as string || undefined,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string || undefined,
    linkedin: formData.get('linkedin') as string || undefined,
    active: formData.get('active') === 'true' || undefined,
    competitionId: formData.get('competitionId') as string || undefined,
  };

  // TODO: Handle file upload with serverFetch
  try {
    // For now, skipping file upload - need to handle FormData properly
    await serverFetch<DataResultEventDto>('/api/events/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createEvent error:', error);
    throw error;
  }
}

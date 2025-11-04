'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListEventTypeDto,
  DataResultEventTypeDto,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
} from '@/types/api';

export async function getEventTypes() {
  try {
    const response = await serverFetch<DataResultListEventTypeDto>('/api/event-types/');
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getEventTypes error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Etkinlik tipleri yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getEventTypeById(id: string) {
  try {
    const response = await serverFetch<DataResultEventTypeDto>(`/api/event-types/${id}`);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getEventTypeById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Etkinlik tipi yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createEventType(formData: FormData) {
  const data: CreateEventTypeRequest = {
    name: formData.get('name') as string,
  };

  try {
    await serverFetch<DataResultEventTypeDto>('/api/event-types/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createEventType error:', error);
    throw error;
  }
}

export async function updateEventType(id: string, formData: FormData) {
  const data: UpdateEventTypeRequest = {
    name: formData.get('name') as string || undefined,
    competitive: formData.get('competitive') === 'true' || undefined,
  };

  try {
    await serverFetch<DataResultEventTypeDto>(`/api/event-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateEventType error:', error);
    throw error;
  }
}

export async function deleteEventType(id: string) {
  try {
    await serverFetch(`/api/event-types/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteEventType error:', error);
    throw error;
  }
}

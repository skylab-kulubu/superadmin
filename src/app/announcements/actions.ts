'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListAnnouncementDto,
  DataResultAnnouncementDto,
  CreateAnnouncementRequestDto,
  UpdateAnnouncementRequest,
} from '@/types/api';

export async function getAnnouncements(params?: {
  includeUser?: boolean;
  includeEventType?: boolean;
  includeImages?: boolean;
}) {
  try {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    
    const endpoint = qs ? `/api/announcements/?${qs}` : `/api/announcements/`;
    const response = await serverFetch<DataResultListAnnouncementDto>(endpoint);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getAnnouncements error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Duyurular yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getAnnouncementById(id: string) {
  try {
    const response = await serverFetch<DataResultAnnouncementDto>(`/api/announcements/${id}`);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getAnnouncementById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Duyuru yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createAnnouncement(formData: FormData) {
  const coverImage = formData.get('coverImage') as File | null;
  const data: CreateAnnouncementRequestDto = {
    title: formData.get('title') as string,
    body: formData.get('body') as string,
    active: formData.get('active') === 'true' || undefined,
    eventTypeId: formData.get('eventTypeId') as string || undefined,
    formUrl: formData.get('formUrl') as string || undefined,
  };

  // TODO: Handle file upload with serverFetch
  try {
    // For now, skipping file upload - need to handle FormData properly
    await serverFetch<DataResultAnnouncementDto>('/api/announcements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createAnnouncement error:', error);
    throw error;
  }
}

export async function updateAnnouncement(id: string, formData: FormData) {
  const data: UpdateAnnouncementRequest = {
    title: formData.get('title') as string || undefined,
    body: formData.get('body') as string || undefined,
    active: formData.get('active') === 'true' || undefined,
    eventTypeId: formData.get('eventTypeId') as string || undefined,
    formUrl: formData.get('formUrl') as string || undefined,
  };

  try {
    await serverFetch<DataResultAnnouncementDto>(`/api/announcements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateAnnouncement error:', error);
    throw error;
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await serverFetch(`/api/announcements/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteAnnouncement error:', error);
    throw error;
  }
}

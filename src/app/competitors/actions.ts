'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListCompetitorDto,
  DataResultCompetitorDto,
  CreateCompetitorRequest,
  UpdateCompetitorRequest,
} from '@/types/api';

export async function getCompetitors(params?: { includeUser?: boolean; includeEvent?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    
    const response = await serverFetch<DataResultListCompetitorDto>(
      `/api/competitors/my${qs ? `?${qs}` : ''}`
    );
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getCompetitors error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Yarışmacılar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createCompetitor(formData: FormData) {
  const data: CreateCompetitorRequest = {
    userId: formData.get('userId') as string,
    eventId: formData.get('eventId') as string,
    points: parseFloat(formData.get('points') as string) || undefined,
    winner: formData.get('winner') === 'true' || undefined,
  };

  try {
    await serverFetch<DataResultCompetitorDto>('/api/competitors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createCompetitor error:', error);
    throw error;
  }
}

export async function updateCompetitor(id: string, formData: FormData) {
  const data: UpdateCompetitorRequest = {
    userId: formData.get('userId') as string || undefined,
    eventId: formData.get('eventId') as string || undefined,
    points: parseFloat(formData.get('points') as string) || undefined,
    winner: formData.get('winner') === 'true' || undefined,
  };

  try {
    await serverFetch<DataResultCompetitorDto>(`/api/competitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateCompetitor error:', error);
    throw error;
  }
}

export async function deleteCompetitor(id: string) {
  try {
    await serverFetch(`/api/competitors/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteCompetitor error:', error);
    throw error;
  }
}

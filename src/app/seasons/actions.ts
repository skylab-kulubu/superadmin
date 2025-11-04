'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListSeasonDto,
  DataResultSeasonDto,
  CreateSeasonRequest,
} from '@/types/api';

export async function getSeasons(params?: { includeEvents?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvents !== undefined) query.set('includeEvents', params.includeEvents.toString());
    const qs = query.toString();
    
    const response = await serverFetch<DataResultListSeasonDto>(
      `/api/seasons/${qs ? `?${qs}` : ''}`
    );
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getSeasons error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Sezonlar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getSeasonById(id: string, params?: { includeEvents?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvents !== undefined) query.set('includeEvents', params.includeEvents.toString());
    const qs = query.toString();
    
    const response = await serverFetch<DataResultSeasonDto>(
      `/api/seasons/${id}${qs ? `?${qs}` : ''}`
    );
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getSeasonById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Sezon yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createSeason(formData: FormData) {
  const data: CreateSeasonRequest = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true' || undefined,
  };

  try {
    await serverFetch<DataResultSeasonDto>('/api/seasons/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createSeason error:', error);
    throw error;
  }
}

export async function deleteSeason(id: string) {
  try {
    await serverFetch(`/api/seasons/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteSeason error:', error);
    throw error;
  }
}

export async function addEventToSeason(seasonId: string, eventId: string) {
  try {
    await serverFetch(`/api/seasons/addEventToSeason?seasonId=${seasonId}&eventId=${eventId}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('addEventToSeason error:', error);
    throw error;
  }
}

export async function removeEventFromSeason(seasonId: string, eventId: string) {
  try {
    await serverFetch(`/api/seasons/removeEventFromSeason?seasonId=${seasonId}&eventId=${eventId}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('removeEventFromSeason error:', error);
    throw error;
  }
}

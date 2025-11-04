'use server';

import { serverFetch } from '@/lib/api/server-client';
import type {
  DataResultListCompetitionDto,
  DataResultCompetitionDto,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
} from '@/types/api';

export async function getCompetitions(params?: { includeEvent?: boolean; includeEventType?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    
    const endpoint = `/api/competitions/${qs ? `?${qs}` : ''}`;
    const response = await serverFetch<DataResultListCompetitionDto>(endpoint);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getCompetitions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Yarışmalar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getCompetitionById(id: string, params?: { includeEvent?: boolean; includeEventType?: boolean }) {
  try {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    
    const response = await serverFetch<DataResultCompetitionDto>(
      `/api/competitions/${id}${qs ? `?${qs}` : ''}`
    );
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getCompetitionById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Yarışma yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createCompetition(formData: FormData) {
  const data: CreateCompetitionRequest = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
    eventTypeId: formData.get('eventTypeId') as string,
  };

  try {
    await serverFetch<DataResultCompetitionDto>('/api/competitions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('createCompetition error:', error);
    throw error;
  }
}

export async function updateCompetition(id: string, formData: FormData) {
  const data: UpdateCompetitionRequest = {
    name: formData.get('name') as string,
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    active: formData.get('active') === 'true',
  };

  try {
    await serverFetch<DataResultCompetitionDto>(`/api/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateCompetition error:', error);
    throw error;
  }
}

export async function deleteCompetition(id: string) {
  try {
    await serverFetch(`/api/competitions/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('deleteCompetition error:', error);
    throw error;
  }
}

export async function addEventToCompetition(competitionId: string, eventId: string) {
  try {
    await serverFetch(`/api/competitions/${competitionId}/events/${eventId}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('addEventToCompetition error:', error);
    throw error;
  }
}


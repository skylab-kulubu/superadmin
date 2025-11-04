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
    
    console.log('EventTypes API Response (full):', JSON.stringify(response, null, 2));
    console.log('EventTypes API Response:', {
      success: response?.success,
      message: response?.message,
      hasData: !!response?.data,
      dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
      dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A',
      responseKeys: response ? Object.keys(response) : 'no response',
    });
    
    // Eğer response boş obje ise ({}) veya hiç property yoksa, boş array döndür
    if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
      console.warn('API boş yanıt döndü, boş array döndürülüyor');
      return [];
    }

    // Eğer data array ise ve success false olsa bile, boş liste döndürebiliriz
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Eğer success false ise ve mesaj varsa hata fırlat
    if (response.success === false) {
      const errorMessage = response.message || 'API isteği başarısız';
      console.error('API Error Details:', {
        message: response.message,
        httpStatus: response.httpStatus,
        path: response.path,
        timeStamp: response.timeStamp,
      });
      throw new Error(errorMessage);
    }

    // Eğer response var ama success undefined ise ve data yoksa, muhtemelen boş liste
    if (response.success === undefined && !response.data) {
      console.warn('API yanıtında success ve data yok, boş array döndürülüyor');
      return [];
    }

    // data property'si olmalı ve array olmalı
    if (response.data && !Array.isArray(response.data)) {
      throw new Error('Geçersiz API yanıtı: data bir array değil');
    }
    
    // Eğer buraya geldiysek ve data varsa döndür
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getEventTypes error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Etkinlik tipleri yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getEventTypeById(id: string) {
  try {
    const response = await serverFetch<DataResultEventTypeDto>(`/api/event-types/${id}`);
    
    if (!response) {
      throw new Error('API yanıtı alınamadı');
    }

    if (!response.success) {
      throw new Error(response.message || 'API isteği başarısız');
    }

    if (!response.data) {
      throw new Error('Geçersiz API yanıtı: data bulunamadı');
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

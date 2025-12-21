import { apiClient } from './client';
import type {
  DataResultListEventDto,
  DataResultEventDto,
  CreateEventRequest,
  UpdateEventRequest,
  Result,
} from '@/types/api';

export const eventsApi = {
  async getAll(params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListEventDto>(`/api/events/${qs ? `?${qs}` : ''}`);
  },

  async getActive(params?: {
    includeEventType?: boolean;
    includeSession?: boolean;
    includeCompetitors?: boolean;
    includeImages?: boolean;
    includeSeason?: boolean;
  }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListEventDto>(`/api/events/active${qs ? `?${qs}` : ''}`);
  },

  async getByEventType(
    eventTypeName: string,
    params?: {
      includeEventType?: boolean;
      includeSession?: boolean;
      includeCompetitors?: boolean;
      includeImages?: boolean;
      includeSeason?: boolean;
    },
  ) {
    const query = new URLSearchParams();
    query.set('eventTypeName', eventTypeName);
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    // Response type is generic object in docs
    return apiClient.get<any>(`/api/events/event-type?${query.toString()}`);
  },

  async getById(
    id: string,
    params?: {
      includeEventType?: boolean;
      includeSession?: boolean;
      includeCompetitors?: boolean;
      includeImages?: boolean;
      includeSeason?: boolean;
    },
  ) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultEventDto>(`/api/events/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateEventRequest, coverImage: File) {
    const formData = new FormData();
    formData.append('coverImage', coverImage);
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', jsonBlob);
    return apiClient.postFormData<DataResultEventDto>('/api/events/', formData);
  },

  async update(id: string, data: UpdateEventRequest) {
    // Backend docs specify UpdateEventRequest JSON body for PUT
    return apiClient.put<DataResultEventDto>(`/api/events/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/events/${id}`);
  },
};

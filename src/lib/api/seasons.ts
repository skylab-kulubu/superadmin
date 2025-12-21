import { apiClient } from './client';
import type {
  DataResultListSeasonDto,
  DataResultSeasonDto,
  CreateSeasonRequest,
  UpdateSeasonRequest,
  Result,
} from '@/types/api';

export const seasonsApi = {
  async getAll(params?: { includeEvents?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvents !== undefined)
      query.set('includeEvents', params.includeEvents.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListSeasonDto>(`/api/seasons/${qs ? `?${qs}` : ''}`);
  },

  async getActive(params?: { includeEvents?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvents !== undefined)
      query.set('includeEvents', params.includeEvents.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListSeasonDto>(`/api/seasons/active${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string, params?: { includeEvents?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvents !== undefined)
      query.set('includeEvents', params.includeEvents.toString());
    const qs = query.toString();
    return apiClient.get<DataResultSeasonDto>(`/api/seasons/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateSeasonRequest) {
    return apiClient.post<DataResultSeasonDto>('/api/seasons/', data);
  },

  async update(id: string, data: UpdateSeasonRequest) {
    return apiClient.put<DataResultSeasonDto>(`/api/seasons/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/seasons/${id}`);
  },

  async addEvent(seasonId: string, eventId: string) {
    return apiClient.post<Result>(`/api/seasons/${seasonId}/events/${eventId}`);
  },

  async removeEvent(seasonId: string, eventId: string) {
    return apiClient.delete<Result>(`/api/seasons/${seasonId}/events/${eventId}`);
  },
};

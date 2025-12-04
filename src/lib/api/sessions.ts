import { apiClient } from './client';
import type {
  DataResultListSessionDto,
  DataResultSessionDto,
  CreateSessionRequest,
  DataResultVoid,
} from '@/types/api';

export const sessionsApi = {
  async getAll(params?: { includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListSessionDto>(`/api/sessions/${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateSessionRequest) {
    return apiClient.post<DataResultSessionDto>('/api/sessions/', data);
  },

  async delete(id: string) {
    return apiClient.delete<DataResultVoid>(`/api/sessions/${id}`);
  },
};

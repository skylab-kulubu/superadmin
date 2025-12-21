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

  async getById(id: string, params?: { includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultSessionDto>(`/api/sessions/${id}${qs ? `?${qs}` : ''}`);
  },

  async update(
    id: string,
    data: {
      eventId?: string;
      title?: string;
      speakerName?: string;
      speakerLinkedin?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      orderIndex?: number;
      sessionType?: string;
    },
  ) {
    // Should use UpdateSessionRequest but for simplicity/avoiding import hell I define inline or just use any if needed, but here I can just use the shape.
    // Wait, I can import UpdateSessionRequest now.
    return apiClient.put<DataResultSessionDto>(`/api/sessions/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<DataResultVoid>(`/api/sessions/${id}`);
  },
};

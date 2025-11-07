import { apiClient } from './client';
import type {
  DataResultListCompetitionDto,
  DataResultCompetitionDto,
  CreateCompetitionRequest,
  UpdateCompetitionRequest,
  Result,
} from '@/types/api';

export const competitionsApi = {
  async getAll(params?: { includeEvent?: boolean; includeEventType?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitionDto>(`/api/competitions/${qs ? `?${qs}` : ''}`);
  },

  async getActive(params?: { includeEvent?: boolean; includeEventType?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitionDto>(`/api/competitions/active${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string, params?: { includeEvent?: boolean; includeEventType?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEvent !== undefined) query.set('includeEvent', params.includeEvent.toString());
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    return apiClient.get<DataResultCompetitionDto>(`/api/competitions/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateCompetitionRequest) {
    return apiClient.post<DataResultCompetitionDto>('/api/competitions/', data);
  },

  async update(id: string, data: UpdateCompetitionRequest) {
    return apiClient.put<DataResultCompetitionDto>(`/api/competitions/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/competitions/${id}`);
  },

  async addEvent(competitionId: string, eventId: string) {
    return apiClient.post<Result>(`/api/competitions/${competitionId}/events/${eventId}`);
  },
};







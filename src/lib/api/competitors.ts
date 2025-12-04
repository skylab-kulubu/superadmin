import { apiClient } from './client';
import type {
  DataResultListCompetitorDto,
  DataResultCompetitorDto,
  CreateCompetitorRequest,
  UpdateCompetitorRequest,
  Result,
} from '@/types/api';

export const competitorsApi = {
  async getAll(params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(`/api/competitors/${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string, params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultCompetitorDto>(`/api/competitors/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateCompetitorRequest) {
    return apiClient.post<DataResultCompetitorDto>('/api/competitors/', data);
  },

  async update(id: string, data: UpdateCompetitorRequest) {
    return apiClient.put<DataResultCompetitorDto>(`/api/competitors/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/competitors/${id}`);
  },

  async getMy(params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(`/api/competitors/my${qs ? `?${qs}` : ''}`);
  },

  async getByUserId(userId: string, params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(
      `/api/competitors/user/${userId}${qs ? `?${qs}` : ''}`,
    );
  },

  async getByEventId(eventId: string, params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(
      `/api/competitors/event/${eventId}${qs ? `?${qs}` : ''}`,
    );
  },

  async getLeaderboard(params?: { includeUser?: boolean; includeEvent?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(
      `/api/competitors/leaderboard${qs ? `?${qs}` : ''}`,
    );
  },

  async getSeasonLeaderboard(
    seasonId: string,
    params?: { includeUser?: boolean; includeEvent?: boolean },
  ) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultListCompetitorDto>(
      `/api/competitors/leaderboard/season/${seasonId}${qs ? `?${qs}` : ''}`,
    );
  },

  async getEventWinner(
    eventId: string,
    params?: { includeUser?: boolean; includeEvent?: boolean },
  ) {
    const query = new URLSearchParams();
    if (params?.includeUser !== undefined) query.set('includeUser', params.includeUser.toString());
    if (params?.includeEvent !== undefined)
      query.set('includeEvent', params.includeEvent.toString());
    const qs = query.toString();
    return apiClient.get<DataResultCompetitorDto>(
      `/api/competitors/event/${eventId}/winner${qs ? `?${qs}` : ''}`,
    );
  },
};

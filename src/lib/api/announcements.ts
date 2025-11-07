import { apiClient } from './client';
import type {
  DataResultListAnnouncementDto,
  DataResultAnnouncementDto,
  CreateAnnouncementRequestDto,
  UpdateAnnouncementRequest,
  Result,
} from '@/types/api';

export const announcementsApi = {
  async getAll(params?: { includeUser?: boolean; includeEventType?: boolean; includeImages?: boolean }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListAnnouncementDto>(`/api/announcements/${qs ? `?${qs}` : ''}`);
  },

  async getByEventType(eventTypeId: string, params?: { includeUser?: boolean; includeEventType?: boolean; includeImages?: boolean }) {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, value.toString());
    });
    const qs = query.toString();
    return apiClient.get<DataResultListAnnouncementDto>(`/api/announcements/event-type/${eventTypeId}${qs ? `?${qs}` : ''}`);
  },

  async getById(id: string, params?: { includeEventType?: boolean }) {
    const query = new URLSearchParams();
    if (params?.includeEventType !== undefined) query.set('includeEventType', params.includeEventType.toString());
    const qs = query.toString();
    return apiClient.get<DataResultAnnouncementDto>(`/api/announcements/${id}${qs ? `?${qs}` : ''}`);
  },

  async create(data: CreateAnnouncementRequestDto, coverImage?: File) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (coverImage) formData.append('coverImage', coverImage);
    return apiClient.postFormData<DataResultAnnouncementDto>('/api/announcements/', formData);
  },

  async update(id: string, data: UpdateAnnouncementRequest) {
    return apiClient.patch<DataResultAnnouncementDto>(`/api/announcements/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/announcements/${id}`);
  },
};







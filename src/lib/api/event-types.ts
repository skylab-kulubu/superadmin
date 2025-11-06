import { apiClient } from './client';
import type {
  DataResultListEventTypeDto,
  DataResultEventTypeDto,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  Result,
} from '@/types/api';

export const eventTypesApi = {
  async getAll() {
    return apiClient.get<DataResultListEventTypeDto>('/api/event-types/');
  },

  async getById(id: string) {
    return apiClient.get<DataResultEventTypeDto>(`/api/event-types/${id}`);
  },

  async create(data: CreateEventTypeRequest) {
    return apiClient.post<DataResultEventTypeDto>('/api/event-types/', data);
  },

  async update(id: string, data: UpdateEventTypeRequest) {
    return apiClient.put<DataResultEventTypeDto>(`/api/event-types/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/event-types/${id}`);
  },
};






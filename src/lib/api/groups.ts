import { apiClient } from './client';
import type { Result, CreateGroupRequest } from '@/types/api';

export const groupsApi = {
  async create(data: CreateGroupRequest) {
    return apiClient.post<Result>('/api/groups/', data);
  },
};






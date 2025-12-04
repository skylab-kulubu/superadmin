import { apiClient } from './client';
import type {
  DataResultListUserDto,
  DataResultUserDto,
  UpdateUserRequest,
  Result,
} from '@/types/api';
import { normalizeRoleForBackend } from '@/config/roles';

export const usersApi = {
  async getAll() {
    return apiClient.get<DataResultListUserDto>('/api/users/');
  },

  async getById(id: string) {
    return apiClient.get<DataResultUserDto>(`/api/users/${id}`);
  },

  async getMe() {
    return apiClient.get<DataResultUserDto>('/api/users/me');
  },

  async updateMe(data: UpdateUserRequest) {
    return apiClient.put<DataResultUserDto>('/api/users/me', data);
  },

  async update(id: string, data: UpdateUserRequest) {
    return apiClient.put<DataResultUserDto>(`/api/users/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete<Result>(`/api/users/${id}`);
  },

  async assignRole(username: string, role: string) {
    const normalized = normalizeRoleForBackend(role);
    return apiClient.put<Result>(
      `/api/users/assign-role/${encodeURIComponent(username)}?role=${encodeURIComponent(normalized)}`,
    );
  },

  async removeRole(username: string, role: string) {
    const normalized = normalizeRoleForBackend(role);
    return apiClient.put<Result>(
      `/api/users/remove-role/${encodeURIComponent(username)}?role=${encodeURIComponent(normalized)}`,
    );
  },

  async updateProfilePicture(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.postFormData<Result>('/api/users/me/profile-picture', formData);
  },
};

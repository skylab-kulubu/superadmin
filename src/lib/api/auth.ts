import { apiClient } from './client';
import type { CreateUserRequest, SuccessResult, RegisterRequestDto, RegisterResponseDto } from '@/types/api';

export const authApi = {
  async register(data: CreateUserRequest) {
    return apiClient.post<SuccessResult>('/api/auth/register', data);
  },

  async registerOAuth2(data: RegisterRequestDto) {
    return apiClient.post<RegisterResponseDto>('/internal/api/auth/register/oauth2', data);
  },
};







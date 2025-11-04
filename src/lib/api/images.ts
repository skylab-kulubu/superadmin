import { apiClient } from './client';
import type {
  SuccessDataResultUploadImageResponseDto,
  SuccessResult,
} from '@/types/api';

export const imagesApi = {
  async upload(image: File) {
    // Token'ı kontrol et ve gerekirse cookie'den al
    if (typeof window !== 'undefined') {
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          credentials: 'include',
        });
        if (tokenResponse.ok) {
          const { token: tokenData } = await tokenResponse.json();
          if (tokenData) {
            apiClient.setToken(tokenData);
          }
        }
      } catch (error) {
        console.error('Token fetch error:', error);
      }
    }

    const formData = new FormData();
    formData.append('image', image);
    return apiClient.postFormData<SuccessDataResultUploadImageResponseDto>('/api/images/', formData);
  },

  async delete(imageId: string) {
    return apiClient.delete<SuccessResult>(`/api/images/${imageId}`);
  },
};


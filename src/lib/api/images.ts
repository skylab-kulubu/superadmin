import { apiClient } from './client';
import type { SuccessDataResultUploadImageResponseDto, SuccessResult } from '@/types/api';

export const imagesApi = {
  async upload(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.postFormData<SuccessDataResultUploadImageResponseDto>(
      '/api/images/',
      formData,
    );
  },

  async delete(imageId: string) {
    return apiClient.delete<SuccessResult>(`/api/images/${imageId}`);
  },
};

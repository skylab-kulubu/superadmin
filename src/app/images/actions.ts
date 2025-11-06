'use server';

import { imagesApi } from '@/lib/api/images';

export async function uploadImage(formData: FormData) {
  const image = formData.get('image') as File;
  if (!image) {
    throw new Error('Resim seçilmedi');
  }

  try {
    const response = await imagesApi.upload(image);
    return response.data;
  } catch (error) {
    throw new Error('Resim yüklenirken hata oluştu');
  }
}

export async function deleteImage(imageId: string) {
  try {
    await imagesApi.delete(imageId);
  } catch (error) {
    throw error;
  }
}










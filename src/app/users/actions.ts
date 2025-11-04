'use server';

import { serverFetch } from '@/lib/api/server-client';
import type { DataResultListUserDto, DataResultUserDto, UpdateUserRequest } from '@/types/api';

export async function getUsers() {
  try {
    const response = await serverFetch<DataResultListUserDto>('/api/users/');
    
    // Backend DataResultList formatında dönüyor: { success, message, data: UserDto[] }
    if (!response || !response.data) {
      console.error('Users API response:', response);
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data || [];
  } catch (error) {
    console.error('getUsers error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Kullanıcılar yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function getUserById(id: string) {
  try {
    const response = await serverFetch<DataResultUserDto>(`/api/users/${id}`);
    
    if (!response || !response.data) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    return response.data;
  } catch (error) {
    console.error('getUserById error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new Error(`Kullanıcı yüklenirken hata oluştu: ${errorMessage}`);
  }
}

export async function createUser(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  try {
    // Users API'de create yok, authApi.register kullanılmalı
    // Burada authApi.register kullanılmalı
    throw new Error('Create user henüz implement edilmedi');
  } catch (error) {
    throw error;
  }
}

export async function updateUser(id: string, formData: FormData) {
  try {
    const data: UpdateUserRequest = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      linkedin: formData.get('linkedin') as string || undefined,
      university: formData.get('university') as string || undefined,
      faculty: formData.get('faculty') as string || undefined,
      department: formData.get('department') as string || undefined,
    };

    await serverFetch<DataResultUserDto>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('updateUser error:', error);
    throw error;
  }
}

export async function addRoleToUser(username: string, role: string) {
  try {
    await serverFetch(`/api/users/add-role/${encodeURIComponent(username)}?role=${role}`, {
      method: 'PUT',
    });
  } catch (error) {
    console.error('addRoleToUser error:', error);
    throw error;
  }
}



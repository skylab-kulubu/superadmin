import { apiClient } from './client';

export const qrCodesApi = {
  async generateQRCode(url: string, width: number, height: number): Promise<Blob> {
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

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
    const headers = apiClient.getHeaders();
    // Blob response için Content-Type header'ını kaldır
    delete headers['Content-Type'];
    
    const response = await fetch(
      `${API_BASE_URL}/api/qrCodes/generateQRCode?url=${encodeURIComponent(url)}&width=${width}&height=${height}`,
      {
        headers,
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QR code generation failed: ${response.status} - ${errorText}`);
    }
    
    return response.blob();
  },

  async generateQRCodeWithLogo(url: string, width: number, height: number, logoSize: number = 50): Promise<Blob> {
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

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
    const headers = apiClient.getHeaders();
    // Blob response için Content-Type header'ını kaldır
    delete headers['Content-Type'];
    
    const response = await fetch(
      `${API_BASE_URL}/api/qrCodes/generateQRCodeWithLogo?url=${encodeURIComponent(url)}&width=${width}&height=${height}&logoSize=${logoSize}`,
      {
        headers,
        credentials: 'include',
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QR code generation failed: ${response.status} - ${errorText}`);
    }
    
    return response.blob();
  },
};


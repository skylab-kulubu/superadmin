const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';

class ApiClient {
  private _baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this._baseURL = baseURL;
  }

  get baseURL(): string {
    return this._baseURL;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Client-side'da token'ı cookie'den almak için API endpoint'ini kullan
    if (typeof window !== 'undefined' && !this.token && !localStorage.getItem('auth_token')) {
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          credentials: 'include',
        });
        if (tokenResponse.ok) {
          const { token } = await tokenResponse.json();
          if (token) {
            this.token = token;
            localStorage.setItem('auth_token', token);
          }
        }
      } catch (error) {
        // Token alınamazsa devam et, backend'den 401 dönecek
      }
    }

    const url = `${this._baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Cookie'lerin gönderilmesi için
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      // 401 Unauthorized durumunda token geçersiz demektir
      if (response.status === 401) {
        // Token geçersizse temizle ve logout yap
        this.clearToken();
        // Logout endpoint'ini çağır (cookie'leri temizlemek için)
        if (typeof window !== 'undefined') {
          fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          }).catch(() => {
            // Logout başarısız olsa bile devam et
          });
          // Login sayfasına yönlendir
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${this._baseURL}${endpoint}`, {
      method: 'POST',
      credentials: 'include', // Cookie'lerin gönderilmesi için
      headers,
      body: formData,
    }).then(res => {
      if (!res.ok) {
        // 401 Unauthorized durumunda token geçersiz demektir
        if (res.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);


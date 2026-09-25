import { coreFetch } from './core';

export type Media = {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedBy: string;
  kind: string;
  /** The Media purpose it was uploaded for (ADR-0052); `legacy` without one. */
  purpose?: string;
  /** Whether a record uses it: `pending`, `attached` or `detached` (core media redesign ticket 02). */
  status?: string;
  /** When a pending or detached Media is purged unless something links it. */
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export const mediaApi = {
  list: () => coreFetch<Media[]>('/v1/media'),
  get: (id: string) => coreFetch<Media>(`/v1/media/${encodeURIComponent(id)}`),
  upload: (file: File, purpose?: string) => {
    const body = new FormData();
    if (purpose) body.append('purpose', purpose);
    body.append('file', file);
    return coreFetch<Media>('/v1/media', { method: 'POST', body });
  },
  remove: (id: string) =>
    coreFetch<void>(`/v1/media/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

/**
 * Media purposes as core's catalogue names them (ADR-0052,
 * core-backend `config/media-purposes.json`), with the Turkish label
 * superadmin shows for each.
 */
export const MEDIA_PURPOSE_LABELS: Record<string, string> = {
  event_cover: 'Etkinlik kapağı',
  event_gallery: 'Etkinlik galerisi',
  profile_picture: 'Profil fotoğrafı',
  cms_image: 'CMS görseli',
  cms_file: 'CMS dosyası',
  club_file: 'Kulüp dosyası',
  video: 'Video',
  certificate_asset: 'Sertifika görseli',
  answer_file: 'Yanıt dosyası',
  answer_file_large: 'Büyük yanıt dosyası',
  legacy: 'Amaçsız (eski)',
};

export function mediaPurposeLabel(purpose?: string | null): string {
  const value = (purpose ?? '').trim();
  return MEDIA_PURPOSE_LABELS[value] ?? value;
}

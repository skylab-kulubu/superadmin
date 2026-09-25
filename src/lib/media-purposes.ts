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

/**
 * Private purposes never get a public address, and nobody browses them from
 * the Media screen: the owning product opens each one on its own.
 */
const PRIVATE_MEDIA_PURPOSES = new Set(['answer_file', 'answer_file_large', 'certificate_asset']);

export function isPrivateMediaPurpose(purpose?: string | null): boolean {
  return PRIVATE_MEDIA_PURPOSES.has((purpose ?? '').trim());
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  attached: 'Bağlı',
  detached: 'Ayrıldı',
};

/** The Turkish label of a Media status, or nothing for a status core did not send. */
export function mediaStatusLabel(status?: string | null): string {
  const value = (status ?? '').trim();
  return STATUS_LABELS[value] ?? value;
}

/** The distinct purposes given, in catalogue order; purposes superadmin does not know yet go last. */
export function orderedMediaPurposes(purposes: ReadonlyArray<string | undefined>): string[] {
  const catalogue = Object.keys(MEDIA_PURPOSE_LABELS);
  const rank = (purpose: string) => {
    const index = catalogue.indexOf(purpose);
    return index === -1 ? catalogue.length : index;
  };
  const distinct = [...new Set(purposes.filter((purpose): purpose is string => Boolean(purpose)))];
  return distinct.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

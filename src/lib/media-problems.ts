import { ProblemError } from '@/lib/api/core';
import { mediaPurposeLabel } from '@/lib/media-purposes';

const MIB = 1024 * 1024;
const GIB = 1024 * MIB;

function oneDecimal(value: number): string {
  return String(Math.round(value * 10) / 10).replace('.', ',');
}

function formatBytes(bytes: number): string {
  if (bytes >= GIB) return `${oneDecimal(bytes / GIB)} GB`;
  return `${oneDecimal(bytes / MIB)} MB`;
}

const TYPE_NAMES: Record<string, string> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'application/pdf': 'PDF',
  'video/mp4': 'MP4',
  'application/zip': 'ZIP',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
};

function typeNames(value: unknown): string {
  const types = Array.isArray(value) ? value.filter((row) => typeof row === 'string') : [];
  return types.map((type) => TYPE_NAMES[type] ?? type).join(', ');
}

/** A wait in Turkish, rounded up: `45 saniye`, `4 dakika`, `1 saat 30 dakika`. */
export function formatWait(seconds: number): string {
  const total = Math.max(1, Math.ceil(seconds));
  if (total < 60) return `${total} saniye`;
  const minutes = Math.ceil(total / 60);
  if (minutes < 60) return `${minutes} dakika`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} saat ${rest} dakika` : `${hours} saat`;
}

const LOCATIVE: Record<string, string> = { saniye: 'saniyede', dakika: 'dakikada', saat: 'saatte' };

function within(seconds: number): string {
  const words = formatWait(seconds).split(' ');
  const last = words.pop() ?? '';
  return [...words, LOCATIVE[last] ?? last].join(' ');
}

/** How long core asked to wait before the next upload, from a `media_rate_limited` refusal. */
export function uploadRetryAfterSeconds(error: unknown): number | undefined {
  if (!(error instanceof ProblemError) || error.code !== 'media_rate_limited') return undefined;
  const seconds = Number(error.members.retryAfterSeconds);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : undefined;
}

/** The roles core links a Media under, as the object of a sentence. */
const ROLE_NAMES: Record<string, string> = {
  event_cover: 'etkinlik kapağı',
  event_gallery: 'etkinlik galerisi görseli',
  profile_picture: 'profil fotoğrafı',
  certificate_asset: 'sertifika görseli',
};

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function purposeOf(error: ProblemError): string {
  return mediaPurposeLabel(text(error.members.purpose)) || 'bu alan';
}

/** A Turkish sentence for a refusal core gave a Media upload or link. */
export function mediaProblemMessage(error: unknown, fallback = 'Yüklenemedi'): string {
  if (!(error instanceof ProblemError)) return fallback;
  const members = error.members;
  switch (error.code) {
    case 'purpose_unknown':
      return `Sunucu bu yükleme amacını tanımıyor (${text(members.purpose)}). Sayfayı yenileyip tekrar dene; sürerse yöneticiye haber ver.`;
    case 'purpose_forbidden':
      return `${purposeOf(error)} yüklemeye yetkin yok.`;
    case 'private_media_disabled':
      return `${purposeOf(error)} gizli bir dosya türü ve gizli dosya depolama henüz açılmadı; şimdilik yüklenemez.`;
    case 'purpose_requires_direct_upload':
      return `${purposeOf(error)} büyük dosya yüklemesiyle gönderilir; buradan yüklenemez.`;
    case 'media_too_large': {
      const maxBytes = Number(members.maxBytes);
      return `Dosya çok büyük: ${purposeOf(error)} için en fazla ${formatBytes(maxBytes)} yüklenebilir.`;
    }
    case 'media_type_not_allowed': {
      const allowed = typeNames(members.allowedTypes);
      const sentence = `Bu dosya türü ${purposeOf(error)} için kabul edilmiyor.`;
      return allowed ? `${sentence} Kabul edilenler: ${allowed}.` : sentence;
    }
    case 'media_rate_limited': {
      const limit =
        members.limit === 'volume'
          ? `günde en fazla ${formatBytes(Number(members.maxDailyBytes))}`
          : `${within(Number(members.uploadWindowSeconds))} en fazla ${Number(members.maxUploads)} dosya`;
      const seconds = uploadRetryAfterSeconds(error);
      const wait =
        seconds === undefined
          ? 'Biraz sonra tekrar dene.'
          : `${formatWait(seconds)} sonra tekrar dene.`;
      return `Yükleme sınırına ulaştın: ${limit}. ${wait}`;
    }
    case 'media_purpose_mismatch': {
      const role = ROLE_NAMES[text(members.role)];
      const where = role ? `${role} olarak` : 'burada';
      return `Bu dosya ${purposeOf(error)} için yüklenmiş; ${where} kullanılamaz. Dosyayı bu alan için yeniden yükle.`;
    }
    case 'media_not_linkable':
      return 'Seçilen dosya artık kullanılamıyor: silinmiş, arşivlenmiş ya da kaydedilmeden süresi dolmuş. Dosyayı yeniden yükle.';
    case 'media_team_mismatch':
      return 'Bu fotoğraf başka bir ekibin etkinliğinde kullanılıyor. Yalnız kendi ekibinin fotoğraflarını kullanabilirsin.';
    default:
      return error.detail || error.title || fallback;
  }
}

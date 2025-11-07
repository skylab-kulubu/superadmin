/**
 * GMT+0'dan GMT+3'e dönüşüm (Backend'den gelen tarihleri Türkiye saatine çevirir)
 * Backend'den gelen tarih GMT+0 (UTC) formatında, bunu GMT+3'e çeviriyoruz
 */
export function convertGMT0ToGMT3(dateString: string): Date {
  const date = new Date(dateString);
  // UTC tarihini al ve GMT+3'e çevir (3 saat ekle)
  const utcTime = date.getTime();
  const gmt3Time = utcTime + (3 * 60 * 60 * 1000); // 3 saat = 3 * 60 * 60 * 1000 ms
  return new Date(gmt3Time);
}

/**
 * GMT+3'ten GMT+0'a dönüşüm (Frontend'den backend'e gönderirken)
 * Frontend'deki GMT+3 tarihini GMT+0 (UTC) formatına çeviriyoruz
 */
export function convertGMT3ToGMT0(dateString: string): string {
  // datetime-local input'u local timezone olarak parse eder
  // Bunu UTC'ye çevirmek için 3 saat çıkarıyoruz
  const date = new Date(dateString);
  const localTime = date.getTime();
  const utcTime = localTime - (3 * 60 * 60 * 1000); // 3 saat çıkar
  return new Date(utcTime).toISOString();
}

/**
 * GMT+0 tarihini datetime-local formatına çevirir (GMT+3'e göre)
 */
export function formatGMT0ToLocalInput(dateString: string): string {
  if (!dateString) return '';
  const date = convertGMT0ToGMT3(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Güncel tarih/saati GMT+3'e göre formatlar
 */
export function getCurrentDateTimeGMT3(): string {
  const now = new Date();
  // Local timezone zaten GMT+3 olmalı, ama emin olmak için kontrol ediyoruz
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


import { WorkshopSessionStatus } from '../types';

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Đang cập nhật';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long', // Hiển thị kiểu "tháng 1", "tháng 12"
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return 'Đang cập nhật';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'long', // Hiển thị "Thứ 2,
    month: 'long', // Hiển thị "tháng 1", "tháng 12"
    day: 'numeric', // Hiển thị "05"
  });
}

export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return 'Đang cập nhật';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Ở Việt Nam thường dùng hệ 24h cho UI
  });
}

export function getSessionStatusColor(status: WorkshopSessionStatus): string {
  switch (status) {
    case WorkshopSessionStatus.SCHEDULED:
      return '#3b82f6';
    case WorkshopSessionStatus.IN_PROGRESS:
      return '#10b981';
    case WorkshopSessionStatus.COMPLETED:
      return '#6b7280';
    case WorkshopSessionStatus.CANCELLED:
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getRatingStars(rating: number): { full: number; half: boolean; empty: number } {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
}

export function getAvailabilityColor(available: number, total: number): string {
  const ratio = available / total;
  if (ratio <= 0) return '#ef4444';
  if (ratio <= 0.25) return '#f97316';
  if (ratio <= 0.5) return '#eab308';
  return '#10b981';
}

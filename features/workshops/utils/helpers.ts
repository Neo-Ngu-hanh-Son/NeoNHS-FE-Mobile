import { WorkshopSessionStatus } from "../types";

export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateStr?: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getSessionStatusColor(status: WorkshopSessionStatus): string {
  switch (status) {
    case WorkshopSessionStatus.SCHEDULED:
      return "#3b82f6";
    case WorkshopSessionStatus.IN_PROGRESS:
      return "#10b981";
    case WorkshopSessionStatus.COMPLETED:
      return "#6b7280";
    case WorkshopSessionStatus.CANCELLED:
      return "#ef4444";
    default:
      return "#6b7280";
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
  if (ratio <= 0) return "#ef4444";
  if (ratio <= 0.25) return "#f97316";
  if (ratio <= 0.5) return "#eab308";
  return "#10b981";
}

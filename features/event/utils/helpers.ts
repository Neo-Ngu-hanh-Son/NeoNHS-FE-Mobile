import { TicketCatalogStatus } from "../types";

export function getStatusColor(status: string): string {
  switch (status) {
    case "UPCOMING":
      return "#3b82f6";
    case "ONGOING":
      return "#10b981";
    case "COMPLETED":
      return "#6b7280";
    case "CANCELLED":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

export function getTicketStatusColor(status: TicketCatalogStatus): string {
  switch (status) {
    case TicketCatalogStatus.ACTIVE:
      return "#10b981";
    case TicketCatalogStatus.SOLD_OUT:
      return "#ef4444";
    case TicketCatalogStatus.INACTIVE:
      return "#6b7280";
    default:
      return "#6b7280";
  }
}

export function getTicketStatusLabel(status: TicketCatalogStatus): string {
  switch (status) {
    case TicketCatalogStatus.ACTIVE:
      return "On Sale";
    case TicketCatalogStatus.SOLD_OUT:
      return "Sold Out";
    case TicketCatalogStatus.INACTIVE:
      return "Unavailable";
    default:
      return status;
  }
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

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export function calcDiscount(
  price: number,
  originalPrice?: number | null
): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatDaysOfWeek(days?: string | null): string {
  if (!days) return "All days";
  const dayMap: Record<string, string> = {
    MON: "Mon",
    TUE: "Tue",
    WED: "Wed",
    THU: "Thu",
    FRI: "Fri",
    SAT: "Sat",
    SUN: "Sun",
  };
  return days
    .split(",")
    .map((d) => dayMap[d.trim()] || d.trim())
    .join(", ");
}

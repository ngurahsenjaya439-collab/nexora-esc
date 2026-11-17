import { differenceInCalendarDays, format, isValid } from "date-fns";
import { id as localeId } from "date-fns/locale";

export type DeadlineTone = "rose" | "amber" | "emerald" | "slate";

export type DeadlineInfo = {
  key: "overdue" | "today" | "approaching" | "on-track" | "done" | "archived";
  label: string;
  detail: string;
  tone: DeadlineTone;
  days: number;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = asDate(value);
  if (!isValid(date)) return "—";
  return format(date, "d MMM yyyy", { locale: localeId });
}

export function formatLongDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = asDate(value);
  if (!isValid(date)) return "—";
  return format(date, "EEEE, d MMMM yyyy", { locale: localeId });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = asDate(value);
  if (!isValid(date)) return "—";
  return format(date, "d MMM yyyy, HH:mm", { locale: localeId });
}

export function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = asDate(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
}

export function daysUntilDeadline(value: Date | string): number {
  return differenceInCalendarDays(asDate(value), new Date());
}

export function getDeadlineInfo(
  deadline: Date | string,
  status: string,
): DeadlineInfo {
  const days = daysUntilDeadline(deadline);

  if (status === "DONE") {
    return {
      key: "done",
      label: "Selesai",
      detail: "Riset telah disetujui",
      tone: "emerald",
      days,
    };
  }

  if (status === "ARCHIVED") {
    return {
      key: "archived",
      label: "Diarsipkan",
      detail: "Tidak termasuk antrean aktif",
      tone: "slate",
      days,
    };
  }

  if (days < 0) {
    return {
      key: "overdue",
      label: `Overdue ${Math.abs(days)} hari`,
      detail: "Melewati deadline",
      tone: "rose",
      days,
    };
  }

  if (days === 0) {
    return {
      key: "today",
      label: "Jatuh tempo hari ini",
      detail: "Prioritaskan penyelesaian",
      tone: "amber",
      days,
    };
  }

  if (days <= 3) {
    return {
      key: "approaching",
      label: `${days} hari lagi`,
      detail: "Mendekati deadline",
      tone: "amber",
      days,
    };
  }

  return {
    key: "on-track",
    label: `${days} hari lagi`,
    detail: "On track",
    tone: "emerald",
    days,
  };
}

export function getTimelineProgress(
  startDate: Date | string,
  deadline: Date | string,
): { percent: number; totalDays: number; elapsedDays: number } {
  const totalDays = differenceInCalendarDays(asDate(deadline), asDate(startDate));
  const elapsedDays = differenceInCalendarDays(new Date(), asDate(startDate));
  const percent =
    totalDays <= 0
      ? elapsedDays >= 0
        ? 100
        : 0
      : Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  return {
    percent,
    totalDays: Math.max(totalDays, 0),
    elapsedDays: Math.max(elapsedDays, 0),
  };
}

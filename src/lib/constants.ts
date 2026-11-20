export const APP_NAME = "NEXORA";
export const APP_DESCRIPTION =
  "Research management workspace untuk Departemen Research East Side Central.";

export const RESEARCH_STATUS_VALUES = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "REVISION_NEEDED",
  "DONE",
  "ARCHIVED",
] as const;

export type ResearchStatusValue = (typeof RESEARCH_STATUS_VALUES)[number];

export const ACTIVE_STATUS_VALUES: ResearchStatusValue[] = [
  "IN_PROGRESS",
  "IN_REVIEW",
  "REVISION_NEEDED",
];

export const STATUS_META: Record<
  ResearchStatusValue,
  { label: string; badge: string; dot: string }
> = {
  TO_DO: {
    label: "To Do",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  IN_REVIEW: {
    label: "In Review",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  REVISION_NEEDED: {
    label: "Revision Needed",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  DONE: {
    label: "Done",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "bg-slate-100 text-slate-500 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type PriorityValue = (typeof PRIORITY_VALUES)[number];

export const PRIORITY_META: Record<
  PriorityValue,
  { label: string; badge: string; dot: string }
> = {
  LOW: {
    label: "Low",
    badge: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-teal-50 text-teal-700 ring-teal-200",
    dot: "bg-teal-600",
  },
  HIGH: {
    label: "High",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },
  URGENT: {
    label: "Urgent",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const AVAILABILITY_VALUES = [
  "AVAILABLE",
  "BUSY_EXAM",
  "UNAVAILABLE",
] as const;
export type AvailabilityValue = (typeof AVAILABILITY_VALUES)[number];

export const AVAILABILITY_META: Record<
  AvailabilityValue,
  { label: string; badge: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  BUSY_EXAM: {
    label: "Busy / Exam",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const SUBMISSION_STATUS_VALUES = [
  "PENDING_REVIEW",
  "APPROVED",
  "REVISION_REQUESTED",
] as const;
export type SubmissionStatusValue = (typeof SUBMISSION_STATUS_VALUES)[number];

export const SUBMISSION_STATUS_META: Record<
  SubmissionStatusValue,
  { label: string; badge: string; dot: string }
> = {
  PENDING_REVIEW: {
    label: "Menunggu Review",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  APPROVED: {
    label: "Disetujui",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  REVISION_REQUESTED: {
    label: "Diminta Revisi",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
};

export const REVIEW_DECISION_META: Record<
  "APPROVED" | "REVISION_REQUESTED",
  { label: string; badge: string }
> = {
  APPROVED: {
    label: "Approved",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

export const REVISION_SEVERITY_VALUES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "BLOCKING",
] as const;
export type RevisionSeverityValue = (typeof REVISION_SEVERITY_VALUES)[number];

export const REVISION_SEVERITY_META: Record<
  RevisionSeverityValue,
  { label: string; badge: string; dot: string }
> = {
  LOW: {
    label: "Low",
    badge: "bg-slate-50 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-teal-50 text-teal-700 ring-teal-200",
    dot: "bg-teal-600",
  },
  HIGH: {
    label: "High",
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },
  BLOCKING: {
    label: "Blocking",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
  },
};

export const REVISION_STATUS_META: Record<
  "OPEN" | "RESOLVED",
  { label: string; badge: string }
> = {
  OPEN: {
    label: "Open",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  RESOLVED: {
    label: "Resolved",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
};

export const TASK_STATUS_OPTIONS = (
  [
    "TO_DO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "REVISION_NEEDED",
    "DONE",
  ] as ResearchStatusValue[]
).map((status) => ({ value: status, label: STATUS_META[status].label }));

export const REFERENCE_SOURCE_VALUES = [
  "NEWS",
  "JOURNAL",
  "REPORT",
  "INTERNAL",
  "OTHER",
] as const;
export type ReferenceSourceValue = (typeof REFERENCE_SOURCE_VALUES)[number];

export const REFERENCE_SOURCE_LABELS: Record<ReferenceSourceValue, string> = {
  NEWS: "Berita",
  JOURNAL: "Jurnal",
  REPORT: "Laporan",
  INTERNAL: "Internal",
  OTHER: "Lainnya",
};

export const STATUS_OPTIONS = RESEARCH_STATUS_VALUES.filter(
  (status) => status !== "ARCHIVED",
).map((status) => ({ value: status, label: STATUS_META[status].label }));

export const PRIORITY_OPTIONS = PRIORITY_VALUES.map((priority) => ({
  value: priority,
  label: PRIORITY_META[priority].label,
}));

export const DEADLINE_TONE_CLASSES = {
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
} as const;

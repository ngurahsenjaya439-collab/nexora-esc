import type { ResearchStatusValue } from "@/lib/constants";

export type WorkflowRole = "MANAGER" | "ANALYST";

export type StatusAction = {
  toStatus: ResearchStatusValue;
  label: string;
  description: string;
  roles: readonly WorkflowRole[];
  variant: "accent" | "secondary" | "danger";
};

/**
 * Transisi status yang boleh dipicu langsung dari panel aksi (bukan lewat
 * submission / review). Transisi ke IN_REVIEW, DONE, dan REVISION_NEEDED
 * sengaja tidak ada di sini karena harus melalui alur submission & review.
 */
export const STATUS_ACTIONS: Record<ResearchStatusValue, StatusAction[]> = {
  TO_DO: [
    {
      toStatus: "IN_PROGRESS",
      label: "Mulai Pengerjaan",
      description: "Tandai riset mulai dikerjakan.",
      roles: ["MANAGER", "ANALYST"],
      variant: "accent",
    },
  ],
  IN_PROGRESS: [
    {
      toStatus: "TO_DO",
      label: "Kembalikan ke To Do",
      description: "Tandai riset belum siap dikerjakan.",
      roles: ["MANAGER", "ANALYST"],
      variant: "secondary",
    },
  ],
  IN_REVIEW: [
    {
      toStatus: "IN_PROGRESS",
      label: "Batalkan Review",
      description: "Tarik topik dari antrean review dan lanjutkan pengerjaan.",
      roles: ["MANAGER"],
      variant: "secondary",
    },
  ],
  REVISION_NEEDED: [
    {
      toStatus: "IN_PROGRESS",
      label: "Mulai Revisi",
      description: "Mulai mengerjakan perbaikan yang diminta Manager.",
      roles: ["MANAGER", "ANALYST"],
      variant: "accent",
    },
  ],
  DONE: [
    {
      toStatus: "IN_PROGRESS",
      label: "Buka Kembali",
      description: "Buka kembali riset yang sudah selesai untuk ditinjau ulang.",
      roles: ["MANAGER"],
      variant: "secondary",
    },
  ],
  ARCHIVED: [],
};

export function isActiveAssignee(
  assignments: { userId: string; role: string; isActive: boolean }[],
  userId: string,
): boolean {
  return assignments.some(
    (assignment) =>
      assignment.isActive &&
      assignment.userId === userId &&
      (assignment.role === "PRIMARY" || assignment.role === "BACKUP"),
  );
}

export function getStatusActions(
  status: ResearchStatusValue,
  role: WorkflowRole,
  isAssigned: boolean,
): StatusAction[] {
  if (status === "ARCHIVED") return [];

  return (STATUS_ACTIONS[status] ?? []).filter((action) => {
    if (!action.roles.includes(role)) return false;
    if (role === "ANALYST" && !isAssigned) return false;
    return true;
  });
}

export function findStatusAction(
  from: ResearchStatusValue,
  to: ResearchStatusValue,
  role: WorkflowRole,
  isAssigned: boolean,
): StatusAction | null {
  return (
    getStatusActions(from, role, isAssigned).find(
      (action) => action.toStatus === to,
    ) ?? null
  );
}

export const WORKFLOW_STEPS = [
  "TO_DO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
] as const;

export type WorkflowStep = (typeof WORKFLOW_STEPS)[number];

export const WORKFLOW_STEP_LABELS: Record<WorkflowStep, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

export const REVISION_SECTION_VALUES = [
  "Latar Belakang",
  "Metodologi",
  "Analisis & Temuan",
  "Referensi & Sitasi",
  "Struktur & Penulisan",
  "Lainnya",
] as const;

export type RevisionSectionValue = (typeof REVISION_SECTION_VALUES)[number];

export const REVISION_SECTIONS: { value: RevisionSectionValue; label: string }[] =
  REVISION_SECTION_VALUES.map((value) => ({ value, label: value }));

/** Bucket deadline yang dipakai halaman Tugas Saya. */
export const TASK_DUE_VALUES = [
  "overdue",
  "approaching",
  "on-track",
  "done",
] as const;

export type TaskDueValue = (typeof TASK_DUE_VALUES)[number];

export const TASK_DUE_OPTIONS: { value: TaskDueValue; label: string }[] = [
  { value: "overdue", label: "Overdue" },
  { value: "approaching", label: "Approaching Deadline" },
  { value: "on-track", label: "On Track" },
  { value: "done", label: "Selesai" },
];

export const TASK_ROLE_OPTIONS = [
  { value: "PRIMARY", label: "Primary Analyst" },
  { value: "BACKUP", label: "Backup Analyst" },
] as const;

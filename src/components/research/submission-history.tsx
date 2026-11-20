import {
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  MessageSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  REVIEW_DECISION_META,
  SUBMISSION_STATUS_META,
  type SubmissionStatusValue,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { TopicDetail } from "@/server/services/research.service";

type Submission = TopicDetail["submissions"][number];

function SubmissionCard({ submission }: { submission: Submission }) {
  const meta =
    SUBMISSION_STATUS_META[submission.status as SubmissionStatusValue] ??
    SUBMISSION_STATUS_META.PENDING_REVIEW;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white">
              <FileText className="size-3" />
              Submission v{submission.version}
            </span>
            <Badge className={meta.badge}>
              <span className={cn("size-1.5 rounded-full", meta.dot)} />
              {meta.label}
            </Badge>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Dikirim oleh {submission.submittedBy.name} ·{" "}
            {formatDateTime(submission.submittedAt)}
          </p>
        </div>
        {submission.reviewedAt ? (
          <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock3 className="size-3" />
            Direview {formatDateTime(submission.reviewedAt)}
          </p>
        ) : null}
      </div>

      {submission.summary ? (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
          {submission.summary}
        </p>
      ) : null}

      {submission.attachments.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {submission.attachments.map((attachment) =>
            attachment.url ? (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-medium text-teal-700 ring-1 ring-inset ring-teal-100 transition hover:bg-teal-100"
              >
                <ExternalLink className="size-3" />
                {attachment.label}
              </a>
            ) : null,
          )}
        </div>
      ) : null}

      {submission.reviews.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {submission.reviews.map((review) => {
            const decisionMeta =
              REVIEW_DECISION_META[review.decision] ??
              REVIEW_DECISION_META.REVISION_REQUESTED;

            return (
              <div
                key={review.id}
                className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-3.5 text-slate-400" />
                    <Badge className={decisionMeta.badge}>
                      {decisionMeta.label}
                    </Badge>
                    <span className="text-[11px] text-slate-500">
                      oleh {review.reviewer.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(review.createdAt)}
                  </span>
                </div>
                {review.summary ? (
                  <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-600">
                    {review.summary}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : submission.status === "PENDING_REVIEW" ? (
        <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-violet-600">
          <FileCheck2 className="size-3.5" />
          Menunggu verifikasi Manager.
        </p>
      ) : null}
    </article>
  );
}

export function SubmissionHistory({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-500">
        Belum ada submission. Riwayat versi akan muncul setelah hasil riset
        dikirim.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}

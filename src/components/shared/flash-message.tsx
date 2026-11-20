import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type FlashTone = "success" | "error" | "info";

const toneMap = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: AlertTriangle,
    className: "border-rose-200 bg-rose-50 text-rose-800",
    iconClassName: "text-rose-600",
  },
  info: {
    icon: Info,
    className: "border-teal-200 bg-teal-50 text-teal-800",
    iconClassName: "text-teal-600",
  },
};

export function FlashMessage({
  tone = "info",
  message,
  className,
}: {
  tone?: FlashTone;
  message: string;
  className?: string;
}) {
  const config = toneMap[tone];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        config.className,
        className,
      )}
      role="status"
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClassName)} />
      <p>{message}</p>
    </div>
  );
}

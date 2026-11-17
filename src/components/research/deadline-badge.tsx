import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DEADLINE_TONE_CLASSES } from "@/lib/constants";
import { getDeadlineInfo } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function DeadlineBadge({
  deadline,
  status,
  className,
}: {
  deadline: Date | string;
  status: string;
  className?: string;
}) {
  const info = getDeadlineInfo(deadline, status);

  return (
    <Badge
      className={cn(DEADLINE_TONE_CLASSES[info.tone], className)}
      title={info.detail}
    >
      <Clock3 className="size-3" />
      {info.label}
    </Badge>
  );
}

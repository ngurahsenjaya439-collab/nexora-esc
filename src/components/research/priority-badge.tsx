import { Badge } from "@/components/ui/badge";
import { PRIORITY_META, type PriorityValue } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: string }) {
  const meta =
    PRIORITY_META[priority as PriorityValue] ?? PRIORITY_META.MEDIUM;

  return (
    <Badge className={meta.badge}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

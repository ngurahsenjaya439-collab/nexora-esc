import { Badge } from "@/components/ui/badge";
import { STATUS_META, type ResearchStatusValue } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const meta =
    STATUS_META[status as ResearchStatusValue] ?? STATUS_META.TO_DO;

  return (
    <Badge className={meta.badge}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

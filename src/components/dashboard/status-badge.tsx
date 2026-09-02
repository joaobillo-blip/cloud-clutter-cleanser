import { STATUS_LABEL, type WorkspaceStatus } from "@/lib/workspace-data";

const STYLES: Record<WorkspaceStatus, string> = {
  running: "bg-success/12 text-success",
  stopped: "bg-muted text-muted-foreground",
  creating: "bg-info/12 text-info",
  failed: "bg-destructive/12 text-destructive",
  removed: "bg-warning/15 text-warning-foreground",
};

export function StatusBadge({ status }: { status: WorkspaceStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

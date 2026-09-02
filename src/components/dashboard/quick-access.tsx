import {
  AlertTriangle,
  Download,
  LayoutGrid,
  PlayCircle,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

const ACTIONS: { label: string; icon: LucideIcon; primary?: boolean; action?: "entries" }[] = [
  { label: "Gerenciar workspaces", icon: LayoutGrid, primary: true },
  { label: "Ver workspaces ativos", icon: PlayCircle },
  { label: "Ver workspaces com falha", icon: AlertTriangle },
  { label: "Entradas de custo", icon: Receipt, action: "entries" },
  { label: "Exportar dados do período", icon: Download },
];

export function QuickAccess({
  periodLabel,
  onOpenCostEntries,
}: {
  periodLabel: string;
  onOpenCostEntries: () => void;
}) {
  return (
    <aside className="card-surface h-fit p-6">
      <h2 className="font-display text-xl font-bold">Acesso rápido</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ações de gestão para {periodLabel}.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() =>
              action.action === "entries"
                ? onOpenCostEntries()
                : toast.info(`${action.label} — ação de demonstração`)
            }
            className={
              action.primary
                ? "flex w-full items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                : "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            }
          >
            <span className="min-w-0 flex-1 truncate text-center">{action.label}</span>
            <action.icon className="size-4 shrink-0" />
          </button>
        ))}
      </div>

    </aside>
  );
}

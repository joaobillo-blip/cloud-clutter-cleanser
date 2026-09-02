import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CLASS_OPTIONS,
  filterEntries,
  formatCurrency,
  formatDateTime,
  periodLabel,
  type CostEntry,
  type Grouping,
  type PeriodFilter,
} from "@/lib/workspace-data";

const GROUPINGS: { value: Grouping; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFilter: PeriodFilter;
  onSelectEntry: (entry: CostEntry) => void;
}

export function CostEntriesDialog({ open, onOpenChange, initialFilter, onSelectEntry }: Props) {
  const [grouping, setGrouping] = useState<Grouping>(initialFilter.grouping);
  const [date, setDate] = useState(initialFilter.date);
  const [className, setClassName] = useState(initialFilter.className);
  const [search, setSearch] = useState("");

  const filter: PeriodFilter = { grouping, date, className };
  const label = periodLabel(filter);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filterEntries(filter)
      .filter((e) => !q || e.workspaceName.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouping, date, className, search]);

  const total = rows.reduce((s, e) => s + e.cost, 0);

  const dateInputType = grouping === "day" ? "date" : grouping === "month" ? "month" : "number";
  const dateInputValue =
    grouping === "day" ? date : grouping === "month" ? date.slice(0, 7) : date.slice(0, 4);

  const onDateChange = (value: string) => {
    if (!value) return;
    if (grouping === "day") setDate(value);
    else if (grouping === "month") setDate(`${value}-01`);
    else setDate(`${value}-01-01`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold">Entradas de custo</DialogTitle>
          <DialogDescription>
            {rows.length} lançamentos em {label} (UTC) · total {formatCurrency(total)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold">Agrupamento</p>
            <div className="inline-flex w-full rounded-lg border border-border p-1">
              {GROUPINGS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGrouping(g.value)}
                  className={`flex-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
                    grouping === g.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold">Período</p>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={dateInputType}
                value={dateInputValue}
                min={grouping === "year" ? 2025 : undefined}
                max={grouping === "year" ? 2026 : undefined}
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold">Turma</p>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar workspace"
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Workspace</th>
                <th className="py-2 pr-3 font-semibold">Data/hora</th>
                <th className="py-2 pr-3 font-semibold">Serviço</th>
                <th className="py-2 pr-3 text-right font-semibold">Custo da entrada</th>
                <th className="py-2 text-right font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-3">
                    <span className="font-medium">{e.workspaceName}</span>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{formatDateTime(e.timestamp)}</td>
                  <td className="py-3 pr-3">{e.service}</td>
                  <td className="py-3 pr-3 text-right font-semibold">
                    {formatCurrency(e.cost, e.currency)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        onOpenChange(false);
                        onSelectEntry(e);
                      }}
                      className="rounded-md border border-border px-3 py-1 text-xs font-semibold hover:bg-accent hover:text-accent-foreground"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nenhuma entrada de custo para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

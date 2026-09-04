import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import {
  costSeries,
  formatCurrency,
  formatDateTime,
  type CostEntry,
  type PeriodFilter,
} from "@/lib/workspace-data";

interface Props {
  entry: CostEntry | null;
  entries: CostEntry[];
  filter: PeriodFilter;
  periodLabel: string;
  canSeeOriginFile: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium">{value}</p>
    </div>
  );
}

export function EntryDetail({
  entry,
  entries,
  filter,
  periodLabel,
  canSeeOriginFile,
  onOpenChange,
}: Props) {
  const wsEntries = entry ? entries.filter((e) => e.workspaceId === entry.workspaceId) : [];
  const series = entry ? costSeries(wsEntries, filter) : [];
  const machines = [...new Set(wsEntries.map((e) => e.machine))];
  const machineSeries = series.map((point, i) => {
    const row: Record<string, string | number> = { bucket: point.bucket };
    for (const m of machines) {
      const forMachine = wsEntries.filter(
        (e) => e.machine === m && costSeries([e], filter)[i]?.cost,
      );
      row[m] = Math.round(forMachine.reduce((s, e) => s + e.cost, 0) * 100) / 100;
    }
    return row;
  });
  const hasData = series.some((s) => s.cost > 0);

  return (
    <Sheet open={!!entry} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        {entry ? (
          <>
            <SheetHeader className="space-y-2">
              <SheetTitle className="font-display text-2xl">{entry.workspaceName}</SheetTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>ID: {entry.workspaceId}</span>
                <span>•</span>
                <span>{entry.className}</span>
                <span>•</span>
                <span>Período: {periodLabel}</span>
              </div>
            </SheetHeader>

            <div className="grid gap-3 px-4 sm:grid-cols-2">
              <Field label="Service" value={entry.service} />
              <Field label="Measured Service" value={entry.measuredService} />
              <Field
                label="Origin File"
                value={
                  canSeeOriginFile ? (
                    <span className="font-mono text-xs">{entry.originFile}</span>
                  ) : (
                    <span className="text-muted-foreground">Restrito ao seu perfil</span>
                  )
                }
              />
              <Field label="Tempo de uso" value={`${entry.usageHours.toFixed(1)} h`} />
              <Field
                label="Custo da entrada"
                value={formatCurrency(entry.cost, entry.currency)}
              />
              <Field label="Data/hora (UTC)" value={formatDateTime(entry.timestamp)} />
            </div>

            <div className="space-y-4 px-4 pb-8">
              <div className="card-surface p-4">
                <h3 className="text-base font-semibold">Custo por Hora vs. Utilização Média</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Custo médio por hora de uso (barras) comparado à utilização média acumulada no
                  período (linha).
                </p>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={hourlySeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="h" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="c" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number, name) =>
                          name === "Custo por hora"
                            ? `${formatCurrency(v)}/h`
                            : `${v.toFixed(1)} h (média)`
                        }
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar
                        yAxisId="c"
                        dataKey="costPerHour"
                        name="Custo por hora"
                        fill="var(--chart-2)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="h"
                        type="monotone"
                        dataKey="avgHours"
                        name="Utilização média"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Sem dados suficientes para montar o gráfico.
                  </p>
                )}
              </div>

              <div className="card-surface p-4">
                <h3 className="text-base font-semibold">Progressão de custo por máquina</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Uma série por configuração de máquina utilizada.
                </p>
                {hasData ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={machineSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {machines.map((m, i) => (
                        <Line
                          key={m}
                          type="monotone"
                          dataKey={m}
                          stroke={`var(--chart-${(i % 5) + 1})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Sem dados suficientes para montar o gráfico.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

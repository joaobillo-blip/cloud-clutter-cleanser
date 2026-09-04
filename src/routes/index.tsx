import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Menu,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { QuickAccess } from "@/components/dashboard/quick-access";
import { EntryDetail } from "@/components/dashboard/entry-detail";
import { CostEntriesDialog } from "@/components/dashboard/cost-entries-dialog";
import {
  CLASS_OPTIONS,
  costSeries,
  filterEntries,
  formatCurrency,
  periodLabel,
  uniqueWorkspaceCount,
  weeklyVariation,
  type CostEntry,
  type Grouping,
  type PeriodFilter,
} from "@/lib/workspace-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestão de Workspaces | Painel de custos e utilização" },
      {
        name: "description",
        content:
          "Painel consolidado de custos e utilização de workspaces: indicadores, evolução de gastos, ranking e entradas de custo detalhadas.",
      },
      { property: "og:title", content: "Gestão de Workspaces" },
      {
        property: "og:description",
        content:
          "Acompanhe a evolução dos gastos, identifique workspaces mais caros e consulte a origem de cada custo.",
      },
    ],
  }),
  component: Dashboard,
});

const GROUPINGS: { value: Grouping; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "month", label: "Mês" },
  { value: "year", label: "Ano" },
];


function Dashboard() {
  const [grouping, setGrouping] = useState<Grouping>("month");
  const [date, setDate] = useState("2026-09-02");
  const [className, setClassName] = useState(CLASS_OPTIONS[0]!);
  const [selected, setSelected] = useState<CostEntry | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);


  const filter: PeriodFilter = { grouping, date, className };
  const label = periodLabel(filter);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["cost-entries", grouping, date, className],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 350));
      return filterEntries(filter);
    },
  });

  const entries = useMemo(() => data ?? [], [data]);
  const totalCost = entries.reduce((s, e) => s + e.cost, 0);
  const totalWorkspaces = uniqueWorkspaceCount(entries);
  const series = costSeries(entries, filter);
  const weekly = weeklyVariation(entries, filter);




  const dateInputType = grouping === "day" ? "date" : grouping === "month" ? "month" : "number";
  const dateInputValue =
    grouping === "day" ? date : grouping === "month" ? date.slice(0, 7) : date.slice(0, 4);

  const onDateChange = (value: string) => {
    if (!value) return;
    if (grouping === "day") setDate(value);
    else if (grouping === "month") setDate(`${value}-01`);
    else setDate(`${value}-01-01`);
  };

  const empty = !isPending && !isError && entries.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card px-4 py-3 sm:px-6">
        <Menu className="size-5 shrink-0 text-muted-foreground" />
        <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold">
          Gestão de Workspaces
        </h1>
        <button className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
          <ArrowLeft className="size-4" /> VOLTAR
        </button>
        <Bell className="size-5 shrink-0 text-muted-foreground" />
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 p-4 sm:p-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        {/* Identificação do usuário */}
        <aside className="card-surface h-fit p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              AI
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Admin de Infraestrutura</p>
              <p className="truncate text-xs text-muted-foreground">(INFRA-OPS)</p>
            </div>
          </div>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-xs">
            <p className="font-semibold">Tenant:</p>
            <p className="text-muted-foreground">eduvora-prod</p>
            <p className="mt-3 font-semibold">Permissões:</p>
            <p className="text-muted-foreground">Custos, Origin File, Gestão</p>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="min-w-0 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Período selecionado — {label} (UTC)
            </p>
            <h2 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
              Painel de Workspaces
            </h2>
          </div>

          {/* Filtros */}
          <section className="card-surface flex flex-wrap items-end gap-4 p-4">
            <div className="min-w-[200px] flex-1">
              <p className="mb-1.5 text-sm font-semibold">Agrupamento</p>
              <div className="inline-flex w-full rounded-lg border border-border p-1">
                {GROUPINGS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => {
                      setGrouping(g.value);
                                    }}
                    className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
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
            <div className="min-w-[180px] flex-1">
              <p className="mb-1.5 text-sm font-semibold">Período</p>
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
            <div className="min-w-[200px] flex-1">
              <p className="mb-1.5 text-sm font-semibold">Turma</p>
              <Select
                value={className}
                onValueChange={(v) => {
                  setClassName(v);
                            }}
              >
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
          </section>

          {isError ? (
            <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
              <TriangleAlert className="size-8 text-destructive" />
              <p className="font-semibold">Falha ao consultar os custos do período.</p>
              <button
                onClick={() => refetch()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <>
              {/* Indicadores */}
              <section className="grid gap-4 sm:grid-cols-2">
                <div className="card-surface p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Boxes className="size-5" />
                    <h3 className="text-lg font-bold">Total de workspaces</h3>
                  </div>
                  {isPending ? (
                    <Skeleton className="mt-3 h-12 w-24" />
                  ) : (
                    <p className="mt-2 font-display text-5xl font-extrabold">{totalWorkspaces}</p>
                  )}
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    Workspaces com lançamentos de custo no período selecionado.
                  </p>
                </div>
                <div className="card-surface p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <CircleDollarSign className="size-5" />
                    <h3 className="text-lg font-bold">Custo do período</h3>
                  </div>
                  {isPending ? (
                    <Skeleton className="mt-3 h-12 w-40" />
                  ) : (
                    <p className="mt-2 font-display text-4xl font-extrabold">
                      {formatCurrency(totalCost)}
                    </p>
                  )}
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    Soma das {entries.length} entradas de custo em {label}. Não representa o custo
                    histórico total dos workspaces.
                  </p>
                </div>
              </section>

              {empty ? (
                <div className="card-surface p-12 text-center">
                  <p className="font-semibold">Nenhum dado no período selecionado.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ajuste o agrupamento, a data ou a turma para visualizar custos.
                  </p>
                </div>
              ) : (
                <>
                  {/* Gráficos */}
                  <section className="grid gap-4">
                    <div className="card-surface p-5">
                      <h3 className="text-lg font-bold">Evolução de custo</h3>
                      <p className="mb-4 text-xs text-muted-foreground">
                        Custo por{" "}
                        {grouping === "day" ? "hora" : grouping === "month" ? "dia" : "mês"} em USD.
                      </p>
                      {isPending ? (
                        <Skeleton className="h-[240px] w-full" />
                      ) : (
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={series}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              formatter={(v: number, n) => [
                                formatCurrency(v),
                                n === "cost" ? "Custo do intervalo" : "Acumulado",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="cost"
                              stroke="var(--chart-1)"
                              strokeWidth={2.5}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="accumulated"
                              stroke="var(--chart-2)"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                  </section>


                  <section className="card-surface p-5">
                    <h3 className="text-lg font-bold">Top custos por workspace</h3>
                    <p className="mb-4 text-xs text-muted-foreground">
                      Oito maiores custos do período, do maior para o menor.
                    </p>
                    {isPending ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ranking} layout="vertical" margin={{ left: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={140}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(v: number, _n, item) => [
                              `${formatCurrency(v)} · ${(item.payload as { hours: number }).hours} h de uso`,
                              "Custo no período",
                            ]}
                          />
                          <Bar dataKey="cost" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </section>

                </>
              )}
            </>
          )}
        </main>

        <QuickAccess periodLabel={label} onOpenCostEntries={() => setEntriesOpen(true)} />
      </div>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        © 2026 — Painel de Gestão de Workspaces · valores em USD · fuso horário UTC
      </footer>

      <EntryDetail
        entry={selected}
        entries={entries}
        filter={filter}
        periodLabel={label}
        canSeeOriginFile
        onOpenChange={(open) => !open && setSelected(null)}
      />

      <CostEntriesDialog
        open={entriesOpen}
        onOpenChange={setEntriesOpen}
        initialFilter={filter}
        onSelectEntry={setSelected}
      />

    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpDown,
  Bell,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Menu,
  Search,
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
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EntryDetail } from "@/components/dashboard/entry-detail";
import { CostEntriesDialog } from "@/components/dashboard/cost-entries-dialog";
import {
  CLASS_OPTIONS,
  STATUS_LABEL,
  costSeries,
  filterEntries,
  formatCurrency,
  formatDateTime,
  periodLabel,
  statusBreakdown,
  topWorkspaces,
  type CostEntry,
  type Grouping,
  type PeriodFilter,
  type WorkspaceStatus,
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


const PAGE_SIZE = 8;

function Dashboard() {
  const [grouping, setGrouping] = useState<Grouping>("month");
  const [date, setDate] = useState("2026-09-02");
  const [className, setClassName] = useState(CLASS_OPTIONS[0]!);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: "timestamp" | "cost"; dir: "asc" | "desc" }>({
    key: "timestamp",
    dir: "desc",
  });
  const [page, setPage] = useState(0);
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
  const breakdown = statusBreakdown(entries);
  const series = costSeries(entries, filter);
  const ranking = topWorkspaces(entries, 8);



  const tableRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = entries.filter((e) => !q || e.workspaceName.toLowerCase().includes(q));
    return rows.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "cost") return (a.cost - b.cost) * dir;
      return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir;
    });
  }, [entries, search, sort]);

  const pageCount = Math.max(1, Math.ceil(tableRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = tableRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: "timestamp" | "cost") =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

  const dateInputType = grouping === "day" ? "date" : grouping === "month" ? "month" : "number";
  const dateInputValue =
    grouping === "day" ? date : grouping === "month" ? date.slice(0, 7) : date.slice(0, 4);

  const onDateChange = (value: string) => {
    if (!value) return;
    if (grouping === "day") setDate(value);
    else if (grouping === "month") setDate(`${value}-01`);
    else setDate(`${value}-01-01`);
    setPage(0);
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
                      setPage(0);
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
                  setPage(0);
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
                    <p className="mt-2 font-display text-5xl font-extrabold">{breakdown.total}</p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-3">
                    {(Object.keys(STATUS_LABEL) as WorkspaceStatus[]).map((s) => (
                      <div key={s}>
                        <p className="text-muted-foreground">{STATUS_LABEL[s]}</p>
                        <p className="font-semibold">{breakdown.counts[s]}</p>
                      </div>
                    ))}
                  </div>
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

                  {/* Entradas de custo */}
                  <section className="card-surface p-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold">Entradas de custo</h3>
                        <p className="text-xs text-muted-foreground">
                          {tableRows.length} lançamentos em {label}
                        </p>
                      </div>
                      <div className="relative w-full max-w-[220px]">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                          }}
                          placeholder="Buscar workspace"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                            <th className="py-2 pr-3 font-semibold">Workspace</th>
                            <th className="py-2 pr-3 font-semibold">
                              <button
                                className="inline-flex items-center gap-1"
                                onClick={() => toggleSort("timestamp")}
                              >
                                Data/hora <ArrowUpDown className="size-3" />
                              </button>
                            </th>
                            <th className="py-2 pr-3 font-semibold">Serviço</th>
                            <th className="py-2 pr-3 text-right font-semibold">
                              <button
                                className="inline-flex items-center gap-1"
                                onClick={() => toggleSort("cost")}
                              >
                                Custo da entrada <ArrowUpDown className="size-3" />
                              </button>
                            </th>
                            <th className="py-2 text-right font-semibold">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pageRows.map((e) => (
                            <tr key={e.id} className="border-b border-border/60 last:border-0">
                              <td className="py-3 pr-3">
                                <button
                                  onClick={() => setSelected(e)}
                                  className="font-medium text-primary hover:underline"
                                >
                                  {e.workspaceName}
                                </button>
                                <div className="mt-1">
                                  <StatusBadge status={e.status} />
                                </div>
                              </td>
                              <td className="py-3 pr-3 text-muted-foreground">
                                {formatDateTime(e.timestamp)}
                              </td>
                              <td className="py-3 pr-3">{e.service}</td>
                              <td className="py-3 pr-3 text-right font-semibold">
                                {formatCurrency(e.cost, e.currency)}
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => setSelected(e)}
                                  className="rounded-md border border-border px-3 py-1 text-xs font-semibold hover:bg-accent hover:text-accent-foreground"
                                >
                                  Visualizar
                                </button>
                              </td>
                            </tr>
                          ))}
                          {pageRows.length === 0 && (
                            <tr>
                              <td colSpan={5} className="py-10 text-center text-muted-foreground">
                                Nenhuma entrada encontrada para a busca.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Página {safePage + 1} de {pageCount}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={safePage === 0}
                          onClick={() => setPage(safePage - 1)}
                          className="rounded-md border border-border p-1.5 disabled:opacity-40"
                        >
                          <ChevronLeft className="size-4" />
                        </button>
                        <button
                          disabled={safePage >= pageCount - 1}
                          onClick={() => setPage(safePage + 1)}
                          className="rounded-md border border-border p-1.5 disabled:opacity-40"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>
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

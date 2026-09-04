export type WorkspaceStatus = "running" | "stopped" | "creating" | "failed" | "removed";

export type Grouping = "day" | "month" | "year";

export interface CostEntry {
  id: string;
  workspaceId: string;
  workspaceName: string;
  status: WorkspaceStatus;
  className: string;
  timestamp: string; // ISO
  service: string;
  measuredService: string;
  originFile: string;
  usageHours: number;
  cost: number;
  currency: "USD";
  machine: string;
}


const SERVICES = [
  ["Compute Engine", "vCPU/hora"],
  ["Cloud Storage", "GB armazenado"],
  ["Networking", "GB trafegado"],
  ["Persistent Disk", "GB/hora"],
  ["GPU Runtime", "GPU/hora"],
] as const;

const MACHINES = ["e2-standard-2", "e2-standard-4", "n2-highmem-4", "t4-gpu-small"];

const CLASSES = [
  "Todas as turmas",
  "ADS 2026.1",
  "Redes 2026.1",
  "Data Science 2025.2",
  "Eng. Software 2026.1",
];

const STATUSES: WorkspaceStatus[] = ["running", "stopped", "creating", "failed", "removed"];

// Deterministic pseudo-random so SSR and client agree.
function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildWorkspaces() {
  const rand = rng(42);
  return Array.from({ length: 34 }, (_, i) => {
    const status = STATUSES[Math.floor(rand() * STATUSES.length)]!;
    return {
      id: `ws-${(1000 + i).toString()}`,
      name: `workspace-${["alfa", "beta", "gama", "delta", "omega", "sigma", "zeta"][i % 7]}-${String(i + 1).padStart(2, "0")}`,
      status,
      className: CLASSES[1 + Math.floor(rand() * (CLASSES.length - 1))]!,
      weight: 0.3 + rand() * 2.2,
      machine: MACHINES[Math.floor(rand() * MACHINES.length)]!,
    };
  });
}

const WORKSPACES = buildWorkspaces();
export const CLASS_OPTIONS = CLASSES;

function buildEntries(): CostEntry[] {
  const rand = rng(7);
  const entries: CostEntry[] = [];
  const end = new Date(Date.UTC(2026, 8, 2, 23, 0, 0));
  const start = new Date(Date.UTC(2025, 8, 1, 0, 0, 0));
  let id = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += 6 * 3600 * 1000) {
    const perTick = 1 + Math.floor(rand() * 3);
    for (let k = 0; k < perTick; k++) {
      const ws = WORKSPACES[Math.floor(rand() * WORKSPACES.length)]!;
      const svc = SERVICES[Math.floor(rand() * SERVICES.length)]!;
      const usageHours = Math.round((0.5 + rand() * 6) * 10) / 10;
      const date = new Date(t + Math.floor(rand() * 6 * 3600 * 1000));
      entries.push({
        id: `ce-${(id++).toString().padStart(5, "0")}`,
        workspaceId: ws.id,
        workspaceName: ws.name,
        status: ws.status,
        className: ws.className,
        timestamp: date.toISOString(),
        service: svc[0],
        measuredService: svc[1],
        originFile: `gs://billing-exports/2026/${date.toISOString().slice(0, 10)}/export-${(id % 9) + 1}.csv`,
        usageHours,
        cost: Math.round(usageHours * ws.weight * (0.4 + rand() * 0.9) * 100) / 100,
        currency: "USD",
        machine: ws.machine,
      });
    }
  }
  return entries;
}

export const ALL_ENTRIES = buildEntries();

export interface PeriodFilter {
  grouping: Grouping;
  /** ISO date string anchoring the period (YYYY-MM-DD) */
  date: string;
  className: string;
}

export function periodRange({ grouping, date }: PeriodFilter) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  if (grouping === "day") {
    const from = new Date(Date.UTC(y, m - 1, d));
    return { from, to: new Date(from.getTime() + 24 * 3600 * 1000) };
  }
  if (grouping === "month") {
    return { from: new Date(Date.UTC(y, m - 1, 1)), to: new Date(Date.UTC(y, m, 1)) };
  }
  return { from: new Date(Date.UTC(y, 0, 1)), to: new Date(Date.UTC(y + 1, 0, 1)) };
}

export function filterEntries(filter: PeriodFilter, entries = ALL_ENTRIES) {
  const { from, to } = periodRange(filter);
  return entries.filter((e) => {
    const t = new Date(e.timestamp).getTime();
    if (t < from.getTime() || t >= to.getTime()) return false;
    if (filter.className !== CLASSES[0] && e.className !== filter.className) return false;
    return true;
  });
}

export function bucketKey(iso: string, grouping: Grouping) {
  const d = new Date(iso);
  if (grouping === "day") return `${String(d.getUTCHours()).padStart(2, "0")}h`;
  if (grouping === "month") return String(d.getUTCDate()).padStart(2, "0");
  return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][
    d.getUTCMonth()
  ]!;
}

export function bucketList(filter: PeriodFilter) {
  const [y, m] = filter.date.split("-").map(Number) as [number, number];
  if (filter.grouping === "day")
    return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}h`);
  if (filter.grouping === "month") {
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, "0"));
  }
  return ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
}

export function costSeries(entries: CostEntry[], filter: PeriodFilter) {
  const buckets = bucketList(filter);
  const map = new Map(buckets.map((b) => [b, { cost: 0, hours: 0 }]));
  for (const e of entries) {
    const k = bucketKey(e.timestamp, filter.grouping);
    const cur = map.get(k);
    if (cur) {
      cur.cost += e.cost;
      cur.hours += e.usageHours;
    }
  }
  let acc = 0;
  return buckets.map((b) => {
    const v = map.get(b)!;
    acc += v.cost;
    return {
      bucket: b,
      cost: Math.round(v.cost * 100) / 100,
      hours: Math.round(v.hours * 10) / 10,
      accumulated: Math.round(acc * 100) / 100,
    };
  });
}

export function uniqueWorkspaceCount(entries: CostEntry[]) {
  return new Set(entries.map((e) => e.workspaceId)).size;
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Custo por semana do período, com variação percentual em relação à semana anterior. */
export function weeklyVariation(entries: CostEntry[], filter: PeriodFilter) {
  const { from, to } = periodRange(filter);
  const weeks: { label: string; cost: number; variation: number | null }[] = [];
  for (let t = from.getTime(); t < to.getTime(); t += WEEK_MS) {
    let cost = 0;
    for (const e of entries) {
      const x = new Date(e.timestamp).getTime();
      if (x >= t && x < t + WEEK_MS) cost += e.cost;
    }
    cost = Math.round(cost * 100) / 100;
    const prev = weeks.length ? weeks[weeks.length - 1]!.cost : null;
    const variation =
      prev !== null && prev > 0 ? Math.round(((cost - prev) / prev) * 1000) / 10 : null;
    const d = new Date(t);
    weeks.push({
      label: `Sem. ${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      cost,
      variation,
    });
  }
  return weeks;
}

export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function periodLabel(filter: PeriodFilter) {
  const { from } = periodRange(filter);
  if (filter.grouping === "day")
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" }).format(from);
  if (filter.grouping === "month")
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(from);
  return String(from.getUTCFullYear());
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  CircleDot,
  Cpu,
  Database,
  Filter,
  Gauge,
  HardDrive,
  LayoutDashboard,
  LineChart as LineChartIcon,
  type LucideIcon,
  Network,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fluxboard — InfluxDB + Grafana Observability" },
      {
        name: "description",
        content:
          "Real-time observability dashboard powered by InfluxDB time-series data and Grafana visualizations.",
      },
      { property: "og:title", content: "Fluxboard — Observability Dashboard" },
      {
        property: "og:description",
        content:
          "Monitor hosts, services, and time-series metrics in one place. InfluxDB + Grafana.",
      },
    ],
  }),
  component: Dashboard,
});

/* ---------------- Sample (example) data ---------------- */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const cpuSeries = (() => {
  const r = seeded(11);
  return Array.from({ length: 60 }, (_, i) => ({
    t: i,
    a: 30 + Math.sin(i / 5) * 12 + r() * 10,
    b: 45 + Math.cos(i / 7) * 14 + r() * 8,
    c: 22 + Math.sin(i / 9 + 1) * 8 + r() * 6,
  }));
})();

const reqSeries = (() => {
  const r = seeded(3);
  return Array.from({ length: 48 }, (_, i) => ({
    t: i,
    v: 800 + Math.sin(i / 4) * 220 + r() * 180,
  }));
})();

const latencyBars = (() => {
  const r = seeded(7);
  return Array.from({ length: 24 }, (_, i) => ({
    h: i,
    p50: 40 + r() * 30,
    p95: 120 + r() * 80,
    p99: 220 + r() * 140,
  }));
})();

const hosts = [
  { name: "edge-eu-01", region: "fra", cpu: 78, mem: 64, disk: 41, net: "1.2 GB/s", status: "ok", uptime: "42d" },
  { name: "edge-eu-02", region: "ams", cpu: 54, mem: 49, disk: 38, net: "880 MB/s", status: "ok", uptime: "42d" },
  { name: "api-us-01", region: "iad", cpu: 91, mem: 82, disk: 71, net: "2.4 GB/s", status: "warn", uptime: "11d" },
  { name: "api-us-02", region: "sfo", cpu: 33, mem: 41, disk: 28, net: "640 MB/s", status: "ok", uptime: "42d" },
  { name: "worker-ap-01", region: "sin", cpu: 67, mem: 73, disk: 55, net: "1.1 GB/s", status: "ok", uptime: "8d" },
  { name: "db-primary", region: "fra", cpu: 88, mem: 91, disk: 84, net: "3.2 GB/s", status: "crit", uptime: "112d" },
  { name: "db-replica-1", region: "ams", cpu: 41, mem: 58, disk: 80, net: "1.8 GB/s", status: "ok", uptime: "112d" },
  { name: "cache-eu", region: "fra", cpu: 22, mem: 38, disk: 12, net: "420 MB/s", status: "ok", uptime: "63d" },
];

const alerts = [
  { sev: "crit", title: "db-primary disk > 80%", source: "telegraf.disk", time: "2m" },
  { sev: "warn", title: "api-us-01 CPU sustained > 90%", source: "telegraf.cpu", time: "7m" },
  { sev: "warn", title: "5xx rate spike on /checkout", source: "nginx.http", time: "14m" },
  { sev: "info", title: "Retention policy rolled over (7d)", source: "influxd", time: "1h" },
];

const measurements = [
  { name: "cpu", series: 248, points: "1.2M", icon: Cpu },
  { name: "mem", series: 248, points: "1.2M", icon: Activity },
  { name: "disk", series: 1024, points: "4.8M", icon: HardDrive },
  { name: "net", series: 512, points: "2.4M", icon: Network },
  { name: "http", series: 192, points: "880K", icon: Wifi },
  { name: "db_query", series: 64, points: "320K", icon: Database },
];

/* ---------------- Layout ---------------- */

function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TopBar />
          <main className="px-6 py-6 space-y-6">
            <PageHeader />
            <KpiRow />
            <div className="grid grid-cols-12 gap-6">
              <CpuChartCard />
              <GaugesCard />
            </div>
            <div className="grid grid-cols-12 gap-6">
              <RequestsCard />
              <LatencyCard />
            </div>
            <div className="grid grid-cols-12 gap-6">
              <HostsTable />
              <AlertsPanel />
            </div>
            <MeasurementsExplorer />
            <QueryConsole />
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar ---------------- */

function Sidebar() {
  const nav: { label: string; icon: LucideIcon; active?: boolean; badge?: string }[] = [
    { label: "Overview", icon: LayoutDashboard, active: true },
    { label: "Explore", icon: LineChartIcon },
    { label: "Dashboards", icon: Gauge, badge: "12" },
    { label: "Alerts", icon: Bell, badge: "3" },
    { label: "Data Sources", icon: Database },
    { label: "Tasks & Flux", icon: Sparkles },
    { label: "Users", icon: Users },
    { label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card/40 min-h-screen sticky top-0">
      <div className="h-14 flex items-center gap-2 px-5 border-b border-border">
        <div className="size-7 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
          <Activity className="size-4 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Fluxboard</div>
          <div className="text-[10px] text-muted-foreground font-mono tracking-wider">INFLUXDB · GRAFANA</div>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-0.5">
        {nav.map((n) => (
          <button
            key={n.label}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              n.active
                ? "bg-primary/15 text-foreground border border-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <n.icon className="size-4" />
            <span className="flex-1 text-left">{n.label}</span>
            {n.badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {n.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 border-t border-border">
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs">
            <CircleDot className="size-3 text-success" />
            <span className="font-medium">Cluster healthy</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground font-mono">
            influxd 2.7 · 3 nodes
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-background overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-primary to-accent" />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>storage</span>
            <span>72% / 4TB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------- Top bar ---------------- */

function TopBar() {
  return (
    <header className="h-14 sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur flex items-center gap-4 px-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span>workspace</span>
        <span className="text-foreground/40">/</span>
        <span className="text-foreground">acme-prod</span>
        <span className="text-foreground/40">/</span>
        <span className="text-foreground">overview</span>
      </div>

      <div className="flex-1 max-w-md ml-4">
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search metrics, hosts, dashboards…"
            className="w-full h-9 rounded-md bg-muted/40 border border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-muted/40 border border-border text-xs font-mono hover:bg-muted/60">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          live · 5s
          <ChevronDown className="size-3" />
        </button>
        <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-muted/40 border border-border text-xs hover:bg-muted/60">
          <RefreshCw className="size-3.5" />
          Last 1h
          <ChevronDown className="size-3" />
        </button>
        <button className="size-9 grid place-items-center rounded-md bg-muted/40 border border-border hover:bg-muted/60 relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
        </button>
        <div className="size-9 rounded-full bg-gradient-to-br from-accent to-primary grid place-items-center text-xs font-semibold text-primary-foreground">
          AK
        </div>
      </div>
    </header>
  );
}

/* ---------------- Page header ---------------- */

function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Production overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Time-series telemetry streaming from{" "}
          <span className="font-mono text-foreground">telegraf</span> into{" "}
          <span className="font-mono text-foreground">influxdb://acme-prod</span>, rendered with
          Grafana panels.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Tab active>Overview</Tab>
        <Tab>Infrastructure</Tab>
        <Tab>Application</Tab>
        <Tab>Network</Tab>
        <div className="w-px h-6 bg-border mx-1" />
        <button className="h-9 px-3 rounded-md bg-muted/40 border border-border text-xs flex items-center gap-2 hover:bg-muted/60">
          <Filter className="size-3.5" /> Filter
        </button>
        <button className="h-9 px-3 rounded-md bg-muted/40 border border-border text-xs flex items-center gap-2 hover:bg-muted/60">
          <Share2 className="size-3.5" /> Share
        </button>
        <button className="h-9 px-3 rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-medium flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="size-3.5" /> New panel
        </button>
      </div>
    </div>
  );
}

function Tab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`h-9 px-3 rounded-md text-xs font-medium transition-colors ${
        active
          ? "bg-primary/15 text-foreground border border-primary/30"
          : "text-muted-foreground hover:text-foreground border border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------------- KPI Row ---------------- */

function KpiRow() {
  const kpis = [
    { label: "Series active", value: "12,488", delta: "+2.4%", up: true, icon: Activity, color: "from-primary to-accent" },
    { label: "Writes / sec", value: "84.2K", delta: "+11.8%", up: true, icon: Zap, color: "from-accent to-info" },
    { label: "Query p95", value: "182 ms", delta: "-6.1%", up: false, good: true, icon: Gauge, color: "from-info to-primary" },
    { label: "Open alerts", value: "3", delta: "+1", up: true, good: false, icon: AlertTriangle, color: "from-warning to-destructive" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
        >
          <div className={`absolute -top-12 -right-12 size-36 rounded-full bg-gradient-to-br ${k.color} opacity-15 blur-2xl`} />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                {k.label}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">{k.value}</div>
            </div>
            <div className={`size-9 grid place-items-center rounded-lg bg-gradient-to-br ${k.color} text-primary-foreground`}>
              <k.icon className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono ${
                (k.good ?? k.up)
                  ? "text-success bg-success/10"
                  : "text-destructive bg-destructive/10"
              }`}
            >
              {k.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {k.delta}
            </span>
            <span className="text-muted-foreground">vs. last hour</span>
          </div>
          <Sparkline className="mt-3" seed={k.label.length + 4} accent={k.good === false ? "destructive" : "primary"} />
        </div>
      ))}
    </div>
  );
}

function Sparkline({ className = "", seed = 1, accent = "primary" }: { className?: string; seed?: number; accent?: "primary" | "destructive" }) {
  const pts = useMemo(() => {
    const r = seeded(seed * 13);
    return Array.from({ length: 32 }, (_, i) => 20 + Math.sin(i / 3 + seed) * 8 + r() * 10);
  }, [seed]);
  const w = 200, h = 36;
  const max = Math.max(...pts), min = Math.min(...pts);
  const d = pts
    .map((v, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = accent === "destructive" ? "var(--color-destructive)" : "var(--color-primary)";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full h-9 ${className}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sp-${seed}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sp-${seed})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

/* ---------------- CPU multi-line chart ---------------- */

function CpuChartCard() {
  return (
    <Card className="col-span-12 xl:col-span-8">
      <CardHeader
        title="CPU usage by host"
        subtitle="from(bucket: &quot;telegraf&quot;) |> range(start: -1h) |> filter(fn: (r) =&gt; r._measurement == &quot;cpu&quot;)"
        right={
          <div className="flex items-center gap-3 text-xs">
            <LegendDot color="var(--color-chart-1)" label="api-us-01" />
            <LegendDot color="var(--color-chart-2)" label="edge-eu-01" />
            <LegendDot color="var(--color-chart-3)" label="worker-ap-01" />
          </div>
        }
      />
      <div className="px-5 pb-5">
        <MultiLineChart data={cpuSeries} />
      </div>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="size-2 rounded-full" style={{ background: color }} />
      <span className="font-mono">{label}</span>
    </span>
  );
}

function MultiLineChart({ data }: { data: { t: number; a: number; b: number; c: number }[] }) {
  const w = 800, h = 260, pad = { l: 36, r: 12, t: 12, b: 24 };
  const xs = data.map((d) => d.t);
  const ys = data.flatMap((d) => [d.a, d.b, d.c]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0, yMax = Math.max(100, Math.max(...ys));
  const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const sy = (y: number) => pad.t + (1 - (y - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);
  const line = (key: "a" | "b" | "c") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d.t).toFixed(1)},${sy(d[key]).toFixed(1)}`).join(" ");

  const gridY = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[260px]">
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={sy(g)} y2={sy(g)} stroke="var(--color-grid)" strokeDasharray="2 4" />
          <text x={pad.l - 6} y={sy(g) + 3} textAnchor="end" fontSize="10" fill="var(--color-muted-foreground)" fontFamily="JetBrains Mono">
            {g}%
          </text>
        </g>
      ))}
      {[0, 15, 30, 45, 60].map((t) => (
        <text key={t} x={sx(t)} y={h - 6} textAnchor="middle" fontSize="10" fill="var(--color-muted-foreground)" fontFamily="JetBrains Mono">
          {60 - t}m
        </text>
      ))}
      <path d={`${line("a")} L${sx(xMax)},${sy(0)} L${sx(xMin)},${sy(0)} Z`} fill="url(#ga)" />
      <path d={line("a")} fill="none" stroke="var(--color-chart-1)" strokeWidth="2" />
      <path d={line("b")} fill="none" stroke="var(--color-chart-2)" strokeWidth="2" />
      <path d={line("c")} fill="none" stroke="var(--color-chart-3)" strokeWidth="2" />
    </svg>
  );
}

/* ---------------- Gauges ---------------- */

function GaugesCard() {
  return (
    <Card className="col-span-12 xl:col-span-4">
      <CardHeader title="System pressure" subtitle="Aggregated across cluster" />
      <div className="grid grid-cols-2 gap-4 px-5 pb-5">
        <Gauge2 value={72} label="CPU" color="var(--color-chart-1)" />
        <Gauge2 value={64} label="Memory" color="var(--color-chart-2)" />
        <Gauge2 value={41} label="Disk I/O" color="var(--color-chart-3)" />
        <Gauge2 value={88} label="Network" color="var(--color-chart-4)" />
      </div>
    </Card>
  );
}

function Gauge2({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 42, c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c * 0.75;
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-muted/30 border border-border p-4">
      <svg viewBox="0 0 110 110" className="size-28 -rotate-[225deg]">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--color-border)" strokeWidth="8" strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" />
        <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${c * 0.75} ${c}`} strokeDashoffset={offset - c * 0.25} strokeLinecap="round" />
      </svg>
      <div className="-mt-16 text-center">
        <div className="text-2xl font-semibold tracking-tight">{value}<span className="text-muted-foreground text-sm">%</span></div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

/* ---------------- Requests area chart ---------------- */

function RequestsCard() {
  return (
    <Card className="col-span-12 xl:col-span-7">
      <CardHeader
        title="HTTP requests / sec"
        subtitle="measurement: nginx.http · group by: status"
        right={<MiniStat label="now" value="1,284 rps" />}
      />
      <div className="px-5 pb-5">
        <AreaChart data={reqSeries} />
      </div>
    </Card>
  );
}

function AreaChart({ data }: { data: { t: number; v: number }[] }) {
  const w = 800, h = 220, pad = { l: 36, r: 12, t: 12, b: 24 };
  const xs = data.map((d) => d.t);
  const ys = data.map((d) => d.v);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0, yMax = Math.max(...ys) * 1.1;
  const sx = (x: number) => pad.l + ((x - xMin) / (xMax - xMin)) * (w - pad.l - pad.r);
  const sy = (y: number) => pad.t + (1 - (y - yMin) / (yMax - yMin)) * (h - pad.t - pad.b);
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d.t).toFixed(1)},${sy(d.v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px]">
      <defs>
        <linearGradient id="ar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((p) => {
        const y = pad.t + p * (h - pad.t - pad.b);
        const v = Math.round(yMax * (1 - p));
        return (
          <g key={p}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="var(--color-grid)" strokeDasharray="2 4" />
            <text x={pad.l - 6} y={y + 3} textAnchor="end" fontSize="10" fill="var(--color-muted-foreground)" fontFamily="JetBrains Mono">
              {v}
            </text>
          </g>
        );
      })}
      <path d={`${path} L${sx(xMax)},${sy(0)} L${sx(xMin)},${sy(0)} Z`} fill="url(#ar)" />
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
    </svg>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</div>
      <div className="text-sm font-semibold font-mono">{value}</div>
    </div>
  );
}

/* ---------------- Latency bars ---------------- */

function LatencyCard() {
  return (
    <Card className="col-span-12 xl:col-span-5">
      <CardHeader title="Latency distribution" subtitle="p50 / p95 / p99 · last 24h" />
      <div className="px-5 pb-5">
        <BarChart data={latencyBars} />
        <div className="mt-3 flex items-center gap-4 text-xs">
          <LegendDot color="var(--color-chart-3)" label="p50" />
          <LegendDot color="var(--color-chart-4)" label="p95" />
          <LegendDot color="var(--color-chart-5)" label="p99" />
        </div>
      </div>
    </Card>
  );
}

function BarChart({ data }: { data: { h: number; p50: number; p95: number; p99: number }[] }) {
  const w = 560, h = 220, pad = { l: 32, r: 8, t: 12, b: 22 };
  const max = Math.max(...data.map((d) => d.p99)) * 1.1;
  const bw = (w - pad.l - pad.r) / data.length;
  const sy = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px]">
      {[0, 0.5, 1].map((p) => (
        <line key={p} x1={pad.l} x2={w - pad.r} y1={pad.t + p * (h - pad.t - pad.b)} y2={pad.t + p * (h - pad.t - pad.b)} stroke="var(--color-grid)" strokeDasharray="2 4" />
      ))}
      {data.map((d, i) => {
        const x = pad.l + i * bw + 2;
        const innerW = (bw - 6) / 3;
        return (
          <g key={i}>
            <rect x={x} y={sy(d.p50)} width={innerW} height={h - pad.b - sy(d.p50)} fill="var(--color-chart-3)" opacity="0.9" rx="1" />
            <rect x={x + innerW + 1} y={sy(d.p95)} width={innerW} height={h - pad.b - sy(d.p95)} fill="var(--color-chart-4)" opacity="0.9" rx="1" />
            <rect x={x + 2 * (innerW + 1)} y={sy(d.p99)} width={innerW} height={h - pad.b - sy(d.p99)} fill="var(--color-chart-5)" opacity="0.9" rx="1" />
            {i % 4 === 0 && (
              <text x={x + (bw - 6) / 2} y={h - 6} textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)" fontFamily="JetBrains Mono">
                {d.h}h
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- Hosts table ---------------- */

function HostsTable() {
  const statusStyle = {
    ok: "bg-success/15 text-success border-success/30",
    warn: "bg-warning/15 text-warning border-warning/30",
    crit: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;

  return (
    <Card className="col-span-12 xl:col-span-8">
      <CardHeader
        title="Hosts"
        subtitle={`${hosts.length} hosts reporting · telegraf agent v1.30`}
        right={
          <div className="flex items-center gap-1 text-xs">
            <button className="px-2 py-1 rounded bg-muted/40 border border-border font-mono">all</button>
            <button className="px-2 py-1 rounded text-muted-foreground hover:bg-muted/30 font-mono">eu</button>
            <button className="px-2 py-1 rounded text-muted-foreground hover:bg-muted/30 font-mono">us</button>
            <button className="px-2 py-1 rounded text-muted-foreground hover:bg-muted/30 font-mono">ap</button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-mono border-y border-border bg-muted/20">
              <th className="px-5 py-2">Host</th>
              <th className="px-3 py-2">Region</th>
              <th className="px-3 py-2 w-40">CPU</th>
              <th className="px-3 py-2 w-40">Mem</th>
              <th className="px-3 py-2 w-40">Disk</th>
              <th className="px-3 py-2">Net</th>
              <th className="px-3 py-2">Uptime</th>
              <th className="px-3 py-2 pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {hosts.map((h, i) => (
              <tr key={h.name} className={`border-b border-border last:border-0 hover:bg-muted/20 ${i % 2 ? "bg-background/40" : ""}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${h.status === "ok" ? "bg-success" : h.status === "warn" ? "bg-warning" : "bg-destructive"}`} />
                    <span className="font-mono">{h.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground uppercase text-xs">{h.region}</td>
                <td className="px-3 py-3"><Meter v={h.cpu} /></td>
                <td className="px-3 py-3"><Meter v={h.mem} /></td>
                <td className="px-3 py-3"><Meter v={h.disk} /></td>
                <td className="px-3 py-3 font-mono text-xs">{h.net}</td>
                <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{h.uptime}</td>
                <td className="px-3 py-3 pr-5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${statusStyle[h.status as keyof typeof statusStyle]}`}>
                    {h.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Meter({ v }: { v: number }) {
  const color = v > 85 ? "bg-destructive" : v > 70 ? "bg-warning" : "bg-gradient-to-r from-primary to-accent";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-mono w-9 text-right">{v}%</span>
    </div>
  );
}

/* ---------------- Alerts ---------------- */

function AlertsPanel() {
  const sevStyle = {
    crit: { dot: "bg-destructive", chip: "text-destructive bg-destructive/10 border-destructive/30" },
    warn: { dot: "bg-warning", chip: "text-warning bg-warning/10 border-warning/30" },
    info: { dot: "bg-info", chip: "text-info bg-info/10 border-info/30" },
  } as const;
  return (
    <Card className="col-span-12 xl:col-span-4">
      <CardHeader
        title="Active alerts"
        subtitle="Rule engine: kapacitor"
        right={
          <button className="text-xs text-muted-foreground hover:text-foreground font-mono">view all</button>
        }
      />
      <ul className="px-3 pb-4 space-y-1">
        {alerts.map((a) => {
          const s = sevStyle[a.sev as keyof typeof sevStyle];
          return (
            <li key={a.title} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <span className={`mt-1.5 size-2 rounded-full ${s.dot} shrink-0 shadow-[0_0_0_4px] shadow-current/10`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${s.chip}`}>{a.sev}</span>
                  <span className="text-xs text-muted-foreground font-mono">{a.time} ago</span>
                </div>
                <div className="mt-1 text-sm">{a.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{a.source}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- Measurements explorer ---------------- */

function MeasurementsExplorer() {
  return (
    <Card>
      <CardHeader
        title="Measurements"
        subtitle="Bucket: telegraf · retention 7d"
        right={
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Tag className="size-3.5" /> 18 tags · 6 measurements
          </div>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 px-5 pb-5">
        {measurements.map((m) => (
          <div key={m.name} className="group rounded-lg border border-border bg-muted/20 p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <m.icon className="size-4 text-accent" />
              <span className="text-[10px] font-mono text-muted-foreground">_measurement</span>
            </div>
            <div className="mt-3 text-lg font-mono">{m.name}</div>
            <div className="mt-2 flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>{m.series} series</span>
              <span>{m.points} pts</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- Query console ---------------- */

function QueryConsole() {
  return (
    <Card>
      <CardHeader
        title="Flux query console"
        subtitle="Run ad-hoc queries against the active bucket"
        right={
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded-md bg-muted/40 border border-border text-xs font-mono">format</button>
            <button className="h-8 px-3 rounded-md bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-medium flex items-center gap-1.5">
              <Zap className="size-3.5" /> Run
            </button>
          </div>
        }
      />
      <div className="mx-5 mb-5 rounded-lg border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30">
          <span className="size-2.5 rounded-full bg-destructive/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          <span className="ml-3 text-[11px] text-muted-foreground font-mono">query.flux</span>
        </div>
        <pre className="px-4 py-4 text-[12.5px] leading-6 font-mono overflow-x-auto">
<span className="text-muted-foreground">{`// Top 5 hosts by CPU over last 15m`}</span>{`\n`}
<span className="text-accent">from</span>{`(bucket: `}<span className="text-success">{`"telegraf"`}</span>{`)\n`}
{`  |> `}<span className="text-accent">range</span>{`(start: -15m)\n`}
{`  |> `}<span className="text-accent">filter</span>{`(fn: (r) => r._measurement == `}<span className="text-success">{`"cpu"`}</span>{` and r._field == `}<span className="text-success">{`"usage_user"`}</span>{`)\n`}
{`  |> `}<span className="text-accent">group</span>{`(columns: [`}<span className="text-success">{`"host"`}</span>{`])\n`}
{`  |> `}<span className="text-accent">mean</span>{`()\n`}
{`  |> `}<span className="text-accent">sort</span>{`(columns: [`}<span className="text-success">{`"_value"`}</span>{`], desc: true)\n`}
{`  |> `}<span className="text-accent">limit</span>{`(n: 5)`}
        </pre>
        <div className="px-4 py-2 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <span>executed in 184ms · 5 rows · 12 series scanned</span>
          <span>shard: 2026-06-26</span>
        </div>
      </div>
    </Card>
  );
}

/* ---------------- Primitives ---------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-border bg-card ${className}`}>
      {children}
    </section>
  );
}

function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && (
          <p
            className="mt-0.5 text-[11px] text-muted-foreground font-mono truncate"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

function Footer() {
  return (
    <div className="pt-2 pb-6 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono">
      <span>
        © Fluxboard · Built on InfluxDB 2.7 · Grafana 11.1
      </span>
      <span className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1"><CircleDot className="size-3 text-success" /> ingest healthy</span>
        <span>org: acme · bucket: telegraf</span>
      </span>
    </div>
  );
}

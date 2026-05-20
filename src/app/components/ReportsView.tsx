import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Award, Target, DollarSign, Users } from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import { statusLabel, type Lead, type LeadStatus, type SourcePlatform, SALES_REPS } from "../lib/leads/types";
import { cn } from "./ui/utils";

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];

const SOURCES: SourcePlatform[] = ["Website", "Facebook", "Twitter", "Google", "Offline Event"];

const STATUS_ORDER: LeadStatus[] = [
  "new", "contacted", "qualified", "test_drive", "negotiating", "won", "not_interested",
];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-medium">
              {entry.name === 'revenue' || entry.name === 'Revenue'
                ? `$${(entry.value / 1000000).toFixed(2)}M`
                : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-gray-600">Leads: <span className="font-semibold text-indigo-600">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ label, value, sub, positive, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-xl font-semibold text-gray-900 mt-0.5 leading-none">{value}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {positive !== undefined && (
              positive
                ? <TrendingUp className="w-3 h-3 text-green-500" />
                : <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={cn("text-xs", positive ? "text-green-600" : positive === false ? "text-red-600" : "text-gray-400")}>
              {sub}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsView() {
  const { leads } = useLeads();

  // ── KPI metrics computed from live data ──
  const kpis = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((l) => l.status === "won");
    const lost = leads.filter((l) => l.status === "not_interested");
    const wonRevenue = won.reduce((s, l) => s + l.budget, 0);
    const avgDeal = won.length > 0 ? wonRevenue / won.length : 0;
    const activeLeads = leads.filter(
      (l) => l.status !== "won" && l.status !== "not_interested",
    );
    const pipelineValue = activeLeads.reduce((s, l) => s + l.budget, 0);

    return { total, won: won.length, lost: lost.length, wonRevenue, avgDeal, pipelineValue };
  }, [leads]);

  // ── Monthly leads & won chart (last 6 months) ──
  const monthlyLeadsData = useMemo(() => {
    const now = new Date();
    const data: { month: string; leads: number; won: number; lost: number }[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);

      const leadsInMonth = leads.filter((l) => {
        const t = Date.parse(l.created_at);
        return t >= mStart.getTime() && t <= mEnd.getTime();
      });

      data.push({
        month: monthDate.toLocaleDateString(undefined, { month: "short" }),
        leads: leadsInMonth.length,
        won: leadsInMonth.filter((l) => l.status === "won").length,
        lost: leadsInMonth.filter((l) => l.status === "not_interested").length,
      });
    }
    return data;
  }, [leads]);

  // ── Source distribution ──
  const sourceData = useMemo(() => {
    return SOURCES.map((src) => ({
      source: src,
      count: leads.filter((l) => l.source_platform === src).length,
    }));
  }, [leads]);

  // ── Conversion funnel ──
  const conversionFunnel = useMemo(() => {
    const total = leads.length;
    const contactedPlus = leads.filter((l) => l.status !== "new").length;
    const qualifiedPlus = leads.filter((l) =>
      ["qualified", "test_drive", "negotiating", "won"].includes(l.status),
    ).length;
    const testDrivePlus = leads.filter((l) =>
      ["test_drive", "negotiating", "won"].includes(l.status),
    ).length;
    const negotiatingPlus = leads.filter((l) =>
      ["negotiating", "won"].includes(l.status),
    ).length;
    const won = leads.filter((l) => l.status === "won").length;

    const stages = [
      { stage: "Total Leads", count: total },
      { stage: "Contacted", count: contactedPlus },
      { stage: "Qualified", count: qualifiedPlus },
      { stage: "Test Drive", count: testDrivePlus },
      { stage: "Negotiating", count: negotiatingPlus },
      { stage: "Won", count: won },
    ];

    return stages.map((s) => ({
      ...s,
      pct: total > 0 ? Math.round((s.count / total) * 100) : 0,
    }));
  }, [leads]);

  // ── Team leaderboard ──
  const teamPerformance = useMemo(() => {
    return SALES_REPS.map((rep) => {
      const repLeads = leads.filter((l) => l.assigned_to === rep.name);
      const wonLeads = repLeads.filter((l) => l.status === "won");
      return {
        rep: rep.name,
        leads: repLeads.length,
        won: wonLeads.length,
        revenue: wonLeads.reduce((s, l) => s + l.budget, 0),
        initials: rep.initials,
        color: rep.color,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [leads]);

  // ── Revenue per month (proxy: won lead budget by created month) ──
  const revenueByMonth = useMemo(() => {
    const now = new Date();
    const data: { month: string; revenue: number; deals: number }[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = startOfMonth(monthDate);
      const mEnd = endOfMonth(monthDate);

      const wonInMonth = leads.filter((l) => {
        if (l.status !== "won") return false;
        const t = Date.parse(l.created_at);
        return t >= mStart.getTime() && t <= mEnd.getTime();
      });

      data.push({
        month: monthDate.toLocaleDateString(undefined, { month: "short" }),
        revenue: wonInMonth.reduce((s, l) => s + l.budget, 0),
        deals: wonInMonth.length,
      });
    }
    return data;
  }, [leads]);

  const overallConversion = kpis.total > 0 ? ((kpis.won / kpis.total) * 100).toFixed(1) : "0";

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`$${(kpis.wonRevenue / 1000).toFixed(0)}k`}
            sub={`${kpis.won} deals closed`}
            positive={kpis.won > 0}
            icon={DollarSign}
            color="bg-green-50 text-green-600"
          />
          <MetricCard
            label="Deals Closed"
            value={String(kpis.won)}
            sub={`of ${kpis.total} total leads`}
            positive={kpis.won > 0}
            icon={Award}
            color="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            label="Avg. Deal Size"
            value={kpis.avgDeal > 0 ? `$${(kpis.avgDeal / 1000).toFixed(1)}k` : "$0"}
            sub={kpis.won > 0 ? "Per closed deal" : "No closed deals yet"}
            icon={Target}
            color="bg-amber-50 text-amber-600"
          />
          <MetricCard
            label="Active Pipeline"
            value={`$${(kpis.pipelineValue / 1000).toFixed(0)}k`}
            sub={`${kpis.total - kpis.won - kpis.lost} leads in pipeline`}
            icon={Users}
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* Revenue + Leads Source Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Monthly Revenue</h3>
              <p className="text-xs text-gray-500 mt-0.5">Closed deal value per month (live data)</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueByMonth} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v > 0 ? `$${(v / 1000).toFixed(0)}k` : '0'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Leads Source Pie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Lead Source Distribution</h3>
              <p className="text-xs text-gray-500 mt-0.5">Where your leads come from (live)</p>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="source"
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {sourceData.map((item, i) => {
                  const totalCount = sourceData.reduce((s, d) => s + d.count, 0);
                  return (
                    <div key={item.source} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 flex-1">{item.source}</span>
                      <span className="text-xs font-semibold text-gray-900">{item.count}</span>
                      <span className="text-xs text-gray-400 w-8 text-right">
                        {totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel + Team */}
        <div className="grid grid-cols-2 gap-4">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Conversion Funnel</h3>
              <p className="text-xs text-gray-500 mt-0.5">Lead to close pipeline breakdown (live)</p>
            </div>
            <div className="space-y-2">
              {conversionFunnel.map((stage, i) => {
                const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500'];
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{stage.pct}%</span>
                        <span className="text-xs font-semibold text-gray-900 w-8 text-right">{stage.count}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", colors[i])}
                        style={{ width: `${stage.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Overall Conversion Rate</span>
                <span className="text-sm font-bold text-green-600">{overallConversion}%</span>
              </div>
            </div>
          </div>

          {/* Team Leaderboard */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Sales Leaderboard</h3>
              <p className="text-xs text-gray-500 mt-0.5">Top performers (live data)</p>
            </div>
            <div className="space-y-3">
              {teamPerformance.map((rep, i) => (
                <div key={rep.rep} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  i === 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
                )}>
                  <div className="w-6 text-center">
                    {i === 0 ? (
                      <Award className="w-4 h-4 text-amber-500 mx-auto" />
                    ) : (
                      <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                    )}
                  </div>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold", rep.color)}>
                    {rep.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{rep.rep}</p>
                    <p className="text-xs text-gray-400">{rep.leads} leads · {rep.won} won</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${(rep.revenue / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-gray-400">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Deals Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900">Monthly Lead Volume vs Deals Closed</h3>
            <p className="text-xs text-gray-500 mt-0.5">6-month comparison overview (live data)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyLeadsData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
              />
              <Bar dataKey="leads" name="Total Leads" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="won" name="Won" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="lost" name="Lost" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

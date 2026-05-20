import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Calendar,
  GitBranch,
  Mail,
  Phone,
  Plus,
  StickyNote,
  TrendingUp,
  Users,
} from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import { statusLabel, type Lead, type SourcePlatform } from "../lib/leads/types";
import { cn } from "./ui/utils";

const SOURCES: SourcePlatform[] = ["Website", "Facebook", "Twitter", "Google", "Offline Event"];

type RangeFilter = 7 | 30 | 90;

const STATUS_ORDER: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "test_drive",
  "negotiating",
  "won",
  "not_interested",
];

function inLastDays(isoDate: string, days: RangeFilter) {
  const date = Date.parse(isoDate);
  if (Number.isNaN(date)) return false;
  return Date.now() - date <= days * 86400000;
}

function formatShortDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
        <span>{sub}</span>
      </div>
    </div>
  );
}

interface DashboardProps {
  onViewLeads: () => void;
  onViewPipeline: () => void;
}

export function Dashboard({ onViewLeads, onViewPipeline }: DashboardProps) {
  const { leads, activities, connectionMode } = useLeads();

  const [range, setRange] = useState<RangeFilter>(30);
  const [source, setSource] = useState<SourcePlatform | "all">("all");
  const [rep, setRep] = useState<string | "all">("all");

  const reps = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.assigned_to))).sort((a, b) => a.localeCompare(b)),
    [leads],
  );

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const byRange = inLastDays(lead.created_at, range);
      const bySource = source === "all" || lead.source_platform === source;
      const byRep = rep === "all" || lead.assigned_to === rep;
      return byRange && bySource && byRep;
    });
  }, [leads, range, source, rep]);

  const kpis = useMemo(() => {
    const total = filteredLeads.length;
    const newLeads = filteredLeads.filter((lead) => lead.status === "new").length;
    const won = filteredLeads.filter((lead) => lead.status === "won").length;
    const conversion = total > 0 ? (won / total) * 100 : 0;
    const pipelineValue = filteredLeads
      .filter((lead) => lead.status !== "won" && lead.status !== "not_interested")
      .reduce((sum, lead) => sum + lead.budget, 0);

    return {
      total,
      newLeads,
      conversion,
      pipelineValue,
    };
  }, [filteredLeads]);

  const sourceData = useMemo(() => {
    return SOURCES.map((item) => ({
      source: item,
      count: filteredLeads.filter((lead) => lead.source_platform === item).length,
    }));
  }, [filteredLeads]);

  const pipelineData = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      name: statusLabel[status],
      count: filteredLeads.filter((lead) => lead.status === status).length,
    }));
  }, [filteredLeads]);

  const monthlyLeadsData = useMemo(() => {
    const now = new Date();
    const data: { month: string; leads: number; won: number }[] = [];

    for (let index = 5; index >= 0; index -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const leadsInMonth = leads.filter((lead) => {
        const createdAt = Date.parse(lead.created_at);
        return createdAt >= monthStart.getTime() && createdAt <= monthEnd.getTime();
      });

      const wonInMonth = leadsInMonth.filter((lead) => lead.status === "won").length;

      data.push({
        month: monthDate.toLocaleDateString(undefined, { month: "short" }),
        leads: leadsInMonth.length,
        won: wonInMonth,
      });
    }

    return data;
  }, [leads]);

  const teamPerformance = useMemo(() => {
    return reps
      .map((name) => {
        const repLeads = filteredLeads.filter((lead) => lead.assigned_to === name);
        const wonLeads = repLeads.filter((lead) => lead.status === "won");
        return {
          rep: name,
          leads: repLeads.length,
          won: wonLeads.length,
          revenue: wonLeads.reduce((sum, lead) => sum + lead.budget, 0),
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredLeads, reps]);

  const recentLeads = useMemo(
    () => [...filteredLeads].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 6),
    [filteredLeads],
  );

  const recentActivities = useMemo(() => activities.slice(0, 6), [activities]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live now ({connectionMode === "supabase" ? "Supabase realtime" : "Local realtime fallback"})
          </div>

          <div className="flex items-center gap-2 text-sm">
            <select
              value={range}
              onChange={(event) => setRange(Number(event.target.value) as RangeFilter)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as SourcePlatform | "all")}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">All Sources</option>
              {SOURCES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={rep}
              onChange={(event) => setRep(event.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white"
            >
              <option value="all">All Reps</option>
              {reps.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <MetricCard label="Total Leads" value={String(kpis.total)} sub={`Scoped to selected filters`} />
          <MetricCard label="New Leads" value={String(kpis.newLeads)} sub="Fresh opportunities" />
          <MetricCard label="Conversion Rate" value={`${kpis.conversion.toFixed(1)}%`} sub="Won / total" />
          <MetricCard label="Pipeline Value" value={`$${(kpis.pipelineValue / 1000000).toFixed(2)}M`} sub="Open stages only" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Lead Volume Trend</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live aggregation from lead creation and win status</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyLeadsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} fill="url(#leadGrad)" />
                <Area type="monotone" dataKey="won" stroke="#10b981" strokeWidth={2} fill="url(#wonGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Source Mix</h3>
              <p className="text-xs text-gray-500 mt-0.5">Required channels + website + offline</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={84} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Pipeline Stages</h3>
              <button onClick={onViewPipeline} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                View board <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {pipelineData.map((stage) => {
                const pct = kpis.total > 0 ? Math.round((stage.count / kpis.total) * 100) : 0;
                return (
                  <div key={stage.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{stage.name}</span>
                      <span className="text-xs font-semibold text-gray-900">{stage.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-xs text-gray-400">Updated {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="space-y-4">
              {recentActivities.length === 0 && (
                <p className="text-sm text-gray-400">No activity yet.</p>
              )}
              {recentActivities.map((activity) => {
                const iconMap: Record<string, React.ElementType> = {
                  call: Phone,
                  email: Mail,
                  note: StickyNote,
                  meeting: Calendar,
                  status: GitBranch,
                  created: Plus,
                  test_drive: Users,
                  assignment: Users,
                  follow_up: Calendar,
                };

                const Icon = iconMap[activity.type] ?? Users;

                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-medium text-gray-900">{activity.lead_name}</span>
                        {" — "}
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{new Date(activity.created_at).toLocaleTimeString()}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{activity.user}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
            <button onClick={onViewLeads} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
              View all leads <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.vehicle_interest}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", lead.status === "not_interested" ? "bg-red-100 text-red-700 border-red-200" : "bg-indigo-100 text-indigo-700 border-indigo-200")}>
                        {statusLabel[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{lead.source_platform}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{lead.follow_up_at ? formatShortDate(lead.follow_up_at) : "Not set"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{lead.assigned_to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="grid grid-cols-5 gap-3">
            {teamPerformance.map((member) => (
              <div key={member.rep} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors">
                <p className="text-xs font-semibold text-gray-900 truncate">{member.rep}</p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Leads</span>
                    <span className="font-medium text-gray-900">{member.leads}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Won</span>
                    <span className="font-medium text-green-600">{member.won}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Revenue</span>
                    <span className="font-semibold text-gray-900">${(member.revenue / 1000).toFixed(0)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

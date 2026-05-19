import {
  Users, TrendingUp, DollarSign, Target,
  Phone, Mail, StickyNote, Calendar,
  GitBranch, Plus, ArrowRight, Car,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { leads, activities, monthlyLeadsData, sourceData, pipelineData, teamPerformance } from "./data/mockData";
import type { ActivityItem } from "./data/mockData";
import { cn } from "./ui/utils";

const activityIcons: Record<ActivityItem['type'], React.ElementType> = {
  call: Phone,
  email: Mail,
  note: StickyNote,
  meeting: Calendar,
  status: GitBranch,
  created: Plus,
  'test-drive': Car,
};

const activityColors: Record<ActivityItem['type'], string> = {
  call: 'bg-green-100 text-green-600',
  email: 'bg-blue-100 text-blue-600',
  note: 'bg-yellow-100 text-yellow-600',
  meeting: 'bg-purple-100 text-purple-600',
  status: 'bg-indigo-100 text-indigo-600',
  created: 'bg-gray-100 text-gray-600',
  'test-drive': 'bg-orange-100 text-orange-600',
};

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  qualified: { label: 'Qualified', color: 'bg-indigo-100 text-indigo-700' },
  'test-drive': { label: 'Test Drive', color: 'bg-purple-100 text-purple-700' },
  negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-700' },
  won: { label: 'Won', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700' },
};

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KpiCard({ label, value, change, positive, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
          <div className="mt-2 flex items-center gap-1">
            <TrendingUp className={cn("w-3.5 h-3.5", positive ? "text-green-500" : "text-red-500")} />
            <span className={cn("text-xs font-medium", positive ? "text-green-600" : "text-red-600")}>{change}</span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-sm">
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-gray-600">Leads: <span className="font-semibold text-indigo-600">{payload[0]?.value}</span></p>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  onViewLeads: () => void;
  onViewPipeline: () => void;
}

export function Dashboard({ onViewLeads, onViewPipeline }: DashboardProps) {
  const recentLeads = leads.slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard
            label="Total Leads"
            value="247"
            change="+11.2%"
            positive
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <KpiCard
            label="New This Week"
            value="38"
            change="+22.6%"
            positive
            icon={Target}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KpiCard
            label="Conversion Rate"
            value="12.4%"
            change="+1.8%"
            positive
            icon={TrendingUp}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />
          <KpiCard
            label="Pipeline Value"
            value="$4.2M"
            change="+8.4%"
            positive
            icon={DollarSign}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Area Chart - Leads Over Time */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Lead Volume</h3>
                <p className="text-xs text-gray-500 mt-0.5">New leads over the past 6 months</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-indigo-500 inline-block" />
                  Total Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded bg-green-400 inline-block" />
                  Won
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyLeadsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="leads" name="Total Leads" stroke="#6366f1" strokeWidth={2} fill="url(#leadsGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
                <Area type="monotone" dataKey="won" name="Won" stroke="#10b981" strokeWidth={2} fill="url(#wonGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - By Source */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900">Lead Sources</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution this month</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={['#6366f1', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Overview + Activity Feed */}
        <div className="grid grid-cols-3 gap-4">
          {/* Pipeline Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Pipeline Stages</h3>
              <button
                onClick={onViewPipeline}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {pipelineData.map((stage) => {
                const pct = Math.round((stage.value / 247) * 100);
                return (
                  <div key={stage.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 font-medium">{stage.name}</span>
                      <span className="text-xs font-semibold text-gray-900">{stage.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-xs text-gray-400">Today, May 19</span>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity, i) => {
                const Icon = activityIcons[activity.type];
                const colorClass = activityColors[activity.type];
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">
                        <span className="font-medium text-gray-900">{activity.leadName}</span>
                        {' — '}
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{activity.timeAgo}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{activity.user}</span>
                      </div>
                    </div>
                    {i < activities.length - 1 && (
                      <div className="absolute left-[1.7rem] mt-7 w-px h-4 bg-gray-100" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Leads Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Recent Leads</h3>
            <button
              onClick={onViewLeads}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all leads <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => {
                  const status = statusConfig[lead.status];
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-700">{lead.vehicleInterest}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", status.color)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-600">{lead.source}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-gray-900">${lead.budget.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", lead.assignedColor)}>
                            {lead.assignedInitials}
                          </div>
                          <span className="text-sm text-gray-600 truncate">{lead.assignedTo.split(' ')[0]}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Performance — May 2026</h3>
          <div className="grid grid-cols-5 gap-3">
            {teamPerformance.map((member) => (
              <div key={member.rep} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-indigo-50 transition-colors group">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold mx-auto mb-2",
                  member.color
                )}>
                  {member.initials}
                </div>
                <p className="text-xs font-semibold text-gray-900 truncate">{member.rep.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{member.rep.split(' ')[1]}</p>
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
                    <span className="text-gray-400">Rev</span>
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

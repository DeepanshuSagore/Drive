import { useState, useMemo } from "react";
import {
  Search, SlidersHorizontal, ChevronDown, ChevronUp, ChevronsUpDown,
  Phone, Mail, X, Edit, Trash2, Calendar, DollarSign,
  Car, User, ArrowUpDown, Star, CheckCircle, XCircle,
  ExternalLink, ChevronLeft, ChevronRight, MessageSquare,
} from "lucide-react";
import { leads, type Lead, type LeadStatus, type LeadSource } from "./data/mockData";
import { cn } from "./ui/utils";

const statusConfig: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  qualified: { label: 'Qualified', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'test-drive': { label: 'Test Drive', color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  won: { label: 'Won', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const sourceColors: Record<LeadSource, string> = {
  Website: 'bg-blue-50 text-blue-600',
  'Walk-in': 'bg-green-50 text-green-600',
  Referral: 'bg-purple-50 text-purple-600',
  Phone: 'bg-amber-50 text-amber-600',
  Social: 'bg-pink-50 text-pink-600',
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 tabular-nums w-6">{score}</span>
    </div>
  );
}

function LeadDetailDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  if (!lead) return null;
  const status = statusConfig[lead.status];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md border", status.color)}>
                {status.label}
              </span>
              <span className="text-xs text-gray-400">{lead.id}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500">{lead.vehicleInterest}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
          {[
            { icon: Phone, label: 'Call', color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200' },
            { icon: Mail, label: 'Email', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200' },
            { icon: MessageSquare, label: 'Note', color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
            { icon: Calendar, label: 'Schedule', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200' },
          ].map(({ icon: Icon, label, color }) => (
            <button key={label} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
              color
            )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h4>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-sm text-indigo-600 hover:underline">{lead.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`tel:${lead.phone}`} className="text-sm text-gray-700">{lead.phone}</a>
              </div>
            </div>
          </div>

          {/* Lead Details */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lead Details</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Budget', value: `$${lead.budget.toLocaleString()}`, icon: DollarSign },
                { label: 'Source', value: lead.source, icon: ExternalLink },
                { label: 'Category', value: lead.vehicleCategory, icon: Car },
                { label: 'Lead Score', value: `${lead.score}/100`, icon: Star },
                { label: 'Created', value: lead.createdAt, icon: Calendar },
                { label: 'Last Contact', value: lead.lastContact, icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Preferences</h4>
            <div className="flex flex-wrap gap-2">
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                lead.financing ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              )}>
                {lead.financing ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Financing
              </span>
              <span className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
                lead.tradeIn ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              )}>
                {lead.tradeIn ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                Trade-In
              </span>
            </div>
          </div>

          {/* Assigned To */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Sales Rep</h4>
            <div className="flex items-center gap-3">
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold", lead.assignedColor)}>
                {lead.assignedInitials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{lead.assignedTo}</p>
                <p className="text-xs text-gray-400">Sales Representative</p>
              </div>
              <button className="ml-auto text-xs text-indigo-600 hover:text-indigo-800 font-medium">Reassign</button>
            </div>
          </div>

          {/* Notes */}
          <div className="px-6 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{lead.notes}</p>
            </div>
            <button className="mt-3 w-full h-9 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Add a note
            </button>
          </div>
        </div>

        {/* Status Footer */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0">
          <p className="text-xs text-gray-400 mb-2 font-medium">Update Status</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(statusConfig) as LeadStatus[]).map((s) => (
              <button
                key={s}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  lead.status === s
                    ? statusConfig[s].color + " ring-2 ring-offset-1 ring-indigo-400"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                )}
              >
                {statusConfig[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

type SortKey = 'name' | 'budget' | 'score' | 'createdAt' | 'status';
type SortDir = 'asc' | 'desc';

export function LeadsView() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    let result = [...leads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.vehicleInterest.toLowerCase().includes(q) ||
        l.assignedTo.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (sourceFilter !== 'all') result = result.filter(l => l.source === sourceFilter);

    result.sort((a, b) => {
      let av: any = a[sortKey];
      let bv: any = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [search, statusFilter, sourceFilter, sortKey, sortDir]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-sm flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowSourceDropdown(false); }}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                statusFilter !== 'all'
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {statusFilter === 'all' ? 'All Statuses' : statusConfig[statusFilter].label}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute top-10 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <button className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50"
                    onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); setPage(1); }}>
                    All Statuses
                  </button>
                  {(Object.keys(statusConfig) as LeadStatus[]).map(s => (
                    <button key={s} className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); setPage(1); }}>
                      <span className={cn("w-2 h-2 rounded-full", statusConfig[s].dot)} />
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Source Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowSourceDropdown(!showSourceDropdown); setShowStatusDropdown(false); }}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                sourceFilter !== 'all'
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              Source: {sourceFilter === 'all' ? 'All' : sourceFilter}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showSourceDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSourceDropdown(false)} />
                <div className="absolute top-10 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  <button className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50"
                    onClick={() => { setSourceFilter('all'); setShowSourceDropdown(false); setPage(1); }}>
                    All Sources
                  </button>
                  {(['Website', 'Walk-in', 'Referral', 'Phone', 'Social'] as LeadSource[]).map(s => (
                    <button key={s} className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => { setSourceFilter(s); setShowSourceDropdown(false); setPage(1); }}>
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Clear Filters */}
          {(statusFilter !== 'all' || sourceFilter !== 'all' || search) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setSourceFilter('all'); setPage(1); }}
              className="h-9 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <div className="ml-auto text-xs text-gray-400 font-medium">
            {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-5 py-3">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Lead <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Interest</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('budget')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Budget <SortIcon col="budget" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort('score')} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Score <SortIcon col="score" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                      No leads match your filters
                    </td>
                  </tr>
                ) : paged.map((lead) => {
                  const status = statusConfig[lead.status];
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-gray-700 max-w-[200px] truncate">{lead.vehicleInterest}</p>
                        <p className="text-xs text-gray-400">{lead.vehicleCategory}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          status.color
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", sourceColors[lead.source])}>
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">${lead.budget.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ScoreBar score={lead.score} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", lead.assignedColor)}>
                            {lead.assignedInitials}
                          </div>
                          <span className="text-sm text-gray-600 truncate max-w-[80px]">{lead.assignedTo.split(' ')[0]}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-400">{lead.createdAt}</span>
                      </td>
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            onClick={() => setSelectedLead(lead)}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} leads
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs font-medium transition-colors",
                      page === p
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}

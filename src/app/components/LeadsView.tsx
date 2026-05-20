import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import { isFollowUpOverdue } from "../lib/leads/automation";
import {
  sourceColor,
  statusColor,
  statusLabel,
  type Lead,
  type LeadStatus,
  type SourcePlatform,
} from "../lib/leads/types";
import { cn } from "./ui/utils";
import { LeadDetailsContent } from "./LeadDetailsContent";

const allSources: SourcePlatform[] = ["Website", "Facebook", "Twitter", "Google", "Offline Event"];

type SortKey = "name" | "budget" | "score" | "created_at" | "status";
type SortDir = "asc" | "desc";

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-700 tabular-nums w-6">{score}</span>
    </div>
  );
}

interface LeadsViewProps {
  onOpenLeadPage: (leadId: string) => void;
}

export function LeadsView({ onOpenLeadPage }: LeadsViewProps) {
  const {
    leads,
    loading,
    changeStatus,
    createNote,
    assignLead,
    scheduleFollowUp,
    salesReps,
  } = useLeads();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<SourcePlatform | "all">("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  const pageSize = 10;

  const filtered = useMemo(() => {
    let result = [...leads];

    if (search) {
      const query = search.toLowerCase();
      result = result.filter((lead) =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.vehicle_interest.toLowerCase().includes(query) ||
        lead.assigned_to.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      result = result.filter((lead) => lead.source_platform === sourceFilter);
    }

    result.sort((a, b) => {
      let left: string | number = a[sortKey];
      let right: string | number = b[sortKey];

      if (sortKey === "created_at") {
        left = Date.parse(String(a.created_at));
        right = Date.parse(String(b.created_at));
      }

      if (typeof left === "string") left = left.toLowerCase();
      if (typeof right === "string") right = right.toLowerCase();

      if (left < right) return sortDir === "asc" ? -1 : 1;
      if (left > right) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, search, statusFilter, sourceFilter, sortKey, sortDir]);

  const selectedLead = useMemo(
    () => filtered.find((lead) => lead.id === selectedLeadId) ?? leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [filtered, leads, selectedLeadId],
  );

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-indigo-500" />
      : <ChevronDown className="w-3 h-3 text-indigo-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5 shadow-sm flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowStatusDropdown((prev) => !prev);
                setShowSourceDropdown(false);
              }}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                statusFilter !== "all"
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {statusFilter === "all" ? "All Statuses" : statusLabel[statusFilter]}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                <div className="absolute top-10 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <button
                    className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      setStatusFilter("all");
                      setShowStatusDropdown(false);
                      setPage(1);
                    }}
                  >
                    All Statuses
                  </button>
                  {(Object.keys(statusLabel) as LeadStatus[]).map((status) => (
                    <button
                      key={status}
                      className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                      onClick={() => {
                        setStatusFilter(status);
                        setShowStatusDropdown(false);
                        setPage(1);
                      }}
                    >
                      <span className={cn("w-2 h-2 rounded-full", statusColor[status].dot)} />
                      {statusLabel[status]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowSourceDropdown((prev) => !prev);
                setShowStatusDropdown(false);
              }}
              className={cn(
                "h-9 px-3 rounded-lg border text-sm flex items-center gap-2 transition-colors",
                sourceFilter !== "all"
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              )}
            >
              Source: {sourceFilter === "all" ? "All" : sourceFilter}
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {showSourceDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSourceDropdown(false)} />
                <div className="absolute top-10 left-0 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                  <button
                    className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-gray-50"
                    onClick={() => {
                      setSourceFilter("all");
                      setShowSourceDropdown(false);
                      setPage(1);
                    }}
                  >
                    All Sources
                  </button>
                  {allSources.map((source) => (
                    <button
                      key={source}
                      className="w-full px-3 py-2 text-sm text-left text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                      onClick={() => {
                        setSourceFilter(source);
                        setShowSourceDropdown(false);
                        setPage(1);
                      }}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {(statusFilter !== "all" || sourceFilter !== "all" || search) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setSourceFilter("all");
                setPage(1);
              }}
              className="h-9 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}

          <div className="ml-auto text-xs text-gray-400 font-medium">
            {loading ? "Syncing leads..." : `${filtered.length} lead${filtered.length === 1 ? "" : "s"}`}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-5 py-3">
                    <button onClick={() => handleSort("name")} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Lead <SortIcon col="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Interest</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort("status")} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Status <SortIcon col="status" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort("budget")} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Budget <SortIcon col="budget" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3">
                    <button onClick={() => handleSort("score")} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                      Score <SortIcon col="score" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading && paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                      No leads match your filters
                    </td>
                  </tr>
                ) : (
                  paged.map((lead: Lead) => {
                    const overdue = isFollowUpOverdue(lead.follow_up_at);
                    return (
                      <tr
                        key={lead.id}
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                              {lead.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                              <p className="text-xs text-gray-400">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-gray-700 max-w-[220px] truncate">{lead.vehicle_interest}</p>
                          <p className="text-xs text-gray-400">{lead.vehicle_category}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", statusColor[lead.status].pill)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", statusColor[lead.status].dot)} />
                            {statusLabel[lead.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", sourceColor[lead.source_platform])}>
                            {lead.source_platform}
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
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", lead.assigned_color)}>
                              {lead.assigned_initials}
                            </div>
                            <span className="text-sm text-gray-600 truncate max-w-[90px]">{lead.assigned_to.split(" ")[0]}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn("text-xs font-medium", overdue ? "text-red-600" : "text-gray-500")}>
                            {lead.follow_up_at ? new Date(lead.follow_up_at).toLocaleDateString() : "Not set"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} leads
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNo) => (
                  <button
                    key={pageNo}
                    onClick={() => setPage(pageNo)}
                    className={cn(
                      "w-7 h-7 rounded-lg text-xs font-medium",
                      page === pageNo ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {pageNo}
                  </button>
                ))}
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedLead && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setSelectedLeadId(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-[560px] bg-white shadow-2xl z-50">
            <LeadDetailsContent
              lead={selectedLead}
              mode="drawer"
              salesReps={salesReps}
              onClose={() => setSelectedLeadId(null)}
              onOpenFullPage={() => onOpenLeadPage(selectedLead.id)}
              onStatusChange={(status) => changeStatus(selectedLead.id, status)}
              onAddNote={(note) => createNote(selectedLead.id, note)}
              onAssign={(assignee) => assignLead(selectedLead.id, assignee)}
              onScheduleFollowUp={(followUpAt, action) => scheduleFollowUp(selectedLead.id, followUpAt, action)}
            />
          </div>
        </>
      )}
    </div>
  );
}

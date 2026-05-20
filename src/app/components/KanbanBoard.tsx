import { useMemo, useState } from "react";
import { Mail, Phone, Star } from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import {
  statusLabel,
  type Lead,
  type LeadStatus,
} from "../lib/leads/types";
import { cn } from "./ui/utils";

interface KanbanColumn {
  id: LeadStatus;
  headerBg: string;
  dot: string;
}

const columns: KanbanColumn[] = [
  { id: "new", headerBg: "bg-blue-50", dot: "bg-blue-500" },
  { id: "contacted", headerBg: "bg-yellow-50", dot: "bg-yellow-500" },
  { id: "qualified", headerBg: "bg-indigo-50", dot: "bg-indigo-500" },
  { id: "test_drive", headerBg: "bg-purple-50", dot: "bg-purple-500" },
  { id: "negotiating", headerBg: "bg-orange-50", dot: "bg-orange-500" },
  { id: "won", headerBg: "bg-green-50", dot: "bg-green-500" },
  { id: "not_interested", headerBg: "bg-red-50", dot: "bg-red-500" },
];

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-500";
}

function KanbanCard({ lead, onDragStart, onOpenLeadPage }: {
  lead: Lead;
  onDragStart: (id: string) => void;
  onOpenLeadPage: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={() => onOpenLeadPage(lead.id)}
        className="w-full text-left"
      >
        <div className="mb-2.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{lead.vehicle_interest}</p>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="text-sm font-semibold text-gray-800">${lead.budget.toLocaleString()}</span>
          <span className="ml-auto flex items-center gap-0.5">
            <Star className={cn("w-3 h-3", scoreColor(lead.score))} />
            <span className={cn("text-xs font-semibold", scoreColor(lead.score))}>{lead.score}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">{lead.source_platform}</span>
          <span className="px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">{lead.vehicle_category}</span>
          <span className="px-1.5 py-0.5 rounded text-xs text-indigo-600 bg-indigo-50">{lead.priority_band.toUpperCase()}</span>
        </div>
      </button>

      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", lead.assigned_color)}>
            {lead.assigned_initials}
          </div>
          <span className="text-xs text-gray-500">{lead.assigned_to.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <a
            href={`tel:${lead.phone}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Call ${lead.name}`}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-green-600 hover:bg-green-50"
          >
            <Phone className="w-3 h-3" />
          </a>
          <a
            href={`mailto:${lead.email}`}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Email ${lead.name}`}
            className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50"
          >
            <Mail className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  column: KanbanColumn;
  leads: Lead[];
  onDragStart: (id: string) => void;
  onDrop: (status: LeadStatus) => void;
  isDragOver: boolean;
  onDragOver: (status: LeadStatus) => void;
  onDragLeave: () => void;
  onOpenLeadPage: (id: string) => void;
}

function KanbanColumn({
  column,
  leads: columnLeads,
  onDragStart,
  onDrop,
  isDragOver,
  onDragOver,
  onDragLeave,
  onOpenLeadPage,
}: ColumnProps) {
  const totalValue = columnLeads.reduce((sum, lead) => sum + lead.budget, 0);

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      <div className={cn("rounded-t-xl px-3 py-3 border border-b-0 border-gray-200", column.headerBg)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", column.dot)} />
            <span className="text-sm font-semibold text-gray-900">{statusLabel[column.id]}</span>
          </div>
          <span className="min-w-5 h-5 rounded-full bg-white/80 text-gray-700 text-xs font-semibold flex items-center justify-center px-1.5 border border-gray-200">
            {columnLeads.length}
          </span>
        </div>
        <p className="text-xs text-gray-500 pl-4">${(totalValue / 1000).toFixed(0)}k pipeline</p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          onDragOver(column.id);
        }}
        onDrop={() => onDrop(column.id)}
        onDragLeave={onDragLeave}
        className={cn(
          "flex-1 rounded-b-xl border border-gray-200 p-2 space-y-2 min-h-[500px] transition-all",
          isDragOver ? "bg-indigo-50/60 border-indigo-300 border-dashed" : "bg-gray-50/50",
        )}
      >
        {columnLeads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} onOpenLeadPage={onOpenLeadPage} />
        ))}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  onOpenLeadPage: (leadId: string) => void;
}

export function KanbanBoard({ onOpenLeadPage }: KanbanBoardProps) {
  const { leads, changeStatus, connectionMode } = useLeads();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);

  const grouped = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      leads: leads.filter((lead) => lead.status === column.id),
    }));
  }, [leads]);

  const handleDrop = async (targetStatus: LeadStatus) => {
    if (!draggingId) return;
    const movedLead = leads.find((lead) => lead.id === draggingId);
    if (!movedLead || movedLead.status === targetStatus) {
      setDraggingId(null);
      setDragOverCol(null);
      return;
    }

    await changeStatus(draggingId, targetStatus);
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          {grouped.map((column) => (
            <div key={column.id} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", column.dot)} />
              <span className="text-gray-500">{statusLabel[column.id]}</span>
              <span className="text-gray-900 font-semibold">{column.leads.length}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live now ({connectionMode === "supabase" ? "Supabase realtime" : "Local realtime fallback"})
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-3 min-w-max">
          {grouped.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              leads={column.leads}
              onDragStart={setDraggingId}
              onDrop={(status) => {
                void handleDrop(status);
              }}
              isDragOver={dragOverCol === column.id}
              onDragOver={setDragOverCol}
              onDragLeave={() => setDragOverCol(null)}
              onOpenLeadPage={onOpenLeadPage}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

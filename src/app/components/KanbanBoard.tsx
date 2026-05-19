import { useState } from "react";
import { DollarSign, Phone, Mail, MoreHorizontal, Plus, Star } from "lucide-react";
import { leads, type Lead, type LeadStatus } from "./data/mockData";
import { cn } from "./ui/utils";

interface KanbanColumn {
  id: LeadStatus;
  label: string;
  headerBg: string;
  dot: string;
  accent: string;
}

const columns: KanbanColumn[] = [
  { id: 'new', label: 'New', headerBg: 'bg-blue-50', dot: 'bg-blue-500', accent: 'border-t-blue-500' },
  { id: 'contacted', label: 'Contacted', headerBg: 'bg-yellow-50', dot: 'bg-yellow-500', accent: 'border-t-yellow-500' },
  { id: 'qualified', label: 'Qualified', headerBg: 'bg-indigo-50', dot: 'bg-indigo-500', accent: 'border-t-indigo-500' },
  { id: 'test-drive', label: 'Test Drive', headerBg: 'bg-purple-50', dot: 'bg-purple-500', accent: 'border-t-purple-500' },
  { id: 'negotiating', label: 'Negotiating', headerBg: 'bg-orange-50', dot: 'bg-orange-500', accent: 'border-t-orange-500' },
  { id: 'won', label: 'Won', headerBg: 'bg-green-50', dot: 'bg-green-500', accent: 'border-t-green-500' },
  { id: 'lost', label: 'Lost', headerBg: 'bg-red-50', dot: 'bg-red-400', accent: 'border-t-red-400' },
];

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-500';
}

function KanbanCard({ lead, onDragStart }: { lead: Lead; onDragStart: (id: string) => void }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(lead.id)}
      className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
          <p className="text-xs text-gray-500 truncate mt-0.5">{lead.vehicleInterest}</p>
        </div>
        <button className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Budget */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="text-sm font-semibold text-gray-800">${lead.budget.toLocaleString()}</span>
        <span className="ml-auto flex items-center gap-0.5">
          <Star className={cn("w-3 h-3", scoreColor(lead.score))} />
          <span className={cn("text-xs font-semibold", scoreColor(lead.score))}>{lead.score}</span>
        </span>
      </div>

      {/* Source + Category */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">{lead.source}</span>
        <span className="px-1.5 py-0.5 rounded text-xs text-gray-500 bg-gray-100">{lead.vehicleCategory}</span>
        {lead.tradeIn && (
          <span className="px-1.5 py-0.5 rounded text-xs text-purple-600 bg-purple-50">Trade-In</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0", lead.assignedColor)}>
            {lead.assignedInitials}
          </div>
          <span className="text-xs text-gray-500">{lead.assignedTo.split(' ')[0]}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-green-600 hover:bg-green-50 transition-colors">
            <Phone className="w-3 h-3" />
          </button>
          <button className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Mail className="w-3 h-3" />
          </button>
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
}

function KanbanColumn({ column, leads: colLeads, onDragStart, onDrop, isDragOver, onDragOver, onDragLeave }: ColumnProps) {
  const totalValue = colLeads.reduce((sum, l) => sum + l.budget, 0);

  return (
    <div className="flex flex-col min-w-[240px] w-[240px]">
      {/* Column Header */}
      <div className={cn("rounded-t-xl px-3 py-3 border border-b-0 border-gray-200", column.headerBg)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", column.dot)} />
            <span className="text-sm font-semibold text-gray-900">{column.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="min-w-5 h-5 rounded-full bg-white/80 text-gray-700 text-xs font-semibold flex items-center justify-center px-1.5 border border-gray-200">
              {colLeads.length}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 pl-4">
          ${(totalValue / 1000).toFixed(0)}k pipeline
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver(column.id); }}
        onDrop={() => onDrop(column.id)}
        onDragLeave={onDragLeave}
        className={cn(
          "flex-1 rounded-b-xl border border-gray-200 p-2 space-y-2 min-h-[500px] transition-all",
          isDragOver
            ? "bg-indigo-50/60 border-indigo-300 border-dashed"
            : "bg-gray-50/50"
        )}
      >
        {colLeads.map(lead => (
          <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} />
        ))}
        <button className="w-full h-8 rounded-lg border border-dashed border-gray-300 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-colors flex items-center justify-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Add lead
        </button>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const [boardLeads, setBoardLeads] = useState<Lead[]>(leads);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);

  const handleDrop = (targetStatus: LeadStatus) => {
    if (!draggingId) return;
    setBoardLeads(prev => prev.map(l =>
      l.id === draggingId ? { ...l, status: targetStatus } : l
    ));
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm">
          {columns.map(col => {
            const count = boardLeads.filter(l => l.status === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-1.5">
                <span className={cn("w-2 h-2 rounded-full", col.dot)} />
                <span className="text-gray-500">{col.label}</span>
                <span className="text-gray-900 font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Drag cards to update status
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-3 min-w-max">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              leads={boardLeads.filter(l => l.status === col.id)}
              onDragStart={setDraggingId}
              onDrop={handleDrop}
              isDragOver={dragOverCol === col.id}
              onDragOver={setDragOverCol}
              onDragLeave={() => setDragOverCol(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

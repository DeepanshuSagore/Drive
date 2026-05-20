import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Mail,
  MessageSquare,
  Phone,
  X,
  XCircle,
} from "lucide-react";
import { isFollowUpOverdue } from "../lib/leads/automation";
import {
  priorityColor,
  statusColor,
  statusLabel,
  type Lead,
  type LeadStatus,
  type NextAction,
} from "../lib/leads/types";
import { cn } from "./ui/utils";

interface LeadDetailsContentProps {
  lead: Lead;
  mode: "drawer" | "page";
  salesReps: { name: string; initials: string; color: string }[];
  onClose?: () => void;
  onOpenFullPage?: () => void;
  onStatusChange: (status: LeadStatus) => Promise<void>;
  onAddNote: (note: string) => Promise<void>;
  onAssign: (assignee: { name: string; initials: string; color: string }) => Promise<void>;
  onScheduleFollowUp: (followUpAt: string, nextAction: NextAction) => Promise<void>;
}

function formatDateTime(value: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString();
}

function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

export function LeadDetailsContent({
  lead,
  mode,
  salesReps,
  onClose,
  onOpenFullPage,
  onStatusChange,
  onAddNote,
  onAssign,
  onScheduleFollowUp,
}: LeadDetailsContentProps) {
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedRep, setSelectedRep] = useState(lead.assigned_to);
  const [followUpDateTime, setFollowUpDateTime] = useState(toDateTimeLocal(lead.follow_up_at));
  const [followUpAction, setFollowUpAction] = useState<NextAction>(lead.next_action);

  const overdue = isFollowUpOverdue(lead.follow_up_at);

  const leadCreated = useMemo(() => formatDateTime(lead.created_at), [lead.created_at]);
  const lastActivity = useMemo(() => formatDateTime(lead.last_activity_at), [lead.last_activity_at]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md border", statusColor[lead.status].pill)}>
                {statusLabel[lead.status]}
              </span>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", priorityColor[lead.priority_band])}>
                {lead.priority_band.toUpperCase()} Priority
              </span>
              {overdue && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                  Follow-up Overdue
                </span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{lead.vehicle_interest}</p>
          </div>
          <div className="flex items-center gap-2">
            {mode === "drawer" && onOpenFullPage && (
              <button
                onClick={onOpenFullPage}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                Open Full Page
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close panel"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Source Platform</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{lead.source_platform}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Budget</p>
            <p className="text-sm font-medium text-gray-900 mt-1">${lead.budget.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Lead Score</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{lead.score}/100</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Automation Suggestion</p>
            <p className="text-sm font-medium text-gray-900 mt-1">Next: {lead.next_action}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{leadCreated}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Last Activity</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{lastActivity}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${lead.phone}`}
            aria-label={`Call ${lead.name}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <a
            href={`mailto:${lead.email}`}
            aria-label={`Email ${lead.name}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </a>
          <span className="text-xs text-gray-500">{lead.phone}</span>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Update Status</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusLabel) as LeadStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => void onStatusChange(status)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                  lead.status === status
                    ? `${statusColor[status].pill} ring-2 ring-offset-1 ring-indigo-300`
                    : "border-gray-200 text-gray-500 hover:bg-gray-50",
                )}
              >
                {statusLabel[status]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assign Sales Rep</h4>
          <div className="flex items-center gap-2">
            <select
              value={selectedRep}
              onChange={(event) => setSelectedRep(event.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900"
            >
              {salesReps.map((rep) => (
                <option key={rep.name} value={rep.name}>
                  {rep.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const rep = salesReps.find((item) => item.name === selectedRep);
                if (!rep) return;
                void onAssign(rep);
              }}
              className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Reassign
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Schedule Follow-up</h4>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="datetime-local"
              value={followUpDateTime}
              onChange={(event) => setFollowUpDateTime(event.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900"
            />
            <select
              value={followUpAction}
              onChange={(event) => setFollowUpAction(event.target.value as NextAction)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900"
            >
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Test Drive">Test Drive</option>
            </select>
            <button
              onClick={() => {
                if (!followUpDateTime) return;
                const iso = new Date(followUpDateTime).toISOString();
                void onScheduleFollowUp(iso, followUpAction);
              }}
              className="h-9 px-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Save Follow-up
            </button>
          </div>
          <p className={cn("text-xs", overdue ? "text-red-600" : "text-gray-500")}>
            Current follow-up: {formatDateTime(lead.follow_up_at)}
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {lead.notes.length === 0 && (
              <p className="text-sm text-gray-400">No notes yet.</p>
            )}
            {lead.notes.map((note, index) => (
              <div key={`${lead.id}-note-${index}`} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{note}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-start gap-2">
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={2}
              placeholder="Add conversation notes..."
              className="flex-1 rounded-lg border border-gray-200 p-2.5 text-sm text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={() => {
                if (!noteDraft.trim()) return;
                void onAddNote(noteDraft.trim());
                setNoteDraft("");
              }}
              className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            {lead.financing ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
            )}
            Financing
          </span>
          <span className="flex items-center gap-1">
            {lead.trade_in ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-gray-400" />
            )}
            Trade-in
          </span>
        </div>
      </div>
    </div>
  );
}

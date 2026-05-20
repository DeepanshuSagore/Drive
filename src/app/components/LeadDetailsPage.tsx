import { ArrowLeft } from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import { LeadDetailsContent } from "./LeadDetailsContent";

interface LeadDetailsPageProps {
  leadId: string;
  onBack: () => void;
}

export function LeadDetailsPage({ leadId, onBack }: LeadDetailsPageProps) {
  const {
    leads,
    salesReps,
    changeStatus,
    createNote,
    assignLead,
    scheduleFollowUp,
  } = useLeads();

  const lead = leads.find((item) => item.id === leadId);

  if (!lead) {
    return (
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-6">
          <button
            onClick={onBack}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leads
          </button>
          <p className="mt-5 text-sm text-gray-500">Lead not found in current workspace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-4">
        <button
          onClick={onBack}
          className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1 bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </button>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[780px]">
          <LeadDetailsContent
            lead={lead}
            mode="page"
            salesReps={salesReps}
            onStatusChange={(status) => changeStatus(lead.id, status)}
            onAddNote={(note) => createNote(lead.id, note)}
            onAssign={(assignee) => assignLead(lead.id, assignee)}
            onScheduleFollowUp={(followUpAt, action) => scheduleFollowUp(lead.id, followUpAt, action)}
          />
        </div>
      </div>
    </div>
  );
}

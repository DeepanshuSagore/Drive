export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "test_drive"
  | "negotiating"
  | "won"
  | "not_interested";

export type SourcePlatform =
  | "Website"
  | "Facebook"
  | "Twitter"
  | "Google"
  | "Offline Event";

export type PriorityBand = "hot" | "warm" | "cold";

export type NextAction = "Call" | "Email" | "Test Drive";

export type ActivityType =
  | "call"
  | "email"
  | "note"
  | "meeting"
  | "status"
  | "created"
  | "test_drive"
  | "assignment"
  | "follow_up";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_interest: string;
  vehicle_category: string;
  budget: number;
  status: LeadStatus;
  source_platform: SourcePlatform;
  assigned_to: string;
  assigned_initials: string;
  assigned_color: string;
  created_at: string;
  last_activity_at: string;
  score: number;
  priority_band: PriorityBand;
  next_action: NextAction;
  follow_up_at: string | null;
  trade_in: boolean;
  financing: boolean;
  notes: string[];
  updated_by: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  lead_name: string;
  user: string;
  created_at: string;
}

export interface LeadFollowUp {
  lead_id: string;
  follow_up_at: string;
  next_action: NextAction;
  created_by: string;
  updated_at: string;
}

export interface LeadFilters {
  source: SourcePlatform | "all";
  rep: string | "all";
  days: 7 | 30 | 90;
}

export const statusLabel: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  test_drive: "Test Drive",
  negotiating: "Negotiating",
  won: "Won",
  not_interested: "Not Interested",
};

export const statusColor: Record<LeadStatus, { pill: string; dot: string }> = {
  new: { pill: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  contacted: { pill: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  qualified: { pill: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  test_drive: { pill: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  negotiating: { pill: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  won: { pill: "bg-green-100 text-green-700 border-green-200", dot: "bg-green-500" },
  not_interested: { pill: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
};

export const sourceColor: Record<SourcePlatform, string> = {
  Website: "bg-blue-50 text-blue-600",
  Facebook: "bg-sky-50 text-sky-600",
  Twitter: "bg-cyan-50 text-cyan-600",
  Google: "bg-emerald-50 text-emerald-600",
  "Offline Event": "bg-amber-50 text-amber-700",
};

export const priorityColor: Record<PriorityBand, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  cold: "bg-blue-100 text-blue-700",
};

export const SALES_REPS = [
  { name: "Alex Morgan", initials: "AM", color: "bg-violet-500" },
  { name: "Sarah Chen", initials: "SC", color: "bg-blue-500" },
  { name: "Marcus Johnson", initials: "MJ", color: "bg-emerald-500" },
  { name: "Lisa Park", initials: "LP", color: "bg-amber-500" },
  { name: "David Torres", initials: "DT", color: "bg-rose-500" },
] as const;

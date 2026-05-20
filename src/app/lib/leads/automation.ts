import type { Lead, LeadStatus, NextAction, PriorityBand, SourcePlatform } from "./types";

const SOURCE_WEIGHT: Record<SourcePlatform, number> = {
  Website: 10,
  Facebook: 8,
  Twitter: 7,
  Google: 12,
  "Offline Event": 9,
};

const STATUS_WEIGHT: Record<LeadStatus, number> = {
  new: 6,
  contacted: 12,
  qualified: 22,
  test_drive: 28,
  negotiating: 24,
  won: 30,
  not_interested: -20,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return 0;
  const diffMs = Date.now() - time;
  return Math.max(0, Math.floor(diffMs / 86400000));
}

export function computeLeadScore(lead: Pick<
  Lead,
  | "status"
  | "source_platform"
  | "budget"
  | "trade_in"
  | "financing"
  | "last_activity_at"
  | "follow_up_at"
>) {
  const source = SOURCE_WEIGHT[lead.source_platform] ?? 0;
  const status = STATUS_WEIGHT[lead.status] ?? 0;
  const budget = clamp(Math.round(lead.budget / 5000), 2, 24);
  const intent = (lead.financing ? 7 : 0) + (lead.trade_in ? 6 : 0);
  const freshnessPenalty = clamp(daysSince(lead.last_activity_at) * 2, 0, 22);

  let score = 30 + source + status + budget + intent - freshnessPenalty;

  if (lead.follow_up_at) {
    const dueInMs = Date.parse(lead.follow_up_at) - Date.now();
    if (!Number.isNaN(dueInMs) && dueInMs < 0) {
      score -= 8;
    }
  }

  return clamp(score, 1, 99);
}

export function derivePriorityBand(score: number): PriorityBand {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  return "cold";
}

export function suggestNextAction(lead: Pick<Lead, "status" | "follow_up_at">): NextAction {
  if (lead.status === "new") return "Call";
  if (lead.status === "contacted") return "Email";
  if (lead.status === "qualified" || lead.status === "negotiating") return "Test Drive";

  if (lead.follow_up_at) {
    const overdue = Date.parse(lead.follow_up_at) <= Date.now();
    if (overdue) return "Call";
  }

  return "Email";
}

export function isFollowUpOverdue(followUpAt: string | null): boolean {
  if (!followUpAt) return false;
  const dueAt = Date.parse(followUpAt);
  if (Number.isNaN(dueAt)) return false;
  return dueAt < Date.now();
}

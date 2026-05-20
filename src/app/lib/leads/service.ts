import { hasSupabaseConfig, supabase } from "../supabaseClient";
import { computeLeadScore, derivePriorityBand, suggestNextAction } from "./automation";
import { seedActivities, seedLeads } from "./seed";
import type {
  Lead,
  LeadActivity,
  LeadFollowUp,
  LeadStatus,
  NextAction,
  PriorityBand,
  SourcePlatform,
} from "./types";

const LEADS_TABLE = "leads";
const ACTIVITIES_TABLE = "lead_activities";
const FOLLOWUPS_TABLE = "lead_followups";

const STORAGE_KEY = "driveflow_live_store_v1";
const BC_NAME = "driveflow_live_channel";

type LocalStore = {
  leads: Lead[];
  activities: LeadActivity[];
  followups: LeadFollowUp[];
};

let cache: LocalStore | null = null;

const leadListeners = new Set<(leads: Lead[]) => void>();
const activityListeners = new Set<(activities: LeadActivity[]) => void>();

const channel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(BC_NAME)
    : null;

function normalizeStatus(status: string): LeadStatus {
  if (status === "lost") return "not_interested";
  if (status === "test-drive") return "test_drive";
  return (status as LeadStatus) ?? "new";
}

function normalizeSource(source: string): SourcePlatform {
  if (source === "Walk-in" || source === "Referral") return "Offline Event";
  if (source === "Phone") return "Google";
  if (source === "Social") return "Twitter";
  return (source as SourcePlatform) ?? "Website";
}

function safeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string");
}

function normalizeLead(input: any): Lead {
  const status = normalizeStatus(input.status ?? "new");
  const followUp = input.follow_up_at ?? null;
  const leadBase = {
    id: String(input.id),
    name: String(input.name ?? "Unknown Lead"),
    email: String(input.email ?? ""),
    phone: String(input.phone ?? ""),
    vehicle_interest: String(input.vehicle_interest ?? ""),
    vehicle_category: String(input.vehicle_category ?? ""),
    budget: Number(input.budget ?? 0),
    status,
    source_platform: normalizeSource(String(input.source_platform ?? "Website")),
    assigned_to: String(input.assigned_to ?? "Unassigned"),
    assigned_initials: String(input.assigned_initials ?? "NA"),
    assigned_color: String(input.assigned_color ?? "bg-gray-500"),
    created_at: String(input.created_at ?? new Date().toISOString()),
    last_activity_at: String(input.last_activity_at ?? input.created_at ?? new Date().toISOString()),
    follow_up_at: followUp ? String(followUp) : null,
    trade_in: Boolean(input.trade_in),
    financing: Boolean(input.financing),
    notes: safeStringArray(input.notes),
    updated_by: String(input.updated_by ?? "System"),
  };

  const score =
    typeof input.score === "number"
      ? input.score
      : computeLeadScore({
          status: leadBase.status,
          source_platform: leadBase.source_platform,
          budget: leadBase.budget,
          trade_in: leadBase.trade_in,
          financing: leadBase.financing,
          last_activity_at: leadBase.last_activity_at,
          follow_up_at: leadBase.follow_up_at,
        });

  const priorityBand: PriorityBand =
    input.priority_band ?? derivePriorityBand(score);

  return {
    ...leadBase,
    score,
    priority_band: priorityBand,
    next_action:
      (input.next_action as NextAction) ??
      suggestNextAction({
        status: leadBase.status,
        follow_up_at: leadBase.follow_up_at,
      }),
  };
}

function normalizeActivity(input: any): LeadActivity {
  return {
    id: String(input.id),
    lead_id: String(input.lead_id),
    type: input.type,
    description: String(input.description ?? ""),
    lead_name: String(input.lead_name ?? ""),
    user: String(input.user ?? "System"),
    created_at: String(input.created_at ?? new Date().toISOString()),
  };
}

function hydrateLocalStore(): LocalStore {
  if (cache) return cache;

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LocalStore;
        cache = {
          leads: (parsed.leads ?? []).map(normalizeLead),
          activities: (parsed.activities ?? []).map(normalizeActivity),
          followups: parsed.followups ?? [],
        };
        return cache;
      } catch {
        // fallback to seeds
      }
    }
  }

  cache = {
    leads: seedLeads,
    activities: seedActivities,
    followups: [],
  };

  persistLocalStore();
  return cache;
}

function persistLocalStore() {
  if (!cache || typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function emitLocalUpdates() {
  const state = hydrateLocalStore();
  const leadsSorted = [...state.leads].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const activitiesSorted = [...state.activities].sort((a, b) => b.created_at.localeCompare(a.created_at));

  leadListeners.forEach((listener) => listener(leadsSorted));
  activityListeners.forEach((listener) => listener(activitiesSorted));
}

function broadcastState() {
  if (!channel || !cache) return;
  channel.postMessage({
    type: "SYNC_STATE",
    payload: cache,
  });
}

if (channel) {
  channel.onmessage = (event) => {
    if (event.data?.type !== "SYNC_STATE") return;
    const incoming = event.data.payload as LocalStore;
    if (!incoming) return;

    cache = {
      leads: (incoming.leads ?? []).map(normalizeLead),
      activities: (incoming.activities ?? []).map(normalizeActivity),
      followups: incoming.followups ?? [],
    };

    persistLocalStore();
    emitLocalUpdates();
  };
}

async function fetchSupabaseLeads(): Promise<Lead[]> {
  const { data, error } = await supabase!
    .from(LEADS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeLead);
}

async function fetchSupabaseActivities(): Promise<LeadActivity[]> {
  const { data, error } = await supabase!
    .from(ACTIVITIES_TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).map(normalizeActivity);
}

function recalculateLead(lead: Lead): Lead {
  const score = computeLeadScore({
    status: lead.status,
    source_platform: lead.source_platform,
    budget: lead.budget,
    trade_in: lead.trade_in,
    financing: lead.financing,
    last_activity_at: lead.last_activity_at,
    follow_up_at: lead.follow_up_at,
  });

  return {
    ...lead,
    score,
    priority_band: derivePriorityBand(score),
    next_action: suggestNextAction({ status: lead.status, follow_up_at: lead.follow_up_at }),
  };
}

function addLocalActivity(activity: LeadActivity) {
  const state = hydrateLocalStore();
  state.activities = [activity, ...state.activities];
}

async function appendActivity(
  lead: Lead,
  type: LeadActivity["type"],
  description: string,
  user: string,
) {
  const payload = {
    id: crypto.randomUUID(),
    lead_id: lead.id,
    type,
    description,
    lead_name: lead.name,
    user,
    created_at: new Date().toISOString(),
  } satisfies LeadActivity;

  if (hasSupabaseConfig) {
    const { error } = await supabase!.from(ACTIVITIES_TABLE).insert(payload);
    if (error) throw error;
    return;
  }

  addLocalActivity(payload);
}

export async function listLeads() {
  if (hasSupabaseConfig) {
    return fetchSupabaseLeads();
  }
  const state = hydrateLocalStore();
  return [...state.leads].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listActivities() {
  if (hasSupabaseConfig) {
    return fetchSupabaseActivities();
  }
  const state = hydrateLocalStore();
  return [...state.activities].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function subscribeLeads(onChange: (leads: Lead[]) => void) {
  if (hasSupabaseConfig) {
    const initial = await fetchSupabaseLeads();
    onChange(initial);

    const sub = supabase!
      .channel(`leads-live-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: LEADS_TABLE },
        async () => {
          onChange(await fetchSupabaseLeads());
        },
      )
      .subscribe();

    return () => {
      void supabase!.removeChannel(sub);
    };
  }

  const state = hydrateLocalStore();
  leadListeners.add(onChange);
  onChange([...state.leads].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  return () => {
    leadListeners.delete(onChange);
  };
}

export async function subscribeActivities(onChange: (activities: LeadActivity[]) => void) {
  if (hasSupabaseConfig) {
    const initial = await fetchSupabaseActivities();
    onChange(initial);

    const sub = supabase!
      .channel(`activities-live-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: ACTIVITIES_TABLE },
        async () => {
          onChange(await fetchSupabaseActivities());
        },
      )
      .subscribe();

    return () => {
      void supabase!.removeChannel(sub);
    };
  }

  const state = hydrateLocalStore();
  activityListeners.add(onChange);
  onChange([...state.activities].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  return () => {
    activityListeners.delete(onChange);
  };
}

export async function updateLeadStatus(id: string, status: LeadStatus, user: string) {
  if (hasSupabaseConfig) {
    const current = (await fetchSupabaseLeads()).find((lead) => lead.id === id);
    if (!current) return;

    const withUpdates = recalculateLead({
      ...current,
      status,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });

    const { error } = await supabase!
      .from(LEADS_TABLE)
      .update({
        status: withUpdates.status,
        score: withUpdates.score,
        priority_band: withUpdates.priority_band,
        next_action: withUpdates.next_action,
        last_activity_at: withUpdates.last_activity_at,
        updated_by: user,
      })
      .eq("id", id);

    if (error) throw error;

    await appendActivity(
      withUpdates,
      "status",
      `Lead moved to ${status.replace("_", " ")}.`,
      user,
    );

    return;
  }

  const state = hydrateLocalStore();
  state.leads = state.leads.map((lead) => {
    if (lead.id !== id) return lead;
    return recalculateLead({
      ...lead,
      status,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });
  });

  const updated = state.leads.find((lead) => lead.id === id);
  if (updated) {
    await appendActivity(
      updated,
      "status",
      `Lead moved to ${status.replace("_", " ")}.`,
      user,
    );
  }

  persistLocalStore();
  emitLocalUpdates();
  broadcastState();
}

export async function addLeadNote(id: string, note: string, user: string) {
  const trimmedNote = note.trim();
  if (!trimmedNote) return;

  if (hasSupabaseConfig) {
    const current = (await fetchSupabaseLeads()).find((lead) => lead.id === id);
    if (!current) return;

    const withUpdates = recalculateLead({
      ...current,
      notes: [trimmedNote, ...current.notes],
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });

    const { error } = await supabase!
      .from(LEADS_TABLE)
      .update({
        notes: withUpdates.notes,
        score: withUpdates.score,
        priority_band: withUpdates.priority_band,
        next_action: withUpdates.next_action,
        last_activity_at: withUpdates.last_activity_at,
        updated_by: user,
      })
      .eq("id", id);

    if (error) throw error;

    await appendActivity(withUpdates, "note", `Added note: ${trimmedNote}`, user);
    return;
  }

  const state = hydrateLocalStore();
  state.leads = state.leads.map((lead) => {
    if (lead.id !== id) return lead;
    return recalculateLead({
      ...lead,
      notes: [trimmedNote, ...lead.notes],
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });
  });

  const updated = state.leads.find((lead) => lead.id === id);
  if (updated) {
    await appendActivity(updated, "note", `Added note: ${trimmedNote}`, user);
  }

  persistLocalStore();
  emitLocalUpdates();
  broadcastState();
}

export async function reassignLead(id: string, assignee: {
  name: string;
  initials: string;
  color: string;
}, user: string) {
  if (hasSupabaseConfig) {
    const current = (await fetchSupabaseLeads()).find((lead) => lead.id === id);
    if (!current) return;

    const withUpdates = recalculateLead({
      ...current,
      assigned_to: assignee.name,
      assigned_initials: assignee.initials,
      assigned_color: assignee.color,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });

    const { error } = await supabase!
      .from(LEADS_TABLE)
      .update({
        assigned_to: assignee.name,
        assigned_initials: assignee.initials,
        assigned_color: assignee.color,
        score: withUpdates.score,
        priority_band: withUpdates.priority_band,
        next_action: withUpdates.next_action,
        last_activity_at: withUpdates.last_activity_at,
        updated_by: user,
      })
      .eq("id", id);

    if (error) throw error;

    await appendActivity(withUpdates, "assignment", `Reassigned to ${assignee.name}.`, user);
    return;
  }

  const state = hydrateLocalStore();
  state.leads = state.leads.map((lead) => {
    if (lead.id !== id) return lead;
    return recalculateLead({
      ...lead,
      assigned_to: assignee.name,
      assigned_initials: assignee.initials,
      assigned_color: assignee.color,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });
  });

  const updated = state.leads.find((lead) => lead.id === id);
  if (updated) {
    await appendActivity(updated, "assignment", `Reassigned to ${assignee.name}.`, user);
  }

  persistLocalStore();
  emitLocalUpdates();
  broadcastState();
}

export async function upsertFollowUp(
  id: string,
  followUpAt: string,
  nextAction: NextAction,
  user: string,
) {
  if (!followUpAt) return;

  if (hasSupabaseConfig) {
    const current = (await fetchSupabaseLeads()).find((lead) => lead.id === id);
    if (!current) return;

    const withUpdates = recalculateLead({
      ...current,
      follow_up_at: followUpAt,
      next_action: nextAction,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });

    const { error } = await supabase!
      .from(LEADS_TABLE)
      .update({
        follow_up_at: followUpAt,
        next_action: nextAction,
        score: withUpdates.score,
        priority_band: withUpdates.priority_band,
        last_activity_at: withUpdates.last_activity_at,
        updated_by: user,
      })
      .eq("id", id);

    if (error) throw error;

    const { error: followUpError } = await supabase!.from(FOLLOWUPS_TABLE).upsert(
      {
        lead_id: id,
        follow_up_at: followUpAt,
        next_action: nextAction,
        created_by: user,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "lead_id" },
    );

    if (followUpError) throw followUpError;

    await appendActivity(
      withUpdates,
      "follow_up",
      `Follow-up scheduled for ${new Date(followUpAt).toLocaleString()} (${nextAction}).`,
      user,
    );
    return;
  }

  const state = hydrateLocalStore();
  state.leads = state.leads.map((lead) => {
    if (lead.id !== id) return lead;
    return recalculateLead({
      ...lead,
      follow_up_at: followUpAt,
      next_action: nextAction,
      last_activity_at: new Date().toISOString(),
      updated_by: user,
    });
  });

  state.followups = [
    {
      lead_id: id,
      follow_up_at: followUpAt,
      next_action: nextAction,
      created_by: user,
      updated_at: new Date().toISOString(),
    },
    ...state.followups.filter((item) => item.lead_id !== id),
  ];

  const updated = state.leads.find((lead) => lead.id === id);
  if (updated) {
    await appendActivity(
      updated,
      "follow_up",
      `Follow-up scheduled for ${new Date(followUpAt).toLocaleString()} (${nextAction}).`,
      user,
    );
  }

  persistLocalStore();
  emitLocalUpdates();
  broadcastState();
}

export async function createLead(input: Omit<Lead, "score" | "priority_band" | "next_action" | "notes"> & { notes?: string[] }) {
  const computedScore = computeLeadScore({
    status: input.status,
    source_platform: input.source_platform,
    budget: input.budget,
    trade_in: input.trade_in,
    financing: input.financing,
    last_activity_at: input.last_activity_at,
    follow_up_at: input.follow_up_at,
  });

  const payload: Lead = {
    ...input,
    notes: input.notes ?? [],
    score: computedScore,
    priority_band: derivePriorityBand(computedScore),
    next_action: suggestNextAction({ status: input.status, follow_up_at: input.follow_up_at }),
  };

  if (hasSupabaseConfig) {
    const { error } = await supabase!.from(LEADS_TABLE).insert(payload);
    if (error) throw error;

    await appendActivity(payload, "created", "Lead created manually from CRM.", payload.updated_by);
    return;
  }

  const state = hydrateLocalStore();
  state.leads = [payload, ...state.leads];
  await appendActivity(payload, "created", "Lead created manually from CRM.", payload.updated_by);

  persistLocalStore();
  emitLocalUpdates();
  broadcastState();
}

export function getConnectionMode() {
  return hasSupabaseConfig ? "supabase" : "local-fallback";
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  addLeadNote,
  createLead,
  getConnectionMode,
  reassignLead,
  subscribeActivities,
  subscribeLeads,
  updateLeadStatus,
  upsertFollowUp,
} from "../lib/leads/service";
import { SALES_REPS } from "../lib/leads/types";
import type { Lead, LeadActivity, LeadStatus, NextAction } from "../lib/leads/types";

interface LeadsContextValue {
  leads: Lead[];
  activities: LeadActivity[];
  loading: boolean;
  connectionMode: "supabase" | "local-fallback";
  currentUser: string;
  salesReps: { name: string; initials: string; color: string }[];
  addNewLead: (lead: Omit<Lead, "score" | "priority_band" | "next_action" | "notes"> & { notes?: string[] }) => Promise<void>;
  changeStatus: (id: string, status: LeadStatus) => Promise<void>;
  createNote: (id: string, note: string) => Promise<void>;
  assignLead: (id: string, assignee: { name: string; initials: string; color: string }) => Promise<void>;
  scheduleFollowUp: (id: string, followUpAt: string, nextAction: NextAction) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const connectionMode = getConnectionMode();
  const currentUser = "Alex Morgan";

  useEffect(() => {
    let mounted = true;
    let leadUnsub = () => undefined;
    let activityUnsub = () => undefined;

    (async () => {
      const unsubLeads = await subscribeLeads((nextLeads) => {
        if (!mounted) return;
        setLeads(nextLeads);
      });

      const unsubActivities = await subscribeActivities((nextActivities) => {
        if (!mounted) return;
        setActivities(nextActivities);
      });

      leadUnsub = unsubLeads;
      activityUnsub = unsubActivities;

      if (mounted) {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      leadUnsub();
      activityUnsub();
    };
  }, []);

  const addNewLead = useCallback<LeadsContextValue["addNewLead"]>(
    async (lead) => {
      await createLead(lead);
    },
    [],
  );

  const changeStatus = useCallback<LeadsContextValue["changeStatus"]>(
    async (id, status) => {
      await updateLeadStatus(id, status, currentUser);
    },
    [currentUser],
  );

  const createNote = useCallback<LeadsContextValue["createNote"]>(
    async (id, note) => {
      await addLeadNote(id, note, currentUser);
    },
    [currentUser],
  );

  const assignLead = useCallback<LeadsContextValue["assignLead"]>(
    async (id, assignee) => {
      await reassignLead(id, assignee, currentUser);
    },
    [currentUser],
  );

  const scheduleFollowUp = useCallback<LeadsContextValue["scheduleFollowUp"]>(
    async (id, followUpAt, nextAction) => {
      await upsertFollowUp(id, followUpAt, nextAction, currentUser);
    },
    [currentUser],
  );

  const value = useMemo<LeadsContextValue>(
    () => ({
      leads,
      activities,
      loading,
      connectionMode,
      currentUser,
      salesReps: SALES_REPS.map((rep) => ({ ...rep })),
      addNewLead,
      changeStatus,
      createNote,
      assignLead,
      scheduleFollowUp,
    }),
    [
      leads,
      activities,
      loading,
      connectionMode,
      currentUser,
      addNewLead,
      changeStatus,
      createNote,
      assignLead,
      scheduleFollowUp,
    ],
  );

  return <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>;
}

export function useLeads() {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within LeadsProvider");
  }
  return context;
}

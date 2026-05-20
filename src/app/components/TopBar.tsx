import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useLeads } from "../context/LeadsContext";
import type { Lead, SourcePlatform } from "../lib/leads/types";
import { cn } from "./ui/utils";
import type { ViewType } from "./Sidebar";

const sourceOptions: SourcePlatform[] = ["Website", "Facebook", "Twitter", "Google", "Offline Event"];

const pageTitle: Record<ViewType, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  pipeline: "Lead Management",
  reports: "Reports & Analytics",
  settings: "Settings",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface TopBarProps {
  currentView: ViewType;
  onNewLead: () => void;
  onOpenLeadPage: (leadId: string) => void;
}

export function TopBar({ currentView, onNewLead, onOpenLeadPage }: TopBarProps) {
  const { leads, activities, addNewLead, salesReps, currentUser } = useLeads();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleInterest: "",
    vehicleCategory: "SUV",
    budget: 35000,
    source: "Website" as SourcePlatform,
    assignedTo: salesReps[0]?.name ?? "Alex Morgan",
    financing: true,
    tradeIn: false,
  });

  const notifications = useMemo(
    () => activities.slice(0, 4).map((activity) => ({
      id: activity.id,
      text: `${activity.lead_name}: ${activity.description}`,
      time: new Date(activity.created_at).toLocaleTimeString(),
      unread: true,
    })),
    [activities],
  );

  const unreadCount = notifications.length;
  const newThisWeek = leads.filter((lead) => Date.now() - Date.parse(lead.created_at) <= 7 * 86400000).length;

  const subtitle =
    currentView === "dashboard"
      ? `${leads.length} total leads · ${newThisWeek} new this week`
      : currentView === "leads"
      ? `${leads.length} total leads in live workspace`
      : currentView === "pipeline"
      ? "Drag and drop updates sync instantly"
      : currentView === "reports"
      ? `${leads.length} leads · ${leads.filter((l) => l.status === "won").length} won`
      : "Workspace configuration";

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return [];
    return leads.filter((lead) =>
      lead.name.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query) ||
      lead.vehicle_interest.toLowerCase().includes(query),
    ).slice(0, 5);
  }, [searchValue, leads]);

  const createLead = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.vehicleInterest.trim()) {
      return;
    }

    const rep = salesReps.find((item) => item.name === form.assignedTo) ?? salesReps[0];
    const idNumber = leads.length + 1;
    const leadId = `L${String(idNumber).padStart(3, "0")}`;

    await addNewLead({
      id: leadId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      vehicle_interest: form.vehicleInterest.trim(),
      vehicle_category: form.vehicleCategory,
      budget: Number(form.budget),
      status: "new",
      source_platform: form.source,
      assigned_to: rep?.name ?? "Alex Morgan",
      assigned_initials: rep?.initials ?? "AM",
      assigned_color: rep?.color ?? "bg-violet-500",
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      follow_up_at: null,
      trade_in: form.tradeIn,
      financing: form.financing,
      updated_by: currentUser,
    });

    setShowCreateModal(false);
    setForm({
      name: "",
      email: "",
      phone: "",
      vehicleInterest: "",
      vehicleCategory: "SUV",
      budget: 35000,
      source: "Website",
      assignedTo: salesReps[0]?.name ?? "Alex Morgan",
      financing: true,
      tradeIn: false,
    });

    onNewLead();
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 relative z-10">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-gray-900 leading-none">{pageTitle[currentView]}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads by name, email, vehicle..."
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => { if (searchValue) setShowSearchResults(true); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setShowSearchResults(false);
                (event.target as HTMLInputElement).blur();
              }
              if (event.key === "Enter" && searchResults.length > 0) {
                onOpenLeadPage(searchResults[0].id);
                setSearchValue("");
                setShowSearchResults(false);
              }
            }}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {showSearchResults && searchValue && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
              <div className="absolute top-11 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">No leads found</div>
                ) : (
                  searchResults.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => {
                        onOpenLeadPage(lead.id);
                        setSearchValue("");
                        setShowSearchResults(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-400 truncate">{lead.vehicle_interest}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{lead.source_platform}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Lead
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowUserMenu(false);
            }}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-0.5 leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-11 w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Live Activity</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 bg-indigo-50/30">
                      <p className="text-sm text-gray-800 leading-snug">{notification.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu((prev) => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold">
              {initialsOf(currentUser)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-11 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{currentUser}</p>
                  <p className="text-xs text-gray-500">Live collaboration enabled</p>
                </div>
                {[
                  { icon: User, label: "My Profile" },
                  { icon: Settings, label: "Workspace Settings" },
                  { icon: HelpCircle, label: "Help & Support" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                    <Icon className="w-4 h-4 text-gray-400" />
                    {label}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/25 z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Create New Lead</h3>
                <p className="text-sm text-gray-500 mt-0.5">This lead will sync live across all screens.</p>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Email</span>
                  <input
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Phone</span>
                  <input
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Vehicle Interest</span>
                  <input
                    value={form.vehicleInterest}
                    onChange={(event) => setForm((prev) => ({ ...prev, vehicleInterest: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Vehicle Category</span>
                  <input
                    value={form.vehicleCategory}
                    onChange={(event) => setForm((prev) => ({ ...prev, vehicleCategory: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Budget</span>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(event) => setForm((prev) => ({ ...prev, budget: Number(event.target.value) || 0 }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  />
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Source Platform</span>
                  <select
                    value={form.source}
                    onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value as SourcePlatform }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  >
                    {sourceOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-gray-600 space-y-1">
                  <span>Assign To</span>
                  <select
                    value={form.assignedTo}
                    onChange={(event) => setForm((prev) => ({ ...prev, assignedTo: event.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-gray-200"
                  >
                    {salesReps.map((rep) => (
                      <option key={rep.name} value={rep.name}>{rep.name}</option>
                    ))}
                  </select>
                </label>

                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.financing}
                    onChange={(event) => setForm((prev) => ({ ...prev, financing: event.target.checked }))}
                    className="w-4 h-4"
                  />
                  Financing needed
                </label>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.tradeIn}
                    onChange={(event) => setForm((prev) => ({ ...prev, tradeIn: event.target.checked }))}
                    className="w-4 h-4"
                  />
                  Trade-in expected
                </label>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="h-9 px-4 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void createLead()}
                  className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Create Lead
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

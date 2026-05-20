import { useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, HelpCircle, Palette, Shield, Users } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { KanbanBoard } from "./components/KanbanBoard";
import { LeadDetailsPage } from "./components/LeadDetailsPage";
import { LeadsView } from "./components/LeadsView";
import { ReportsView } from "./components/ReportsView";
import { Sidebar, type ViewType } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

function parseLeadPath(pathname: string) {
  const match = pathname.match(/^\/leads\/([^/]+)$/);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function SettingsView() {
  const sections = [
    {
      title: "Profile & Account",
      items: [
        { icon: Users, label: "Personal Information", sub: "Name, email, phone, profile photo" },
        { icon: Shield, label: "Security", sub: "Password and access preferences" },
        { icon: Bell, label: "Notifications", sub: "Email and in-app updates" },
      ],
    },
    {
      title: "Workspace",
      items: [
        { icon: Palette, label: "Appearance", sub: "Theme and density" },
        { icon: Users, label: "Team Members", sub: "Manage reps and roles" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help & Documentation", sub: "Guides and FAQs" },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map(({ icon: Icon, label, sub }) => (
                <button key={label} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 text-left group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const initialLeadPath =
    typeof window === "undefined" ? null : parseLeadPath(window.location.pathname);

  const [currentView, setCurrentView] = useState<ViewType>(initialLeadPath ? "leads" : "dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullPageLeadId, setFullPageLeadId] = useState<string | null>(initialLeadPath);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const onPopState = () => {
      const leadId = parseLeadPath(window.location.pathname);
      setFullPageLeadId(leadId);
      if (leadId) {
        setCurrentView("leads");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openLeadPage = (leadId: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/leads/${encodeURIComponent(leadId)}`);
    }
    setCurrentView("leads");
    setFullPageLeadId(leadId);
  };

  const closeLeadPage = () => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/");
    }
    setCurrentView("leads");
    setFullPageLeadId(null);
  };

  const navigateView = (view: ViewType) => {
    setCurrentView(view);
    if (fullPageLeadId) {
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", "/");
      }
      setFullPageLeadId(null);
    }
  };

  const renderedView = useMemo(() => {
    if (fullPageLeadId) {
      return <LeadDetailsPage leadId={fullPageLeadId} onBack={closeLeadPage} />;
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewLeads={() => navigateView("leads")} onViewPipeline={() => navigateView("pipeline")} />;
      case "leads":
        return <LeadsView onOpenLeadPage={openLeadPage} />;
      case "pipeline":
        return <KanbanBoard onOpenLeadPage={openLeadPage} />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  }, [currentView, fullPageLeadId]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onNavigate={navigateView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar currentView={currentView} onNewLead={() => navigateView("leads")} onOpenLeadPage={openLeadPage} />
        {renderedView}
      </div>
    </div>
  );
}

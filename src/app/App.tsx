import { useState } from "react";
import { Sidebar, type ViewType } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./components/Dashboard";
import { LeadsView } from "./components/LeadsView";
import { KanbanBoard } from "./components/KanbanBoard";
import { ReportsView } from "./components/ReportsView";
import {
  Contact, Car, Settings, Bell, Shield, Palette,
  Link, Users, HelpCircle, ChevronRight,
} from "lucide-react";

function PlaceholderView({ title, icon: Icon, description }: {
  title: string;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{description}</p>
        <button className="h-9 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
          Coming Soon
        </button>
      </div>
    </div>
  );
}

function SettingsView() {
  const sections = [
    {
      title: 'Profile & Account',
      items: [
        { icon: Users, label: 'Personal Information', sub: 'Name, email, phone, profile photo' },
        { icon: Shield, label: 'Security & Password', sub: 'Password, two-factor authentication' },
        { icon: Bell, label: 'Notifications', sub: 'Email, push, and in-app preferences' },
      ],
    },
    {
      title: 'Workspace',
      items: [
        { icon: Palette, label: 'Appearance', sub: 'Theme, density, and display settings' },
        { icon: Link, label: 'Integrations', sub: 'Connect external tools and APIs' },
        { icon: Users, label: 'Team Members', sub: 'Manage reps, roles, and permissions' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Documentation', sub: 'Guides, tutorials, and FAQs' },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {sections.map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map(({ icon: Icon, label, sub }) => (
                <button key={label} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left group">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">DriveFlow CRM</p>
            <p className="text-xs text-gray-400">Version 2.4.1 · Enterprise Plan</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onViewLeads={() => setCurrentView('leads')}
            onViewPipeline={() => setCurrentView('pipeline')}
          />
        );
      case 'leads':
        return <LeadsView />;
      case 'pipeline':
        return <KanbanBoard />;
      case 'contacts':
        return (
          <PlaceholderView
            title="Contacts"
            icon={Contact}
            description="A unified directory of all your customers and prospects — complete with purchase history, interactions, and communication logs."
          />
        );
      case 'vehicles':
        return (
          <PlaceholderView
            title="Vehicle Inventory"
            icon={Car}
            description="Browse and manage your full vehicle inventory. Match leads to available stock, track lot arrivals, and set pricing rules."
          />
        );
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          currentView={currentView}
          onNewLead={() => setCurrentView('leads')}
        />
        {renderView()}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Search, Bell, Plus, ChevronDown, LogOut, User, HelpCircle, Settings } from "lucide-react";
import { cn } from "./ui/utils";
import type { ViewType } from "./Sidebar";

const pageLabels: Record<ViewType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Welcome back, Alex' },
  leads: { title: 'Leads', subtitle: '247 total leads · 38 new this week' },
  pipeline: { title: 'Pipeline', subtitle: 'Visual pipeline management' },
  contacts: { title: 'Contacts', subtitle: 'Customer & prospect directory' },
  vehicles: { title: 'Vehicles', subtitle: 'Inventory management' },
  reports: { title: 'Reports & Analytics', subtitle: 'Performance insights' },
  settings: { title: 'Settings', subtitle: 'Manage your workspace' },
};

const notifications = [
  { id: 1, text: 'Amanda Foster completed a test drive', time: '10 min ago', unread: true },
  { id: 2, text: 'Karen Martinez responded to your offer', time: '25 min ago', unread: true },
  { id: 3, text: 'New lead assigned: Angela White', time: '1 hr ago', unread: true },
  { id: 4, text: 'Monthly report ready to view', time: '3 hrs ago', unread: false },
];

interface TopBarProps {
  currentView: ViewType;
  onNewLead: () => void;
}

export function TopBar({ currentView, onNewLead }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const page = pageLabels[currentView];
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 relative z-10">
      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 leading-none">{page.title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{page.subtitle}</p>
      </div>

      {/* Search Bar */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search leads, contacts..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all"
        />
      </div>

      {/* Add Lead Button */}
      <button
        onClick={onNewLead}
        className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shrink-0 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        New Lead
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Mark all read</button>
              </div>
              <div className="divide-y divide-gray-50">
                {notifications.map(notification => (
                  <div key={notification.id} className={cn(
                    "px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                    notification.unread ? "bg-indigo-50/40" : ""
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 w-2 h-2 rounded-full shrink-0",
                        notification.unread ? "bg-indigo-500" : "bg-transparent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 leading-snug">{notification.text}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
          className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold">
            AM
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {showUserMenu && (
          <>
            <div className="fixed inset-0" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-11 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Alex Morgan</p>
                <p className="text-xs text-gray-500">alex.morgan@driveflow.com</p>
              </div>
              {[
                { icon: User, label: 'My Profile' },
                { icon: Settings, label: 'Account Settings' },
                { icon: HelpCircle, label: 'Help & Support' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <Icon className="w-4 h-4 text-gray-400" />
                  {label}
                </button>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

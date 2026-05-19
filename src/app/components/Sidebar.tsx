import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Contact,
  Car,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Zap,
} from "lucide-react";
import { cn } from "./ui/utils";

export type ViewType = 'dashboard' | 'leads' | 'pipeline' | 'contacts' | 'vehicles' | 'reports' | 'settings';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users, badge: 38 },
  { id: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'contacts', label: 'Contacts', icon: Contact },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentView, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shrink-0 relative z-20",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 border-b border-gray-200 flex items-center shrink-0",
        collapsed ? "justify-center px-2" : "px-5 gap-3"
      )}>
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-900 tracking-tight">DriveFlow</span>
            <span className="text-xs text-indigo-600 font-medium tracking-wide">CRM</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-150 group relative",
                  collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                {!collapsed && (
                  <>
                    <span className={cn(
                      "text-sm font-medium flex-1 text-left",
                      isActive ? "text-indigo-700" : ""
                    )}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="min-w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center px-1.5">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Settings at bottom of nav */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onNavigate('settings')}
            className={cn(
              "w-full flex items-center rounded-lg transition-all duration-150 group",
              collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
              currentView === 'settings'
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className={cn(
              "w-5 h-5 shrink-0",
              currentView === 'settings' ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
            )} />
            {!collapsed && (
              <span className={cn(
                "text-sm font-medium",
                currentView === 'settings' ? "text-indigo-700" : ""
              )}>Settings</span>
            )}
          </button>
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-gray-200 p-3 shrink-0",
        collapsed ? "flex justify-center" : ""
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold">
            AM
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
              AM
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Alex Morgan</p>
              <p className="text-xs text-gray-500 truncate">Sales Manager</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:shadow-md transition-all z-30"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}

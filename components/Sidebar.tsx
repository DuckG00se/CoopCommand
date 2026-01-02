import React from 'react';
import { LayoutDashboard, FileCode, Settings, Terminal, Bird } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'logs', label: 'Serial Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'firmware', label: 'Firmware & Wiring', icon: FileCode },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 border-r border-slate-700 z-10">
      <div className="p-4 flex items-center justify-center md:justify-start gap-3 border-b border-slate-700 h-16">
        <Bird className="w-8 h-8 text-emerald-400" />
        <span className="text-xl font-bold hidden md:block tracking-tight">Coop<span className="text-emerald-400">Cmd</span></span>
      </div>
      
      <nav className="flex-1 py-6 space-y-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={22} className={isActive ? 'animate-pulse-slow' : 'group-hover:scale-110 transition-transform'} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 hidden md:block">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Simulated
          </div>
        </div>
      </div>
    </div>
  );
};
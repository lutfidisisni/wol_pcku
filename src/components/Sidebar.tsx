import React from "react";
import {
  LayoutDashboard,
  Network,
  Clock,
  Radio,
  BookOpen,
  Zap,
  Power,
  Server,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  activeTab: "dashboard" | "topology" | "logs";
  onSelectTab: (tab: "dashboard" | "topology" | "logs") => void;
  onOpenManualModal: () => void;
  onOpenGuideModal: () => void;
  logCount: number;
  onlineCount: number;
  totalCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenManualModal,
  onOpenGuideModal,
  logCount,
  onlineCount,
  totalCount,
}) => {
  return (
    <aside
      id="app-sidebar"
      className="w-64 bg-[#020202] border-r border-slate-800 p-5 flex flex-col shrink-0 select-none"
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
          <Zap className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex items-baseline">
          <span className="text-xl font-extrabold tracking-tight text-white font-sans">
            WOL<span className="text-blue-500">DASH</span>
          </span>
          <span className="ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            PRO
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {/* Dashboard */}
        <button
          id="nav-tab-dashboard"
          onClick={() => onSelectTab("dashboard")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "dashboard"
              ? "bg-slate-800/60 text-blue-400 border border-slate-700/50 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
            <span>Dashboard</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {onlineCount}/{totalCount}
          </span>
        </button>

        {/* Network Topology */}
        <button
          id="nav-tab-topology"
          onClick={() => onSelectTab("topology")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "topology"
              ? "bg-slate-800/60 text-blue-400 border border-slate-700/50 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <Network className="w-4.5 h-4.5 shrink-0" />
          <span>Network Topology</span>
        </button>

        {/* Logs */}
        <button
          id="nav-tab-logs"
          onClick={() => onSelectTab("logs")}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "logs"
              ? "bg-slate-800/60 text-blue-400 border border-slate-700/50 shadow-xs"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-4.5 h-4.5 shrink-0" />
            <span>Activity Logs</span>
          </div>
          {logCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30">
              {logCount}
            </span>
          )}
        </button>

        <div className="my-3 pt-3 border-t border-slate-900">
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
            WoL Tools
          </span>

          {/* WoL Manual Packet */}
          <button
            id="nav-btn-manual-wol"
            onClick={onOpenManualModal}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            <Radio className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Kirim WoL Manual</span>
          </button>

          {/* WoL Setup Guide */}
          <button
            id="nav-btn-guide"
            onClick={onOpenGuideModal}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Panduan Konfigurasi</span>
          </button>
        </div>
      </nav>

      {/* Local Server IP Card (from Design HTML) */}
      <div className="mt-auto p-4 bg-[#111114] rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Local Server IP
          </p>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <p className="text-sm font-mono font-bold text-blue-400">192.168.8.1</p>
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>UDP Port 9/7</span>
          <span className="text-emerald-400 font-medium">Ready</span>
        </div>
      </div>
    </aside>
  );
};

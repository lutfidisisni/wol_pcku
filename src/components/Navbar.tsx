import React from "react";
import {
  Power,
  Search,
  Plus,
  Radio,
  Clock,
  BookOpen,
  LayoutGrid,
  List,
  Sun,
  Moon,
  X,
  Filter,
  RefreshCw,
  Zap,
} from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "online" | "offline";
  onStatusFilterChange: (status: "all" | "online" | "offline") => void;
  groupFilter: string;
  onGroupFilterChange: (group: string) => void;
  availableGroups: string[];
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  onOpenAddModal: () => void;
  onOpenManualModal: () => void;
  onOpenLogsDrawer: () => void;
  onOpenGuideModal: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  logCount: number;
  pollInterval: number; // in seconds, 0 = off
  onPollIntervalChange: (seconds: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  groupFilter,
  onGroupFilterChange,
  availableGroups,
  viewMode,
  onViewModeChange,
  onOpenAddModal,
  onOpenManualModal,
  onOpenLogsDrawer,
  onOpenGuideModal,
  onRefreshAll,
  isRefreshing,
  logCount,
  pollInterval,
  onPollIntervalChange,
}) => {
  return (
    <header
      id="main-header"
      className="sticky top-0 z-30 border-b border-slate-800 bg-[#0c0c0e] text-slate-100 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
        {/* Top Row: Controller Title & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Header Title & Subtitle */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Wake-on-LAN Controller</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Manage and boot devices across your local subnet.
            </p>
          </div>

          {/* Actions Button Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Auto-Sync Interval Selector with Pulsing Live Dot */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-[#111114] text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  pollInterval > 0
                    ? isRefreshing
                      ? "bg-amber-400 animate-ping"
                      : "bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse"
                    : "bg-slate-600"
                }`}
                title={pollInterval > 0 ? "Auto-Sync Aktif" : "Auto-Sync Nonaktif"}
              />
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Sync:</span>
              <select
                id="select-poll-interval"
                value={pollInterval}
                onChange={(e) => onPollIntervalChange(Number(e.target.value))}
                className="bg-transparent text-slate-200 text-xs font-medium cursor-pointer focus:outline-none pr-1"
                title="Atur interval auto-refresh status"
              >
                <option value={3} className="bg-[#111114] text-slate-200">
                  3s (Cepat / Realtime)
                </option>
                <option value={5} className="bg-[#111114] text-slate-200">
                  5s (Standar)
                </option>
                <option value={10} className="bg-[#111114] text-slate-200">
                  10s
                </option>
                <option value={30} className="bg-[#111114] text-slate-200">
                  30s
                </option>
                <option value={0} className="bg-[#111114] text-slate-200">
                  Manual (Off)
                </option>
              </select>
            </div>

            {/* Quick Refresh Status */}
            <button
              id="btn-nav-refresh"
              onClick={onRefreshAll}
              disabled={isRefreshing}
              className="p-2.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
              title="Ping & Refresh Semua Host Sekarang"
              aria-label="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
            </button>

            {/* Manual WoL Packet Sender */}
            <button
              id="btn-open-manual-wol"
              onClick={onOpenManualModal}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-[#111114] text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-all"
              title="Kirim Magic Packet Manual ke MAC sembarang"
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">WoL Manual</span>
            </button>

            {/* Guide Button */}
            <button
              id="btn-open-guide"
              onClick={onOpenGuideModal}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-[#111114] text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-all"
              title="Panduan Konfigurasi BIOS & Driver"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Panduan</span>
            </button>

            {/* Activity Logs Drawer Toggle */}
            <button
              id="btn-open-logs"
              onClick={onOpenLogsDrawer}
              className="relative px-3 py-2 rounded-xl text-xs font-semibold border border-slate-800 bg-[#111114] text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-all"
              title="Buka Riwayat Log Magic Packet"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Logs</span>
              {logCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                  {logCount}
                </span>
              )}
            </button>

            {/* Add PC Button (Exact from Design HTML) */}
            <button
              id="btn-add-pc"
              onClick={onOpenAddModal}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Device</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Search, Filters, and View Toggles */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              id="input-search"
              type="text"
              placeholder="Search by device name, IP (192.168.x.x), or MAC address..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-800 bg-[#111114] text-slate-100 placeholder-slate-400 text-xs transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills and View Mode */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Tabs */}
            <div className="p-1 rounded-xl border border-slate-800 bg-[#111114] flex items-center gap-1">
              {(
                [
                  { id: "all", label: "All Hosts" },
                  { id: "online", label: "Online" },
                  { id: "offline", label: "Offline" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onStatusFilterChange(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === tab.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Group Dropdown Filter */}
            {availableGroups.length > 0 && (
              <div className="relative">
                <select
                  value={groupFilter}
                  onChange={(e) => onGroupFilterChange(e.target.value)}
                  className="py-1.5 pl-3 pr-8 rounded-xl border border-slate-800 bg-[#111114] text-slate-300 text-xs font-medium appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Rooms / Groups</option>
                  {availableGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
                  <Filter className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="p-1 rounded-xl border border-slate-800 bg-[#111114] flex items-center gap-1">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange("table")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};


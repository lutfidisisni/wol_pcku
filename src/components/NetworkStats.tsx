import React from "react";
import {
  Activity,
  CheckCircle2,
  Power,
  RefreshCw,
  Wifi,
  Radio,
  Zap,
} from "lucide-react";
import { Device } from "../types";

interface NetworkStatsProps {
  devices: Device[];
  onWakeAll: () => void;
  onRefreshAll: () => void;
  isWakingAll: boolean;
  isRefreshing: boolean;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  devices,
  onWakeAll,
  onRefreshAll,
  isWakingAll,
  isRefreshing,
}) => {
  const totalCount = devices.length;
  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const wakingCount = devices.filter((d) => d.status === "waking").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Devices */}
      <div
        id="stat-card-total"
        className="p-5 rounded-2xl border border-slate-800 bg-[#111114] flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            Total Devices
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Wifi className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-white">{totalCount}</span>
          <span className="text-xs text-slate-400 font-mono">Hosts Configured</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>192.168.8.255 / UDP 9</span>
        </div>
      </div>

      {/* Online Devices */}
      <div
        id="stat-card-online"
        className="p-5 rounded-2xl border border-slate-800 bg-[#111114] flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            Online Hosts
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-green-400">{onlineCount}</span>
          <span className="text-xs text-slate-400 font-mono">Active & Responding</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>ICMP Echo / Socket OK</span>
        </div>
      </div>

      {/* Offline Devices */}
      <div
        id="stat-card-offline"
        className="p-5 rounded-2xl border border-slate-800 bg-[#111114] flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            Offline / Standby
          </span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 border border-red-500/20">
            <Power className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-red-400">{offlineCount}</span>
          {wakingCount > 0 ? (
            <span className="text-xs text-amber-400 animate-pulse font-medium">
              ({wakingCount} booting...)
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-mono">WoL Standby</span>
          )}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Radio className="w-3.5 h-3.5 text-slate-400" />
          <span>Listening for Magic Packets</span>
        </div>
      </div>

      {/* Quick Batch Actions */}
      <div
        id="stat-card-actions"
        className="p-5 rounded-2xl border border-slate-800 bg-[#111114] flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg shadow-black/20"
      >
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
            Batch Network Control
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast wake packet to all offline hosts simultaneously.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            id="btn-wake-all"
            onClick={onWakeAll}
            disabled={isWakingAll || offlineCount === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all shadow-md ${
              offlineCount === 0
                ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/30"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95 cursor-pointer"
            }`}
            title="Broadcast Magic Packet ke semua PC offline"
          >
            {isWakingAll ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Wake All ({offlineCount})</span>
              </>
            )}
          </button>

          <button
            id="btn-refresh-all"
            onClick={onRefreshAll}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-xs font-medium border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-all active:scale-95"
            title="Refresh dan Ping status semua perangkat"
            aria-label="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};


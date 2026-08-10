import React from "react";
import {
  Network,
  Server,
  Monitor,
  Activity,
  Power,
  Zap,
  Radio,
  CheckCircle2,
  Shield,
  Wifi,
} from "lucide-react";
import { Device } from "../types";
import { DeviceIcon, DEVICE_TYPE_LABELS } from "./DeviceIcon";

interface TopologyViewProps {
  devices: Device[];
  onWake: (device: Device) => void;
  onPing: (device: Device) => void;
  onInspect: (device: Device) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
  devices,
  onWake,
  onPing,
  onInspect,
}) => {
  const onlineDevices = devices.filter((d) => d.status === "online");
  const offlineDevices = devices.filter((d) => d.status === "offline");
  const wakingDevices = devices.filter((d) => d.status === "waking");

  return (
    <div className="space-y-6">
      {/* Topology Header Info */}
      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-blue-400" />
              <span>Peta Topologi Jaringan Lokal (Subnet /24)</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualisasi keterhubungan router gateway, broadcast IP, dan host Wake-on-LAN.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 uppercase text-[10px]">Gateway:</span>
            <span className="text-blue-400 font-bold">192.168.8.1</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#09090b] border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400 uppercase text-[10px]">Broadcast:</span>
            <span className="text-emerald-400 font-bold">192.168.8.255</span>
          </div>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        {/* Central Router / Gateway Node */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-xl shadow-blue-600/30 border-2 border-blue-400/40 relative z-10">
            <Server className="w-7 h-7" />
          </div>
          <span className="mt-2 text-sm font-bold text-slate-100">Gateway Switch & WoL Server</span>
          <span className="text-xs font-mono text-blue-400">192.168.8.1 • UDP Port 9 / 7</span>
        </div>

        {/* Device Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          {devices.map((device) => {
            const isOnline = device.status === "online";
            const isWaking = device.status === "waking";
            const typeInfo = DEVICE_TYPE_LABELS[device.iconType] || DEVICE_TYPE_LABELS.workstation;

            return (
              <div
                key={device.id}
                onClick={() => onInspect(device)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isOnline
                    ? "bg-[#09090b] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/10"
                    : isWaking
                    ? "bg-[#09090b] border-amber-500/40 animate-pulse"
                    : "bg-[#09090b] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${typeInfo.bg}`}
                    >
                      <DeviceIcon type={device.iconType} className={`w-5 h-5 ${typeInfo.text}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {device.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">{device.ip}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-tighter border ${
                      isOnline
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : isWaking
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}
                  >
                    {isOnline ? "Online" : isWaking ? "Booting" : "Offline"}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-sky-400">{device.mac}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onPing(device)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Ping Host"
                    >
                      <Activity className="w-3.5 h-3.5" />
                    </button>
                    {!isOnline && (
                      <button
                        onClick={() => onWake(device)}
                        className="py-1 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors"
                      >
                        <Power className="w-3 h-3" />
                        <span>Turn On</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

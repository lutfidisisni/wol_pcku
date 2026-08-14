import React, { useState } from "react";
import {
  Power,
  Copy,
  Check,
  MoreVertical,
  Activity,
  Edit2,
  Trash2,
  Loader2,
  Info,
  Radio,
  Eye,
  Zap,
  RotateCcw,
  Moon,
} from "lucide-react";
import { Device } from "../types";
import { DeviceIcon, DEVICE_TYPE_LABELS } from "./DeviceIcon";

interface DeviceCardProps {
  device: Device;
  isDark?: boolean;
  onWake: (device: Device) => Promise<void>;
  onPing: (device: Device) => Promise<void>;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
  onInspect: (device: Device) => void;
  onPowerAction: (device: Device) => void;
  isWaking: boolean;
  isPinging: boolean;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  device,
  onWake,
  onPing,
  onEdit,
  onDelete,
  onInspect,
  onPowerAction,
  isWaking,
  isPinging,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const copyToClipboard = (text: string, fieldName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const isOnline = device.status === "online";
  const isWakingUp = device.status === "waking" || isWaking;

  const typeInfo = DEVICE_TYPE_LABELS[device.iconType] || DEVICE_TYPE_LABELS.workstation;

  return (
    <div
      id={`device-card-${device.id}`}
      onClick={() => onInspect(device)}
      className={`bg-[#111114] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all cursor-pointer shadow-lg shadow-black/20 group relative ${
        isWakingUp ? "ring-1 ring-amber-500/50" : ""
      }`}
    >
      <div>
        {/* Top bar: Icon & Status Badge */}
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
            <DeviceIcon type={device.iconType} className="w-6 h-6 text-blue-400" />
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Interactive Status Badge (Click to re-check ping status) */}
            <button
              type="button"
              id={`status-badge-${device.id}`}
              onClick={() => onPing(device)}
              disabled={isPinging}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-tight flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                  : isWakingUp
                  ? "bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse hover:bg-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              }`}
              title="Klik untuk ping dan perbarui status sekarang"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline
                    ? "bg-emerald-400 shadow-xs shadow-emerald-400"
                    : isWakingUp
                    ? "bg-amber-400 animate-ping"
                    : "bg-rose-400"
                }`}
              />
              <span>{isPinging ? "Checking..." : isOnline ? "Online" : isWakingUp ? "Booting" : "Offline"}</span>
            </button>

            {/* Menu options */}
            <div className="relative">
              <button
                id={`device-menu-btn-${device.id}`}
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Device Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div
                    id={`device-menu-dropdown-${device.id}`}
                    className="absolute right-0 top-8 z-30 w-48 rounded-xl border border-slate-800 bg-[#09090b] text-slate-200 shadow-2xl p-1.5 text-xs animate-in fade-in zoom-in-95 duration-150"
                  >
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onPing(device);
                      }}
                      disabled={isPinging}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 transition-colors text-left"
                    >
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Ping Check</span>
                    </button>

                    {isOnline && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onPowerAction(device);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-rose-400 transition-colors text-left font-medium"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Matikan / Restart</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onInspect(device);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 transition-colors text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Inspect Payload</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(device);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg hover:bg-slate-800 transition-colors text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Device</span>
                    </button>

                    <div className="h-px bg-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(device);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Device</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Device Name and Group */}
        <div>
          <div className="flex items-baseline justify-between gap-2 mt-4">
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors tracking-tight truncate">
              {device.name}
            </h3>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#09090b] text-slate-400 border border-slate-800 shrink-0">
              {device.group}
            </span>
          </div>

          {/* Network Specs (Exact layout from Design HTML) */}
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono text-xs uppercase">IP Address</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-200">{device.ip}</span>
                <button
                  onClick={(e) => copyToClipboard(device.ip, "ip", e)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Salin IP"
                >
                  {copiedField === "ip" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-mono text-xs uppercase">MAC Address</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-sky-400 tracking-wider">
                  {device.mac}
                </span>
                <button
                  onClick={(e) => copyToClipboard(device.mac, "mac", e)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Salin MAC"
                >
                  {copiedField === "mac" ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {isOnline && device.pingLatencyMs !== undefined && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400 font-mono text-xs uppercase">Latency</span>
                <span className="font-mono text-emerald-400 font-semibold text-xs">
                  {device.pingLatencyMs} ms
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Button Action - Dual Instant Access Controls */}
      <div className="mt-5 pt-4 border-t border-slate-800/80" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Nyalakan (Turn On / WoL) Button */}
          <button
            id={`btn-wake-${device.id}`}
            onClick={() => onWake(device)}
            disabled={isWaking}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer ${
              isWakingUp
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                : isOnline
                ? "bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
            }`}
            title="Kirim Magic Packet (Wake-on-LAN) untuk menyalakan PC"
          >
            {isWaking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            <span>{isWakingUp ? "Kirim Ulang WoL" : "Nyalakan"}</span>
          </button>

          {/* Matikan (Shutdown / Restart / Sleep) Button */}
          <button
            id={`btn-power-${device.id}`}
            onClick={() => onPowerAction(device)}
            className={`flex-1 py-2.5 px-3 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer ${
              isOnline
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
            title="Kirim sinyal Shutdown / Restart / Sleep ke sistem operasi"
          >
            <Power className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
            <span>Matikan</span>
          </button>

          {/* Instant Ping Check */}
          <button
            id={`btn-ping-${device.id}`}
            onClick={() => onPing(device)}
            disabled={isPinging}
            className={`p-2.5 rounded-xl border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all active:scale-95 ${
              isPinging ? "border-sky-500/50 bg-sky-500/10 text-sky-400" : ""
            }`}
            title="Cek respon Ping sekarang"
          >
            <Activity className={`w-4 h-4 ${isPinging ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};



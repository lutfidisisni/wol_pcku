import React, { useState } from "react";
import {
  X,
  Activity,
  Power,
  Copy,
  Check,
  Send,
  Loader2,
  Terminal,
  Shield,
  Layers,
} from "lucide-react";
import { Device } from "../types";
import { DeviceIcon, DEVICE_TYPE_LABELS } from "./DeviceIcon";
import { generateMagicPacketHex } from "../services/api";

interface DeviceDetailModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onWake: (device: Device) => Promise<void>;
  onPing: (device: Device) => Promise<void>;
  onEdit: (device: Device) => void;
  isDark: boolean;
  isWaking: boolean;
  isPinging: boolean;
}

export const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({
  device,
  isOpen,
  onClose,
  onWake,
  onPing,
  onEdit,
  isDark,
  isWaking,
  isPinging,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !device) return null;

  const hexPayload = generateMagicPacketHex(device.mac);
  const typeInfo = DEVICE_TYPE_LABELS[device.iconType] || DEVICE_TYPE_LABELS.workstation;
  const isOnline = device.status === "online";

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const modalBg = "bg-[#111114] border-slate-800 text-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        id="device-detail-modal"
        className={`relative w-full max-w-xl rounded-2xl border p-6 shadow-2xl backdrop-blur-xl z-10 my-8 animate-in fade-in zoom-in-95 duration-200 ${modalBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${typeInfo.bg}`}
            >
              <DeviceIcon type={device.iconType} className={`w-6 h-6 ${typeInfo.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{device.name}</h2>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isOnline
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`}
                  />
                  <span>{isOnline ? "Online" : "Offline"}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {device.group} • {typeInfo.label}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Hardware & Notes */}
          {device.notes && (
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Catatan Spesifikasi:
              </span>
              <p className="text-slate-200 text-xs font-medium">{device.notes}</p>
            </div>
          )}

          {/* Network Parameter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* IP Address */}
            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-medium">Alamat IP Lokal:</span>
              <div className="flex items-center justify-between mt-1 font-code">
                <span className="font-bold text-sm text-slate-100">{device.ip}</span>
                <button
                  onClick={() => copy(device.ip, "ip")}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400"
                >
                  {copiedKey === "ip" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* MAC Address */}
            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-medium">MAC Address (Physical):</span>
              <div className="flex items-center justify-between mt-1 font-code">
                <span className="font-bold text-sm text-sky-400 tracking-wider">
                  {device.mac}
                </span>
                <button
                  onClick={() => copy(device.mac, "mac")}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400"
                >
                  {copiedKey === "mac" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Broadcast IP */}
            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-medium">Broadcast Subnet:</span>
              <span className="font-code font-semibold text-slate-200 mt-1">
                {device.broadcastIp || "255.255.255.255"}
              </span>
            </div>

            {/* Port & Ping */}
            <div className="p-3 rounded-xl border border-slate-800/80 bg-slate-950/50 flex flex-col justify-between">
              <span className="text-slate-400 text-[11px] font-medium">WoL Port / Latensi:</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-code text-slate-200">UDP : {device.port || 9}</span>
                {isOnline && (
                  <span className="font-code text-emerald-400 font-semibold">
                    {device.pingLatencyMs || 10} ms
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Magic Packet Payload Hex Inspector */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Raw Magic Packet Payload (102 Byte)</span>
              </span>
              <button
                onClick={() => copy(hexPayload, "hex")}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                {copiedKey === "hex" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Payload</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-code text-[11px] break-all leading-relaxed max-h-24 overflow-y-auto">
              <span className="text-amber-400 font-bold">FFFFFFFFFFFF</span>
              <span className="text-sky-300">{hexPayload.slice(12)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPing(device)}
              disabled={isPinging}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Activity className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-sky-400" : ""}`} />
              <span>{isPinging ? "Ping..." : "Test Ping"}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(device);
              }}
              className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
            >
              Edit
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onWake(device)}
              disabled={isWaking}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-900/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              {isWaking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim WoL...</span>
                </>
              ) : (
                <>
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOnline ? "Kirim Ulang Magic Packet" : "Nyalakan PC Sekarang"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

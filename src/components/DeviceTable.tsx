import React, { useState } from "react";
import {
  Power,
  Copy,
  Check,
  Activity,
  Edit2,
  Trash2,
  Info,
  Loader2,
  Send,
  Zap,
  Eye,
} from "lucide-react";
import { Device } from "../types";
import { DeviceIcon, DEVICE_TYPE_LABELS } from "./DeviceIcon";

interface DeviceTableProps {
  devices: Device[];
  isDark?: boolean;
  onWake: (device: Device) => Promise<void>;
  onPing: (device: Device) => Promise<void>;
  onEdit: (device: Device) => void;
  onDelete: (device: Device) => void;
  onInspect: (device: Device) => void;
  onPowerAction: (device: Device) => void;
  wakingDeviceIds: Set<string>;
  pingingDeviceIds: Set<string>;
  onBatchWake: (devices: Device[]) => Promise<void>;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  devices,
  onWake,
  onPing,
  onEdit,
  onDelete,
  onInspect,
  onPowerAction,
  wakingDeviceIds,
  pingingDeviceIds,
  onBatchWake,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === devices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(devices.map((d) => d.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const selectedDevices = devices.filter((d) => selectedIds.has(d.id));

  return (
    <div className="flex flex-col gap-3">
      {/* Batch Actions Bar if any row selected */}
      {selectedIds.size > 0 && (
        <div
          id="batch-action-bar"
          className="p-3 px-4 rounded-xl border border-slate-700 bg-[#111114] flex items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-400 font-mono">
              {selectedIds.size} devices selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBatchWake(selectedDevices)}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Wake Selected ({selectedIds.size})</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="py-1.5 px-3 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111114] overflow-hidden shadow-lg shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0c0c0e] text-slate-400 text-[11px] font-semibold uppercase tracking-wider font-mono">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={devices.length > 0 && selectedIds.size === devices.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    aria-label="Select all hosts"
                  />
                </th>
                <th className="p-4">Device & Group</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">MAC Address</th>
                <th className="p-4">Broadcast / Port</th>
                <th className="p-4">Status & Latency</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {devices.map((device) => {
                const isOnline = device.status === "online";
                const isWaking = wakingDeviceIds.has(device.id) || device.status === "waking";
                const isPinging = pingingDeviceIds.has(device.id);
                const typeInfo = DEVICE_TYPE_LABELS[device.iconType] || DEVICE_TYPE_LABELS.workstation;
                const isChecked = selectedIds.has(device.id);

                return (
                  <tr
                    key={device.id}
                    id={`table-row-${device.id}`}
                    className={`transition-colors hover:bg-slate-900/60 ${
                      isChecked ? "bg-slate-800/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(device.id)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        aria-label={`Select ${device.name}`}
                      />
                    </td>

                    {/* Name & Icon */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${typeInfo.bg}`}
                        >
                          <DeviceIcon type={device.iconType} className={`w-4 h-4 ${typeInfo.text}`} />
                        </div>
                        <div>
                          <div className="font-bold text-sm tracking-tight text-white">{device.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-400">
                              {device.group || "Default"}
                            </span>
                            {device.notes && (
                              <span className="text-[10px] text-slate-500 italic max-w-xs truncate">
                                • {device.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-200">{device.ip}</span>
                        <button
                          onClick={() => copyToClipboard(device.ip, `ip-${device.id}`)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          title="Copy IP"
                        >
                          {copiedField === `ip-${device.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* MAC */}
                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sky-400 tracking-wider">
                          {device.mac}
                        </span>
                        <button
                          onClick={() => copyToClipboard(device.mac, `mac-${device.id}`)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          title="Copy MAC"
                        >
                          {copiedField === `mac-${device.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Broadcast & Port */}
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      <div>UDP: {device.port || 9}</div>
                      <div className="text-[10px] text-slate-500">{device.broadcastIp}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => onPing(device)}
                        disabled={isPinging}
                        className="text-left group cursor-pointer"
                        title="Klik untuk ping & perbarui status sekarang"
                      >
                        {isOnline ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-500/20 uppercase tracking-tighter w-fit transition-all">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{isPinging ? "Checking..." : "Online"}</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400/80 flex items-center gap-1 mt-0.5 pl-1">
                              <Activity className="w-3 h-3" />
                              {device.pingLatencyMs || 10} ms
                            </span>
                          </div>
                        ) : isWaking ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-tighter animate-pulse group-hover:bg-amber-500/20 w-fit transition-all">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Booting...</span>
                            </span>
                            <span className="text-[10px] text-amber-400/80 font-mono pl-1">
                              Menunggu respon
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 group-hover:bg-rose-500/20 uppercase tracking-tighter w-fit transition-all">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              <span>{isPinging ? "Checking..." : "Offline"}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono pl-1">
                              {device.lastSeen || "Standby"}
                            </span>
                          </div>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Turn On / WoL Button */}
                        <button
                          id={`table-wake-btn-${device.id}`}
                          onClick={() => onWake(device)}
                          disabled={isWaking}
                          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                            isWaking
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : isOnline
                              ? "bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40"
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20"
                          }`}
                          title="Kirim Magic Packet WoL"
                        >
                          {isWaking ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          <span>{isWaking ? "Booting" : "Nyalakan"}</span>
                        </button>

                        {/* Shutdown Button */}
                        <button
                          id={`table-power-btn-${device.id}`}
                          onClick={() => onPowerAction(device)}
                          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                            isOnline
                              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20"
                              : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                          title="Matikan PC / Restart"
                        >
                          <Power className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                          <span>Matikan</span>
                        </button>


                        {/* Ping Test */}
                        <button
                          onClick={() => onPing(device)}
                          disabled={isPinging}
                          className="p-1.5 rounded-lg border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Ping Host"
                          aria-label="Ping Host"
                        >
                          <Activity className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-sky-400" : ""}`} />
                        </button>

                        {/* Detail / Inspect */}
                        <button
                          onClick={() => onInspect(device)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Inspect Payload"
                          aria-label="Inspect Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEdit(device)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-300 transition-colors"
                          title="Edit"
                          aria-label="Edit Device"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDelete(device)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-[#09090b] hover:bg-rose-500/10 text-rose-400 transition-colors"
                          title="Delete"
                          aria-label="Delete Device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


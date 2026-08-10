import React, { useState } from "react";
import {
  X,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Radio,
  Copy,
  Check,
  Eye,
  Send,
} from "lucide-react";
import { WoLLog } from "../types";

interface ActivityLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WoLLog[];
  onClearLogs: () => Promise<void>;
  isDark: boolean;
}

export const ActivityLogDrawer: React.FC<ActivityLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  isDark,
}) => {
  const [selectedHexLog, setSelectedHexLog] = useState<WoLLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const drawerBg = "bg-[#111114] border-slate-800 text-slate-100";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        id="activity-log-drawer"
        className={`relative w-full max-w-lg h-full border-l shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 ${drawerBg}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Riwayat Aktivitas WoL</h2>
              <p className="text-xs text-slate-400">
                Log penyiaran Magic Packet dan respon jaringan.
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

        {/* Toolbar */}
        <div className="p-3.5 px-5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            Total {logs.length} catatan aktivitas
          </span>
          {logs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-medium text-xs px-2 py-1 rounded hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Log</span>
            </button>
          )}
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Radio className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
              <p className="text-sm font-semibold">Belum Ada Aktivitas</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Kirim sinyal Wake-on-LAN dari dashboard untuk mencatat riwayat penyiaran paket di sini.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isSuccess = log.status === "success";
              const formattedDate = new Date(log.timestamp).toLocaleString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                day: "numeric",
                month: "short",
              });

              return (
                <div
                  key={log.id}
                  id={`log-item-${log.id}`}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 flex flex-col gap-2 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-slate-200">
                        {log.deviceName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 flex flex-col gap-1 text-[11px] font-code">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">MAC:</span>
                      <span className="text-sky-400 font-bold">{log.mac}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-slate-500">Target / Port:</span>
                      <span>
                        {log.broadcastIp || "255.255.255.255"} : UDP {log.port || 9}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {log.message}
                  </p>

                  {log.packetHex && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px]">
                      <button
                        onClick={() => setSelectedHexLog(log)}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspeksi Raw Hex Packet</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(log.packetHex, log.id)}
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === log.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Hex</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Raw Hex Packet Modal if open */}
        {selectedHexLog && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-6 flex flex-col justify-between backdrop-blur-md animate-in fade-in">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Inspeksi Magic Packet WoL</span>
                </h3>
                <button
                  onClick={() => setSelectedHexLog(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="text-slate-300 font-medium">
                  Tujuan: <span className="text-white font-bold">{selectedHexLog.deviceName}</span> (
                  {selectedHexLog.mac})
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-code text-[11px] text-emerald-400 break-all leading-relaxed max-h-48 overflow-y-auto">
                  <span className="text-amber-400 font-bold">
                    {selectedHexLog.packetHex.slice(0, 12)}
                  </span>
                  <span className="text-sky-300">
                    {selectedHexLog.packetHex.slice(12)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>
                    • <strong className="text-amber-400">Header:</strong> 6x 0xFF (12 karakter hex heksadesimal)
                  </p>
                  <p>
                    • <strong className="text-sky-400">Payload:</strong> 16 kali pengulangan target MAC address
                  </p>
                  <p>• Total Ukuran: 102 Byte via UDP socket</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedHexLog(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs hover:bg-slate-700 transition-colors"
            >
              Tutup Inspeksi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

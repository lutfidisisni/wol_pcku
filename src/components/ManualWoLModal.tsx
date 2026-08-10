import React, { useState } from "react";
import {
  X,
  Radio,
  Send,
  Loader2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { generateMagicPacketHex } from "../services/api";

interface ManualWoLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendWoL: (params: {
    mac: string;
    broadcastIp: string;
    port: number;
    deviceName: string;
  }) => Promise<void>;
  isDark: boolean;
}

export const ManualWoLModal: React.FC<ManualWoLModalProps> = ({
  isOpen,
  onClose,
  onSendWoL,
  isDark,
}) => {
  const [mac, setMac] = useState("D4:5D:64:89:A1:7B");
  const [broadcastIp, setBroadcastIp] = useState("192.168.8.255");
  const [port, setPort] = useState(9);
  const [deviceName, setDeviceName] = useState("PC Manual Target");
  const [burstCount, setBurstCount] = useState(3);
  const [isSending, setIsSending] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMacChange = (value: string) => {
    const clean = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase().slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 2) {
      parts.push(clean.slice(i, i + 2));
    }
    setMac(parts.join(":"));
  };

  const hexPayload = generateMagicPacketHex(mac);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, "");
    if (cleanMac.length !== 12) {
      setError("MAC Address harus 12 digit heksadesimal.");
      return;
    }

    setIsSending(true);
    try {
      // Send burst packets
      for (let i = 0; i < burstCount; i++) {
        await onSendWoL({
          mac: mac.toUpperCase(),
          broadcastIp: broadcastIp.trim() || "255.255.255.255",
          port: Number(port) || 9,
          deviceName: deviceName.trim() || "Manual Target",
        });
        if (burstCount > 1 && i < burstCount - 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim paket.");
    } finally {
      setIsSending(false);
    }
  };

  const copyHex = () => {
    if (hexPayload) {
      navigator.clipboard.writeText(hexPayload);
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 2000);
    }
  };

  const modalBg = "bg-[#111114] border-slate-800 text-slate-100";

  const inputBg =
    "bg-[#09090b] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        id="manual-wol-modal"
        className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl backdrop-blur-xl z-10 my-8 animate-in fade-in zoom-in-95 duration-200 ${modalBg}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Kirim Magic Packet Manual</h2>
              <p className="text-xs text-slate-400">
                Tembakkan sinyal Wake-on-LAN instan ke alamat MAC mana pun.
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

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Label / Nama Tujuan
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Contoh: PC Ruang Tamu"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${inputBg}`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target MAC Address *
              </label>
              <span className="text-[10px] text-sky-400">Format: XX:XX:XX:XX:XX:XX</span>
            </div>
            <input
              type="text"
              required
              value={mac}
              onChange={(e) => handleMacChange(e.target.value)}
              maxLength={17}
              placeholder="00:1A:2B:3C:4D:5E"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-code font-bold tracking-wider focus:outline-none focus:ring-2 ${inputBg}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Broadcast IP
              </label>
              <input
                type="text"
                value={broadcastIp}
                onChange={(e) => setBroadcastIp(e.target.value)}
                placeholder="255.255.255.255"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-code focus:outline-none focus:ring-2 ${inputBg}`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                UDP Port
              </label>
              <select
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-code cursor-pointer focus:outline-none focus:ring-2 ${inputBg}`}
              >
                <option value={9}>Port 9 (Default)</option>
                <option value={7}>Port 7 (Echo)</option>
                <option value={0}>Port 0</option>
              </select>
            </div>
          </div>

          {/* Burst Count */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Jumlah Pengiriman Paket (Burst)
            </label>
            <div className="flex gap-2">
              {[1, 3, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setBurstCount(count)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    burstCount === count
                      ? "bg-blue-600 text-white border-blue-500 shadow-md"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {count}x Paket
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mengirim paket berulang (3x) meningkatkan kehandalan saat switch jaringan sibuk.
            </p>
          </div>

          {/* Live 102-byte Magic Packet Hex Dump preview */}
          {hexPayload && (
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">
                  Struktur Magic Packet (102 Byte)
                </span>
                <button
                  type="button"
                  onClick={copyHex}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {copiedHex ? (
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
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 font-code text-[10px] text-emerald-400/90 break-all leading-relaxed max-h-20 overflow-y-auto">
                <span className="text-amber-400 font-bold">FFFFFFFFFFFF</span>
                <span className="text-sky-300">{hexPayload.slice(12)}</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Header: 6 byte 0xFF • Payload: 16x pengulangan MAC address ({mac})
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Tutup
            </button>

            <button
              id="btn-send-manual-wol"
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/40 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim {burstCount}x Paket...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Tembakkan Magic Packet ({burstCount}x)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit,
  Sparkles,
  Network,
  HelpCircle,
} from "lucide-react";
import { Device, DeviceIconType } from "../types";
import { DeviceIcon, DEVICE_TYPE_LABELS } from "./DeviceIcon";

interface AddEditDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deviceData: Omit<Device, "id" | "status" | "lastSeen" | "lastWaked" | "pingLatencyMs">, id?: string) => Promise<void>;
  editingDevice?: Device | null;
  isDark: boolean;
}

const TEMPLATES: Array<{
  name: string;
  iconType: DeviceIconType;
  group: string;
  ip: string;
  mac: string;
  port: number;
  notes: string;
}> = [
  {
    name: "PC Gaming ASRock",
    iconType: "gaming",
    group: "Ruang Gaming",
    ip: "192.168.8.105",
    mac: "D4:5D:64:89:A1:7B",
    port: 9,
    notes: "ASRock B650M + AMD Ryzen 7 7800X3D + RTX 4080",
  },
  {
    name: "Workstation Desain & Edit",
    iconType: "workstation",
    group: "Kantor / Ruang Kerja",
    ip: "192.168.8.85",
    mac: "00:E0:4C:68:01:23",
    port: 9,
    notes: "Workstation Desain Grafis & Coding, Win 11",
  },
  {
    name: "Render Farm Node",
    iconType: "render",
    group: "Studio Animasi",
    ip: "192.168.8.150",
    mac: "70:85:C2:5E:19:9C",
    port: 9,
    notes: "Dual GPU Rendering Box Blender/Cinema4D",
  },
  {
    name: "Ubuntu Server / Docker",
    iconType: "server",
    group: "Server Room",
    ip: "192.168.8.200",
    mac: "BC:24:11:4F:7A:3D",
    port: 9,
    notes: "Proxmox / Docker Container Cluster Host",
  },
  {
    name: "NAS Storage Synology",
    iconType: "nas",
    group: "Server Room",
    ip: "192.168.8.220",
    mac: "00:11:32:9F:88:4A",
    port: 7,
    notes: "Synology DiskStation RAID Array",
  },
];

export const AddEditDeviceModal: React.FC<AddEditDeviceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDevice,
  isDark,
}) => {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("192.168.8.100");
  const [mac, setMac] = useState("");
  const [broadcastIp, setBroadcastIp] = useState("192.168.8.255");
  const [port, setPort] = useState(9);
  const [iconType, setIconType] = useState<DeviceIconType>("workstation");
  const [group, setGroup] = useState("Kantor / Ruang Kerja");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingDevice) {
      setName(editingDevice.name);
      setIp(editingDevice.ip);
      setMac(editingDevice.mac);
      setBroadcastIp(editingDevice.broadcastIp || "192.168.8.255");
      setPort(editingDevice.port || 9);
      setIconType(editingDevice.iconType || "workstation");
      setGroup(editingDevice.group || "Kantor / Ruang Kerja");
      setNotes(editingDevice.notes || "");
    } else {
      setName("");
      setIp("192.168.8.100");
      setMac("");
      setBroadcastIp("192.168.8.255");
      setPort(9);
      setIconType("workstation");
      setGroup("Kantor / Ruang Kerja");
      setNotes("");
    }
    setError(null);
  }, [editingDevice, isOpen]);

  if (!isOpen) return null;

  // Smart MAC Address formatting helper
  const handleMacChange = (value: string) => {
    // Remove non-hex
    const clean = value.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
    const truncated = clean.slice(0, 12);
    // Add colons every 2 characters
    const parts = [];
    for (let i = 0; i < truncated.length; i += 2) {
      parts.push(truncated.slice(i, i + 2));
    }
    setMac(parts.join(":"));
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setName(template.name);
    setIconType(template.iconType);
    setGroup(template.group);
    setIp(template.ip);
    setMac(template.mac);
    setPort(template.port);
    setNotes(template.notes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama perangkat wajib diisi.");
      return;
    }

    const cleanMac = mac.replace(/[^0-9A-Fa-f]/g, "");
    if (cleanMac.length !== 12) {
      setError("Alamat MAC harus terdiri dari 12 karakter heksadesimal (contoh: 00:1A:2B:3C:4D:5E).");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          ip: ip.trim() || "192.168.8.100",
          mac: mac.trim().toUpperCase(),
          broadcastIp: broadcastIp.trim() || "255.255.255.255",
          port: Number(port) || 9,
          iconType,
          group: group.trim() || "Umum",
          notes: notes.trim(),
        },
        editingDevice?.id
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat menyimpan perangkat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBg = "bg-[#111114] border-slate-800 text-slate-100";

  const inputBg =
    "bg-[#09090b] border-slate-800 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30";

  const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        id="add-device-modal"
        className={`relative w-full max-w-xl rounded-2xl border p-6 shadow-2xl backdrop-blur-xl z-10 my-8 transition-all animate-in fade-in zoom-in-95 duration-200 ${modalBg}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                editingDevice
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}
            >
              {editingDevice ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {editingDevice ? "Edit Konfigurasi PC" : "Tambah PC Baru"}
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Konfigurasikan alamat IP, MAC Address, dan parameter Wake-on-LAN.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-slate-100 text-slate-500"
            }`}
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates / Presets (only for Add mode) */}
        {!editingDevice && (
          <div className="mt-4 p-3 rounded-xl border border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gunakan Preset Cepat:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg border bg-[#09090b] border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 hover:text-blue-300 transition-all"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Device Name */}
          <div>
            <label className={labelClass}>Nama PC / Hostname *</label>
            <input
              id="input-device-name"
              type="text"
              required
              placeholder="Contoh: PC Ruang Kerja, PC Gaming ASRock"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${inputBg}`}
            />
          </div>

          {/* Device Type & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipe / Kategori PC</label>
              <div className="relative">
                <select
                  id="select-device-type"
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value as DeviceIconType)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 appearance-none cursor-pointer ${inputBg}`}
                >
                  <option value="workstation">PC Ruang Kerja / Desktop</option>
                  <option value="gaming">PC Gaming Rig</option>
                  <option value="render">PC Render / Workstation</option>
                  <option value="server">Home Server / Proxmox</option>
                  <option value="nas">NAS Storage</option>
                  <option value="laptop">Laptop / Dock</option>
                  <option value="tv">Smart TV / Media</option>
                  <option value="router">Network Device</option>
                </select>
                <div className="absolute right-3.5 top-3 pointer-events-none">
                  <DeviceIcon type={iconType} className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Ruangan / Grup</label>
              <input
                id="input-device-group"
                type="text"
                placeholder="Contoh: Ruang Kerja, Studio, Ruang Gaming"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${inputBg}`}
              />
            </div>
          </div>

          {/* IP Address & MAC Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Alamat IP Lokal *</label>
              <input
                id="input-device-ip"
                type="text"
                required
                placeholder="192.168.8.82"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-code transition-all focus:outline-none focus:ring-2 ${inputBg}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  MAC Address *
                </label>
                <span className="text-[10px] text-sky-400">Auto-Format</span>
              </div>
              <input
                id="input-device-mac"
                type="text"
                required
                placeholder="D4:5D:64:89:A1:7B"
                value={mac}
                onChange={(e) => handleMacChange(e.target.value)}
                maxLength={17}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-code font-bold tracking-wider transition-all focus:outline-none focus:ring-2 ${inputBg}`}
              />
            </div>
          </div>

          {/* Advanced Network Config: Broadcast IP & Port */}
          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Network className="w-3.5 h-3.5 text-blue-400" />
              <span>Parameter Jaringan WoL (Advanced)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Broadcast IP (Subnet)
                </label>
                <input
                  id="input-broadcast-ip"
                  type="text"
                  value={broadcastIp}
                  onChange={(e) => setBroadcastIp(e.target.value)}
                  placeholder="192.168.8.255 atau 255.255.255.255"
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-code ${inputBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  UDP Port
                </label>
                <select
                  id="select-udp-port"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-code cursor-pointer ${inputBg}`}
                >
                  <option value={9}>Port 9 (Default)</option>
                  <option value={7}>Port 7 (Echo)</option>
                  <option value={0}>Port 0</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes / Specs */}
          <div>
            <label className={labelClass}>Catatan Tambahan / Spesifikasi</label>
            <input
              id="input-device-notes"
              type="text"
              placeholder="Contoh: Ryzen 7 + RTX 4080, Windows 11 Pro"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${inputBg}`}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Batal
            </button>

            <button
              id="btn-save-device"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/30 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : editingDevice ? (
                <>
                  <Edit className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan PC</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

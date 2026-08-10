import React from "react";
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Monitor,
  Terminal,
  Wifi,
} from "lucide-react";

interface WoLGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const WoLGuideModal: React.FC<WoLGuideModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  if (!isOpen) return null;

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
        id="wol-guide-modal"
        className={`relative w-full max-w-2xl rounded-2xl border p-6 shadow-2xl backdrop-blur-xl z-10 my-8 animate-in fade-in zoom-in-95 duration-200 ${modalBg}`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Panduan Konfigurasi Wake-on-LAN (WoL)</h2>
              <p className="text-xs text-slate-400">
                Langkah-langkah agar PC target dapat dinyalakan dari jarak jauh.
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

        <div className="mt-5 space-y-4 text-xs overflow-y-auto max-h-[65vh] pr-1">
          {/* Step 1: BIOS/UEFI */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Pengaturan BIOS / UEFI Motherboard</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Masuk ke BIOS/UEFI (tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">DEL</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">F2</kbd> saat PC baru menyala):
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>Cari menu <strong className="text-slate-200">Power Management</strong> / <strong className="text-slate-200">ACPI Configuration</strong>.</li>
              <li>Aktifkan <strong className="text-emerald-400">"Power On By PCIE/PCI Device"</strong> atau <strong className="text-emerald-400">"Wake on LAN (WoL)"</strong>.</li>
              <li>Nonaktifkan (Disable) mode hemat daya agresif seperti <strong className="text-amber-400">"ErP / EuP Ready"</strong> atau <strong className="text-amber-400">"Deep Sleep State"</strong> agar port LAN tetap mendapatkan standby power (+5VSB) saat PC mati.</li>
            </ul>
          </div>

          {/* Step 2: Windows OS Config */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Monitor className="w-4 h-4" />
              <span>2. Pengaturan Driver Kartu Jaringan (Windows 10 / 11)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>Buka <strong className="text-slate-200">Device Manager</strong> &rarr; <strong className="text-slate-200">Network Adapters</strong>.</li>
              <li>Klik kanan pada kartu Ethernet (misal: Realtek / Intel Gigabit) &rarr; <strong className="text-slate-200">Properties</strong>.</li>
              <li>Pada tab <strong className="text-slate-200">Power Management</strong>: centang <em className="text-slate-200">"Allow this device to wake the computer"</em> dan <em className="text-slate-200">"Only allow a magic packet to wake the computer"</em>.</li>
              <li>Pada tab <strong className="text-slate-200">Advanced</strong>: set <strong className="text-emerald-400">"Wake on Magic Packet"</strong> menjadi <strong className="text-emerald-400">Enabled</strong>.</li>
              <li><em>Tips:</em> Nonaktifkan <strong className="text-amber-400">"Fast Startup"</strong> di Windows Control Panel Power Options jika PC menolak bangun saat shut down penuh.</li>
            </ul>
          </div>

          {/* Step 3: Linux OS Config */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>3. Pengaturan Linux / Ubuntu / Proxmox</span>
            </div>
            <p className="text-slate-300">
              Gunakan utility <code className="text-sky-300 font-code">ethtool</code> pada terminal:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-code text-xs text-emerald-400">
              sudo ethtool -s eth0 wol g
            </div>
            <p className="text-slate-400 text-[11px]">
              Huruf <code className="text-amber-300 font-code">g</code> menandakan mode Magic Packet.
            </p>
          </div>

          {/* Step 4: Router Subnet Broadcast */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Wifi className="w-4 h-4" />
              <span>4. Alamat Broadcast & Port UDP</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Magic Packet dikirimkan ke port <strong className="text-sky-400 font-mono">UDP:9</strong> atau <strong className="text-sky-400 font-mono">UDP:7</strong> dengan broadcast IP <strong className="text-sky-400 font-mono">192.168.8.255</strong> (atau <code className="font-mono">255.255.255.255</code>). Pastikan kabel Ethernet tersambung karena WoL umumnya bekerja paling andal melalui koneksi kabel LAN.
            </p>
          </div>

          {/* Step 5: Portainer / Docker Deployment */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5. Panduan Deploy ke Portainer (Anti Bentrok Port)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Berdasarkan daftar port yang sedang aktif di Portainer Anda (<span className="font-mono text-slate-400">8085-8092, 8095, 8000, 9443, 3308-3311, 3385</span>), gunakan port host berikut yang <strong>100% aman &amp; tidak bentrok</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 font-mono text-xs">
                <span className="text-slate-400">Rekomendasi Utama:</span>
                <div className="text-emerald-400 font-bold text-sm">8096:3000</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 font-mono text-xs">
                <span className="text-slate-400">Pilihan Alternatif:</span>
                <div className="text-sky-400 font-bold text-sm">8093:3000 atau 8094:3000</div>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-200">Tips WoL di Docker:</strong> Untuk memastikan UDP Magic Packet broadcast dapat menembus kartu jaringan host ke PC LAN lokal, Anda juga dapat mengaktifkan <code className="text-amber-300 font-mono">network_mode: host</code> di Portainer Stack / Docker Compose dengan environment variable <code className="text-amber-300 font-mono">PORT=8096</code>.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};

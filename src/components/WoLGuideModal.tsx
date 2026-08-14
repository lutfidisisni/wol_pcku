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
  Power,
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
          {/* Step 1: BIOS/UEFI ASRock */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Cpu className="w-4 h-4" />
              <span>1. Pengaturan BIOS / UEFI ASRock H510M-H2</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Masuk ke BIOS/UEFI (tekan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">DEL</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">F2</kbd> saat PC baru menyala):
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>Menu <strong className="text-slate-200">Advanced</strong> &rarr; <strong className="text-slate-200">ACPI Configuration</strong>.</li>
              <li>Pastikan <strong className="text-emerald-400">"PCIE Devices Power On"</strong> diset ke <strong className="text-emerald-400">Enabled</strong>.</li>
              <li>
                <strong className="text-amber-400">PENTING (ASRock Deep Sleep):</strong> Cari pengaturan <strong className="text-amber-400">"Deep Sleep"</strong> dan ubah menjadi <strong className="text-rose-400">Disabled</strong> (atau Disabled in S4-S5). Jika Deep Sleep aktif, motherboard ASRock akan memutus aliran listrik standby (+5VSB) ke port LAN saat PC mati sehingga lampu LAN mati dan tidak bisa mendengarkan Magic Packet!
              </li>
              <li>Pastikan lampu LED kuning/hijau pada port LAN di belakang motherboard tetap menyala kecil saat PC mati (tanda standby WoL aktif).</li>
            </ul>
          </div>

          {/* Step 2: Windows OS Config & Driver Realtek */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Monitor className="w-4 h-4" />
              <span>2. Pengaturan Driver Kartu Jaringan Realtek (Windows 10 / 11)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>Buka <strong className="text-slate-200">Device Manager</strong> &rarr; <strong className="text-slate-200">Network Adapters</strong> &rarr; klik kanan pada <strong className="text-slate-200">Realtek PCIe GbE Family Controller</strong> &rarr; <strong className="text-slate-200">Properties</strong>.</li>
              <li>
                <strong className="text-sky-400">Pada Tab Power Management:</strong>
                <div className="pl-4 pt-1 space-y-0.5 text-slate-300">
                  <div>1. Centang <em className="text-emerald-400">"Allow the computer to turn off this device to save power"</em> (wajib dicentang terlebih dahulu agar opsi di bawahnya aktif).</div>
                  <div>2. Centang <em className="text-emerald-400">"Allow this device to wake the computer"</em>.</div>
                  <div>3. Centang <em className="text-emerald-400">"Only allow a magic packet to wake the computer"</em>.</div>
                </div>
              </li>
              <li className="pt-1">
                <strong className="text-sky-400">Pada Tab Advanced (Pengaturan Lanjutan Realtek):</strong>
                <div className="pl-4 pt-1 space-y-0.5 text-slate-300">
                  <div>• <strong className="text-slate-200">Wake on Magic Packet</strong>: <span className="text-emerald-400 font-semibold">Enabled</span></div>
                  <div>• <strong className="text-slate-200">Shutdown Wake-On-Lan</strong>: <span className="text-emerald-400 font-semibold">Enabled</span></div>
                  <div>• <strong className="text-slate-200">Energy Efficient Ethernet / Green Ethernet</strong>: <span className="text-amber-400 font-semibold">Disabled</span></div>
                </div>
              </li>
              <li className="pt-1">
                <strong className="text-rose-400">Wajib Matikan Windows "Fast Startup":</strong> Buka Control Panel &rarr; Power Options &rarr; <em>"Choose what the power buttons do"</em> &rarr; klik <em>"Change settings that are currently unavailable"</em> &rarr; <strong>Hapus centang (Uncheck) "Turn on fast startup"</strong> &rarr; Save changes. (Fast Startup mengunci kartu jaringan sehingga mengabaikan Magic Packet).
              </li>
            </ul>
          </div>

          {/* Step 3: Remote Shutdown Guide */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Power className="w-4 h-4" />
              <span>3. Panduan Fitur Remote Shutdown (Matikan PC Jarak Jauh)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Berbeda dengan WoL (yang menggunakan broadcast hardware tanpa sistem operasi), <strong>Shutdown</strong> memerlukan izin pada level OS (Windows/Linux):
            </p>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-sky-400 font-semibold mb-1">Opsi 1: Windows RPC / Native Remote (Tanpa Instal Aplikasi)</div>
                <p className="text-[11px] text-slate-300">
                  Jalankan PowerShell sebagai Administrator pada PC target dan masukkan perintah:
                </p>
                <div className="mt-1 p-2 rounded bg-black/60 text-emerald-400 font-mono text-[11px] select-all">
                  reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-violet-400 font-semibold mb-1">Opsi 2: SSH Protocol (Linux &amp; Windows OpenSSH)</div>
                <p className="text-[11px] text-slate-300">
                  Aktifkan OpenSSH Server pada target PC (Windows Settings &rarr; Optional Features &rarr; OpenSSH Server). Dashboard dapat mengirimkan perintah <code className="text-amber-300 font-mono">shutdown /s /t 0</code> secara aman.
                </p>
              </div>
            </div>
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

import React, { useState } from "react";
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
  Copy,
  Check,
  Shield,
  Server,
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
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const modalBg = "bg-[#111114] border-slate-800 text-slate-100";

  const copyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(key);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const CmdBlock = ({ cmd, id }: { cmd: string; id: string }) => (
    <div className="relative group mt-1">
      <div className="p-2 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-400 select-all pr-16 break-all">
        {cmd}
      </div>
      <button
        type="button"
        onClick={() => copyCmd(cmd, id)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-sky-300 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5"
      >
        {copiedCmd === id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copiedCmd === id ? "Tersalin" : "Salin"}
      </button>
    </div>
  );

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
              <span>1. Pengaturan BIOS / UEFI</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Masuk ke BIOS/UEFI (tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">DEL</kbd> atau <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono">F2</kbd> saat PC baru menyala):
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>Menu <strong className="text-slate-200">Advanced</strong> → <strong className="text-slate-200">ACPI Configuration</strong>.</li>
              <li>Pastikan <strong className="text-emerald-400">"PCIE Devices Power On"</strong> diset ke <strong className="text-emerald-400">Enabled</strong>.</li>
              <li>
                <strong className="text-amber-400">ASRock — Matikan Deep Sleep:</strong> Cari <strong className="text-amber-400">"Deep Sleep"</strong> dan ubah ke <strong className="text-rose-400">Disabled</strong>. Jika Deep Sleep aktif, motherboard akan memutus daya standby (+5VSB) ke port LAN saat PC mati dan tidak bisa mendengarkan Magic Packet.
              </li>
              <li>Lampu LED kuning/hijau pada port LAN di belakang motherboard harus tetap menyala kecil saat PC mati sebagai tanda WoL standby aktif.</li>
            </ul>
          </div>

          {/* Step 2: Windows Driver */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Monitor className="w-4 h-4" />
              <span>2. Pengaturan Driver Jaringan Windows (WoL)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
              <li>
                Buka <strong className="text-slate-200">Device Manager</strong> → <strong className="text-slate-200">Network Adapters</strong> → klik kanan adapter LAN → <strong className="text-slate-200">Properties</strong>.
              </li>
              <li>
                <strong className="text-sky-400">Tab Power Management:</strong>
                <div className="pl-4 pt-1 space-y-0.5 text-slate-300">
                  <div>✔ <em className="text-emerald-400">Allow this device to wake the computer</em></div>
                  <div>✔ <em className="text-emerald-400">Only allow a magic packet to wake the computer</em></div>
                </div>
              </li>
              <li className="pt-1">
                <strong className="text-sky-400">Tab Advanced (Realtek):</strong>
                <div className="pl-4 pt-1 space-y-0.5 text-slate-300">
                  <div>• <strong>Wake on Magic Packet</strong>: <span className="text-emerald-400 font-semibold">Enabled</span></div>
                  <div>• <strong>Shutdown Wake-On-Lan</strong>: <span className="text-emerald-400 font-semibold">Enabled</span></div>
                  <div>• <strong>Energy Efficient / Green Ethernet</strong>: <span className="text-amber-400 font-semibold">Disabled</span></div>
                </div>
              </li>
              <li className="pt-1">
                <strong className="text-rose-400">Matikan Fast Startup Windows:</strong> Control Panel → Power Options → <em>"Choose what the power buttons do"</em> → hapus centang <strong>"Turn on fast startup"</strong> → Save. Fast Startup mengunci adapter jaringan sehingga mengabaikan Magic Packet.
              </li>
            </ul>
          </div>

          {/* Step 3: Remote Shutdown Setup — EXPANDED */}
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Power className="w-4 h-4" />
              <span>3. Pengaturan Remote Shutdown / Restart di PC Target</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Fitur Shutdown memerlukan izin OS. Pilih salah satu metode berikut sesuai kebutuhan.
            </p>

            {/* Method A: Windows RPC */}
            <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Metode A — Windows RPC (Tanpa instal software tambahan)</span>
              </div>
              <p className="text-slate-400">Jalankan semua perintah berikut di <strong className="text-slate-200">PowerShell Administrator</strong> pada PC target:</p>

              <div className="space-y-2">
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">1. Izinkan akun lokal untuk remote shutdown (sudah Anda lakukan):</p>
                  <CmdBlock cmd={`reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f`} id="reg1" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">2. Aktifkan aturan firewall untuk Remote Shutdown:</p>
                  <CmdBlock cmd={`netsh advfirewall firewall set rule group="Remote Shutdown" new enable=yes`} id="fw1" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">3. Aktifkan layanan Remote Registry:</p>
                  <CmdBlock cmd={`Set-Service RemoteRegistry -StartupType Automatic; Start-Service RemoteRegistry`} id="svc1" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">4. Aktifkan Windows File & Printer Sharing di firewall:</p>
                  <CmdBlock cmd={`netsh advfirewall firewall set rule group="File and Printer Sharing" new enable=yes`} id="fw2" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">5. Pastikan akun Administrator lokal aktif dan memiliki password:</p>
                  <CmdBlock cmd={`net user Administrator /active:yes`} id="usr1" />
                </div>
              </div>

              <div className="mt-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Metode ini menggunakan akun Administrator Windows lokal. Pastikan PC target dan server Docker berada di subnet LAN yang sama. Akun Administrator harus memiliki password (tidak boleh kosong).</span>
              </div>
            </div>

            {/* Method B: SSH */}
            <div className="p-3 rounded-xl border border-violet-500/30 bg-violet-950/20 space-y-2">
              <div className="flex items-center gap-2 text-violet-400 font-semibold">
                <Server className="w-3.5 h-3.5" />
                <span>Metode B — SSH / OpenSSH (Windows & Linux)</span>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">Windows — Instal dan aktifkan OpenSSH Server (PowerShell Admin):</p>
                  <CmdBlock cmd={`Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0`} id="ssh1" />
                  <CmdBlock cmd={`Set-Service sshd -StartupType Automatic; Start-Service sshd`} id="ssh2" />
                  <CmdBlock cmd={`netsh advfirewall firewall add rule name="OpenSSH" dir=in action=allow protocol=TCP localport=22`} id="ssh3" />
                </div>
                <div>
                  <p className="text-slate-400 text-[11px] mb-0.5">Linux / Ubuntu — Instal OpenSSH Server:</p>
                  <CmdBlock cmd={`sudo apt install openssh-server -y && sudo systemctl enable --now ssh`} id="ssh4" />
                </div>
              </div>

              <p className="text-slate-400 text-[11px] pt-1">
                Setelah SSH aktif, masukkan username dan password di form PowerControlModal. Dashboard akan mengirimkan perintah <code className="text-amber-300 font-mono">shutdown /s /t 0 /f</code> (Windows) atau <code className="text-amber-300 font-mono">sudo shutdown -h now</code> (Linux) lewat SSH.
              </p>
            </div>
          </div>

          {/* Step 4: Linux WoL */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>4. Pengaturan Linux / Ubuntu / Proxmox (WoL)</span>
            </div>
            <p className="text-slate-300">
              Gunakan <code className="text-sky-300 font-mono">ethtool</code> untuk mengaktifkan WoL:
            </p>
            <CmdBlock cmd={`sudo ethtool -s eth0 wol g`} id="linux1" />
            <p className="text-slate-400 text-[11px]">
              Huruf <code className="text-amber-300 font-mono">g</code> = mode Magic Packet. Ganti <code className="font-mono">eth0</code> dengan nama interface yang sesuai (<code className="font-mono">enp3s0</code>, dll).
            </p>
            <p className="text-slate-400 text-[11px]">Untuk persisten setelah reboot, tambahkan ke <code className="font-mono">/etc/rc.local</code> atau buat systemd service.</p>
          </div>

          {/* Step 5: Broadcast & Port */}
          <div className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
              <Wifi className="w-4 h-4" />
              <span>5. Alamat Broadcast & Port UDP</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Magic Packet dikirim ke port <strong className="text-sky-400 font-mono">UDP:9</strong> atau <strong className="text-sky-400 font-mono">UDP:7</strong> dengan broadcast IP subnet <strong className="text-sky-400 font-mono">192.168.x.255</strong> (atau <code className="font-mono">255.255.255.255</code>). Pastikan kabel Ethernet tersambung — WoL paling andal melalui koneksi kabel LAN.
            </p>
          </div>

          {/* Step 6: Portainer / Docker */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-2.5">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>6. Konfigurasi Docker / Portainer</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Aplikasi ini sudah dikonfigurasi dengan <code className="text-amber-300 font-mono">network_mode: host</code> agar UDP Magic Packet broadcast dapat menembus langsung ke interface LAN fisik host.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950/90 border border-emerald-500/30 font-mono text-xs space-y-1">
              <div><span className="text-slate-500"># docker-compose.yml</span></div>
              <div><span className="text-sky-400">network_mode</span><span className="text-slate-300">: host</span></div>
              <div><span className="text-sky-400">PORT</span><span className="text-slate-300">=8096  <span className="text-slate-500"># akses via http://&lt;ip-server&gt;:8096</span></span></div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-amber-300">Catatan:</strong> <code className="font-mono">network_mode: host</code> hanya berfungsi di host Linux. Jika server Portainer Anda berjalan di Linux (Proxmox, Ubuntu, dll), konfigurasi ini sudah benar.
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

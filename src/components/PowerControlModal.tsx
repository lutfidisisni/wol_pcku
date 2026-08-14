import React, { useState, useEffect } from "react";
import {
  X,
  Power,
  RotateCcw,
  Moon,
  AlertTriangle,
  Terminal,
  Shield,
  Send,
  Loader2,
  Copy,
  Check,
  CheckCircle2,
  Info,
  Server,
  Globe,
  KeyRound,
} from "lucide-react";
import { Device, PowerActionType } from "../types";

interface PowerControlModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onExecute: (params: {
    deviceId: string;
    action: PowerActionType;
    method?: "rpc" | "ssh" | "webhook" | "agent";
    username?: string;
    password?: string;
    webhookUrl?: string;
  }) => Promise<void>;
  isDark: boolean;
}

export const PowerControlModal: React.FC<PowerControlModalProps> = ({
  device,
  isOpen,
  onClose,
  onExecute,
  isDark,
}) => {
  const [selectedAction, setSelectedAction] = useState<PowerActionType>("shutdown");
  const [method, setMethod] = useState<"rpc" | "ssh" | "webhook">("rpc");
  const [username, setUsername] = useState("Administrator");
  const [password, setPassword] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    if (device) {
      if (device.powerConfig?.method === "ssh") {
        setMethod("ssh");
        setUsername(device.powerConfig.username || "root");
      } else if (device.powerConfig?.method === "webhook") {
        setMethod("webhook");
        setWebhookUrl(device.powerConfig.webhookUrl || `http://${device.ip}:8000/power/shutdown`);
      } else {
        setMethod("rpc");
      }
    }
  }, [device, isOpen]);

  if (!isOpen || !device) return null;

  // Generate copyable CLI command according to selected action & method
  let cliCommand = "";
  if (method === "rpc") {
    if (selectedAction === "shutdown") {
      cliCommand = `shutdown /s /m \\\\${device.ip} /t 0 /f`;
    } else if (selectedAction === "restart") {
      cliCommand = `shutdown /r /m \\\\${device.ip} /t 0 /f`;
    } else {
      cliCommand = `powershell -Command "Add-Type -Assembly System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"`;
    }
  } else if (method === "ssh") {
    const userStr = username ? `${username}@` : "";
    if (selectedAction === "shutdown") {
      cliCommand = `ssh ${userStr}${device.ip} "sudo shutdown -h now"`;
    } else if (selectedAction === "restart") {
      cliCommand = `ssh ${userStr}${device.ip} "sudo reboot"`;
    } else {
      cliCommand = `ssh ${userStr}${device.ip} "sudo systemctl suspend"`;
    }
  } else if (method === "webhook") {
    cliCommand = `curl -X POST "${webhookUrl || `http://${device.ip}:8000/power/${selectedAction}`}"`;
  }

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleConfirmAction = async () => {
    setIsExecuting(true);
    try {
      await onExecute({
        deviceId: device.id,
        action: selectedAction,
        method,
        username,
        password,
        webhookUrl,
      });
      onClose();
    } finally {
      setIsExecuting(false);
    }
  };

  const actionDetails = {
    shutdown: {
      title: "Matikan PC (Shutdown)",
      desc: `Kirim sinyal shutdown ke host ${device.name} (${device.ip}) agar mematikan sistem operasi secara aman.`,
      btnColor: "bg-rose-600 hover:bg-rose-500 shadow-rose-900/30 text-white",
      icon: Power,
      accent: "text-rose-400",
    },
    restart: {
      title: "Muat Ulang (Restart / Reboot)",
      desc: `Kirim sinyal reboot ke ${device.name} (${device.ip}) untuk me-restart sistem operasi.`,
      btnColor: "bg-amber-600 hover:bg-amber-500 shadow-amber-900/30 text-white",
      icon: RotateCcw,
      accent: "text-amber-400",
    },
    sleep: {
      title: "Mode Tidur (Sleep / Suspend)",
      desc: `Alihkan ${device.name} (${device.ip}) ke kondisi sleep / hemat daya (dapat dinyalakan kembali via WoL).`,
      btnColor: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30 text-white",
      icon: Moon,
      accent: "text-indigo-400",
    },
  };

  const currentAction = actionDetails[selectedAction];
  const ActionIcon = currentAction.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        id="power-control-modal"
        className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-[#111114] text-slate-100 p-6 shadow-2xl backdrop-blur-xl z-10 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Manajemen Daya Jarak Jauh</h2>
              <p className="text-xs text-slate-400">
                Kontrol daya host <span className="text-slate-200 font-semibold">{device.name}</span> ({device.ip})
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

        {/* Action Type Selection Tabs */}
        <div className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Pilih Aksi Daya
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Shutdown */}
              <button
                type="button"
                onClick={() => setSelectedAction("shutdown")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedAction === "shutdown"
                    ? "border-rose-500 bg-rose-500/10 text-rose-300 font-bold shadow-lg shadow-rose-950/40"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Power className="w-5 h-5 text-rose-400" />
                <span className="text-xs">Shutdown</span>
              </button>

              {/* Restart */}
              <button
                type="button"
                onClick={() => setSelectedAction("restart")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedAction === "restart"
                    ? "border-amber-500 bg-amber-500/10 text-amber-300 font-bold shadow-lg shadow-amber-950/40"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <span className="text-xs">Restart</span>
              </button>

              {/* Sleep */}
              <button
                type="button"
                onClick={() => setSelectedAction("sleep")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  selectedAction === "sleep"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300 font-bold shadow-lg shadow-indigo-950/40"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="text-xs">Sleep Mode</span>
              </button>
            </div>
          </div>

          {/* Action Description */}
          <div className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/50 flex items-start gap-2.5">
            <Info className={`w-4 h-4 mt-0.5 shrink-0 ${currentAction.accent}`} />
            <p className="text-slate-300 text-xs leading-relaxed">{currentAction.desc}</p>
          </div>

          {/* Protocol Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Metode Protokol Jaringan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod("rpc")}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  method === "rpc"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300 font-semibold"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700"
                }`}
              >
                <Shield className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="text-xs">Windows RPC</div>
                  <div className="text-[10px] text-slate-500">Native Windows LAN</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("ssh")}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  method === "ssh"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300 font-semibold"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700"
                }`}
              >
                <Server className="w-4 h-4 text-violet-400" />
                <div>
                  <div className="text-xs">SSH Protocol</div>
                  <div className="text-[10px] text-slate-500">Linux / Windows OpenSSH</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod("webhook")}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  method === "webhook"
                    ? "border-blue-500 bg-blue-500/10 text-blue-300 font-semibold"
                    : "border-slate-800 bg-[#09090b] text-slate-400 hover:border-slate-700"
                }`}
              >
                <Globe className="w-4 h-4 text-teal-400" />
                <div>
                  <div className="text-xs">HTTP Webhook</div>
                  <div className="text-[10px] text-slate-500">Agent / Home Assistant</div>
                </div>
              </button>
            </div>

            {/* Optional credential fields for SSH or Webhook */}
            {method === "ssh" && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Username SSH
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="root atau user"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-[#09090b] text-xs text-slate-200 font-code"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Port / Password (Opsional)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-[#09090b] text-xs text-slate-200 font-code"
                  />
                </div>
              </div>
            )}

            {method === "webhook" && (
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40">
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  URL Webhook Endpoint
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder={`http://${device.ip}:8000/power/${selectedAction}`}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-[#09090b] text-xs text-slate-200 font-code"
                />
              </div>
            )}
          </div>

          {/* Reference Command Snippet Box */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                <span>Perintah CLI Equivalent</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Perintah</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-code text-xs text-emerald-400 break-all select-all">
              {cliCommand}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-[#09090b] hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleConfirmAction}
            disabled={isExecuting}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg ${currentAction.btnColor}`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Perintah...</span>
              </>
            ) : (
              <>
                <ActionIcon className="w-4 h-4" />
                <span>Konfirmasi {selectedAction === "shutdown" ? "Matikan PC" : selectedAction === "restart" ? "Restart PC" : "Sleep Mode"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

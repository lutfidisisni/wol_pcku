import React, { useState, useEffect, useMemo, useTransition } from "react";
import { Device, WoLLog, ToastMessage } from "./types";
import { api } from "./services/api";
import { Navbar } from "./components/Navbar";
import { NetworkStats } from "./components/NetworkStats";
import { DeviceCard } from "./components/DeviceCard";
import { DeviceTable } from "./components/DeviceTable";
import { AddEditDeviceModal } from "./components/AddEditDeviceModal";
import { ManualWoLModal } from "./components/ManualWoLModal";
import { ActivityLogDrawer } from "./components/ActivityLogDrawer";
import { DeviceDetailModal } from "./components/DeviceDetailModal";
import { WoLGuideModal } from "./components/WoLGuideModal";
import { ToastContainer } from "./components/Toast";
import {
  Monitor,
  Plus,
  Radio,
  Search,
  Zap,
  Power,
  RefreshCw,
  Cpu,
} from "lucide-react";

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [logs, setLogs] = useState<WoLLog[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isDark, setIsDark] = useState(true);

  // Active Action States
  const [wakingDeviceIds, setWakingDeviceIds] = useState<Set<string>>(new Set());
  const [pingingDeviceIds, setPingingDeviceIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWakingAll, setIsWakingAll] = useState(false);

  // Modals & Drawers
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [isManualWoLOpen, setIsManualWoLOpen] = useState(false);
  const [isLogsDrawerOpen, setIsLogsDrawerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [inspectDevice, setInspectDevice] = useState<Device | null>(null);

  // Toast Helper
  const addToast = (type: ToastMessage["type"], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, title, message, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [devList, logList] = await Promise.all([api.getDevices(), api.getLogs()]);
        setDevices(devList);
        setLogs(logList);
      } catch {
        // handled
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute available groups for dropdown
  const availableGroups = useMemo(() => {
    const set = new Set<string>();
    devices.forEach((d) => {
      if (d.group) set.add(d.group);
    });
    return Array.from(set);
  }, [devices]);

  // Filtered Devices
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = d.name.toLowerCase().includes(q);
        const matchIp = d.ip.toLowerCase().includes(q);
        const matchMac = d.mac.toLowerCase().includes(q);
        const matchGroup = (d.group || "").toLowerCase().includes(q);
        const matchNotes = (d.notes || "").toLowerCase().includes(q);
        if (!matchName && !matchIp && !matchMac && !matchGroup && !matchNotes) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "online" && d.status !== "online") return false;
        if (statusFilter === "offline" && d.status === "online") return false;
      }

      // Group filter
      if (groupFilter !== "all" && d.group !== groupFilter) {
        return false;
      }

      return true;
    });
  }, [devices, searchQuery, statusFilter, groupFilter]);

  // Handle Wake Single PC
  const handleWakeDevice = async (device: Device) => {
    const devId = device.id;
    setWakingDeviceIds((prev) => new Set(prev).add(devId));

    // Update optimistic status
    setDevices((prev) =>
      prev.map((d) => (d.id === devId ? { ...d, status: "waking" } : d))
    );

    try {
      const result = await api.wakeDevice({
        id: devId,
        mac: device.mac,
        broadcastIp: device.broadcastIp,
        port: device.port,
        deviceName: device.name,
      });

      if (result.success) {
        addToast(
          "success",
          "Magic Packet WoL Terkirim!",
          `Sinyal 102-byte sukses disiarkan ke ${device.name} (${device.mac}) via UDP Port ${device.port || 9}.`
        );

        // Refresh logs
        const updatedLogs = await api.getLogs();
        setLogs(updatedLogs);

        // Tunggu 5 detik lalu coba ping sesungguhnya
        setTimeout(async () => {
          try {
            const pingRes = await api.pingDevice(devId);
            setDevices((prev) =>
              prev.map((d) =>
                d.id === devId
                  ? {
                      ...d,
                      status: pingRes.status,
                      lastSeen: pingRes.status === "online" ? "Baru saja" : d.lastSeen,
                      pingLatencyMs: pingRes.latencyMs || undefined,
                    }
                  : d
              )
            );
            if (pingRes.status === "online") {
              addToast("info", `${device.name} Online`, `Host ${device.ip} telah boot dan merespon sinyal ping.`);
            } else {
              addToast("warning", `${device.name} Belum Online`, `Host ${device.ip} belum merespon setelah dikirimkan Wake-on-LAN.`);
            }
          } catch (e) {
            setDevices((prev) => prev.map((d) => (d.id === devId ? { ...d, status: "offline" } : d)));
          } finally {
            setWakingDeviceIds((prev) => {
              const next = new Set(prev);
              next.delete(devId);
              return next;
            });
          }
        }, 5000);
      } else {
        throw new Error(result.message || "Gagal mengirim paket.");
      }
    } catch (err: any) {
      addToast("error", "Gagal Mengirim WoL", err?.message || "Terjadi kesalahan jaringan.");
      setWakingDeviceIds((prev) => {
        const next = new Set(prev);
        next.delete(devId);
        return next;
      });
      setDevices((prev) =>
        prev.map((d) => (d.id === devId ? { ...d, status: device.status } : d))
      );
    }
  };

  // Handle Ping Single PC
  const handlePingDevice = async (device: Device) => {
    const devId = device.id;
    setPingingDeviceIds((prev) => new Set(prev).add(devId));

    try {
      const res = await api.pingDevice(devId);
      if (res.status === "online") {
        addToast(
          "success",
          "Host Online & Terhubung",
          `Ping ke ${device.name} (${device.ip}) sukses: ${res.latencyMs || 10} ms latency.`
        );
        setDevices((prev) =>
          prev.map((d) =>
            d.id === devId
              ? {
                  ...d,
                  status: "online",
                  lastSeen: "Baru saja",
                  pingLatencyMs: res.latencyMs || 10,
                }
              : d
          )
        );
      } else {
        addToast(
          "warning",
          "Host Tidak Merespon",
          `Host ${device.ip} (${device.name}) berstatus Offline / Standby.`
        );
      }
    } catch (err: any) {
      addToast("error", "Ping Gagal", err?.message || "Koneksi time out.");
    } finally {
      setPingingDeviceIds((prev) => {
        const next = new Set(prev);
        next.delete(devId);
        return next;
      });
    }
  };

  // Handle Save Device (Add / Edit)
  const handleSaveDevice = async (
    data: Omit<Device, "id" | "status" | "lastSeen" | "lastWaked" | "pingLatencyMs">,
    id?: string
  ) => {
    if (id) {
      const updated = await api.updateDevice(id, data);
      setDevices((prev) => prev.map((d) => (d.id === id ? updated : d)));
      addToast("success", "Perangkat Diperbarui", `Konfigurasi ${updated.name} berhasil disimpan.`);
    } else {
      const created = await api.addDevice(data);
      setDevices((prev) => [created, ...prev]);
      addToast(
        "success",
        "Perangkat Ditambahkan",
        `${created.name} (${created.mac}) berhasil didaftarkan ke dashboard.`
      );
    }
  };

  // Handle Delete Device
  const handleDeleteDevice = async (device: Device) => {
    if (window.confirm(`Yakin ingin menghapus ${device.name} (${device.mac}) dari dashboard?`)) {
      await api.deleteDevice(device.id);
      setDevices((prev) => prev.filter((d) => d.id !== device.id));
      addToast("info", "Perangkat Dihapus", `${device.name} telah dihapus dari daftar.`);
    }
  };

  // Handle Clear All Devices
  const handleClearAll = async () => {
    if (window.confirm("Kosongkan semua daftar perangkat? (Data dapat diisi ulang kapan saja)")) {
      await api.clearAllDevices();
      setDevices([]);
      addToast("info", "Daftar Dikosongkan", "Semua perangkat telah dihapus. Dashboard dalam keadaan bersih.");
    }
  };

  // Handle Load Sample Devices
  const handleLoadSample = async () => {
    const loaded = await api.loadSampleDevices();
    setDevices(loaded);
    addToast("success", "Contoh Data Dimuat", `${loaded.length} perangkat contoh berhasil dimuat.`);
  };

  // Handle Wake All Offline PCs
  const handleWakeAll = async () => {
    const offlineDevs = devices.filter((d) => d.status === "offline");
    if (offlineDevs.length === 0) return;

    setIsWakingAll(true);
    offlineDevs.forEach((d) => setWakingDeviceIds((prev) => new Set(prev).add(d.id)));

    setDevices((prev) =>
      prev.map((d) => (d.status === "offline" ? { ...d, status: "waking" } : d))
    );

    try {
      await api.wakeAll();
      addToast(
        "success",
        "Broadcasting Wake-All Sukses",
        `Magic Packet telah dikirimkan ke ${offlineDevs.length} PC offline secara serentak.`
      );

      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);

      setTimeout(async () => {
        try {
          const updated = await api.pingAll();
          setDevices(updated);
        } catch {
          // ignore
        } finally {
          setWakingDeviceIds(new Set());
          setIsWakingAll(false);
        }
      }, 6000);
    } catch {
      setIsWakingAll(false);
      setWakingDeviceIds(new Set());
    }
  };

  // Batch Wake from Table Selection
  const handleBatchWake = async (selected: Device[]) => {
    for (const dev of selected) {
      handleWakeDevice(dev);
    }
  };

  // Handle Global Ping / Refresh All
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const updated = await api.pingAll();
      setDevices(updated);
      addToast(
        "info",
        "Status Jaringan Diperbarui",
        "Pengecekan ping dan status realtime selesai untuk seluruh host."
      );
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Send Manual WoL
  const handleSendManualWoL = async (params: {
    mac: string;
    broadcastIp: string;
    port: number;
    deviceName: string;
  }) => {
    const res = await api.wakeDevice(params);
    if (res.success) {
      addToast(
        "success",
        "Paket WoL Manual Terkirim!",
        `Magic Packet disiarkan ke ${params.mac} via ${params.broadcastIp}:${params.port}`
      );
      const updatedLogs = await api.getLogs();
      setLogs(updatedLogs);
    } else {
      throw new Error(res.message || "Gagal mengirim paket");
    }
  };

  // Handle Clear Logs
  const handleClearLogs = async () => {
    await api.clearLogs();
    setLogs([]);
    addToast("info", "Log Dibersihkan", "Seluruh riwayat aktivitas telah dihapus.");
  };

  const bodyBg = isDark
    ? "bg-slate-950 text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white"
    : "bg-slate-50 text-slate-900 min-h-screen selection:bg-blue-500 selection:text-white";

  return (
    <div className={bodyBg}>
      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        groupFilter={groupFilter}
        onGroupFilterChange={setGroupFilter}
        availableGroups={availableGroups}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAddModal={() => {
          setEditingDevice(null);
          setIsAddEditOpen(true);
        }}
        onOpenManualModal={() => setIsManualWoLOpen(true)}
        onOpenLogsDrawer={() => setIsLogsDrawerOpen(true)}
        onOpenGuideModal={() => setIsGuideOpen(true)}
        logCount={logs.length}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Network Metrics & Telemetry Bar */}
        <NetworkStats
          devices={devices}
          isDark={isDark}
          onWakeAll={handleWakeAll}
          onRefreshAll={handleRefreshAll}
          isWakingAll={isWakingAll}
          isRefreshing={isRefreshing}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              <span>Daftar Perangkat Jaringan</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"
                }`}
              >
                {filteredDevices.length} PC
              </span>
            </h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {statusFilter !== "all" || groupFilter !== "all" || searchQuery
                ? `Menampilkan hasil filter (${filteredDevices.length} dari ${devices.length} total)`
                : "Klik tombol Nyalakan (Turn On) untuk mengirim Magic Packet ke PC pilihan."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {(searchQuery || statusFilter !== "all" || groupFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setGroupFilter("all");
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-colors ${
                  isDark
                    ? "border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Reset Filter
              </button>
            )}
            {devices.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/10 transition-colors"
                title="Hapus semua perangkat jika ingin mulai dari kosong"
              >
                Kosongkan Data
              </button>
            )}
          </div>
        </div>

        {/* Device Content: Grid or Table */}
        {filteredDevices.length === 0 ? (
          <div
            className={`p-12 rounded-2xl border text-center flex flex-col items-center justify-center ${
              isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Monitor className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold">
              {devices.length === 0 ? "Dashboard Siap & Masih Kosong" : "Tidak Ada Perangkat Ditemukan"}
            </h3>
            <p className={`text-xs max-w-md mt-1 mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {devices.length === 0
                ? "Belum ada PC yang didaftarkan. Anda dapat menambahkan PC/server fisik Anda sekarang atau memuat contoh data jika diperlukan."
                : searchQuery
                ? `Tidak ada perangkat yang cocok dengan kata kunci "${searchQuery}".`
                : "Belum ada PC yang terdaftar pada filter ini."}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingDevice(null);
                  setIsAddEditOpen(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah PC Baru</span>
              </button>
              {devices.length === 0 && (
                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>Muat Contoh Data Dummy</span>
                </button>
              )}
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDevices.map((dev) => (
              <DeviceCard
                key={dev.id}
                device={dev}
                isDark={isDark}
                onWake={handleWakeDevice}
                onPing={handlePingDevice}
                onEdit={(d) => {
                  setEditingDevice(d);
                  setIsAddEditOpen(true);
                }}
                onDelete={handleDeleteDevice}
                onInspect={(d) => setInspectDevice(d)}
                isWaking={wakingDeviceIds.has(dev.id)}
                isPinging={pingingDeviceIds.has(dev.id)}
              />
            ))}
          </div>
        ) : (
          <DeviceTable
            devices={filteredDevices}
            isDark={isDark}
            onWake={handleWakeDevice}
            onPing={handlePingDevice}
            onEdit={(d) => {
              setEditingDevice(d);
              setIsAddEditOpen(true);
            }}
            onDelete={handleDeleteDevice}
            onInspect={(d) => setInspectDevice(d)}
            wakingDeviceIds={wakingDeviceIds}
            pingingDeviceIds={pingingDeviceIds}
            onBatchWake={handleBatchWake}
          />
        )}
      </main>

      {/* Floating Action Modal: Add / Edit Device */}
      <AddEditDeviceModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
        editingDevice={editingDevice}
        isDark={isDark}
      />

      {/* Floating Action Modal: Manual WoL Broadcast */}
      <ManualWoLModal
        isOpen={isManualWoLOpen}
        onClose={() => setIsManualWoLOpen(false)}
        onSendWoL={handleSendManualWoL}
        isDark={isDark}
      />

      {/* Slide-over Drawer: Activity Logs & Hex Inspector */}
      <ActivityLogDrawer
        isOpen={isLogsDrawerOpen}
        onClose={() => setIsLogsDrawerOpen(false)}
        logs={logs}
        onClearLogs={handleClearLogs}
        isDark={isDark}
      />

      {/* Device Detailed Inspector Modal */}
      <DeviceDetailModal
        device={inspectDevice}
        isOpen={!!inspectDevice}
        onClose={() => setInspectDevice(null)}
        onWake={handleWakeDevice}
        onPing={handlePingDevice}
        onEdit={(d) => {
          setInspectDevice(null);
          setEditingDevice(d);
          setIsAddEditOpen(true);
        }}
        isDark={isDark}
        isWaking={inspectDevice ? wakingDeviceIds.has(inspectDevice.id) : false}
        isPinging={inspectDevice ? pingingDeviceIds.has(inspectDevice.id) : false}
      />

      {/* Setup Guide Modal (BIOS, Windows, Linux, Subnet) */}
      <WoLGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isDark={isDark}
      />

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

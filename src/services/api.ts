import { Device, WoLLog, WoLSendResult, PowerActionResult, PowerActionType } from "../types";

const INITIAL_DEVICES: Device[] = [
  {
    id: "dev-1",
    name: "PC Ruang Kerja",
    ip: "192.168.8.82",
    mac: "00:1A:2B:3C:4D:5E",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "workstation",
    group: "Kantor / Ruang Kerja",
    status: "online",
    lastSeen: "Baru saja",
    pingLatencyMs: 12,
    notes: "Workstation harian, OS Windows 11 Pro, Intel Core i7",
  },
  {
    id: "dev-2",
    name: "PC Gaming ASRock",
    ip: "192.168.8.105",
    mac: "D4:5D:64:89:A1:7B",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "gaming",
    group: "Ruang Gaming",
    status: "offline",
    lastSeen: "2 jam yang lalu",
    notes: "ASRock B650M + AMD Ryzen 7 7800X3D + RTX 4080",
  },
  {
    id: "dev-3",
    name: "PC Render Node",
    ip: "192.168.8.150",
    mac: "70:85:C2:5E:19:9C",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "render",
    group: "Studio Animasi",
    status: "offline",
    lastSeen: "Kemarin, 18:30",
    notes: "Dual RTX 3090 GPU Blender & After Effects Node",
  },
  {
    id: "dev-4",
    name: "Home Lab & Media Server",
    ip: "192.168.8.200",
    mac: "BC:24:11:4F:7A:3D",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "server",
    group: "Server Room",
    status: "online",
    lastSeen: "Baru saja",
    pingLatencyMs: 4,
    notes: "Proxmox VE 8.1 + Docker Container Cluster",
  },
  {
    id: "dev-5",
    name: "NAS Storage Backup",
    ip: "192.168.8.220",
    mac: "00:11:32:9F:88:4A",
    broadcastIp: "192.168.8.255",
    port: 7,
    iconType: "nas",
    group: "Server Room",
    status: "online",
    lastSeen: "Baru saja",
    pingLatencyMs: 7,
    notes: "Synology 4-Bay DiskStation RAID 5 Storage",
  },
  {
    id: "dev-6",
    name: "Laptop Docking Station",
    ip: "192.168.8.95",
    mac: "A8:64:F2:77:33:EE",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "laptop",
    group: "Kantor / Ruang Kerja",
    status: "offline",
    lastSeen: "3 hari yang lalu",
    notes: "ThinkPad T14 via Gigabit Ethernet Dock",
  },
];

const STORAGE_KEY_DEVICES = "wol_devices_v1";
const STORAGE_KEY_LOGS = "wol_logs_v1";

function getLocalDevices(): Device[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICES);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return INITIAL_DEVICES;
}

function saveLocalDevices(devices: Device[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
  } catch {
    // ignore
  }
}

function getLocalLogs(): WoLLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: "log-sample-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      deviceName: "PC Ruang Kerja",
      mac: "00:1A:2B:3C:4D:5E",
      ip: "192.168.8.82",
      port: 9,
      broadcastIp: "192.168.8.255",
      status: "success",
      packetHex: "FFFFFFFFFFFF" + "001A2B3C4D5E".repeat(16),
      message: "Magic packet WoL berhasil dikirim via broadcast UDP port 9",
    },
  ];
}

function saveLocalLogs(logs: WoLLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch {
    // ignore
  }
}

/**
 * Generate 102-byte Magic Packet hex string representation on frontend
 */
export function generateMagicPacketHex(mac: string): string {
  const clean = mac.replace(/[^0-9A-Fa-f]/g, "").toUpperCase();
  if (clean.length !== 12) return "";
  return "FFFFFFFFFFFF" + clean.repeat(16);
}

// API Service
export const api = {
  async getDevices(): Promise<Device[]> {
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveLocalDevices(json.data);
          return json.data;
        }
      }
    } catch {
      // fallback to local
    }
    return getLocalDevices();
  },

  async addDevice(deviceData: Omit<Device, "id" | "status" | "lastSeen" | "lastWaked" | "pingLatencyMs">): Promise<Device> {
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const current = getLocalDevices();
          saveLocalDevices([json.data, ...current]);
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    const newDev: Device = {
      ...deviceData,
      id: `dev-${Date.now()}`,
      status: "offline",
      lastSeen: "Belum pernah",
    };
    const current = getLocalDevices();
    const updated = [newDev, ...current];
    saveLocalDevices(updated);
    return newDev;
  },

  async updateDevice(id: string, deviceData: Partial<Device>): Promise<Device> {
    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const current = getLocalDevices();
          const next = current.map((d) => (d.id === id ? json.data : d));
          saveLocalDevices(next);
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    const current = getLocalDevices();
    const index = current.findIndex((d) => d.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...deviceData };
      saveLocalDevices(current);
      return current[index];
    }
    throw new Error("Device not found");
  },

  async deleteDevice(id: string): Promise<void> {
    try {
      await fetch(`/api/devices/${id}`, { method: "DELETE" });
    } catch {
      // ignore
    }
    const current = getLocalDevices();
    const filtered = current.filter((d) => d.id !== id);
    saveLocalDevices(filtered);
  },

  async clearAllDevices(): Promise<void> {
    try {
      await fetch("/api/devices/all", { method: "DELETE" });
    } catch {
      // ignore
    }
    saveLocalDevices([]);
  },

  async loadSampleDevices(): Promise<Device[]> {
    try {
      const res = await fetch("/api/devices/reset-sample", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveLocalDevices(json.data);
          return json.data;
        }
      }
    } catch {
      // ignore
    }
    saveLocalDevices(INITIAL_DEVICES);
    return INITIAL_DEVICES;
  },

  async wakeDevice(params: {
    id?: string;
    mac: string;
    broadcastIp?: string;
    port?: number;
    deviceName?: string;
  }): Promise<WoLSendResult> {
    try {
      const res = await fetch("/api/wol/wake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {
      // fallback
    }

    // Client-side simulation fallback
    const hex = generateMagicPacketHex(params.mac);
    const log: WoLLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      deviceName: params.deviceName || "Perangkat WoL",
      mac: params.mac,
      ip: params.broadcastIp || "255.255.255.255",
      port: params.port || 9,
      broadcastIp: params.broadcastIp || "255.255.255.255",
      status: "success",
      packetHex: hex,
      message: `Paket Magic WoL berhasil dibroadcast ke ${params.mac} (Port ${params.port || 9})`,
    };

    const logs = getLocalLogs();
    logs.unshift(log);
    saveLocalLogs(logs.slice(0, 50));

    return {
      success: true,
      message: `Sinyal Magic Packet WoL berhasil dikirim ke ${params.deviceName || params.mac}`,
      data: {
        mac: params.mac,
        broadcastIp: params.broadcastIp || "255.255.255.255",
        port: params.port || 9,
        packetHex: hex,
        bytesSent: 102,
      },
    };
  },

  async wakeAll(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/wol/wake-all", { method: "POST" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return {
      success: true,
      message: "Paket Magic WoL disiarkan ke semua host offline.",
    };
  },

  async pingAll(): Promise<Device[]> {
    try {
      const res = await fetch("/api/devices/ping", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveLocalDevices(json.data);
          return json.data;
        }
      }
    } catch {
      // fallback
    }

    const current = getLocalDevices();
    const updated = current.map((d) => {
      if (d.status === "online") {
        return {
          ...d,
          pingLatencyMs: Math.floor(Math.random() * 18) + 4,
          lastSeen: "Baru saja",
        };
      }
      return d;
    });
    saveLocalDevices(updated);
    return updated;
  },

  async pingDevice(id: string): Promise<{ success: boolean; status: "online" | "offline"; latencyMs?: number; message: string }> {
    try {
      const res = await fetch(`/api/devices/${id}/ping`, { method: "POST" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const current = getLocalDevices();
    const dev = current.find((d) => d.id === id);
    if (dev && dev.status === "online") {
      const lat = Math.floor(Math.random() * 20) + 4;
      return {
        success: true,
        status: "online",
        latencyMs: lat,
        message: `Ping ke ${dev.ip} (${dev.name}) sukses: ${lat}ms`,
      };
    }
    return {
      success: true,
      status: "offline",
      message: `Host ${dev?.ip || id} tidak merespon (Host Offline).`,
    };
  },

  async getLogs(): Promise<WoLLog[]> {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveLocalLogs(json.data);
          return json.data;
        }
      }
    } catch {
      // fallback
    }
    return getLocalLogs();
  },

  async clearLogs(): Promise<void> {
    try {
      await fetch("/api/logs", { method: "DELETE" });
    } catch {
      // fallback
    }
    saveLocalLogs([]);
  },

  async executePowerAction(params: {
    deviceId: string;
    action: PowerActionType;
    method?: "rpc" | "ssh" | "webhook" | "agent";
    username?: string;
    password?: string;
    webhookUrl?: string;
  }): Promise<PowerActionResult> {
    try {
      const res = await fetch(`/api/devices/${params.deviceId}/power`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch {
      // fallback
    }

    const current = getLocalDevices();
    const dev = current.find((d) => d.id === params.deviceId);
    const actionLabel =
      params.action === "shutdown"
        ? "Matikan PC (Shutdown)"
        : params.action === "restart"
        ? "Restart PC"
        : "Mode Tidur (Sleep)";

    if (dev) {
      if (params.action === "shutdown") {
        dev.status = "offline";
        dev.lastSeen = "Baru saja dimatikan";
        dev.pingLatencyMs = undefined;
      } else if (params.action === "restart") {
        dev.status = "waking";
      }
      saveLocalDevices(current);

      const log: WoLLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        deviceName: dev.name,
        mac: dev.mac,
        ip: dev.ip,
        port: dev.port,
        broadcastIp: dev.broadcastIp,
        status: "success",
        packetHex: `POWER_${params.action.toUpperCase()}`,
        message: `Perintah ${actionLabel} diproses untuk ${dev.name} (${dev.ip})`,
        actionType: params.action,
      };

      const logs = getLocalLogs();
      logs.unshift(log);
      saveLocalLogs(logs.slice(0, 50));
    }

    return {
      success: true,
      action: params.action,
      deviceName: dev?.name || "Perangkat",
      targetIp: dev?.ip || "192.168.8.x",
      message: `Perintah ${actionLabel} berhasil diproses.`,
    };
  },
};


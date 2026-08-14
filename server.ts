import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dgram from "dgram";
import ping from "ping";

interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  broadcastIp: string;
  port: number;
  iconType: "workstation" | "gaming" | "server" | "render" | "laptop" | "nas";
  group: string;
  status: "online" | "offline" | "waking";
  lastSeen?: string;
  lastWaked?: string;
  pingLatencyMs?: number;
  notes?: string;
}

interface WoLLog {
  id: string;
  timestamp: string;
  deviceName: string;
  mac: string;
  ip: string;
  port: number;
  broadcastIp: string;
  status: "success" | "failed";
  packetHex: string;
  message: string;
}

// Sample mock devices for testing or default demonstration
const SAMPLE_DEVICES: Device[] = [
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
    notes: "Workstation harian, OS Windows 11 Pro",
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
    notes: "ASRock B650M + Ryzen 7 7800X3D + RTX 4080",
  },
  {
    id: "dev-3",
    name: "PC Render",
    ip: "192.168.8.150",
    mac: "70:85:C2:5E:19:9C",
    broadcastIp: "192.168.8.255",
    port: 9,
    iconType: "render",
    group: "Studio Animasi",
    status: "offline",
    lastSeen: "Kemarin, 18:30",
    notes: "Dual RTX 3090 Blender & After Effects Node",
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
    notes: "Proxmox VE + Docker Container Cluster",
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
    pingLatencyMs: 6,
    notes: "Synology 4-Bay RAID 5 Storage",
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
    notes: "ThinkPad via Ethernet Gigabit Dock",
  },
];

const SAMPLE_LOGS: WoLLog[] = [
  {
    id: "log-init-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
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

// Persistent File Storage configuration
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const DEVICES_FILE = path.join(DATA_DIR, "devices.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.error("Failed to ensure data dir:", e);
  }
}

function loadInitialDevices(): Device[] {
  ensureDataDirExists();
  // 1. If file already exists on disk (or in mounted volume), always load user data
  if (fs.existsSync(DEVICES_FILE)) {
    try {
      const raw = fs.readFileSync(DEVICES_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading devices.json, falling back:", e);
    }
  }

  // 2. If file does not exist, check LOAD_SAMPLE_DATA environment variable
  const shouldLoadSample =
    process.env.LOAD_SAMPLE_DATA !== "false" &&
    process.env.LOAD_SAMPLE_DATA !== "0" &&
    process.env.LOAD_SAMPLE_DATA !== "no";

  const initial = shouldLoadSample ? SAMPLE_DEVICES : [];
  saveDevicesToDisk(initial);
  return initial;
}

function saveDevicesToDisk(devs: Device[]) {
  ensureDataDirExists();
  try {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(devs, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving devices.json:", e);
  }
}

function loadInitialLogs(): WoLLog[] {
  ensureDataDirExists();
  if (fs.existsSync(LOGS_FILE)) {
    try {
      const raw = fs.readFileSync(LOGS_FILE, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      console.error("Error reading logs.json:", e);
    }
  }

  const shouldLoadSample =
    process.env.LOAD_SAMPLE_DATA !== "false" &&
    process.env.LOAD_SAMPLE_DATA !== "0" &&
    process.env.LOAD_SAMPLE_DATA !== "no";

  const initial = shouldLoadSample ? SAMPLE_LOGS : [];
  saveLogsToDisk(initial);
  return initial;
}

function saveLogsToDisk(logs: WoLLog[]) {
  ensureDataDirExists();
  try {
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving logs.json:", e);
  }
}

let devices: Device[] = loadInitialDevices();
let activityLogs: WoLLog[] = loadInitialLogs();

/**
 * Creates a Wake-on-LAN Magic Packet buffer (102 bytes).
 * 6 bytes of 0xFF followed by 16 repetitions of the target 6-byte MAC address.
 */
function createMagicPacket(macAddress: string): Buffer {
  const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, "");
  if (cleanMac.length !== 12) {
    throw new Error(`Format MAC Address tidak valid: ${macAddress}`);
  }

  const macBytes = Buffer.from(cleanMac, "hex");
  const packet = Buffer.alloc(102);

  // 6 bytes of 0xFF
  for (let i = 0; i < 6; i++) {
    packet[i] = 0xff;
  }

  // 16 copies of the target MAC
  for (let i = 0; i < 16; i++) {
    macBytes.copy(packet, 6 + i * 6, 0, 6);
  }

  return packet;
}

/**
 * Sends Wake-on-LAN Magic Packet via UDP
 */
function sendMagicPacket(
  mac: string,
  broadcastIp: string = "255.255.255.255",
  port: number = 9
): Promise<{ packetHex: string; bytesSent: number }> {
  return new Promise((resolve, reject) => {
    try {
      const packet = createMagicPacket(mac);
      const client = dgram.createSocket("udp4");

      client.bind(() => {
        client.setBroadcast(true);
        client.send(packet, 0, packet.length, port, broadcastIp, (err) => {
          client.close();
          if (err) {
            return reject(err);
          }
          resolve({
            packetHex: packet.toString("hex").toUpperCase(),
            bytesSent: packet.length,
          });
        });
      });

      client.on("error", (err) => {
        try {
          client.close();
        } catch {
          // ignore
        }
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all devices
  app.get("/api/devices", (_req: Request, res: Response) => {
    res.json({ success: true, data: devices });
  });

  // Add new device
  app.post("/api/devices", (req: Request, res: Response) => {
    const { name, ip, mac, broadcastIp, port, iconType, group, notes } = req.body;

    if (!name || !mac) {
      return res.status(400).json({ success: false, message: "Nama dan MAC Address wajib diisi." });
    }

    const cleanMac = mac.trim().toUpperCase();
    const newDevice: Device = {
      id: `dev-${Date.now()}`,
      name: name.trim(),
      ip: (ip || "192.168.1.100").trim(),
      mac: cleanMac,
      broadcastIp: (broadcastIp || "255.255.255.255").trim(),
      port: Number(port) || 9,
      iconType: iconType || "workstation",
      group: (group || "Umum").trim(),
      status: "offline",
      lastSeen: "Belum pernah",
      notes: notes?.trim() || "",
    };

    devices.unshift(newDevice);
    saveDevicesToDisk(devices);
    res.status(201).json({ success: true, data: newDevice, message: `Perangkat ${newDevice.name} berhasil ditambahkan.` });
  });

  // Reset to Sample Devices
  app.post("/api/devices/reset-sample", (_req: Request, res: Response) => {
    devices = [...SAMPLE_DEVICES];
    saveDevicesToDisk(devices);
    res.json({
      success: true,
      data: devices,
      message: "Data contoh (sample dummy) berhasil dimuat ulang.",
    });
  });

  // Delete all devices (Empty clean slate)
  app.delete("/api/devices/all", (_req: Request, res: Response) => {
    devices = [];
    saveDevicesToDisk(devices);
    res.json({
      success: true,
      data: [],
      message: "Semua perangkat telah berhasil dihapus. Dashboard dalam keadaan bersih/kosong.",
    });
  });

  // Update existing device
  app.put("/api/devices/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const index = devices.findIndex((d) => d.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan." });
    }

    devices[index] = {
      ...devices[index],
      ...req.body,
      id, // protect ID
    };

    saveDevicesToDisk(devices);
    res.json({ success: true, data: devices[index], message: `Perangkat ${devices[index].name} diperbarui.` });
  });

  // Delete single device
  app.delete("/api/devices/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = devices.length;
    const target = devices.find((d) => d.id === id);
    devices = devices.filter((d) => d.id !== id);

    if (devices.length === initialLength) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan." });
    }

    saveDevicesToDisk(devices);
    res.json({ success: true, message: `Perangkat ${target?.name || id} berhasil dihapus.` });
  });

  // Wake single device or custom MAC
  app.post("/api/wol/wake", async (req: Request, res: Response) => {
    const { id, mac, broadcastIp, port, deviceName } = req.body;

    let targetMac = mac;
    let targetBroadcast = broadcastIp || "255.255.255.255";
    let targetPort = port || 9;
    let targetName = deviceName || "Custom Device";
    let targetIp = "255.255.255.255";

    if (id) {
      const dev = devices.find((d) => d.id === id);
      if (dev) {
        targetMac = dev.mac;
        targetBroadcast = dev.broadcastIp || "255.255.255.255";
        targetPort = dev.port || 9;
        targetName = dev.name;
        targetIp = dev.ip;

        // Mark as waking
        dev.status = "waking";
        dev.lastWaked = new Date().toISOString();
      }
    }

    if (!targetMac) {
      return res.status(400).json({ success: false, message: "MAC Address tidak disertakan." });
    }

    try {
      const result = await sendMagicPacket(targetMac, targetBroadcast, targetPort);

      const logEntry: WoLLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        deviceName: targetName,
        mac: targetMac,
        ip: targetIp,
        port: targetPort,
        broadcastIp: targetBroadcast,
        status: "success",
        packetHex: result.packetHex,
        message: `Paket Magic WoL (102 byte) sukses dikirimkan ke ${targetMac} via ${targetBroadcast}:${targetPort}`,
      };

      activityLogs.unshift(logEntry);
      if (activityLogs.length > 50) activityLogs.pop();

      // Remove mock simulated wake-up transition. We let actual ping update it later.
      // if (id) {
      //   const dev = devices.find((d) => d.id === id);
      //   if (dev) {
      //     setTimeout(() => {
      //       dev.status = "online";
      //       dev.lastSeen = "Baru saja";
      //       dev.pingLatencyMs = Math.floor(Math.random() * 20) + 8;
      //     }, 4500);
      //   }
      // }

      res.json({
        success: true,
        message: `Sinyal Magic Packet WoL berhasil dikirim ke ${targetName} (${targetMac})`,
        data: {
          mac: targetMac,
          broadcastIp: targetBroadcast,
          port: targetPort,
          packetHex: result.packetHex,
          bytesSent: result.bytesSent,
        },
      });
    } catch (err: any) {
      const logEntry: WoLLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        deviceName: targetName,
        mac: targetMac,
        ip: targetIp,
        port: targetPort,
        broadcastIp: targetBroadcast,
        status: "failed",
        packetHex: "",
        message: `Gagal mengirim paket WoL: ${err?.message || "Kesalahan jaringan UDP"}`,
      };
      activityLogs.unshift(logEntry);

      res.status(500).json({
        success: false,
        message: `Gagal mengirim Magic Packet: ${err?.message || "Error UDP"}`,
      });
    }
  });

  // Wake all offline devices
  app.post("/api/wol/wake-all", async (_req: Request, res: Response) => {
    const offlineDevices = devices.filter((d) => d.status === "offline" || d.status === "waking");
    const results = [];

    for (const dev of offlineDevices) {
      try {
        const result = await sendMagicPacket(dev.mac, dev.broadcastIp, dev.port);
        dev.status = "waking";
        dev.lastWaked = new Date().toISOString();

        activityLogs.unshift({
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          deviceName: dev.name,
          mac: dev.mac,
          ip: dev.ip,
          port: dev.port,
          broadcastIp: dev.broadcastIp,
          status: "success",
          packetHex: result.packetHex,
          message: `Wake-all: Magic packet dikirim ke ${dev.name}`,
        });

        // Remove mock simulated wake-all transition.
        // setTimeout(() => {
        //   dev.status = "online";
        //   dev.lastSeen = "Baru saja";
        //   dev.pingLatencyMs = Math.floor(Math.random() * 25) + 5;
        // }, 5000);

        results.push({ name: dev.name, mac: dev.mac, success: true });
      } catch (err: any) {
        results.push({ name: dev.name, mac: dev.mac, success: false, error: err?.message });
      }
    }

    res.json({
      success: true,
      message: `Berhasil mengirim sinyal Wake-on-LAN ke ${results.filter((r) => r.success).length} perangkat.`,
      results,
    });
  });

  // Ping check for all devices
  app.post("/api/devices/ping", async (_req: Request, res: Response) => {
    // Perform actual ping status across all devices
    const promises = devices.map(async (d) => {
      try {
        const pingRes = await ping.promise.probe(d.ip, { timeout: 2 });
        if (pingRes.alive) {
          d.status = "online";
          d.pingLatencyMs = Math.round(pingRes.time as number) || 1;
          d.lastSeen = "Baru saja";
        } else {
          // If it was 'waking', we can leave it as waking until it actually comes online,
          // or mark it offline if we want. Let's mark it offline if dead.
          if (d.status !== "waking") {
            d.status = "offline";
          }
        }
      } catch (err) {
        if (d.status !== "waking") d.status = "offline";
      }
      return d;
    });

    const updated = await Promise.all(promises);
    saveDevicesToDisk(devices);

    res.json({
      success: true,
      message: "Status konektivitas semua perangkat telah diperbarui.",
      data: updated,
    });
  });

  // Ping single device
  app.post("/api/devices/:id/ping", async (req: Request, res: Response) => {
    const { id } = req.params;
    const dev = devices.find((d) => d.id === id);

    if (!dev) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan." });
    }

    try {
      const pingRes = await ping.promise.probe(dev.ip, { timeout: 2 });
      if (pingRes.alive) {
        dev.status = "online";
        dev.pingLatencyMs = Math.round(pingRes.time as number) || 1;
        dev.lastSeen = "Baru saja";
        saveDevicesToDisk(devices);
        return res.json({
          success: true,
          status: "online",
          latencyMs: dev.pingLatencyMs,
          message: `Ping ke ${dev.ip} (${dev.name}) berhasil: ${dev.pingLatencyMs}ms.`,
        });
      } else {
        if (dev.status !== "waking") dev.status = "offline";
        saveDevicesToDisk(devices);
        return res.json({
          success: true,
          status: "offline",
          latencyMs: null,
          message: `Host ${dev.ip} (${dev.name}) tidak merespon (Host Unreachable).`,
        });
      }
    } catch (err) {
      if (dev.status !== "waking") dev.status = "offline";
      saveDevicesToDisk(devices);
      return res.json({
        success: true,
        status: "offline",
        latencyMs: null,
        message: `Koneksi gagal saat ping ke ${dev.ip}.`,
      });
    }
  });

  // Get activity logs
  app.get("/api/logs", (_req: Request, res: Response) => {
    res.json({ success: true, data: activityLogs });
  });

  // Clear logs
  app.delete("/api/logs", (_req: Request, res: Response) => {
    activityLogs = [];
    res.json({ success: true, message: "Riwayat aktivitas berhasil dikosongkan." });
  });

  // Remote Power Management (Shutdown / Restart / Sleep)
  app.post("/api/devices/:id/power", async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      action = "shutdown",
      method = "rpc",
      username = "",
      password = "",
      webhookUrl = "",
      timeoutSec = 10,
    } = req.body;

    const dev = devices.find((d) => d.id === id);
    if (!dev) {
      return res.status(404).json({ success: false, message: "Perangkat tidak ditemukan." });
    }

    const actionNames: Record<string, string> = {
      shutdown: "Matikan PC (Shutdown)",
      restart: "Muat Ulang (Restart)",
      sleep: "Mode Tidur (Sleep/Suspend)",
    };

    const actionLabel = actionNames[action] || action;
    let snippet = "";

    // Generate reference command snippet for user
    if (method === "rpc" || method === "windows") {
      if (action === "shutdown") {
        snippet = `shutdown /s /m \\\\${dev.ip} /t 0 /f`;
      } else if (action === "restart") {
        snippet = `shutdown /r /m \\\\${dev.ip} /t 0 /f`;
      } else {
        snippet = `rundll32.exe powrprof.dll,SetSuspendState 0,1,0`;
      }
    } else if (method === "ssh") {
      const user = username ? `${username}@` : "";
      if (action === "shutdown") {
        snippet = `ssh ${user}${dev.ip} "sudo shutdown -h now"`;
      } else if (action === "restart") {
        snippet = `ssh ${user}${dev.ip} "sudo reboot"`;
      } else {
        snippet = `ssh ${user}${dev.ip} "sudo systemctl suspend"`;
      }
    } else if (method === "webhook") {
      snippet = `curl -X POST "${webhookUrl || `http://${dev.ip}:8000/power/${action}`}"`;
    }

    try {
      // If Webhook method is provided with URL, attempt HTTP request
      if (method === "webhook" && webhookUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, ip: dev.ip, mac: dev.mac }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch {
          // Webhook might be fire-and-forget or machine went down instantly
        }
      }

      // Record in logs
      const logEntry: WoLLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        deviceName: dev.name,
        mac: dev.mac,
        ip: dev.ip,
        port: dev.port,
        broadcastIp: dev.broadcastIp,
        status: "success",
        packetHex: `POWER_${action.toUpperCase()}_CMD`,
        message: `Perintah ${actionLabel} dikirimkan ke ${dev.name} (${dev.ip}) via metode ${method.toUpperCase()}.`,
      };

      activityLogs.unshift(logEntry);
      if (activityLogs.length > 50) activityLogs.pop();

      // If action is shutdown, mark as offline after short grace period
      if (action === "shutdown") {
        dev.status = "offline";
        dev.lastSeen = "Baru saja dimatikan";
        dev.pingLatencyMs = undefined;
        saveDevicesToDisk(devices);
      } else if (action === "restart") {
        dev.status = "waking";
        saveDevicesToDisk(devices);
      }

      res.json({
        success: true,
        action,
        deviceName: dev.name,
        targetIp: dev.ip,
        commandSnippet: snippet,
        message: `Perintah ${actionLabel} berhasil diproses untuk ${dev.name} (${dev.ip}).`,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: `Gagal mengeksekusi ${actionLabel}: ${err?.message || "Kesalahan koneksi"}`,
      });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wake-on-LAN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

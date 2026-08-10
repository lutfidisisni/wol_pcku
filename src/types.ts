export type DeviceIconType =
  | "workstation"
  | "gaming"
  | "server"
  | "render"
  | "laptop"
  | "nas"
  | "tv"
  | "router";

export type DeviceStatus = "online" | "offline" | "waking";

export interface Device {
  id: string;
  name: string;
  ip: string;
  mac: string;
  broadcastIp: string;
  port: number;
  iconType: DeviceIconType;
  group: string;
  status: DeviceStatus;
  lastSeen?: string;
  lastWaked?: string;
  pingLatencyMs?: number;
  notes?: string;
}

export interface WoLLog {
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

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  timestamp: number;
}

export interface WoLSendResult {
  success: boolean;
  message: string;
  data?: {
    mac: string;
    broadcastIp: string;
    port: number;
    packetHex: string;
    bytesSent: number;
  };
}

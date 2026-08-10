import React from "react";
import {
  Monitor,
  Gamepad2,
  Server,
  Cpu,
  Laptop,
  HardDrive,
  Tv,
  Router,
} from "lucide-react";
import { DeviceIconType } from "../types";

interface DeviceIconProps {
  type: DeviceIconType;
  className?: string;
  size?: number;
}

export const DeviceIcon: React.FC<DeviceIconProps> = ({ type, className = "w-5 h-5", size }) => {
  switch (type) {
    case "gaming":
      return <Gamepad2 className={className} size={size} />;
    case "server":
      return <Server className={className} size={size} />;
    case "render":
      return <Cpu className={className} size={size} />;
    case "laptop":
      return <Laptop className={className} size={size} />;
    case "nas":
      return <HardDrive className={className} size={size} />;
    case "tv":
      return <Tv className={className} size={size} />;
    case "router":
      return <Router className={className} size={size} />;
    case "workstation":
    default:
      return <Monitor className={className} size={size} />;
  }
};

export const DEVICE_TYPE_LABELS: Record<DeviceIconType, { label: string; bg: string; text: string }> = {
  workstation: {
    label: "Workstation / PC",
    bg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    text: "text-blue-400",
  },
  gaming: {
    label: "Gaming Rig",
    bg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    text: "text-violet-400",
  },
  render: {
    label: "Render Workstation",
    bg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    text: "text-amber-400",
  },
  server: {
    label: "Dedicated Server",
    bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    text: "text-emerald-400",
  },
  nas: {
    label: "NAS Storage",
    bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    text: "text-cyan-400",
  },
  laptop: {
    label: "Laptop / Dock",
    bg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    text: "text-indigo-400",
  },
  tv: {
    label: "Smart TV / Media",
    bg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    text: "text-rose-400",
  },
  router: {
    label: "Network Host",
    bg: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    text: "text-teal-400",
  },
};

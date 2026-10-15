'use client';

import React from 'react';
import {
  Video,
  Palette,
  Globe,
  Smartphone,
  CheckCircle,
  Server,
  User,
  Coffee,
} from 'lucide-react';
import { RoomId } from '@nexusdev/shared';

interface QuickNavDockProps {
  onJumpToRoom: (roomId: RoomId) => void;
}

const ROOM_SHORTCUTS: { id: RoomId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'boardroom', label: 'Ruang Rapat', icon: <Video className="w-3.5 h-3.5" />, color: '#3B82F6' },
  { id: 'design_studio', label: 'Design & PM', icon: <Palette className="w-3.5 h-3.5" />, color: '#F59E0B' },
  { id: 'web_bay', label: 'Web Bay', icon: <Globe className="w-3.5 h-3.5" />, color: '#10B981' },
  { id: 'mobile_bay', label: 'Mobile Lab', icon: <Smartphone className="w-3.5 h-3.5" />, color: '#6366F1' },
  { id: 'qa_lab', label: 'QA Lab', icon: <CheckCircle className="w-3.5 h-3.5" />, color: '#EF4444' },
  { id: 'devops_room', label: 'DevOps & Infra', icon: <Server className="w-3.5 h-3.5" />, color: '#14B8A6' },
  { id: 'ceo_office', label: 'Meja CEO', icon: <User className="w-3.5 h-3.5" />, color: '#8B5CF6' },
  { id: 'breakroom', label: 'Lounge', icon: <Coffee className="w-3.5 h-3.5" />, color: '#A855F7' },
];

export default function QuickNavDock({ onJumpToRoom }: QuickNavDockProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
      {/* Mini Controls Guide Pill */}
      <div className="text-[10px] font-semibold text-slate-400 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 shadow-lg pointer-events-auto flex items-center gap-2">
        <span className="text-indigo-400">WASD / Panah / Klik</span>
        <span>• Jalan</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400">Klik Karakter</span>
        <span>• Buka Inspector</span>
      </div>

      {/* Quick Nav Room Buttons */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl pointer-events-auto">
        {ROOM_SHORTCUTS.map((room) => (
          <button
            key={room.id}
            onClick={() => onJumpToRoom(room.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            title={`Lompat ke ${room.label}`}
          >
            <span style={{ color: room.color }}>{room.icon}</span>
            <span className="hidden lg:inline">{room.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

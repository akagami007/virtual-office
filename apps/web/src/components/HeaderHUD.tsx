'use client';

import React from 'react';
import {
  Users,
  Kanban,
  Video,
  Activity,
  MapPin,
  Sparkles,
  FolderCode,
} from 'lucide-react';
import { RoomZone } from '@nexusdev/shared';

interface HeaderHUDProps {
  currentRoom: RoomZone | null;
  onOpenMeeting: () => void;
  onOpenKanban: () => void;
  onOpenRoster: () => void;
  onOpenWorkspace: () => void;
  activeAgentsCount: number;
  isConnected?: boolean;
}

export default function HeaderHUD({
  currentRoom,
  onOpenMeeting,
  onOpenKanban,
  onOpenRoster,
  onOpenWorkspace,
  activeAgentsCount,
  isConnected = false,
}: HeaderHUDProps) {
  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Left: Studio Branding & Project Badge */}
      <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl pointer-events-auto">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">
              NexusDev Studio
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0 SDLC
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
              }`}
              title={isConnected ? 'Live WebSocket Gateway Connected' : 'Running Standalone / Offline'}
            />
            <span className="text-xs text-slate-400 font-medium">
              {isConnected ? 'Gateway Aktif (WebSocket :4000)' : 'Client Ready (Multi-Agent SDLC)'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Current Room Location HUD */}
      {currentRoom && (
        <div className="hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-1.5 shadow-lg pointer-events-auto transition-all animate-in fade-in zoom-in-95">
          <MapPin
            className="w-4 h-4"
            style={{ color: currentRoom.color }}
          />
          <span className="text-xs font-semibold text-slate-200">
            {currentRoom.name}
          </span>
          <span className="text-[11px] text-slate-400">
            • {currentRoom.label}
          </span>
        </div>
      )}

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={onOpenRoster}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-lg transition-all hover:border-slate-600"
          title="Lihat Daftar Tim Agen AI"
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Tim Agen</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-800 rounded-md text-cyan-300 font-mono">
            {activeAgentsCount}
          </span>
        </button>

        <button
          onClick={onOpenKanban}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-lg transition-all hover:border-slate-600"
          title="Papan Kanban Proyek"
        >
          <Kanban className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Kanban</span>
        </button>

        <button
          onClick={onOpenWorkspace}
          className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-lg transition-all hover:border-slate-600"
          title="Lihat Berkas Kode Proyek & Sandbox Terminal"
        >
          <FolderCode className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Workspace</span>
        </button>

        <button
          onClick={onOpenMeeting}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-500/50"
          title="Panggil Rapat Semua Agen di Ruang Rapat"
        >
          <Video className="w-4 h-4" />
          <span>Panggil Rapat</span>
        </button>
      </div>
    </header>
  );
}

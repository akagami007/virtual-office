'use client';

import React from 'react';
import { X, UserCheck, Compass, Sparkles, MessageSquare } from 'lucide-react';
import { AgentProfile, INITIAL_AGENTS_ROSTER } from '@nexusdev/shared';

interface AgentRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agent: AgentProfile) => void;
  onJumpToAgent: (agentId: string) => void;
}

export default function AgentRosterModal({
  isOpen,
  onClose,
  onSelectAgent,
  onJumpToAgent,
}: AgentRosterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Direktori Tim Agen AI (8 Spesialis)
              </h2>
              <p className="text-xs text-slate-400">
                NexusDev Studio — Autonomous Engineering Workforce
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roster Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/20">
          {Object.values(INITIAL_AGENTS_ROSTER).map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-500/80 transition-all shadow-md flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-sm"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {agent.state}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{agent.title}</p>
                  <p className="text-[11px] text-slate-500">{agent.department}</p>
                </div>

                <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {agent.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {agent.skills.slice(0, 2).map((s, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                  {agent.skills.length > 2 && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-500">
                      +{agent.skills.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                <button
                  onClick={() => {
                    onSelectAgent(agent);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Buka Detail</span>
                </button>

                <button
                  onClick={() => {
                    onJumpToAgent(agent.id);
                    onClose();
                  }}
                  className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Fokus Kamera ke Meja"
                >
                  <Compass className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

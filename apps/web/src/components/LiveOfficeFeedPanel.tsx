'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Play,
  Pause,
  Sparkles,
  Users,
  ChevronDown,
  ChevronUp,
  Send,
  Compass,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import {
  AgentPeerDiscussion,
  AgentProfile,
  AgentRole,
  AUTONOMOUS_PEER_DISCUSSIONS,
  INITIAL_AGENTS_ROSTER,
} from '@nexusdev/shared';

interface LiveOfficeFeedPanelProps {
  discussions: AgentPeerDiscussion[];
  isAutonomous: boolean;
  onToggleAutonomous: (enabled: boolean) => void;
  onTriggerRandomDiscussion: () => void;
  onTriggerCustomDiscussion: (
    initiatorId: AgentRole,
    targetId: AgentRole,
    topic?: string,
    skillCommand?: string
  ) => void;
  onSelectAgent: (agent: AgentProfile) => void;
  onFocusPair: (agentId: AgentRole) => void;
}

const COLLABORATING_ROLES: AgentRole[] = [
  'AGT-CTO',
  'AGT-PM',
  'AGT-PA',
  'AGT-UIUX',
  'AGT-FE',
  'AGT-BE',
  'AGT-MOB',
  'AGT-QA',
  'AGT-OPS',
];

export default function LiveOfficeFeedPanel({
  discussions,
  isAutonomous,
  onToggleAutonomous,
  onTriggerRandomDiscussion,
  onTriggerCustomDiscussion,
  onSelectAgent,
  onFocusPair,
}: LiveOfficeFeedPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [initiatorId, setInitiatorId] = useState<AgentRole>('AGT-OPS');
  const [targetId, setTargetId] = useState<AgentRole>('AGT-BE');
  const [customTopic, setCustomTopic] = useState('');

  const activeList: AgentPeerDiscussion[] =
    discussions.length > 0
      ? discussions
      : [
          {
            ...AUTONOMOUS_PEER_DISCUSSIONS[0],
            id: 'disc-fallback-01',
            startedAt: 'Baru saja',
          },
        ];
  const latestDiscussion = activeList[0];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initiatorId === targetId) return;
    const initiator = INITIAL_AGENTS_ROSTER[initiatorId];
    const defaultSkill = initiator?.skills[0] || '/ci-cd-and-automation';
    onTriggerCustomDiscussion(
      initiatorId,
      targetId,
      customTopic.trim() || undefined,
      defaultSkill
    );
    setCustomTopic('');
    setShowCustomForm(false);
  };

  return (
    <div className="fixed left-4 bottom-20 z-20 w-[370px] max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Users className="w-4 h-4" />
            {isAutonomous && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white tracking-tight">
                Interaksi & Diskusi Tim Live
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {discussions.length || 1} Sesi
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Agen berjalan otomatis & berdiskusi lintas divisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleAutonomous(!isAutonomous)}
            title={
              isAutonomous
                ? 'Jeda pergerakan diskusi otomatis'
                : 'Aktifkan pergerakan diskusi otomatis'
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
              isAutonomous
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {isAutonomous ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Auto ON</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                <span>Auto OFF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTriggerRandomDiscussion}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Picu Diskusi Berikutnya</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomForm(!showCustomForm)}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] font-semibold transition-all ${
                showCustomForm
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              + Pilih Agen
            </button>
          </div>

          {/* Custom Pair Trigger Form */}
          {showCustomForm && (
            <form
              onSubmit={handleCustomSubmit}
              className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5 animate-in fade-in duration-200"
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Perintahkan 2 Karakter Berdiskusi
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    Inisiator (Berjalan)
                  </label>
                  <select
                    value={initiatorId}
                    onChange={(e) => setInitiatorId(e.target.value as AgentRole)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  >
                    {COLLABORATING_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {INITIAL_AGENTS_ROSTER[role].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    Rekan Tujuan (Meja)
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value as AgentRole)}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                  >
                    {COLLABORATING_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {INITIAL_AGENTS_ROSTER[role].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {initiatorId === targetId && (
                <p className="text-[10px] text-amber-400">
                  Pilih dua karakter yang berbeda untuk berdiskusi.
                </p>
              )}

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Topik diskusi opsional (misal: Audit CI/CD)..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={initiatorId === targetId}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-bold flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Mulai</span>
                </button>
              </div>
            </form>
          )}

          {/* Latest / Active Peer Discussion Card */}
          {latestDiscussion && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const p = INITIAL_AGENTS_ROSTER[latestDiscussion.initiatorId];
                      if (p) onSelectAgent(p);
                    }}
                    className="text-[11px] font-bold text-indigo-300 hover:underline"
                  >
                    {INITIAL_AGENTS_ROSTER[latestDiscussion.initiatorId]?.name.split(' ')[0]}
                  </button>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => {
                      const p = INITIAL_AGENTS_ROSTER[latestDiscussion.targetId];
                      if (p) onSelectAgent(p);
                    }}
                    className="text-[11px] font-bold text-emerald-300 hover:underline"
                  >
                    {INITIAL_AGENTS_ROSTER[latestDiscussion.targetId]?.name.split(' ')[0]}
                  </button>
                  {latestDiscussion.isLoungeBreak && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Coffee className="w-2.5 h-2.5" />
                      Lounge
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onFocusPair(latestDiscussion.targetId)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-300 transition-colors"
                  title="Arahkan kamera ke lokasi diskusi"
                >
                  <Compass className="w-3 h-3" />
                  <span>Lihat</span>
                </button>
              </div>

              <div className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{latestDiscussion.topic}</span>
              </div>

              {/* Multi-turn dialogue transcript */}
              <div className="space-y-1.5 max-h-[165px] overflow-y-auto pr-1">
                {latestDiscussion.turns.map((turn, idx) => {
                  const speaker = INITIAL_AGENTS_ROSTER[turn.speakerId];
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] leading-snug"
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className="font-bold text-[10px]"
                          style={{ color: speaker?.color || '#cbd5e1' }}
                        >
                          {speaker?.name || turn.speakerName}
                        </span>
                        {turn.skillUsed && (
                          <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {turn.skillUsed}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 text-[11px]">{turn.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

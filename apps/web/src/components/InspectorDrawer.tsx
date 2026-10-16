'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Code2,
  MessageSquare,
  Sparkles,
  Send,
  Zap,
  CheckCircle2,
  Clock,
  Compass,
  Smartphone,
  Terminal,
  Users,
  FileCode2,
} from 'lucide-react';
import {
  AGENT_SKILLS_REGISTRY,
  AgentProfile,
  AgentRole,
  AgentSkillSpec,
  AgentState,
  INITIAL_AGENTS_ROSTER,
} from '@nexusdev/shared';
import { OfficeScene } from '../phaser/scenes/OfficeScene';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface ChatMessageItem {
  sender: string;
  text: string;
  time: string;
}

function getInitialGreeting(agent: AgentProfile): ChatMessageItem {
  const skillsList = agent.skills.slice(0, 3).join(', ');
  if (agent.id === 'AGT-PA') {
    return {
      sender: agent.name,
      text: `Halo CEO! Saya Anggi, Personal Assistant Anda (aktif dengan skill ${skillsList}). Jadwal harian, agenda rapat lintas divisi, dan berkas briefing eksekutif sudah saya siapkan. Apa jadwal atau kebutuhan yang ingin Anda atur sekarang?`,
      time: 'Baru saja',
    };
  }
  return {
    sender: agent.name,
    text: `Halo CEO! Saya ${agent.name} (${agent.title}). Saya telah dibekali modul skill ${skillsList} untuk mengeksekusi "${agent.currentTask || 'tugas sprint aktif'}". Klik salah satu badge /skill saya atau ketik instruksi di bawah!`,
    time: 'Baru saja',
  };
}

function generateRoleFallbackReply(agent: AgentProfile, prompt: string): string {
  const primarySkill = agent.skills[0] || '/code-review-and-quality';
  switch (agent.id as AgentRole) {
    case 'AGT-PA':
      return `Siap, CEO! Menggunakan protokol ${primarySkill} terkait permintaan Anda: "${prompt}"\n• Jadwal & kalender eksekutif Anda telah saya perbarui.\n• Undangan koordinasi dan dokumen briefing terkait sudah saya distribusikan ke kepala divisi.\n• Saya akan mengingatkan Anda 15 menit sebelum agenda dimulai.`;
    case 'AGT-CTO':
      return `Siap CEO. Berdasarkan standar ${primarySkill} terkait "${prompt}", saya akan mengevaluasi dampaknya terhadap arsitektur sistem, kontrak OpenAPI, dan keamanan TLS/Database sebelum memberikan sign-off teknis.`;
    case 'AGT-PM':
      return `Dicatat CEO! Menggunakan ${primarySkill}, permintaan "${prompt}" sudah saya pecah ke dalam Sprint Backlog dengan acceptance criteria terukur dan saya sinkronkan ke papan Kanban.`;
    case 'AGT-UIUX':
      return `Siap CEO! Mengacu pada ${primarySkill} untuk "${prompt}", saya sedang menyiapkan komponen design system, kontras WCAG AA, dan wireframe bebas AI-slop di Figma & Tailwind.`;
    case 'AGT-FE':
      return `Siap CEO! Dengan pedoman ${primarySkill}, saya akan mengimplementasikan "${prompt}" pada komponen Next.js App Router dengan optimasi Core Web Vitals dan state yang bersih.`;
    case 'AGT-BE':
      return `Siap CEO! Sesuai kontrak ${primarySkill}, endpoint API, validasi skema Zod, dan query database untuk "${prompt}" segera saya bangun dan uji.`;
    case 'AGT-MOB':
      return `Siap CEO! Mengikuti aturan ${primarySkill}, fitur "${prompt}" segera saya integrasikan ke modul React Native Expo & Flutter dengan tap-target >= 44px di iOS dan Android.`;
    case 'AGT-QA':
      return `Siap CEO! Menerapkan ${primarySkill}, saya akan menyusun skenario automated test Playwright & Jest untuk memverifikasi "${prompt}" bebas dari bug regresi.`;
    case 'AGT-OPS':
      return `Siap CEO! Menjalankan ${primarySkill}, konfigurasi container Docker, pipeline CI/CD, dan monitoring untuk "${prompt}" segera saya terapkan di server.`;
    default:
      return `Siap CEO! Instruksi "${prompt}" telah saya catat dan segera saya eksekusi.`;
  }
}

const DEFAULT_PEER_BY_ROLE: Record<AgentRole, AgentRole> = {
  'USR-CEO': 'AGT-PA',
  'AGT-CTO': 'AGT-BE',
  'AGT-PM': 'AGT-PA',
  'AGT-PA': 'AGT-PM',
  'AGT-UIUX': 'AGT-FE',
  'AGT-FE': 'AGT-UIUX',
  'AGT-BE': 'AGT-OPS',
  'AGT-MOB': 'AGT-BE',
  'AGT-QA': 'AGT-FE',
  'AGT-OPS': 'AGT-BE',
};

interface InspectorDrawerProps {
  agent: AgentProfile | null;
  onClose: () => void;
  onJumpToDesk: (agentId: string) => void;
  onOpenMobileSimulator?: () => void;
  onTriggerSkillDiscussion?: (
    initiatorId: AgentRole,
    targetId: AgentRole,
    topic: string,
    skillCommand: string
  ) => void;
}

export default function InspectorDrawer({
  agent,
  onClose,
  onJumpToDesk,
  onOpenMobileSimulator,
  onTriggerSkillDiscussion,
}: InspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'code' | 'chat'>('profile');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messagesByAgent, setMessagesByAgent] = useState<Record<string, ChatMessageItem[]>>({});
  const [selectedSkill, setSelectedSkill] = useState<AgentSkillSpec | null>(null);
  const [skillMarkdownExcerpt, setSkillMarkdownExcerpt] = useState<string | null>(null);
  const [targetColleague, setTargetColleague] = useState<AgentRole>('AGT-BE');
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Ensure current agent has an initialized message thread and default selected skill
  useEffect(() => {
    if (!agent) return;
    setMessagesByAgent((prev) => {
      if (prev[agent.id]) return prev;
      return {
        ...prev,
        [agent.id]: [getInitialGreeting(agent)],
      };
    });

    const roleSkills = AGENT_SKILLS_REGISTRY[agent.id] || [];
    setSelectedSkill(roleSkills[0] || null);
    setSkillMarkdownExcerpt(null);
    setTargetColleague(DEFAULT_PEER_BY_ROLE[agent.id] || 'AGT-CTO');
  }, [agent]);

  // Fetch real SKILL.md excerpt from backend when user inspects a skill badge
  useEffect(() => {
    if (!selectedSkill) return;
    let cancelled = false;
    setSkillMarkdownExcerpt(null);

    fetch(`${SERVER_URL}/api/skills/${selectedSkill.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || !data.rawMarkdown) return;
        const cleaned = String(data.rawMarkdown)
          .replace(/^---[\s\S]*?---\s*/, '')
          .trim()
          .slice(0, 520);
        if (cleaned) {
          setSkillMarkdownExcerpt(cleaned);
        }
      })
      .catch(() => {
        // Fallback uses selectedSkill.keyRules
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSkill]);

  // Auto-focus chat input when switching to 'chat' tab
  useEffect(() => {
    if (activeTab === 'chat') {
      const timer = setTimeout(() => {
        chatInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeTab, agent?.id]);

  if (!agent) return null;

  const currentMessages = messagesByAgent[agent.id] || [getInitialGreeting(agent)];
  const roleSkillSpecs = AGENT_SKILLS_REGISTRY[agent.id] || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    const inputCopy = chatInput.trim();
    const userMsg: ChatMessageItem = {
      sender: 'You (CEO)',
      text: inputCopy,
      time: 'Sekarang',
    };

    setMessagesByAgent((prev) => ({
      ...prev,
      [agent.id]: [...(prev[agent.id] || [getInitialGreeting(agent)]), userMsg],
    }));
    setChatInput('');
    setIsSending(true);

    let replyText = '';
    try {
      const res = await fetch(`${SERVER_URL}/api/agents/${agent.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputCopy,
          skillCommand: selectedSkill?.slashCommand,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply;
      } else {
        replyText = generateRoleFallbackReply(agent, inputCopy);
      }
    } catch {
      replyText = generateRoleFallbackReply(agent, inputCopy);
    }

    setMessagesByAgent((prev) => ({
      ...prev,
      [agent.id]: [
        ...(prev[agent.id] || []),
        {
          sender: agent.name,
          text: replyText,
          time: 'Baru saja',
        },
      ],
    }));
    setIsSending(false);

    // Show speech bubble on 2D canvas if scene is active
    if (typeof window !== 'undefined') {
      const scene = (window as unknown as { __NEXUS_SCENE__?: OfficeScene }).__NEXUS_SCENE__;
      if (scene && typeof scene.showSpeechBubble === 'function') {
        scene.showSpeechBubble(agent.id, replyText.slice(0, 90), 4000);
      }
    }
  };

  const handleUseSkillInChat = (skill: AgentSkillSpec) => {
    setSelectedSkill(skill);
    setActiveTab('chat');
    setChatInput(
      `Gunakan skill ${skill.slashCommand} untuk meninjau & mengoptimalkan: ${
        agent.currentTask || 'modul sprint aktif'
      }`
    );
  };

  const handleWalkAndDiscussSkill = (skill: AgentSkillSpec) => {
    if (!onTriggerSkillDiscussion) return;
    const topic = `Implementasi ${skill.slashCommand} (${skill.name})`;
    onTriggerSkillDiscussion(agent.id, targetColleague, topic, skill.slashCommand);
  };

  const getStatusColor = (state: AgentState) => {
    switch (state) {
      case 'CODING':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'TESTING':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'REVIEWING':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'THINKING':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'WAITING_APPROVAL':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-30 w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/60 shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg"
            style={{
              backgroundColor: agent.color,
              boxShadow: `0 8px 24px ${agent.color}44`,
            }}
          >
            {agent.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                {agent.name}
              </h2>
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusColor(
                  agent.state
                )}`}
              >
                {agent.state}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{agent.title}</p>
            <p className="text-[11px] text-slate-500">{agent.department}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 bg-slate-950/20 px-5 pt-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Profil & Agent Skills ({roleSkillSpecs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'code'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Live Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'chat'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Diskusi 1-on-1</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeTab === 'profile' && (
          <>
            {/* Current Focus Card */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Aktivitas Utama Saat Ini</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/40">
                {agent.currentTask || 'Standby for instructions'}
              </p>
            </div>

            {/* Bio */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Deskripsi Tanggung Jawab
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {agent.bio}
              </p>
            </div>

            {/* Interactive Local Agent Skills Set */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Agent Skills Terpasang (Klik untuk Inspeksi)</span>
                </h3>
                <span className="text-[10px] font-mono text-indigo-400">
                  SKILL.md Aktif
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {roleSkillSpecs.length > 0
                  ? roleSkillSpecs.map((spec) => {
                      const isSelected = selectedSkill?.id === spec.id;
                      return (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => setSelectedSkill(spec)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500 shadow-md shadow-indigo-500/10'
                              : 'bg-slate-800/90 text-slate-300 border-slate-700/70 hover:border-slate-500 hover:text-white'
                          }`}
                        >
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>{spec.slashCommand}</span>
                        </button>
                      );
                    })
                  : agent.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
              </div>

              {/* Selected Skill Inspector Card */}
              {selectedSkill && (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 space-y-3 shadow-inner">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {selectedSkill.slashCommand}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                          {selectedSkill.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {selectedSkill.description}
                      </p>
                    </div>
                  </div>

                  {/* File Path Reference */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{selectedSkill.skillPath}</span>
                  </div>

                  {/* Key Rules from SKILL.md */}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Protokol & Aturan Utama Skill:
                    </div>
                    <ul className="space-y-1">
                      {selectedSkill.keyRules.map((rule, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-1.5 text-[11px] text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {skillMarkdownExcerpt && (
                    <details className="text-[10px] text-slate-400 bg-slate-900/70 rounded-lg p-2 border border-slate-800">
                      <summary className="cursor-pointer font-semibold text-indigo-300">
                        Lihat Kutipan Langsung SKILL.md
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] text-slate-300 max-h-32 overflow-y-auto">
                        {skillMarkdownExcerpt}...
                      </pre>
                    </details>
                  )}

                  {/* Skill Actions: 1-on-1 Chat OR Walk to Colleague's Desk */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleUseSkillInChat(selectedSkill)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Gunakan {selectedSkill.slashCommand} di Chat 1-on-1</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={targetColleague}
                        onChange={(e) => setTargetColleague(e.target.value as AgentRole)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        {(
                          [
                            'AGT-CTO',
                            'AGT-PM',
                            'AGT-PA',
                            'AGT-UIUX',
                            'AGT-FE',
                            'AGT-BE',
                            'AGT-MOB',
                            'AGT-QA',
                            'AGT-OPS',
                          ] as AgentRole[]
                        )
                          .filter((r) => r !== agent.id)
                          .map((r) => (
                            <option key={r} value={r}>
                              Ke Meja {INITIAL_AGENTS_ROSTER[r].name}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleWalkAndDiscussSkill(selectedSkill)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Jalan & Diskusikan Skill</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {agent.id === 'AGT-MOB' && onOpenMobileSimulator && (
              <div className="pt-2">
                <button
                  onClick={onOpenMobileSimulator}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Buka Simulator Mobile (iOS & Android)</span>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Editor Buffer Terkini</span>
              <span className="font-mono text-[10px] text-emerald-400">
                ● Live Sync
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
              <code>{agent.activeSnippet || '// Menunggu eksekusi kode...'}</code>
            </pre>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-3">
            {/* Active Skill Indicator Pill inside Chat */}
            {selectedSkill && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-[11px]">
                <span className="text-slate-300">
                  Mode Skill Aktif:{' '}
                  <strong className="font-mono text-emerald-400">
                    {selectedSkill.slashCommand}
                  </strong>
                </span>
                <span className="text-[10px] text-indigo-300">SKILL.md Context</span>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[340px] pr-1">
              {currentMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'You (CEO)'
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 ml-6'
                      : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold opacity-75 mb-1">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isSending && (
                <div className="p-3 rounded-xl text-xs bg-slate-800/40 border border-slate-700/40 text-slate-400 mr-6 animate-pulse">
                  {agent.name} sedang menerapkan {selectedSkill?.slashCommand || 'skill'}...
                </div>
              )}
            </div>

            {/* Quick Skill & Prompt Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {roleSkillSpecs.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    setSelectedSkill(spec);
                    setChatInput(
                      `Terapkan ${spec.slashCommand} untuk tugas: ${
                        agent.currentTask || 'sprint saat ini'
                      }`
                    );
                    chatInputRef.current?.focus();
                  }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-colors"
                >
                  ⚡ {spec.slashCommand}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-1 flex gap-2">
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                placeholder={`Ketik instruksi atau /skill untuk ${agent.name}...`}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSending}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl px-3 py-2 text-xs font-semibold flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <button
          onClick={() => onJumpToDesk(agent.id)}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Fokus Kamera ke Meja</span>
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
        >
          Tutup Panel
        </button>
      </div>
    </aside>
  );
}

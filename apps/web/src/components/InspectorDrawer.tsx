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
} from 'lucide-react';
import { AgentProfile, AgentRole, AgentState } from '@nexusdev/shared';
import { OfficeScene } from '../phaser/scenes/OfficeScene';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface ChatMessageItem {
  sender: string;
  text: string;
  time: string;
}

function getInitialGreeting(agent: AgentProfile): ChatMessageItem {
  if (agent.id === 'AGT-PA') {
    return {
      sender: agent.name,
      text: 'Halo CEO! Saya Anggi, Personal Assistant Anda. Jadwal harian, agenda rapat lintas divisi, dan berkas briefing eksekutif sudah saya siapkan. Apa jadwal atau kebutuhan yang ingin Anda atur sekarang?',
      time: 'Baru saja',
    };
  }
  return {
    sender: agent.name,
    text: `Halo CEO! Saya ${agent.name} (${agent.title}). Saat ini saya sedang fokus pada: "${agent.currentTask || 'tugas sprint aktif'}". Ada instruksi khusus untuk saya?`,
    time: 'Baru saja',
  };
}

function generateRoleFallbackReply(agent: AgentProfile, prompt: string): string {
  switch (agent.id as AgentRole) {
    case 'AGT-PA':
      return `Siap, CEO! Terkait permintaan Anda: "${prompt}"\n• Jadwal & kalender eksekutif Anda telah saya perbarui.\n• Undangan koordinasi dan dokumen briefing terkait sudah saya distribusikan ke kepala divisi.\n• Saya akan mengingatkan Anda 15 menit sebelum agenda dimulai. Ada kebutuhan lain yang perlu saya siapkan?`;
    case 'AGT-CTO':
      return `Siap CEO. Terkait "${prompt}", saya akan mengevaluasi dampaknya terhadap arsitektur sistem, kontrak OpenAPI, dan keamanan TLS/Database sebelum memberikan sign-off teknis.`;
    case 'AGT-PM':
      return `Dicatat CEO! Permintaan "${prompt}" sudah saya pecah ke dalam Sprint Backlog dan saya sinkronkan dengan papan Kanban tim.`;
    case 'AGT-UIUX':
      return `Siap CEO! Untuk "${prompt}", saya sedang menyiapkan komponen design system, palet warna, dan wireframe responsifnya di Figma & Tailwind.`;
    case 'AGT-FE':
      return `Siap CEO! Saya akan mengimplementasikan "${prompt}" pada komponen Next.js App Router dengan optimasi rendering dan state yang bersih.`;
    case 'AGT-BE':
      return `Siap CEO! Endpoint API, validasi skema, dan query database untuk "${prompt}" segera saya bangun dan uji.`;
    case 'AGT-MOB':
      return `Siap CEO! Fitur "${prompt}" segera saya integrasikan ke modul React Native Expo & Flutter agar berjalan mulus di iOS dan Android.`;
    case 'AGT-QA':
      return `Siap CEO! Saya akan menyusun skenario automated test Playwright & Jest untuk memverifikasi "${prompt}" bebas dari bug regresi.`;
    case 'AGT-OPS':
      return `Siap CEO! Konfigurasi container Docker, pipeline CI/CD, dan monitoring untuk "${prompt}" segera saya terapkan di server.`;
    default:
      return `Siap CEO! Instruksi "${prompt}" telah saya catat dan segera saya eksekusi.`;
  }
}

interface InspectorDrawerProps {
  agent: AgentProfile | null;
  onClose: () => void;
  onJumpToDesk: (agentId: string) => void;
  onOpenMobileSimulator?: () => void;
}

export default function InspectorDrawer({
  agent,
  onClose,
  onJumpToDesk,
  onOpenMobileSimulator,
}: InspectorDrawerProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'code' | 'chat'>('profile');
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messagesByAgent, setMessagesByAgent] = useState<Record<string, ChatMessageItem[]>>({});
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Ensure current agent has an initialized message thread
  useEffect(() => {
    if (!agent) return;
    setMessagesByAgent((prev) => {
      if (prev[agent.id]) return prev;
      return {
        ...prev,
        [agent.id]: [getInitialGreeting(agent)],
      };
    });
  }, [agent]);

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
        body: JSON.stringify({ message: inputCopy }),
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
    <aside className="fixed inset-y-0 right-0 z-30 w-full sm:w-[460px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/60 shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-300">
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
          <span>Profil & Skill</span>
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Deskripsi Tanggung Jawab
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {agent.bio}
              </p>
            </div>

            {/* AI Skills Set */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Modul Skill AI Terpasang</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
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
                  {agent.name} sedang menyiapkan balasan...
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(agent.id === 'AGT-PA'
                ? [
                    'Atur jadwal rapat hari ini',
                    'Siapkan briefing eksekutif',
                    'Saring prioritas mendesak CEO',
                  ]
                : [
                    'Laporkan progres modul saat ini',
                    'Prioritaskan tugas sprint utama',
                  ]
              ).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setChatInput(preset);
                    chatInputRef.current?.focus();
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  + {preset}
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
                placeholder={`Ketik pesan untuk ${agent.name} (bebas pakai huruf W, A, S, D)...`}
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

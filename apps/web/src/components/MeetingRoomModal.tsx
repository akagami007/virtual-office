'use client';

import React, { useState } from 'react';
import {
  X,
  Video,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  Users,
} from 'lucide-react';
import {
  AgentRole,
  ApprovalGate,
  ChatMessage,
  INITIAL_AGENTS_ROSTER,
} from '@nexusdev/shared';

interface MeetingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConcludeMeeting: () => void;
}

const DEFAULT_TRANSCRIPT: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'AGT-PM',
    senderName: 'Aria',
    senderRole: 'AGT-PM',
    avatarColor: '#ec4899',
    message:
      'Selamat datang di Ruang Rapat Utama, CEO dan seluruh tim pimpinan! Hari ini kita mengonfirmasi arsitektur NexusDev Studio dan kesiapan rilis Sprint 1.',
    timestamp: '14:02',
  },
  {
    id: 'm2',
    senderId: 'AGT-CTO',
    senderName: 'Viktor',
    senderRole: 'AGT-CTO',
    avatarColor: '#8b5cf6',
    message:
      'Saya telah memvalidasi skema monorepo: Next.js 15 + Phaser 3 di frontend, NestJS WebSocket di backend, dan Prisma ORM dengan isolasi kontainer Docker. Seluruh batasan keamanan dan circuit breaker telah lolos standar.',
    timestamp: '14:03',
  },
  {
    id: 'm3',
    senderId: 'AGT-BE',
    senderName: 'Bima',
    senderRole: 'AGT-BE',
    avatarColor: '#06b6d4',
    message:
      'Kontrak OpenAPI untuk sinkronisasi posisi 2D dan orkestrasi tugas telah dipublikasikan. Endpoint siap dikonsumsi Nadia (FE) dan Raka (Mobile).',
    timestamp: '14:04',
  },
  {
    id: 'm4',
    senderId: 'AGT-QA',
    senderName: 'Sinta',
    senderRole: 'AGT-QA',
    avatarColor: '#ef4444',
    message:
      'Pemeriksaan awal Playwright E2E dan type-checking TypeScript di seluruh workspace bersih tanpa warning.',
    timestamp: '14:05',
  },
];

const SAMPLE_APPROVAL: ApprovalGate = {
  id: 'gate-arch-01',
  projectId: 'proj-1',
  type: 'ARCHITECTURE',
  title: 'Persetujuan Desain Fondasi Monorepo & Engine 2D',
  description:
    'Viktor (CTO) mengajukan persetujuan final untuk adopsi arsitektur 100% Full-Stack TypeScript dengan Next.js 15, Phaser 3, dan Docker sandbox isolation.',
  requestedBy: 'AGT-CTO',
  status: 'PENDING',
  diffPayload: {
    filename: 'docs/SYSTEM_ARCHITECTURE_SPEC.md',
    details:
      '+ Framework: Next.js 15 + Phaser 3 WebGL\n+ Language: 100% Full-Stack TypeScript\n+ Engine: LangGraph.js / State-Machine Event Orchestrator\n+ Sandboxing: Ephemeral Docker Container Volume Mounts\n+ Anti-Loop Circuit Breaker: Max 3 Retries per Task',
  },
  createdAt: '2026-10-14T14:00:00Z',
};

export default function MeetingRoomModal({
  isOpen,
  onClose,
  onConcludeMeeting,
}: MeetingRoomModalProps) {
  const [transcript, setTranscript] = useState<ChatMessage[]>(DEFAULT_TRANSCRIPT);
  const [approval, setApproval] = useState<ApprovalGate>(SAMPLE_APPROVAL);
  const [inputMsg, setInputMsg] = useState('');
  const [isDecisionMade, setIsDecisionMade] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'USR-CEO',
      senderName: 'You (CEO)',
      senderRole: 'USR-CEO',
      avatarColor: '#3b82f6',
      message: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, userMessage]);
    const inputCopy = inputMsg;
    setInputMsg('');

    // Simulated quick response from PM or CTO
    setTimeout(() => {
      const pmResponse: ChatMessage = {
        id: `m-bot-${Date.now()}`,
        senderId: 'AGT-PM',
        senderName: 'Aria (PM)',
        senderRole: 'AGT-PM',
        avatarColor: '#ec4899',
        message: `Catatan diterima dari CEO: "${inputCopy}". Seluruh tim agen akan menyesuaikan backlog kerja sesuai arahan ini.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTranscript((prev) => [...prev, pmResponse]);
    }, 800);
  };

  const handleDecision = (decision: 'APPROVE' | 'REJECT') => {
    setApproval((prev) => ({
      ...prev,
      status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      resolvedAt: new Date().toISOString(),
    }));
    setIsDecisionMade(true);

    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: 'SYSTEM',
      senderName: 'Sistem Persetujuan (HITL)',
      senderRole: 'USR-CEO',
      avatarColor: decision === 'APPROVE' ? '#10b981' : '#ef4444',
      message:
        decision === 'APPROVE'
          ? 'CEO TELAH MENYETUJUI ARSITEKTUR SISTEM. Seluruh tim diizinkan melangkah ke eksekusi implementasi Tahap 1!'
          : 'CEO MEMINTA REVISI ARSITEKTUR. Tim arsitektur dan manajemen diminta meninjau ulang catatan.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };

    setTranscript((prev) => [...prev, systemMsg]);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Ruang Rapat Utama (Boardroom)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Sesi Aktif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Konferensi Kolaborasi 8 Karakter Agen AI & Persetujuan CEO (HITL)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onConcludeMeeting();
                onClose();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              Bubarkan Rapat
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-950/20">
          {/* Left Column: Meeting Discussion Transcript (7 cols) */}
          <div className="md:col-span-7 flex flex-col border-r border-slate-800/80 overflow-hidden">
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 text-xs font-bold text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Transkrip Diskusi Meja Rapat</span>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.isSystem ? 'bg-indigo-950/40 border border-indigo-800/50 p-3 rounded-xl' : ''
                  }`}
                >
                  {!msg.isSystem && (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md"
                      style={{ backgroundColor: msg.avatarColor }}
                    >
                      {msg.senderName.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-200">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-300 font-normal">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/50 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Berikan arahan atau instruksi langsung kepada tim rapat..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>

          {/* Right Column: HITL Approval Gate (5 cols) */}
          <div className="md:col-span-5 flex flex-col p-5 overflow-y-auto bg-slate-900/40 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-xs font-bold text-white">
                  Gerbang Persetujuan Manusia (HITL)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Keputusan Kritis Memerlukan Tanda Tangan CEO
                </p>
              </div>
            </div>

            {/* Approval Gate Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-700/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {approval.type}
                </span>
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                    approval.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : approval.status === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {approval.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100 leading-snug">
                {approval.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {approval.description}
              </p>

              {/* Diff Preview */}
              {approval.diffPayload && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500">
                    Payload Perubahan:
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                    <code>{approval.diffPayload.details}</code>
                  </pre>
                </div>
              )}

              {/* Approval Actions */}
              {approval.status === 'PENDING' && (
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleDecision('APPROVE')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui (Approve)</span>
                  </button>

                  <button
                    onClick={() => handleDecision('REJECT')}
                    className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 border border-slate-700 py-2 px-3 rounded-xl text-xs transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Minta Revisi</span>
                  </button>
                </div>
              )}

              {approval.status !== 'PENDING' && (
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-center text-xs font-semibold text-slate-300">
                  Status: Keputusan tercatat pada {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Attendees Roster Mini-list */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Peserta Meja Rapat (8 Agen)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(INITIAL_AGENTS_ROSTER).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    <span className="font-semibold text-slate-300 truncate">
                      {a.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-auto">
                      {a.id.replace('AGT-', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

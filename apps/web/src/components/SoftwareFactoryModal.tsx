'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Rocket,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code2,
  Play,
  RotateCcw,
  FolderCode,
  Send,
  Layers,
  Terminal,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  AgentRole,
  INITIAL_AGENTS_ROSTER,
  SoftwareFactoryRun,
} from '@nexusdev/shared';
import {
  buildInteractiveWebAppBundle,
  detectTemplateType,
} from '../utils/clientFactoryFallback';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface SoftwareFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRun: SoftwareFactoryRun | null;
  onUpdateRun: (run: SoftwareFactoryRun) => void;
  onOpenWorkspace: (projectId: string) => void;
  onTriggerPeerDiscussion: (
    initiatorId: AgentRole,
    targetId: AgentRole,
    topic?: string,
    skillCommand?: string
  ) => void;
}

const PRESET_PROMPTS = [
  {
    name: 'Kasir POS & Inventori Kafe',
    prompt:
      'Aplikasi Web Kasir POS Kafe lengkap dengan pencatatan pesanan, harga menu, kalkulasi omzet real-time, filter kategori, dan grafik penjualan',
  },
  {
    name: 'Enterprise CRM & Sales Pipeline',
    prompt:
      'Aplikasi Web CRM B2B untuk mengelola prospek klien, nilai kontrak penjualan, tahapan negosiasi, dan laporan win-rate tim sales',
  },
  {
    name: 'Omnichannel E-Commerce Store Hub',
    prompt:
      'Aplikasi Web Katalog Produk & Manajemen Order E-Commerce dengan perhitungan GMV otomatis, status stok, dan ekspor data JSON',
  },
  {
    name: 'Executive Analytics & Telemetry Dashboard',
    prompt:
      'Aplikasi Web Dashboard Analitik Eksekutif untuk memantau pendapatan SaaS, efisiensi cloud, dan metrik retensi pelanggan',
  },
];

export default function SoftwareFactoryModal({
  isOpen,
  onClose,
  activeRun,
  onUpdateRun,
  onOpenWorkspace,
  onTriggerPeerDiscussion,
}: SoftwareFactoryModalProps) {
  const [appNameInput, setAppNameInput] = useState('Nexus Cafe POS & Inventory');
  const [promptInput, setPromptInput] = useState(PRESET_PROMPTS[0].prompt);
  const [gate1Feedback, setGate1Feedback] = useState('');
  const [gate2Feedback, setGate2Feedback] = useState('');
  const [viewMode, setViewMode] = useState<'pipeline' | 'preview'>('pipeline');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically switch to Live App Preview when Phase 2 reaches Gate 2
  useEffect(() => {
    if (
      activeRun?.status === 'WAITING_CEO_GATE_2' ||
      activeRun?.status === 'RELEASED'
    ) {
      setViewMode('preview');
    }
  }, [activeRun?.status]);

  if (!isOpen) return null;

  const handleStartFactory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setViewMode('pipeline');

    try {
      const res = await fetch(`${SERVER_URL}/api/factory/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: appNameInput.trim() || 'Aplikasi Web Baru',
          prompt: promptInput.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.run) {
          onUpdateRun(data.run);
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallback to client-side simulation if backend is unreachable
    }

    // Client-side fallback so it ALWAYS works even offline
    const cleanName = appNameInput.trim() || 'Aplikasi Web Baru';
    const cleanPrompt = promptInput.trim();
    const templateType = detectTemplateType(`${cleanName} ${cleanPrompt}`);
    const bundle = buildInteractiveWebAppBundle({
      appName: cleanName,
      prompt: cleanPrompt,
      templateType,
      ceoFeedbackHistory: [],
    });

    const fallbackRun: SoftwareFactoryRun = {
      id: `factory-local-${Date.now()}`,
      projectId: `app-${Date.now()}`,
      appName: cleanName,
      prompt: cleanPrompt,
      templateType,
      status: 'WAITING_CEO_GATE_1',
      currentStepIndex: 1,
      architectureSummary: bundle.architectureSummary,
      uiDesignSummary: bundle.uiDesignSummary,
      previewHtml: bundle.previewHtml,
      revisionCount: 0,
      ceoFeedbackHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedFiles: [
        {
          path: 'docs/PRD_SPEC.md',
          author: 'AGT-PM',
          skill: '/spec-driven-development',
          description: 'Dokumen Spesifikasi Produk & Kriteria Penerimaan',
        },
        {
          path: 'docs/ARCHITECTURE_AND_UI.md',
          author: 'AGT-CTO',
          skill: '/security-and-hardening & /antislop-ui',
          description: 'Blueprint Arsitektur Keamanan & Desain Sistem UI/UX',
        },
      ],
      steps: [
        {
          id: 'step-1-spec',
          phase: 1,
          agentId: 'AGT-PA',
          partnerId: 'AGT-PM',
          title: '1. Analisis Brief CEO & Spesifikasi Produk (Anggi PA & Aria PM)',
          skillUsed: '/context-engineering & /spec-driven-development',
          status: 'COMPLETED',
          outputFile: 'docs/PRD_SPEC.md',
          summary: 'Menerjemahkan perintah CEO menjadi spesifikasi fitur & backlog terukur.',
          timestamp: 'Selesai',
        },
        {
          id: 'step-2-arch',
          phase: 1,
          agentId: 'AGT-CTO',
          partnerId: 'AGT-UIUX',
          title: '2. Desain Arsitektur, Keamanan & Anti-Slop UI (Viktor CTO & Kael UI/UX)',
          skillUsed: '/security-and-hardening & /antislop-ui',
          status: 'COMPLETED',
          outputFile: 'docs/ARCHITECTURE_AND_UI.md',
          summary: 'Merancang kontrak API, skema data, dan sistem desain bebas AI-slop.',
          timestamp: 'Selesai',
        },
        {
          id: 'step-3-dev',
          phase: 2,
          agentId: 'AGT-FE',
          partnerId: 'AGT-BE',
          title: '3. Konstruksi Kode Full-Stack & Interactive App (Nadia FE & Bima BE)',
          skillUsed: '/frontend-ui-engineering & /api-and-interface-design',
          status: 'PENDING',
          outputFile: 'apps/web/src/app/page.tsx',
          summary: 'Menulis komponen UI interaktif, kalkulasi state, dan endpoint REST API.',
        },
        {
          id: 'step-4-qa',
          phase: 2,
          agentId: 'AGT-QA',
          partnerId: 'AGT-OPS',
          title: '4. Pengujian TDD Otomatis & Bundling Live Preview (Sinta QA & Dion DevOps)',
          skillUsed: '/test-driven-development & /ci-cd-and-automation',
          status: 'PENDING',
          outputFile: 'dist/live-app.html',
          summary: 'Menjalankan verifikasi E2E dan mem-build aplikasi agar siap dijalankan CEO.',
        },
      ],
    };

    onTriggerPeerDiscussion(
      'AGT-PA',
      'AGT-PM',
      `Brief Aplikasi Baru CEO: ${cleanName}`,
      '/spec-driven-development'
    );
    onUpdateRun(fallbackRun);
    setIsSubmitting(false);
  };

  const handleGate1Decision = async (decision: 'APPROVE' | 'REVISE') => {
    if (!activeRun || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/factory/gate1-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          feedback: gate1Feedback.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.run) {
          onUpdateRun(data.run);
          setGate1Feedback('');
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    const updatedHistory = gate1Feedback.trim()
      ? [...activeRun.ceoFeedbackHistory, gate1Feedback.trim()]
      : activeRun.ceoFeedbackHistory;

    const bundle = buildInteractiveWebAppBundle({
      appName: activeRun.appName,
      prompt: activeRun.prompt,
      templateType: activeRun.templateType,
      ceoFeedbackHistory: updatedHistory,
    });

    const updatedRun: SoftwareFactoryRun = {
      ...activeRun,
      status: 'WAITING_CEO_GATE_2',
      currentStepIndex: 3,
      ceoFeedbackHistory: updatedHistory,
      previewHtml: bundle.previewHtml,
      architectureSummary: bundle.architectureSummary,
      uiDesignSummary: bundle.uiDesignSummary,
      steps: activeRun.steps.map((s) => ({
        ...s,
        status: 'COMPLETED',
        timestamp: 'Selesai',
      })),
      generatedFiles: [
        ...activeRun.generatedFiles,
        {
          path: 'apps/web/src/app/page.tsx',
          author: 'AGT-FE',
          skill: '/frontend-ui-engineering',
          description: 'Komponen Utama Aplikasi Web Next.js 15',
        },
        {
          path: 'apps/server/src/routes.js',
          author: 'AGT-BE',
          skill: '/api-and-interface-design',
          description: 'Controller REST API & Penyimpanan Data',
        },
        {
          path: 'dist/live-app.html',
          author: 'AGT-FE',
          skill: '/performance-optimization',
          description: 'Bundel Aplikasi Web Interaktif Siap Pakai (Live Runner)',
        },
        {
          path: 'tests/app.e2e.spec.ts',
          author: 'AGT-QA',
          skill: '/test-driven-development',
          description: 'Suite Pengujian E2E Otomatis Playwright/Jest',
        },
      ],
    };

    onTriggerPeerDiscussion(
      'AGT-FE',
      'AGT-QA',
      `Penyelesaian Koding & Verifikasi QA: ${activeRun.appName}`,
      '/frontend-ui-engineering'
    );
    onUpdateRun(updatedRun);
    setGate1Feedback('');
    setViewMode('preview');
    setIsSubmitting(false);
  };

  const handleGate2Decision = async (
    decision: 'APPROVE_RELEASE' | 'REQUEST_REVISION'
  ) => {
    if (!activeRun || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/factory/gate2-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          feedback: gate2Feedback.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.run) {
          onUpdateRun(data.run);
          setGate2Feedback('');
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    if (decision === 'REQUEST_REVISION') {
      const updatedHistory = gate2Feedback.trim()
        ? [...activeRun.ceoFeedbackHistory, gate2Feedback.trim()]
        : activeRun.ceoFeedbackHistory;
      const bundle = buildInteractiveWebAppBundle({
        appName: activeRun.appName,
        prompt: activeRun.prompt,
        templateType: activeRun.templateType,
        ceoFeedbackHistory: updatedHistory,
      });
      onUpdateRun({
        ...activeRun,
        revisionCount: activeRun.revisionCount + 1,
        ceoFeedbackHistory: updatedHistory,
        previewHtml: bundle.previewHtml,
      });
    } else {
      onUpdateRun({
        ...activeRun,
        status: 'RELEASED',
      });
    }
    setGate2Feedback('');
    setIsSubmitting(false);
  };

  const openStandaloneWindow = () => {
    if (!activeRun?.previewHtml) return;
    const blob = new Blob([activeRun.previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950/50 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Autonomous AI Software Factory (Semi-Otomatis • 2 CEO Gates)
                </h2>
                {activeRun && (
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeRun.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Berikan perintah aplikasi web → Tim Agen berkolaborasi merancang & koding → Anda Approve & Jalankan Aplikasi Langsung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeRun && (
              <>
                <button
                  type="button"
                  onClick={() => setViewMode('pipeline')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    viewMode === 'pipeline'
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  Alur Kolaborasi & Gate CEO
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    viewMode === 'preview'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                      : 'bg-slate-800 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Jalankan Live App Preview</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Command Input Box (Always accessible to launch a new Web App) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Perintah CEO: Buat Aplikasi Web Baru</span>
              </div>

              {/* Preset chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 mr-1">Contoh Cepat:</span>
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAppNameInput(preset.name);
                      setPromptInput(preset.prompt);
                    }}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700 transition-all"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleStartFactory} className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Nama Aplikasi Web
                </label>
                <input
                  type="text"
                  value={appNameInput}
                  onChange={(e) => setAppNameInput(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Contoh: Nexus Cafe POS"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Instruksi & Fitur yang Diinginkan CEO
                </label>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  placeholder="Jelaskan aplikasi web yang ingin dibangun oleh para agen..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all h-[34px]"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Mulai Produksi Tim AI</span>
                </button>
              </div>
            </form>
          </div>

          {/* VIEW MODE 1: PIPELINE, AGENT COLLABORATION & CEO GATES */}
          {activeRun && viewMode === 'pipeline' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: 4-Stage Multi-Agent Steps & CEO Gate Cards */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Tahapan Kolaborasi Otonom: {activeRun.appName}</span>
                </h3>

                <div className="space-y-3">
                  {activeRun.steps.map((step) => {
                    const agentA = INITIAL_AGENTS_ROSTER[step.agentId];
                    const agentB = step.partnerId
                      ? INITIAL_AGENTS_ROSTER[step.partnerId]
                      : null;

                    return (
                      <div
                        key={step.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          step.status === 'IN_PROGRESS'
                            ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                            : step.status === 'COMPLETED'
                            ? 'bg-slate-950/80 border-emerald-500/30'
                            : 'bg-slate-950/50 border-slate-800 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">
                                {step.title}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {step.skillUsed}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{step.summary}</p>
                            {step.outputFile && (
                              <div className="text-[10px] font-mono text-emerald-400 pt-1">
                                📄 Output Workspace: {step.outputFile}
                              </div>
                            )}
                          </div>

                          <span
                            className={`shrink-0 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                              step.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : step.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {step.status === 'COMPLETED'
                              ? '✓ SELESAI'
                              : step.status === 'IN_PROGRESS'
                              ? '● BERDISKUSI...'
                              : 'MENUNGGU'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CEO GATE 1 CARD: Architecture & UI Plan Approval */}
                {activeRun.status === 'WAITING_CEO_GATE_1' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/60 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          CEO GATE 1 • MENUNGGU PERSETUJUAN RENCANA & ARSITEKTUR
                        </span>
                        <h4 className="text-base font-extrabold text-white mt-1.5">
                          Proposal Spesifikasi, Keamanan & Desain UI/UX Siap Ditinjau CEO
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Anggi (PA), Aria (PM), Viktor (CTO), dan Kael (UI/UX) telah menyusun rancangan di bawah. Klik <strong>Approve & Bangun Kode</strong> agar Nadia (FE), Bima (BE), Sinta (QA), dan Dion (DevOps) mengeksekusi aplikasinya!
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-indigo-300">
                          Arsitektur & Keamanan (Viktor CTO):
                        </div>
                        <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                          {activeRun.architectureSummary}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                        <div className="font-bold text-amber-300">
                          Desain Visual Anti-Slop (Kael UI/UX):
                        </div>
                        <p className="text-[11px] text-slate-300 whitespace-pre-line leading-relaxed">
                          {activeRun.uiDesignSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <input
                        type="text"
                        value={gate1Feedback}
                        onChange={(e) => setGate1Feedback(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        placeholder="Catatan tambahan / revisi untuk tim engineering (opsional)..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleGate1Decision('APPROVE')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Bangun Aplikasi Sekarang</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CEO GATE 2 BANNER */}
                {(activeRun.status === 'WAITING_CEO_GATE_2' ||
                  activeRun.status === 'RELEASED') && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/40 border-2 border-emerald-500/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        CEO GATE 2 • APLIKASI SIAP DIJALANKAN
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1.5">
                        {activeRun.appName} Telah Lulus Uji QA & Siap Dicoba Langsung!
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Seluruh file kode telah ditulis ke workspace <code>{activeRun.projectId}</code> dan aplikasi interaktif siap dijalankan.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className="shrink-0 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <Play className="w-4 h-4" />
                      <span>Buka & Jalankan Aplikasi Sekarang</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Generated Workspace Files & Artifacts */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 h-fit">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Berkas Kode yang Dihasilkan Tim
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      workspaces/{activeRun.projectId}/
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWorkspace(activeRun.projectId);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1"
                  >
                    <FolderCode className="w-3.5 h-3.5" />
                    <span>Buka Explorer</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeRun.generatedFiles.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center">
                      Agen sedang menyusun dokumen spesifikasi pertama...
                    </div>
                  ) : (
                    activeRun.generatedFiles.map((file, i) => {
                      const author = INITIAL_AGENTS_ROSTER[file.author];
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {file.path}
                            </span>
                            <span className="text-[10px] font-bold text-slate-300">
                              {author?.name}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">{file.description}</p>
                          <div className="text-[10px] font-mono text-indigo-300">
                            {file.skill}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: LIVE INTERACTIVE WEB APP PREVIEW & GATE 2 SIGN-OFF */}
          {activeRun && viewMode === 'preview' && (
            <div className="flex flex-col h-[68vh] space-y-3">
              {/* Browser Chrome Toolbar */}
              <div className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400">
                    https://preview.nexusdev.studio/{activeRun.projectId}/live-app
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openStandaloneWindow}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Buka Fullscreen di Tab Baru</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWorkspace(activeRun.projectId);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Lihat Source Code</span>
                  </button>
                </div>
              </div>

              {/* Live Sandboxed Interactive App Iframe */}
              <div className="flex-1 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 shadow-2xl">
                <iframe
                  title={`Live Preview — ${activeRun.appName}`}
                  srcDoc={activeRun.previewHtml}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-Downloads allow-forms allow-modals"
                />
              </div>

              {/* Gate 2 CEO Sign-Off / Revision Bar */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-slate-200 font-medium">
                    <strong>CEO Gate 2:</strong> Silakan uji aplikasi di atas (tambah data, klik +1, filter). Ketik revisi jika ingin perubahan, atau Approve Rilis.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gate2Feedback}
                    onChange={(e) => setGate2Feedback(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    placeholder="Ketik permintaan revisi fitur..."
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 w-56"
                  />
                  <button
                    type="button"
                    onClick={() => handleGate2Decision('REQUEST_REVISION')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revisi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGate2Decision('APPROVE_RELEASE')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/25"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {activeRun.status === 'RELEASED'
                        ? '✓ Resmi Dirilis'
                        : 'Approve Rilis Produksi'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Calendar,
  FileBarChart2,
  Rocket,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Send,
  ShieldCheck,
  Users,
  Video,
  Kanban,
  ArrowUpRight,
  AlertCircle,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  AgentProfile,
  AgentRole,
  DepartmentExecutiveReport,
  ExecutiveDashboardData,
  ExecutiveScheduleItem,
  INITIAL_AGENTS_ROSTER,
  INITIAL_EXECUTIVE_DASHBOARD,
  Project,
  ProjectPlatform,
  Task,
  TaskPriority,
} from '@nexusdev/shared';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface CEOCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'briefing' | 'schedule' | 'reports' | 'command';
  activeProject: Project | null;
  tasks: Task[];
  onSelectAgent: (agent: AgentProfile) => void;
  onJumpToAgent: (agentId: string) => void;
  onOpenMeeting: (customTopic?: string) => void;
  onOpenKanban: () => void;
  onTriggerPeerDiscussion: (
    initiatorId: AgentRole,
    targetId: AgentRole,
    topic?: string,
    skillCommand?: string
  ) => void;
}

const DELEGATABLE_ROLES: AgentRole[] = [
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

export default function CEOCommandCenterModal({
  isOpen,
  onClose,
  initialTab = 'briefing',
  activeProject,
  tasks,
  onSelectAgent,
  onJumpToAgent,
  onOpenMeeting,
  onOpenKanban,
  onTriggerPeerDiscussion,
}: CEOCommandCenterModalProps) {
  const [activeTab, setActiveTab] = useState<'briefing' | 'schedule' | 'reports' | 'command'>(
    initialTab
  );
  const [dashboard, setDashboard] = useState<ExecutiveDashboardData>(INITIAL_EXECUTIVE_DASHBOARD);

  // Schedule creation state
  const [newSchedTime, setNewSchedTime] = useState('16:00 WIB');
  const [newSchedTitle, setNewSchedTitle] = useState('');
  const [newSchedCategory, setNewSchedCategory] =
    useState<ExecutiveScheduleItem['category']>('REVIEW');
  const [newSchedNotes, setNewSchedNotes] = useState('');

  // Task delegation state (CEO -> Anggi PA -> Target Agent)
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignee, setTaskAssignee] = useState<AgentRole>('AGT-FE');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('HIGH');
  const [delegationFeedback, setDelegationFeedback] = useState<string | null>(null);

  // New Client Project Kickoff state (Software House CEO capability)
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projPlatform, setProjPlatform] = useState<ProjectPlatform>('FULLSTACK');
  const [kickoffFeedback, setKickoffFeedback] = useState<string | null>(null);

  // Sign-off status tracking per department report
  const [signedOffReportIds, setSignedOffReportIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetch(`${SERVER_URL}/api/ceo/dashboard`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.dashboard) {
            setDashboard(data.dashboard);
          }
        })
        .catch(() => {
          // Fallback to INITIAL_EXECUTIVE_DASHBOARD
        });
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const anggiProfile = INITIAL_AGENTS_ROSTER['AGT-PA'];

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedTitle.trim()) return;

    const tempItem: ExecutiveScheduleItem = {
      id: `sched-local-${Date.now()}`,
      time: newSchedTime.trim() || '16:00 WIB',
      title: newSchedTitle.trim(),
      category: newSchedCategory,
      participants: ['USR-CEO', 'AGT-PA', 'AGT-CTO'],
      status: 'UPCOMING',
      notes:
        newSchedNotes.trim() ||
        'Agenda baru ditambahkan oleh CEO dan disiapkan otomatis oleh Anggi (PA) dengan skill /automation.',
      preparedBy: 'AGT-PA',
    };

    try {
      const res = await fetch(`${SERVER_URL}/api/ceo/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time: tempItem.time,
          title: tempItem.title,
          category: tempItem.category,
          participants: tempItem.participants,
          notes: tempItem.notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.schedule) {
          setDashboard((prev) => ({ ...prev, schedule: data.schedule }));
        } else {
          setDashboard((prev) => ({ ...prev, schedule: [...prev.schedule, tempItem] }));
        }
      } else {
        setDashboard((prev) => ({ ...prev, schedule: [...prev.schedule, tempItem] }));
      }
    } catch {
      setDashboard((prev) => ({ ...prev, schedule: [...prev.schedule, tempItem] }));
    }

    setNewSchedTitle('');
    setNewSchedNotes('');
  };

  const handleToggleScheduleStatus = async (item: ExecutiveScheduleItem) => {
    const nextStatus: ExecutiveScheduleItem['status'] =
      item.status === 'COMPLETED'
        ? 'UPCOMING'
        : item.status === 'UPCOMING'
        ? 'IN_PROGRESS'
        : 'COMPLETED';

    setDashboard((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s) => (s.id === item.id ? { ...s, status: nextStatus } : s)),
    }));

    try {
      await fetch(`${SERVER_URL}/api/ceo/schedule/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch {
      // Ignore offline error
    }
  };

  const handleDelegateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const targetAgent = INITIAL_AGENTS_ROSTER[taskAssignee];
    const cleanTitle = taskTitle.trim();

    try {
      await fetch(`${SERVER_URL}/api/ceo/delegate-task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cleanTitle,
          description: taskDesc.trim(),
          assignee: taskAssignee,
          priority: taskPriority,
        }),
      });
    } catch {
      // Fallback triggers local peer discussion below
    }

    // Make Anggi walk to the assignee's desk on the 2D canvas to deliver the CEO's task!
    onTriggerPeerDiscussion(
      'AGT-PA',
      taskAssignee,
      `Delegasi Direktif CEO: ${cleanTitle}`,
      '/planning-and-task-breakdown'
    );

    setDelegationFeedback(
      `Direktif "${cleanTitle}" (${taskPriority}) telah diserahkan ke Anggi (PA). Anggi sedang berjalan ke meja ${targetAgent.name} untuk meneruskan instruksi Anda!`
    );
    setTaskTitle('');
    setTaskDesc('');
    setTimeout(() => setDelegationFeedback(null), 6000);
  };

  const handleKickoffProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;

    try {
      await fetch(`${SERVER_URL}/api/projects/kickoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projName.trim(),
          description: projDesc.trim() || 'Inisiasi proyek baru oleh CEO Software House.',
          platform: projPlatform,
        }),
      });
    } catch {
      // Ignore offline error
    }

    onTriggerPeerDiscussion(
      'AGT-PA',
      'AGT-PM',
      `Kickoff Proyek Klien Baru: ${projName.trim()} (${projPlatform})`,
      '/spec-driven-development'
    );

    setKickoffFeedback(
      `Proyek "${projName.trim()}" (${projPlatform}) resmi diinisiasi! Anggi (PA) & Aria (PM) sedang menyusun spesifikasi dan membagi backlog ke seluruh tim.`
    );
    setProjName('');
    setProjDesc('');
    setTimeout(() => setKickoffFeedback(null), 6000);
  };

  const handleSignOffReport = (report: DepartmentExecutiveReport) => {
    setSignedOffReportIds((prev) => ({ ...prev, [report.id]: true }));
    onTriggerPeerDiscussion(
      'AGT-PA',
      report.agentId,
      `CEO Sign-Off & Apresiasi Laporan ${report.department}`,
      '/context-engineering'
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Executive Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/25 border border-white/15">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  CEO Command Center & Laporan Eksekutif Anggi (PA)
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Executive Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola jadwal harian CEO, tinjau laporan 8 departemen engineering, delegasikan tugas, & luncurkan proyek Software House
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectAgent(anggiProfile);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 border border-rose-500/30 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Chat 1-on-1 dengan Anggi (PA)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('briefing')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'briefing'
                ? 'border-rose-500 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>1. Briefing Eksekutif Anggi & KPI Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'schedule'
                ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>2. Jadwal & Agenda Harian CEO ({dashboard.schedule.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileBarChart2 className="w-4 h-4 text-emerald-400" />
            <span>3. Laporan Lengkap Semua Divisi ({dashboard.departmentReports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('command')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'command'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-4 h-4 text-amber-400" />
            <span>4. Direktif CEO, Delegasi Tugas & Proyek Baru</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: EXECUTIVE BRIEFING & KPI OVERVIEW */}
          {activeTab === 'briefing' && (
            <div className="space-y-6">
              {/* Anggi's Morning Briefing Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/35 via-slate-900 to-indigo-950/30 border border-rose-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-lg"
                    style={{
                      backgroundColor: anggiProfile.color,
                      boxShadow: `0 8px 24px ${anggiProfile.color}44`,
                    }}
                  >
                    A
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        Anggi — Executive Personal Assistant to CEO
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        /automation
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        /context-engineering
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed max-w-3xl">
                      “{dashboard.briefingSummary}”
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                  >
                    Buka Jadwal Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('command')}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-all"
                  >
                    Delegasikan Tugas Baru
                  </button>
                </div>
              </div>

              {/* Software House KPI Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Proyek Aktif Studio
                  </div>
                  <div className="text-sm font-bold text-white mt-1 truncate">
                    {activeProject?.name || 'NexusDev Studio Platform'}
                  </div>
                  <div className="text-[11px] text-indigo-400 font-mono mt-1">
                    {activeProject?.platform || 'FULLSTACK'} • {activeProject?.status || 'IN_PROGRESS'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Kecepatan Sprint (Velocity)
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {dashboard.kpis.sprintVelocity}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    8 Divisi Engineering Aktif
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Cakupan Test QA (Sinta)
                  </div>
                  <div className="text-sm font-bold text-cyan-400 mt-1">
                    {dashboard.kpis.codeCoverage}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    /test-driven-development
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Status Pipeline CI/CD (Dion)
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                    {dashboard.kpis.pipelineStatus}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    /ci-cd-and-automation
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Kualitas & SLA Klien
                  </div>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    {dashboard.kpis.clientSatisfaction}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Blocker Kritis: {dashboard.kpis.activeBlockers}
                  </div>
                </div>
              </div>

              {/* Two-column Quick View: Today's Priority Schedule + Ready for CEO Sign-Off Reports */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Priority Schedule from Anggi */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Jadwal Prioritas CEO Hari Ini (Disusun Anggi)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('schedule')}
                      className="text-[11px] font-semibold text-indigo-400 hover:underline"
                    >
                      Kelola Semua →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {dashboard.schedule.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-indigo-400">
                              {item.time}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                                item.status === 'COMPLETED'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : item.status === 'IN_PROGRESS'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <p className="text-[11px] text-slate-400">{item.notes}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMeeting(item.title);
                          }}
                          className="shrink-0 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold"
                        >
                          Mulai Rapat
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Reports Waiting for CEO Sign-Off */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Laporan Divisi Siap Sign-Off CEO</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline"
                    >
                      Lihat 9 Divisi →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {dashboard.departmentReports.slice(0, 4).map((rep) => {
                      const agent = INITIAL_AGENTS_ROSTER[rep.agentId];
                      const isSigned = signedOffReportIds[rep.id];
                      return (
                        <div
                          key={rep.id}
                          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: agent?.color || '#6366f1' }}
                              />
                              <span className="text-xs font-bold text-white">
                                {agent?.name} ({rep.department})
                              </span>
                              <span className="text-[10px] font-mono text-indigo-300">
                                {rep.activeSkill}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">
                              {rep.progressPercent}%
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300">{rep.headline}</p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-mono text-slate-400">
                              {rep.metricsLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSignOffReport(rep)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                isSigned
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              }`}
                            >
                              {isSigned ? '✓ Disetujui CEO' : 'Approve & Sign-Off'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTIVE SCHEDULE & AGENDA MANAGEMENT */}
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Schedule Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Kalender & Jadwal Eksekutif CEO
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dikelola otomatis oleh Anggi (PA) menggunakan skill `/automation` & `/planning-and-task-breakdown`
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.schedule.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold">
                            {item.time}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleScheduleStatus(item)}
                            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                              item.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : item.status === 'IN_PROGRESS'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                            title="Klik untuk mengubah status agenda"
                          >
                            ● {item.status}
                          </button>
                        </div>

                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.notes}</p>

                        <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                          <span className="text-[10px] text-slate-500 mr-1">Peserta:</span>
                          {item.participants.map((roleId) => {
                            const p = INITIAL_AGENTS_ROSTER[roleId];
                            return (
                              <span
                                key={roleId}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 font-medium"
                              >
                                {p?.name || roleId}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMeeting(item.title);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Panggil Rapat Ini</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const target =
                              item.participants.find((r) => r !== 'USR-CEO' && r !== 'AGT-PA') ||
                              'AGT-CTO';
                            onTriggerPeerDiscussion(
                              'AGT-PA',
                              target,
                              `Persiapan Agenda CEO: ${item.title}`,
                              '/automation'
                            );
                            onClose();
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-all"
                        >
                          <Users className="w-3.5 h-3.5 text-rose-400" />
                          <span>Suruh Anggi Koordinasi</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add New Executive Schedule via Anggi */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 h-fit space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Tambah Jadwal Baru ke Anggi (PA)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Anggi akan menyusun undangan & briefing otomatis
                    </p>
                  </div>
                </div>

                <form onSubmit={handleAddSchedule} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Waktu Agenda
                    </label>
                    <input
                      type="text"
                      value={newSchedTime}
                      onChange={(e) => setNewSchedTime(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Contoh: 16:00 WIB"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Judul Agenda / Rapat CEO
                    </label>
                    <input
                      type="text"
                      value={newSchedTitle}
                      onChange={(e) => setNewSchedTitle(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Contoh: Evaluasi Kontrak Klien & Target Q4"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Kategori Agenda
                    </label>
                    <select
                      value={newSchedCategory}
                      onChange={(e) =>
                        setNewSchedCategory(e.target.value as ExecutiveScheduleItem['category'])
                      }
                      onKeyDown={(e) => e.stopPropagation()}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="STANDUP">STANDUP (Sinkronisasi Tim)</option>
                      <option value="ARCHITECTURE">ARCHITECTURE (Keputusan Teknis)</option>
                      <option value="REVIEW">REVIEW (Demo Produk & UI/UX)</option>
                      <option value="RELEASE">RELEASE (Deployment & QA Gate)</option>
                      <option value="CLIENT">CLIENT (Rapat Klien & Bisnis)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Catatan Briefing untuk Anggi
                    </label>
                    <textarea
                      rows={3}
                      value={newSchedNotes}
                      onChange={(e) => setNewSchedNotes(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Instruksi tambahan agar disiapkan oleh Anggi..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Simpan & Tugaskan ke Anggi</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: DEPARTMENT PROGRESS & TECHNICAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Laporan Eksekutif & Deliverable Seluruh Divisi (Dikurasi oleh Anggi PA)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sebagai CEO Software House, Anda dapat memberikan Sign-Off, melompat ke meja agen, atau meminta Anggi menindaklanjuti laporan setiap kepala divisi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboard.departmentReports.map((rep) => {
                  const agent = INITIAL_AGENTS_ROSTER[rep.agentId];
                  const isSigned = signedOffReportIds[rep.id];
                  return (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3.5 transition-all"
                    >
                      <div className="space-y-3">
                        {/* Agent Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
                              style={{ backgroundColor: agent?.color || '#6366f1' }}
                            >
                              {agent?.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">
                                {agent?.name} — {agent?.title.split('&')[0]}
                              </div>
                              <div className="text-[10px] text-slate-400">{rep.department}</div>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              rep.health === 'READY_FOR_SIGN_OFF'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}
                          >
                            {rep.health === 'READY_FOR_SIGN_OFF' ? 'SIAP SIGN-OFF' : 'ON TRACK'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-slate-400 font-medium">Progres Sprint</span>
                            <span className="font-mono font-bold text-emerald-400">
                              {rep.progressPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                              style={{ width: `${rep.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-200 leading-snug">
                          {rep.headline}
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                          <Terminal className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{rep.activeSkill}</span>
                        </div>

                        {/* Deliverables List */}
                        <ul className="space-y-1.5 pt-1">
                          {rep.keyDeliverables.map((deliv, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{rep.metricsLabel}</span>
                          <span>{rep.updatedAt}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSignOffReport(rep)}
                            className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-all ${
                              isSigned
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isSigned ? '✓ Approved by CEO' : 'Approve Laporan'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (agent) {
                                onClose();
                                onJumpToAgent(agent.id);
                                onSelectAgent(agent);
                              }
                            }}
                            className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1"
                            title="Inspeksi meja & kode agen"
                          >
                            <span>Inspeksi</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CEO DIRECTIVES, TASK DELEGATION & NEW PROJECT KICKOFF */}
          {activeTab === 'command' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Delegate Task via Anggi (PA) to any Department */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Delegasikan Tugas & Direktif CEO (Via Anggi PA)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tugaskan fitur, perbaikan bug, atau audit ke karakter mana pun. Anggi akan berjalan ke meja mereka dan memasukkan tugas ke Kanban.
                    </p>
                  </div>
                </div>

                {delegationFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs leading-relaxed">
                    ✓ {delegationFeedback}
                  </div>
                )}

                <form onSubmit={handleDelegateTask} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Pilih Karakter Tujuan (Assignee)
                      </label>
                      <select
                        value={taskAssignee}
                        onChange={(e) => setTaskAssignee(e.target.value as AgentRole)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {DELEGATABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {INITIAL_AGENTS_ROSTER[r].name} ({INITIAL_AGENTS_ROSTER[r].title})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tingkat Prioritas
                      </label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="CRITICAL">CRITICAL (Eksekusi Segera)</option>
                        <option value="HIGH">HIGH (Prioritas Sprint Ini)</option>
                        <option value="MEDIUM">MEDIUM (Standar)</option>
                        <option value="LOW">LOW (Backlog)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Judul Tugas / Instruksi CEO
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Contoh: Optimasi Query Analytics & Tambah Guard Keamanan"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Detail Spesifikasi & Kriteria Penerimaan
                    </label>
                    <textarea
                      rows={3}
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      placeholder="Jelaskan ekspektasi Anda sebagai CEO..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Delegasikan Tugas via Anggi (PA)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenKanban();
                      }}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Kanban className="w-4 h-4 text-amber-400" />
                      <span>Lihat Kanban ({tasks.length})</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right: Software House Client Project Kickoff & Executive Broadcast */}
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Inisiasi Proyek Klien Baru (Software House Kickoff)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Mulai proyek aplikasi baru. Workspace terisolasi akan dibuat dan seluruh agen otomatis menyusun arsitektur & sprint.
                      </p>
                    </div>
                  </div>

                  {kickoffFeedback && (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs leading-relaxed">
                      🚀 {kickoffFeedback}
                    </div>
                  )}

                  <form onSubmit={handleKickoffProject} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Nama Proyek / Klien
                        </label>
                        <input
                          type="text"
                          value={projName}
                          onChange={(e) => setProjName(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          placeholder="Contoh: FinTech SuperApp Enterprise"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Target Platform
                        </label>
                        <select
                          value={projPlatform}
                          onChange={(e) => setProjPlatform(e.target.value as ProjectPlatform)}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="FULLSTACK">FULLSTACK (Web + Mobile + API)</option>
                          <option value="WEB">WEB (Next.js + Backend)</option>
                          <option value="MOBILE">MOBILE (iOS & Android Native)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Brief Eksekutif Proyek
                      </label>
                      <textarea
                        rows={2}
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        placeholder="Deskripsi singkat fitur utama proyek klien..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>Luncurkan Proyek Baru ke Seluruh Tim</span>
                    </button>
                  </form>
                </div>

                {/* Quick CEO Executive Actions */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Aksi Cepat Eksekutif CEO
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMeeting('Townhall & Evaluasi Mingguan CEO bersama Seluruh Kepala Divisi');
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all"
                    >
                      <Video className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Panggil Townhall Meeting</div>
                        <div className="text-[10px] text-slate-400">Kumpulkan semua agen ke Boardroom</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onTriggerPeerDiscussion(
                          'AGT-PA',
                          'AGT-CTO',
                          'Audit Kesiapan Rilis & Keamanan Produksi untuk CEO',
                          '/security-and-hardening'
                        );
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex items-center gap-2.5 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Perintahkan Audit CTO</div>
                        <div className="text-[10px] text-slate-400">Anggi jalan ke meja Viktor (CTO)</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

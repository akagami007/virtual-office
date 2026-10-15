'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  AgentRole,
  INITIAL_AGENTS_ROSTER,
  Task,
  TaskPriority,
  TaskStatus,
} from '@nexusdev/shared';

interface KanbanBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent?: (agentRole: AgentRole) => void;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Decompose Project Requirements into User Stories',
    description: 'Breakdown user brief into epics, milestones, and acceptance criteria.',
    assignee: 'AGT-PM',
    status: 'DONE',
    priority: 'HIGH',
    iteration: 1,
    createdAt: '2026-10-14T10:00:00Z',
    updatedAt: '2026-10-14T11:30:00Z',
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Design Tokens & Multi-Platform Theme Spec',
    description: 'JSON design tokens, color palette, responsive typography system.',
    assignee: 'AGT-UIUX',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    iteration: 1,
    createdAt: '2026-10-14T11:00:00Z',
    updatedAt: '2026-10-14T12:00:00Z',
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Next.js 15 App Router & 2D Phaser Canvas Integration',
    description: 'Core 2D viewport, tilemap loader, and real-time state synchronization.',
    assignee: 'AGT-FE',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    iteration: 1,
    createdAt: '2026-10-14T11:30:00Z',
    updatedAt: '2026-10-14T13:00:00Z',
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'OpenAPI Schema & PostgreSQL Database Models',
    description: 'Prisma schema definition, migrations, and WebSocket event gateway.',
    assignee: 'AGT-BE',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    iteration: 1,
    createdAt: '2026-10-14T12:00:00Z',
    updatedAt: '2026-10-14T14:15:00Z',
  },
  {
    id: 'task-5',
    projectId: 'proj-1',
    title: 'Expo Web Mobile Simulator Setup',
    description: 'React Native components with instant browser preview in iframe.',
    assignee: 'AGT-MOB',
    status: 'TODO',
    priority: 'MEDIUM',
    iteration: 0,
    createdAt: '2026-10-14T13:00:00Z',
    updatedAt: '2026-10-14T13:00:00Z',
  },
  {
    id: 'task-6',
    projectId: 'proj-1',
    title: 'Automated Playwright E2E Suite & Regression Tests',
    description: 'Validation scripts for user flow, API contract tests, and load checks.',
    assignee: 'AGT-QA',
    status: 'TODO',
    priority: 'HIGH',
    iteration: 0,
    createdAt: '2026-10-14T13:30:00Z',
    updatedAt: '2026-10-14T13:30:00Z',
  },
  {
    id: 'task-7',
    projectId: 'proj-1',
    title: 'Docker Sandbox Runner & GitHub Actions CI Workflow',
    description: 'Ephemeral container isolation with CPU/RAM caps and Fastlane setup.',
    assignee: 'AGT-OPS',
    status: 'TODO',
    priority: 'HIGH',
    iteration: 0,
    createdAt: '2026-10-14T14:00:00Z',
    updatedAt: '2026-10-14T14:00:00Z',
  },
];

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do (Antrian)', color: '#94a3b8' },
  { id: 'IN_PROGRESS', label: 'In Progress (Pengerjaan)', color: '#3b82f6' },
  { id: 'IN_REVIEW', label: 'Review & Verify (CTO/QA)', color: '#a855f7' },
  { id: 'DONE', label: 'Done (Selesai)', color: '#10b981' },
  { id: 'ESCALATED', label: 'Escalated (HITL)', color: '#ef4444' },
];

export default function KanbanBoardModal({
  isOpen,
  onClose,
  onSelectAgent,
}: KanbanBoardModalProps) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filterRole, setFilterRole] = useState<string>('ALL');

  if (!isOpen) return null;

  const moveTask = (taskId: string, direction: 'next' | 'prev') => {
    const statusOrder: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentIndex = statusOrder.indexOf(t.status);
        if (currentIndex === -1) return t;

        const nextIndex =
          direction === 'next'
            ? Math.min(currentIndex + 1, statusOrder.length - 1)
            : Math.max(currentIndex - 1, 0);

        return {
          ...t,
          status: statusOrder[nextIndex],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const filteredTasks =
    filterRole === 'ALL'
      ? tasks
      : tasks.filter((t) => t.assignee === filterRole);

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-7xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              K
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Papan Kanban Studio SDLC
              </h2>
              <p className="text-xs text-slate-400">
                Lacak pergerakan tugas antar agen spesialis secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by Agent */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">Semua Agen</option>
                {Object.values(INITIAL_AGENTS_ROSTER).map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Board Columns Grid */}
        <div className="flex-1 overflow-x-auto p-5 grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-950/30">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 min-w-[240px] max-h-full"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <h3 className="text-xs font-bold text-slate-200">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                {/* Task Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colTasks.map((task) => {
                    const assignee = INITIAL_AGENTS_ROSTER[task.assignee];
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/50 hover:border-slate-600 transition-all shadow-md group space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                          {task.iteration > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Iterasi {task.iteration}/3
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Card Footer: Assignee & Move Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                          {assignee && (
                            <button
                              onClick={() => {
                                if (onSelectAgent) {
                                  onSelectAgent(assignee.id);
                                  onClose();
                                }
                              }}
                              className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 hover:text-white"
                              title={`Buka Inspector ${assignee.name}`}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: assignee.color }}
                              />
                              <span>{assignee.name.split(' ')[0]}</span>
                            </button>
                          )}

                          {col.id !== 'DONE' && col.id !== 'ESCALATED' && (
                            <button
                              onClick={() => moveTask(task.id, 'next')}
                              className="p-1 rounded-md bg-slate-700/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                              title="Pindahkan ke kolom berikutnya"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-500 italic">
                      Tidak ada kartu
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

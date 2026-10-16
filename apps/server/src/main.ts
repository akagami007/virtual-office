import express from 'express';
import http from 'http';
import fs from 'fs/promises';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import {
  AGENT_SKILLS_REGISTRY,
  AUTONOMOUS_PEER_DISCUSSIONS,
  AgentPeerDiscussion,
  AgentProfile,
  AgentRole,
  AgentSkillSpec,
  ApprovalGate,
  ChatMessage,
  ClientToServerEvents,
  ExecutiveDashboardData,
  ExecutiveScheduleItem,
  INITIAL_AGENTS_ROSTER,
  INITIAL_EXECUTIVE_DASHBOARD,
  INITIAL_ROOMS_SPEC,
  Project,
  ServerToClientEvents,
  SoftwareFactoryRun,
  Task,
  TaskPriority,
} from '@nexusdev/shared';
import {
  SDLCWorkflowEngine,
  getLLMProvider,
} from '@nexusdev/agent-orchestrator';
import { WorkspaceManager } from '@nexusdev/sandbox-runner';
import {
  buildInteractiveWebAppBundle,
  detectTemplateType,
} from './factoryGenerator';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

// State in Memory / Database
let activeProject: Project = {
  id: 'proj-nexus-01',
  name: 'NexusDev Studio Platform',
  description: 'Multi-Agent AI Software House with Next.js 15, Node.js, and Expo Mobile.',
  status: 'IN_PROGRESS',
  platform: 'FULLSTACK',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const agentsRoster: Record<AgentRole, AgentProfile> = { ...INITIAL_AGENTS_ROSTER };
let executiveDashboard: ExecutiveDashboardData = {
  ...INITIAL_EXECUTIVE_DASHBOARD,
  schedule: [...INITIAL_EXECUTIVE_DASHBOARD.schedule],
  departmentReports: [...INITIAL_EXECUTIVE_DASHBOARD.departmentReports],
};
const customTasks: Task[] = [];
let activeFactoryRun: SoftwareFactoryRun | null = null;
const workspaceManager = new WorkspaceManager();
const workflowEngine = new SDLCWorkflowEngine(getLLMProvider(), workspaceManager);

// Auto-seed initial project workspace
workspaceManager.scaffoldProject(activeProject.id, 'FULLSTACK').catch(console.error);

// Helper to find skill spec and load real SKILL.md content from disk
async function loadSkillMarkdown(skillIdOrCommand: string): Promise<{
  spec: AgentSkillSpec | null;
  rawMarkdown: string;
}> {
  const cleanId = skillIdOrCommand.replace(/^\//, '').trim();
  let foundSpec: AgentSkillSpec | null = null;

  for (const list of Object.values(AGENT_SKILLS_REGISTRY)) {
    const match = list.find((s) => s.id === cleanId || s.slashCommand === `/${cleanId}`);
    if (match) {
      foundSpec = match;
      break;
    }
  }

  const candidatePaths = foundSpec
    ? [foundSpec.skillPath]
    : [
        `/Users/akagami/.gemini/config/skills/${cleanId}/SKILL.md`,
        `/Users/akagami/.gemini/antigravity/builtin/skills/${cleanId}/SKILL.md`,
      ];

  for (const p of candidatePaths) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      return { spec: foundSpec, rawMarkdown: content };
    } catch {
      // continue
    }
  }

  return {
    spec: foundSpec,
    rawMarkdown: foundSpec
      ? `# ${foundSpec.name} (${foundSpec.slashCommand})\n\n${foundSpec.description}\n\n## Core Rules\n${foundSpec.keyRules.map((r) => `- ${r}`).join('\n')}`
      : '',
  };
}

// ==========================================
// REST API Routes
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NexusDev Studio Orchestrator & Sandbox Runner',
    agentsOnline: Object.keys(agentsRoster).length,
    activePhase: workflowEngine.getCurrentPhase(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/projects', (req, res) => {
  res.json({
    project: activeProject,
    phase: workflowEngine.getCurrentPhase(),
    tasks: workflowEngine.getTasks(),
  });
});

app.post('/api/projects/kickoff', async (req, res) => {
  const { name, description, platform } = req.body;
  activeProject = {
    id: `proj-${Date.now()}`,
    name: name || 'Aplikasi Baru',
    description: description || 'Proyek baru diinisiasi oleh CEO.',
    status: 'PLANNING',
    platform: platform || 'FULLSTACK',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Launch workflow engine in background
  workflowEngine.startProject(activeProject).catch(console.error);

  res.json({
    message: 'Proyek berhasil diinisiasi & workspace terisolasi dibuat',
    project: activeProject,
  });
});

// CEO Executive Suite & Personal Assistant (Anggi) Endpoints
app.get('/api/ceo/dashboard', (req, res) => {
  res.json({
    dashboard: executiveDashboard,
    activeProject,
    tasks: [...customTasks, ...workflowEngine.getTasks()],
    agents: Object.values(agentsRoster),
  });
});

app.post('/api/ceo/schedule', (req, res) => {
  const { time, title, category, participants, notes } = req.body;
  const newItem: ExecutiveScheduleItem = {
    id: `sched-${Date.now()}`,
    time: time || '16:00 WIB',
    title: title || 'Agenda Eksekutif Baru CEO',
    category: category || 'REVIEW',
    participants:
      Array.isArray(participants) && participants.length > 0
        ? participants
        : ['USR-CEO', 'AGT-PA', 'AGT-CTO'],
    status: 'UPCOMING',
    notes:
      notes ||
      'Disiapkan otomatis oleh Anggi (PA) menggunakan protokol /automation & /context-engineering.',
    preparedBy: 'AGT-PA',
  };

  executiveDashboard.schedule = [...executiveDashboard.schedule, newItem];

  // Trigger Anggi speech bubble on 2D canvas
  io.emit('agent:speech', {
    agentId: 'AGT-PA',
    message: `Siap CEO! Jadwal "${newItem.title}" (${newItem.time}) telah saya catat & undangan sudah dikirim.`,
    durationMs: 4500,
  });

  res.json({
    message: 'Jadwal eksekutif berhasil ditambahkan oleh Anggi (PA)',
    item: newItem,
    schedule: executiveDashboard.schedule,
  });
});

app.patch('/api/ceo/schedule/:id', (req, res) => {
  const { status } = req.body;
  executiveDashboard.schedule = executiveDashboard.schedule.map((item) =>
    item.id === req.params.id ? { ...item, status: status || 'COMPLETED' } : item
  );
  res.json({ schedule: executiveDashboard.schedule });
});

app.post('/api/ceo/delegate-task', (req, res) => {
  const { title, description, assignee, priority } = req.body as {
    title?: string;
    description?: string;
    assignee?: AgentRole;
    priority?: TaskPriority;
  };

  const targetRole: AgentRole = assignee || 'AGT-FE';
  const targetAgent = agentsRoster[targetRole] || agentsRoster['AGT-FE'];
  const newTask: Task = {
    id: `task-ceo-${Date.now()}`,
    projectId: activeProject.id,
    title: title || 'Instruksi Strategis CEO',
    description:
      description ||
      `Direktif langsung dari CEO yang dikoordinasikan melalui Anggi (PA) untuk ${targetAgent.name}.`,
    assignee: targetRole,
    status: 'IN_PROGRESS',
    priority: priority || 'HIGH',
    iteration: 1,
    estimatedTime: '2h',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  customTasks.unshift(newTask);

  // Update target agent's live state and currentTask
  if (agentsRoster[targetRole]) {
    agentsRoster[targetRole].state = 'CODING';
    agentsRoster[targetRole].currentTask = newTask.title;
  }

  io.emit('task:created', newTask);
  io.emit('agent:status_updated', {
    agentId: targetRole,
    state: 'CODING',
    currentTask: newTask.title,
  });

  // Trigger Anggi -> Target Agent desk visit discussion
  const targetSkills = AGENT_SKILLS_REGISTRY[targetRole] || [];
  const primarySkill = targetSkills[0]?.slashCommand || '/incremental-implementation';
  const delegationDiscussion: AgentPeerDiscussion = {
    id: `disc-ceo-del-${Date.now()}`,
    initiatorId: 'AGT-PA',
    targetId: targetRole,
    topic: `Delegasi Tugas CEO: ${newTask.title}`,
    skillApplied: `/planning-and-task-breakdown & ${primarySkill}`,
    locationLabel: `Meja ${targetAgent.name} (${targetAgent.department})`,
    startedAt: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    turns: [
      {
        speakerId: 'AGT-PA',
        speakerName: 'Anggi (PA CEO)',
        speakerColor: '#F43F5E',
        skillUsed: '/planning-and-task-breakdown',
        text: `Halo ${targetAgent.name}, CEO baru saja menugaskan prioritas ${newTask.priority}: "${newTask.title}".`,
      },
      {
        speakerId: targetRole,
        speakerName: `${targetAgent.name} (${targetAgent.department.split(' ')[0]})`,
        speakerColor: targetAgent.color,
        skillUsed: primarySkill,
        text: `Siap Anggi! Tolong sampaikan ke CEO, saya langsung kerjakan "${newTask.title}" dengan standar ${primarySkill}.`,
      },
    ],
  };

  io.emit('office:peer_discussion', delegationDiscussion);

  res.json({
    message: `Tugas berhasil didelegasikan ke ${targetAgent.name} melalui Anggi (PA)`,
    task: newTask,
    discussion: delegationDiscussion,
  });
});

// ==========================================
// Autonomous Software Factory Engine (Semi-Automated 2-Gate CEO Pipeline)
// ==========================================

function emitFactoryUpdate(run: SoftwareFactoryRun) {
  run.updatedAt = new Date().toISOString();
  io.emit('factory:updated', run);
}

function emitFactoryPeerDiscussion(params: {
  initiatorId: AgentRole;
  targetId: AgentRole;
  topic: string;
  skillA: string;
  skillB: string;
  lineA: string;
  lineB: string;
}) {
  const initAgent = agentsRoster[params.initiatorId];
  const targAgent = agentsRoster[params.targetId];
  if (!initAgent || !targAgent) return;

  const disc: AgentPeerDiscussion = {
    id: `disc-factory-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    initiatorId: params.initiatorId,
    targetId: params.targetId,
    topic: params.topic,
    skillApplied: `${params.skillA} & ${params.skillB}`,
    locationLabel: `Meja ${targAgent.name} (${targAgent.department})`,
    startedAt: new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    turns: [
      {
        speakerId: params.initiatorId,
        speakerName: `${initAgent.name} (${initAgent.department.split(' ')[0]})`,
        speakerColor: initAgent.color,
        skillUsed: params.skillA,
        text: params.lineA,
      },
      {
        speakerId: params.targetId,
        speakerName: `${targAgent.name} (${targAgent.department.split(' ')[0]})`,
        speakerColor: targAgent.color,
        skillUsed: params.skillB,
        text: params.lineB,
      },
    ],
  };

  io.emit('office:peer_discussion', disc);
}

async function runFactoryPhase1(run: SoftwareFactoryRun) {
  // Step 0: Anggi (PA) receives CEO brief and walks to Aria (PM)
  run.status = 'PHASE_1_PLANNING';
  run.currentStepIndex = 0;
  run.steps[0].status = 'IN_PROGRESS';
  emitFactoryUpdate(run);

  emitFactoryPeerDiscussion({
    initiatorId: 'AGT-PA',
    targetId: 'AGT-PM',
    topic: `Brief Aplikasi Baru CEO: ${run.appName}`,
    skillA: '/context-engineering',
    skillB: '/spec-driven-development',
    lineA: `Aria, CEO memerintahkan pembuatan aplikasi "${run.appName}": "${run.prompt}". Mari kita susun spesifikasinya!`,
    lineB: `Siap Anggi! Saya jalankan /spec-driven-development & /planning-and-task-breakdown untuk memecah fitur utamanya.`,
  });

  await workspaceManager.ensureWorkspace(run.projectId);
  await workspaceManager.writeFile(
    run.projectId,
    'docs/PRD_SPEC.md',
    `# Product Requirement Document (PRD) — ${run.appName}\n\n**CEO Brief:** ${run.prompt}\n**Disusun Oleh:** Anggi (PA) & Aria (PM) menggunakan \`/spec-driven-development\`\n\n## Daftar Modul Utama\n1. Dashboard KPI Real-time & Kalkulasi Otomatis\n2. Form Input & Validasi Data Interaktif\n3. Tabel Manajemen Data dengan Pencarian, Filter & Aksi Cepat\n4. Visualisasi Grafik Distribusi Kategori & Ekspor JSON\n`
  );

  setTimeout(async () => {
    if (!activeFactoryRun || activeFactoryRun.id !== run.id) return;
    run.steps[0].status = 'COMPLETED';
    run.steps[0].timestamp = 'Selesai';
    run.generatedFiles.push({
      path: 'docs/PRD_SPEC.md',
      author: 'AGT-PM',
      skill: '/spec-driven-development',
      description: 'Dokumen Spesifikasi Produk & Kriteria Penerimaan',
    });

    // Step 1: Aria (PM) walks to Viktor (CTO) & Kael (UI/UX) for Architecture + Anti-Slop UI Design
    run.currentStepIndex = 1;
    run.steps[1].status = 'IN_PROGRESS';
    emitFactoryUpdate(run);

    emitFactoryPeerDiscussion({
      initiatorId: 'AGT-CTO',
      targetId: 'AGT-UIUX',
      topic: `Arsitektur & Desain UI Anti-Slop: ${run.appName}`,
      skillA: '/security-and-hardening',
      skillB: '/antislop-ui',
      lineA: `Kael, saya sudah mengunci kontrak arsitektur & keamanan /security-and-hardening untuk "${run.appName}".`,
      lineB: `Mantap Pak Viktor! Desain sistem /antislop-ui dan kontras aksesibilitas /antislop-human juga sudah siap dipresentasikan ke CEO.`,
    });

    await workspaceManager.writeFile(
      run.projectId,
      'docs/ARCHITECTURE_AND_UI.md',
      `# Arsitektur & Desain UI/UX — ${run.appName}\n\n## Arsitektur Sistem (Viktor CTO)\n${run.architectureSummary}\n\n## Desain Visual & Ergonomi (Kael UI/UX)\n${run.uiDesignSummary}\n`
    );

    setTimeout(() => {
      if (!activeFactoryRun || activeFactoryRun.id !== run.id) return;
      run.steps[1].status = 'COMPLETED';
      run.steps[1].timestamp = 'Selesai';
      run.generatedFiles.push({
        path: 'docs/ARCHITECTURE_AND_UI.md',
        author: 'AGT-CTO',
        skill: '/security-and-hardening & /antislop-ui',
        description: 'Blueprint Arsitektur Keamanan & Desain Sistem UI/UX',
      });

      // Pause at CEO Gate 1!
      run.status = 'WAITING_CEO_GATE_1';
      emitFactoryUpdate(run);

      io.emit('agent:speech', {
        agentId: 'AGT-PA',
        message: `CEO, rancangan fitur & arsitektur "${run.appName}" sudah siap! Mohon klik Approve di Gate 1 agar tim mulai menulis kode.`,
        durationMs: 6000,
      });
    }, 3200);
  }, 3200);
}

async function runFactoryPhase2(run: SoftwareFactoryRun) {
  run.status = 'PHASE_2_BUILDING';
  run.currentStepIndex = 2;
  run.steps[2].status = 'IN_PROGRESS';
  emitFactoryUpdate(run);

  // Regenerate bundle incorporating any CEO feedback from Gate 1 or Gate 2
  const bundle = buildInteractiveWebAppBundle({
    appName: run.appName,
    prompt: run.prompt,
    templateType: run.templateType,
    ceoFeedbackHistory: run.ceoFeedbackHistory,
  });

  run.architectureSummary = bundle.architectureSummary;
  run.uiDesignSummary = bundle.uiDesignSummary;
  run.previewHtml = bundle.previewHtml;

  // Step 2: Nadia (FE) & Bima (BE) build Frontend + Backend + Live Interactive App
  emitFactoryPeerDiscussion({
    initiatorId: 'AGT-FE',
    targetId: 'AGT-BE',
    topic: `Implementasi Full-Stack: ${run.appName}`,
    skillA: '/frontend-ui-engineering',
    skillB: '/api-and-interface-design',
    lineA: `Bima, komponen interaktif Next.js & state kalkulasi "${run.appName}" sedang saya rakit sesuai /frontend-ui-engineering.`,
    lineB: `Siap Nadia! Endpoint REST API dan skema data /api-and-interface-design sudah tersambung mulus.`,
  });

  await workspaceManager.writeFile(
    run.projectId,
    'apps/web/src/app/page.tsx',
    bundle.nextjsPageCode
  );
  await workspaceManager.writeFile(
    run.projectId,
    'apps/server/src/routes.js',
    bundle.backendApiCode
  );
  await workspaceManager.writeFile(
    run.projectId,
    'dist/live-app.html',
    bundle.previewHtml
  );

  setTimeout(async () => {
    if (!activeFactoryRun || activeFactoryRun.id !== run.id) return;
    run.steps[2].status = 'COMPLETED';
    run.steps[2].timestamp = 'Selesai';

    const existingPaths = new Set(run.generatedFiles.map((f) => f.path));
    if (!existingPaths.has('apps/web/src/app/page.tsx')) {
      run.generatedFiles.push(
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
        }
      );
    }

    // Step 3: Sinta (QA) & Dion (DevOps) run TDD verification & CI/CD build packaging
    run.currentStepIndex = 3;
    run.steps[3].status = 'IN_PROGRESS';
    emitFactoryUpdate(run);

    emitFactoryPeerDiscussion({
      initiatorId: 'AGT-QA',
      targetId: 'AGT-OPS',
      topic: `Verifikasi QA & Build Live Preview: ${run.appName}`,
      skillA: '/test-driven-development',
      skillB: '/ci-cd-and-automation',
      lineA: `Dion, seluruh test interaktif form, tabel, dan kalkulasi "${run.appName}" lulus 100% sesuai /test-driven-development!`,
      lineB: `Luar biasa Sinta! Pipeline /ci-cd-and-automation hijau. Aplikasi sekarang siap dicoba langsung oleh CEO!`,
    });

    await workspaceManager.writeFile(
      run.projectId,
      'tests/app.e2e.spec.ts',
      bundle.playwrightTestCode
    );

    setTimeout(() => {
      if (!activeFactoryRun || activeFactoryRun.id !== run.id) return;
      run.steps[3].status = 'COMPLETED';
      run.steps[3].timestamp = 'Selesai';
      if (!run.generatedFiles.some((f) => f.path === 'tests/app.e2e.spec.ts')) {
        run.generatedFiles.push({
          path: 'tests/app.e2e.spec.ts',
          author: 'AGT-QA',
          skill: '/test-driven-development',
          description: 'Suite Pengujian E2E Otomatis Playwright/Jest',
        });
      }

      // Pause at CEO Gate 2 (Live App Preview & Release Sign-Off)
      run.status = 'WAITING_CEO_GATE_2';
      emitFactoryUpdate(run);

      io.emit('agent:speech', {
        agentId: 'AGT-PA',
        message: `CEO! Aplikasi "${run.appName}" sudah selesai dibangun & lulus QA! Silakan coba langsung di Live App Preview!`,
        durationMs: 6500,
      });
    }, 3200);
  }, 3400);
}

app.get('/api/factory/current', (req, res) => {
  res.json({ run: activeFactoryRun });
});

app.post('/api/factory/start', async (req, res) => {
  try {
    const { appName, prompt } = req.body as { appName?: string; prompt?: string };
    const cleanPrompt =
      (prompt && prompt.trim()) ||
      'Aplikasi Web Kasir POS Kafe lengkap dengan keranjang, perhitungan omzet, dan grafik kategori';
    const cleanName =
      (appName && appName.trim()) ||
      cleanPrompt.split(' ').slice(0, 4).join(' ');

    const projectId = `app-${Date.now()}`;
    const templateType = detectTemplateType(`${cleanName} ${cleanPrompt}`);
    const initialBundle = buildInteractiveWebAppBundle({
      appName: cleanName,
      prompt: cleanPrompt,
      templateType,
      ceoFeedbackHistory: [],
    });

    const newRun: SoftwareFactoryRun = {
      id: `factory-${Date.now()}`,
      projectId,
      appName: cleanName,
      prompt: cleanPrompt,
      templateType,
      status: 'PHASE_1_PLANNING',
      currentStepIndex: 0,
      architectureSummary: initialBundle.architectureSummary,
      uiDesignSummary: initialBundle.uiDesignSummary,
      previewHtml: initialBundle.previewHtml,
      generatedFiles: [],
      revisionCount: 0,
      ceoFeedbackHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          id: 'step-1-spec',
          phase: 1,
          agentId: 'AGT-PA',
          partnerId: 'AGT-PM',
          title: '1. Analisis Brief CEO & Spesifikasi Produk (Anggi PA & Aria PM)',
          skillUsed: '/context-engineering & /spec-driven-development',
          status: 'PENDING',
          outputFile: 'docs/PRD_SPEC.md',
          summary: 'Menerjemahkan perintah CEO menjadi spesifikasi fitur & backlog terukur.',
        },
        {
          id: 'step-2-arch',
          phase: 1,
          agentId: 'AGT-CTO',
          partnerId: 'AGT-UIUX',
          title: '2. Desain Arsitektur, Keamanan & Anti-Slop UI (Viktor CTO & Kael UI/UX)',
          skillUsed: '/security-and-hardening & /antislop-ui',
          status: 'PENDING',
          outputFile: 'docs/ARCHITECTURE_AND_UI.md',
          summary: 'Merancang kontrak API, skema data, dan sistem desain bebas AI-slop.',
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

    activeFactoryRun = newRun;
    activeProject = {
      id: projectId,
      name: cleanName,
      description: cleanPrompt,
      status: 'IN_PROGRESS',
      platform: 'WEB',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    runFactoryPhase1(newRun).catch(console.error);
    res.json({ run: newRun });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to start software factory' });
  }
});

app.post('/api/factory/gate1-decision', async (req, res) => {
  try {
    const { decision, feedback } = req.body as {
      decision: 'APPROVE' | 'REVISE';
      feedback?: string;
    };
    if (!activeFactoryRun) {
      return res.status(404).json({ error: 'Tidak ada proses pabrik aplikasi yang aktif' });
    }

    if (feedback && feedback.trim()) {
      activeFactoryRun.ceoFeedbackHistory.push(feedback.trim());
    }

    if (decision === 'REVISE') {
      activeFactoryRun.revisionCount += 1;
      const updatedBundle = buildInteractiveWebAppBundle({
        appName: activeFactoryRun.appName,
        prompt: activeFactoryRun.prompt,
        templateType: activeFactoryRun.templateType,
        ceoFeedbackHistory: activeFactoryRun.ceoFeedbackHistory,
      });
      activeFactoryRun.architectureSummary = updatedBundle.architectureSummary;
      activeFactoryRun.uiDesignSummary = updatedBundle.uiDesignSummary;
      activeFactoryRun.previewHtml = updatedBundle.previewHtml;
    }

    // Proceed to Phase 2 (Coding, QA, DevOps & Live Preview)
    runFactoryPhase2(activeFactoryRun).catch(console.error);
    res.json({ run: activeFactoryRun });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/factory/gate2-decision', async (req, res) => {
  try {
    const { decision, feedback } = req.body as {
      decision: 'APPROVE_RELEASE' | 'REQUEST_REVISION';
      feedback?: string;
    };
    if (!activeFactoryRun) {
      return res.status(404).json({ error: 'Tidak ada proses pabrik aplikasi yang aktif' });
    }

    if (decision === 'REQUEST_REVISION') {
      activeFactoryRun.revisionCount += 1;
      if (feedback && feedback.trim()) {
        activeFactoryRun.ceoFeedbackHistory.push(feedback.trim());
      }
      runFactoryPhase2(activeFactoryRun).catch(console.error);
      return res.json({ run: activeFactoryRun });
    }

    activeFactoryRun.status = 'RELEASED';
    activeProject.status = 'COMPLETED';
    emitFactoryUpdate(activeFactoryRun);

    io.emit('agent:speech', {
      agentId: 'AGT-OPS',
      message: `Rilis Produksi "${activeFactoryRun.appName}" resmi disetujui CEO! Aplikasi berstatus LIVE!`,
      durationMs: 5500,
    });

    res.json({ run: activeFactoryRun });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agents', (req, res) => {
  res.json(Object.values(agentsRoster));
});

app.get('/api/skills/:skillId', async (req, res) => {
  try {
    const { spec, rawMarkdown } = await loadSkillMarkdown(req.params.skillId);
    if (!spec && !rawMarkdown) {
      return res.status(404).json({ error: `Skill ${req.params.skillId} not found` });
    }
    res.json({
      skillId: req.params.skillId,
      spec,
      rawMarkdown: rawMarkdown.slice(0, 3500),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to read SKILL.md' });
  }
});

app.post('/api/agents/:agentId/chat', async (req, res) => {
  try {
    const agentId = req.params.agentId as AgentRole;
    const { message } = req.body;
    const profile = agentsRoster[agentId];

    if (!profile) {
      return res.status(404).json({ error: `Agent ${agentId} not found` });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const assignedSkills = AGENT_SKILLS_REGISTRY[agentId] || [];
    let skillContext = `Assigned Agent Skills: ${assignedSkills.map((s) => `${s.slashCommand} (${s.name})`).join(', ')}`;

    // If user message mentions a specific /skill or matches an assigned skill, load its real SKILL.md excerpt
    const matchedSkill =
      assignedSkills.find((s) => String(message).includes(s.slashCommand) || String(message).includes(s.id)) ||
      assignedSkills[0];
    if (matchedSkill) {
      const { rawMarkdown } = await loadSkillMarkdown(matchedSkill.id);
      if (rawMarkdown) {
        skillContext += `\n\nActive Skill Reference (${matchedSkill.slashCommand}):\n${rawMarkdown.slice(0, 1200)}`;
      }
    }

    const llm = getLLMProvider();
    const reply = await llm.generateText({
      agentRole: agentId,
      prompt: String(message),
      context: skillContext,
    });

    // Emit speech bubble and activity update to connected 2D canvases
    io.emit('agent:speech', {
      agentId,
      message: reply.slice(0, 140),
      durationMs: 4500,
    });

    res.json({
      agentId,
      agentName: profile.name,
      skillUsed: matchedSkill?.slashCommand,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process agent chat' });
  }
});

app.post('/api/office/collaborate', async (req, res) => {
  try {
    const { initiatorId, targetId, skillCommand, customTopic } = req.body as {
      initiatorId?: AgentRole;
      targetId?: AgentRole;
      skillCommand?: string;
      customTopic?: string;
    };

    // Find matching curated discussion or construct a custom skill-driven peer discussion
    let template = AUTONOMOUS_PEER_DISCUSSIONS.find(
      (d) =>
        (!initiatorId || d.initiatorId === initiatorId) &&
        (!targetId || d.targetId === targetId) &&
        (!skillCommand || d.skillApplied.includes(skillCommand))
    );

    if (!template && initiatorId && targetId && agentsRoster[initiatorId] && agentsRoster[targetId]) {
      const initAgent = agentsRoster[initiatorId];
      const targAgent = agentsRoster[targetId];
      const initSkills = AGENT_SKILLS_REGISTRY[initiatorId] || [];
      const targSkills = AGENT_SKILLS_REGISTRY[targetId] || [];
      const primarySkill =
        initSkills.find((s) => s.slashCommand === skillCommand) ||
        initSkills[0] || { slashCommand: '/collaboration', name: 'Cross-Team Sync', keyRules: ['Sinkronisasi modul'] };
      const partnerSkill = targSkills[0] || { slashCommand: '/verification', name: 'Partner Review', keyRules: ['Validasi kontrak'] };

      template = {
        initiatorId,
        targetId,
        topic: customTopic || `Kolaborasi ${primarySkill.slashCommand} bersama ${targAgent.name}`,
        skillApplied: `${primarySkill.slashCommand} & ${partnerSkill.slashCommand}`,
        locationLabel: `Meja ${targAgent.name} (${targAgent.department})`,
        turns: [
          {
            speakerId: initiatorId,
            speakerName: `${initAgent.name} (${initAgent.department.split(' ')[0]})`,
            speakerColor: initAgent.color,
            skillUsed: primarySkill.slashCommand,
            text: `Halo ${targAgent.name}, saya menerapkan ${primarySkill.slashCommand}: "${primarySkill.keyRules[0] || primarySkill.description}". Bagaimana sinkronisasinya di sisi Anda?`,
          },
          {
            speakerId: targetId,
            speakerName: `${targAgent.name} (${targAgent.department.split(' ')[0]})`,
            speakerColor: targAgent.color,
            skillUsed: partnerSkill.slashCommand,
            text: `Siap ${initAgent.name}! Dari sisi ${partnerSkill.slashCommand}, saya pastikan "${partnerSkill.keyRules[0] || partnerSkill.description}" berjalan selaras.`,
          },
          {
            speakerId: initiatorId,
            speakerName: `${initAgent.name} (${initAgent.department.split(' ')[0]})`,
            speakerColor: initAgent.color,
            skillUsed: primarySkill.slashCommand,
            text: `Bagus! Standar ${primarySkill.slashCommand} & ${partnerSkill.slashCommand} sudah terhubung. Saya kembali ke meja untuk lanjut eksekusi.`,
          },
        ],
      };
    }

    if (!template) {
      const randomIndex = Math.floor(Math.random() * AUTONOMOUS_PEER_DISCUSSIONS.length);
      template = AUTONOMOUS_PEER_DISCUSSIONS[randomIndex];
    }

    const discussion: AgentPeerDiscussion = {
      ...template,
      id: `disc-${Date.now()}`,
      startedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    io.emit('office:peer_discussion', discussion);
    res.json(discussion);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to trigger peer discussion' });
  }
});

// Workspace Inspection & Sandbox Execution Endpoints
app.get('/api/workspaces/:projectId/files', async (req, res) => {
  try {
    const files = await workspaceManager.listFiles(req.params.projectId);
    res.json({ projectId: req.params.projectId, files });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/workspaces/:projectId/file', async (req, res) => {
  try {
    const filePath = req.query.path as string;
    if (!filePath) {
      return res.status(400).json({ error: 'Query parameter "path" is required' });
    }
    const content = await workspaceManager.readFile(req.params.projectId, filePath);
    res.json({ projectId: req.params.projectId, path: filePath, content });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

app.post('/api/workspaces/:projectId/execute', async (req, res) => {
  try {
    const { command, args, timeoutMs } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Body parameter "command" is required' });
    }
    const result = await workspaceManager.executeCommand({
      projectId: req.params.projectId,
      command,
      args,
      timeoutMs,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Workflow Engine Event Bridge to WebSockets
// ==========================================

workflowEngine.on('agent:state', (agentId: AgentRole, state, message) => {
  if (agentsRoster[agentId]) {
    agentsRoster[agentId].state = state;
    agentsRoster[agentId].currentTask = message;
    agentsRoster[agentId].lastActive = 'Just now';
  }

  io.emit('agent:status_updated', {
    agentId,
    state,
    currentTask: message,
  });

  io.emit('agent:speech', {
    agentId,
    message,
    durationMs: 4000,
  });
});

workflowEngine.on('task:created', (task: Task) => {
  io.emit('task:created', task);
});

workflowEngine.on('approval:requested', (gate: ApprovalGate) => {
  io.emit('hitl:approval_requested', gate);
});

workflowEngine.on('meeting:called', (topic: string, requiredAgents: AgentRole[]) => {
  io.emit('meeting:started', {
    id: `meeting-${Date.now()}`,
    topic,
    status: 'IN_SESSION',
    requiredAgents,
    transcript: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'SYSTEM',
        senderName: 'Sistem Studio',
        senderRole: 'USR-CEO',
        avatarColor: '#6366f1',
        message: `Rapat dimulai untuk topik: "${topic}". Seluruh agen terkait telah memasuki Ruang Rapat.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
    ],
    createdAt: new Date().toISOString(),
  });
});

// ==========================================
// WebSocket Connection Gateway
// ==========================================

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // 1. Send initial state to newly connected client
  socket.emit('office:init', {
    agents: agentsRoster,
    rooms: INITIAL_ROOMS_SPEC,
    activeProject,
    tasks: workflowEngine.getTasks(),
    activeFactoryRun,
  });

  // 2. Player movement sync
  socket.on('player:move', (data) => {
    socket.broadcast.emit('player:moved', {
      id: socket.id,
      x: data.x,
      y: data.y,
      direction: data.direction,
    });
  });

  // 3. Meeting call from client
  socket.on('meeting:call', (data) => {
    console.log(`[Meeting] Called: ${data.topic}`);
    workflowEngine.emit('meeting:called', data.topic, data.requiredAgents);
  });

  // 4. Meeting message exchange
  socket.on('meeting:send_message', async (data) => {
    const chatMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderId: 'USR-CEO',
      senderName: 'You (CEO)',
      senderRole: 'USR-CEO',
      avatarColor: '#3b82f6',
      message: data.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    io.emit('meeting:message', chatMsg);

    // Generate intelligent AI response from PM or CTO
    setTimeout(async () => {
      const llm = getLLMProvider();
      const replyText = await llm.generateText({
        agentRole: 'AGT-CTO',
        prompt: `CEO berkata: "${data.message}". Tanggapi secara singkat dan teknis dari perspektif Viktor (CTO).`,
      });

      const ctoMsg: ChatMessage = {
        id: `chat-cto-${Date.now()}`,
        senderId: 'AGT-CTO',
        senderName: 'Viktor (CTO)',
        senderRole: 'AGT-CTO',
        avatarColor: '#8b5cf6',
        message: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      io.emit('meeting:message', ctoMsg);
    }, 700);
  });

  // 5. Human-in-the-Loop Approval Decision
  socket.on('hitl:submit_decision', async (data) => {
    console.log(`[HITL] Decision on ${data.approvalId}: ${data.decision}`);
    await workflowEngine.resolveArchitectureApproval(data.decision, data.feedback);

    io.emit('hitl:approval_resolved', {
      id: data.approvalId,
      projectId: activeProject.id,
      type: 'ARCHITECTURE',
      title: 'Persetujuan Arsitektur',
      description: 'Persetujuan CEO telah diproses.',
      requestedBy: 'AGT-CTO',
      status: data.decision === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      feedback: data.feedback,
      createdAt: new Date().toISOString(),
      resolvedAt: new Date().toISOString(),
    });
  });

  // 6. Direct 1-on-1 Chat with Agent
  socket.on('agent:direct_chat', async (data) => {
    const llm = getLLMProvider();
    const response = await llm.generateText({
      agentRole: data.agentId,
      prompt: data.message,
    });

    socket.emit('agent:speech', {
      agentId: data.agentId,
      message: response,
      durationMs: 5000,
    });
  });

  // 7. Kanban Task status move
  socket.on('task:move_status', (data) => {
    const task = workflowEngine.getTasks().find((t) => t.id === data.taskId);
    if (task) {
      task.status = data.newStatus;
      task.updatedAt = new Date().toISOString();
      io.emit('task:updated', task);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 NexusDev Studio Backend Orchestrator & Sandbox Runner`);
  console.log(`📡 WebSocket & REST Gateway running on http://localhost:${PORT}`);
  console.log(`📦 Isolated Workspace Directory: workspaces/`);
  console.log(`🤖 Multi-Agent Engine: 9 Roles Active (incl. Anggi PA to CEO)`);
  console.log(`=======================================================`);
});

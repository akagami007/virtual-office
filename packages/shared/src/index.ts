/**
 * NexusDev Virtual Studio — Shared Core Types & Contracts
 */

// ==========================================
// 1. Agent Roles & States
// ==========================================

export type AgentRole =
  | 'USR-CEO'
  | 'AGT-CTO'
  | 'AGT-PM'
  | 'AGT-UIUX'
  | 'AGT-FE'
  | 'AGT-BE'
  | 'AGT-MOB'
  | 'AGT-QA'
  | 'AGT-OPS'
  | 'AGT-PA';

export type AgentState =
  | 'IDLE'
  | 'NAVIGATING'
  | 'THINKING'
  | 'CODING'
  | 'REVIEWING'
  | 'TESTING'
  | 'WAITING_APPROVAL'
  | 'ERROR';

export type Department =
  | 'Executive'
  | 'Management'
  | 'Architecture'
  | 'Product & Design'
  | 'Web Engineering'
  | 'Mobile Engineering'
  | 'Quality Assurance'
  | 'DevOps & Infrastructure';

export interface SpatialPoint {
  x: number;
  y: number;
}

export interface AgentProfile {
  id: AgentRole;
  name: string;
  title: string;
  department: Department;
  color: string;
  avatarSprite: string;
  deskPosition: SpatialPoint;
  meetingPosition: SpatialPoint;
  state: AgentState;
  currentTask?: string;
  skills: string[];
  bio: string;
  activeSnippet?: string;
  lastActive: string;
}

// ==========================================
// 2. Spatial Rooms & Zones
// ==========================================

export type RoomId =
  | 'boardroom'
  | 'design_studio'
  | 'web_bay'
  | 'mobile_bay'
  | 'qa_lab'
  | 'devops_room'
  | 'ceo_office'
  | 'breakroom';

export interface RoomZone {
  id: RoomId;
  name: string;
  label: string;
  description: string;
  color: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  center: SpatialPoint;
  assignedRoles: AgentRole[];
}

export interface PlayerPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  target?: SpatialPoint;
}

// ==========================================
// 3. Project & Task Backlog (Kanban)
// ==========================================

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'
  | 'ESCALATED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: AgentRole;
  status: TaskStatus;
  priority: TaskPriority;
  iteration: number;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'TESTING'
  | 'COMPLETED'
  | 'PAUSED';

export type ProjectPlatform = 'WEB' | 'MOBILE' | 'FULLSTACK';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  platform: ProjectPlatform;
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. Meeting & Human-in-the-Loop (HITL)
// ==========================================

export type MeetingStatus = 'IDLE' | 'CALLING' | 'IN_SESSION' | 'CONCLUDED';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: AgentRole;
  avatarColor: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

export type ApprovalType =
  | 'ARCHITECTURE'
  | 'DATABASE_MIGRATION'
  | 'STAGING_DEPLOY'
  | 'BUG_ESCALATION';

export interface ApprovalGate {
  id: string;
  projectId: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedBy: AgentRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  diffPayload?: {
    filename?: string;
    oldValue?: string;
    newValue?: string;
    details?: string;
  };
  feedback?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface MeetingSession {
  id: string;
  topic: string;
  status: MeetingStatus;
  summary?: string;
  requiredAgents: AgentRole[];
  transcript: ChatMessage[];
  pendingApproval?: ApprovalGate;
  createdAt: string;
}

// ==========================================
// 5. WebSocket Real-time Event Map
// ==========================================

export interface AgentSkillSpec {
  id: string;
  slashCommand: string;
  name: string;
  description: string;
  skillPath: string;
  keyRules: string[];
}

export interface PeerDialogueTurn {
  speakerId: AgentRole;
  speakerName: string;
  speakerColor: string;
  skillUsed?: string;
  text: string;
}

export interface AgentPeerDiscussion {
  id: string;
  initiatorId: AgentRole;
  targetId: AgentRole;
  topic: string;
  skillApplied: string;
  locationLabel: string;
  isLoungeBreak?: boolean;
  turns: PeerDialogueTurn[];
  startedAt: string;
}

export interface ExecutiveScheduleItem {
  id: string;
  time: string;
  title: string;
  category: 'STANDUP' | 'ARCHITECTURE' | 'CLIENT' | 'RELEASE' | 'REVIEW';
  participants: AgentRole[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  notes: string;
  preparedBy: AgentRole;
}

export interface DepartmentExecutiveReport {
  id: string;
  agentId: AgentRole;
  department: Department;
  headline: string;
  progressPercent: number;
  health: 'ON_TRACK' | 'NEEDS_ATTENTION' | 'READY_FOR_SIGN_OFF';
  metricsLabel: string;
  keyDeliverables: string[];
  activeSkill: string;
  updatedAt: string;
}

export interface ExecutiveDashboardData {
  briefingSummary: string;
  schedule: ExecutiveScheduleItem[];
  departmentReports: DepartmentExecutiveReport[];
  kpis: {
    sprintVelocity: string;
    codeCoverage: string;
    pipelineStatus: string;
    activeBlockers: number;
    clientSatisfaction: string;
  };
}

export type SoftwareFactoryStepStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'WAITING_CEO'
  | 'COMPLETED';

export interface SoftwareFactoryStep {
  id: string;
  phase: 1 | 2;
  agentId: AgentRole;
  partnerId?: AgentRole;
  title: string;
  skillUsed: string;
  status: SoftwareFactoryStepStatus;
  outputFile?: string;
  summary: string;
  timestamp?: string;
}

export type SoftwareFactoryStatus =
  | 'IDLE'
  | 'PHASE_1_PLANNING'
  | 'WAITING_CEO_GATE_1'
  | 'PHASE_2_BUILDING'
  | 'WAITING_CEO_GATE_2'
  | 'RELEASED';

export interface SoftwareFactoryRun {
  id: string;
  projectId: string;
  appName: string;
  prompt: string;
  templateType: 'POS_CAFE' | 'CRM_PIPELINE' | 'ANALYTICS_DASHBOARD' | 'ECOMMERCE_STORE' | 'CUSTOM_WEB_APP';
  status: SoftwareFactoryStatus;
  currentStepIndex: number;
  steps: SoftwareFactoryStep[];
  architectureSummary: string;
  uiDesignSummary: string;
  generatedFiles: Array<{
    path: string;
    author: AgentRole;
    skill: string;
    description: string;
  }>;
  previewHtml: string;
  revisionCount: number;
  ceoFeedbackHistory: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServerToClientEvents {
  'office:init': (data: {
    agents: Record<AgentRole, AgentProfile>;
    rooms: RoomZone[];
    activeProject: Project;
    tasks: Task[];
    activeMeeting?: MeetingSession;
    activeFactoryRun?: SoftwareFactoryRun | null;
  }) => void;
  'player:moved': (data: { id: string; x: number; y: number; direction: string }) => void;
  'agent:status_updated': (data: {
    agentId: AgentRole;
    state: AgentState;
    currentTask?: string;
    activeSnippet?: string;
  }) => void;
  'agent:speech': (data: { agentId: AgentRole; message: string; durationMs: number }) => void;
  'office:peer_discussion': (discussion: AgentPeerDiscussion) => void;
  'factory:updated': (run: SoftwareFactoryRun) => void;
  'meeting:started': (meeting: MeetingSession) => void;
  'meeting:message': (message: ChatMessage) => void;
  'meeting:ended': (data: { meetingId: string; summary?: string }) => void;
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'hitl:approval_requested': (approval: ApprovalGate) => void;
  'hitl:approval_resolved': (approval: ApprovalGate) => void;
}

export interface ClientToServerEvents {
  'player:move': (data: { x: number; y: number; direction: string }) => void;
  'meeting:call': (data: { topic: string; requiredAgents: AgentRole[] }) => void;
  'meeting:send_message': (data: { message: string }) => void;
  'meeting:conclude': (data: { meetingId: string }) => void;
  'hitl:submit_decision': (data: {
    approvalId: string;
    decision: 'APPROVE' | 'REJECT';
    feedback?: string;
  }) => void;
  'agent:direct_chat': (data: { agentId: AgentRole; message: string }) => void;
  'office:trigger_discussion': (data: { initiatorId?: AgentRole; targetId?: AgentRole }) => void;
  'task:move_status': (data: { taskId: string; newStatus: TaskStatus }) => void;
}

// ==========================================
// 6. Default Office Agents Roster
// ==========================================

export const INITIAL_AGENTS_ROSTER: Record<AgentRole, AgentProfile> = {
  'USR-CEO': {
    id: 'USR-CEO',
    name: 'You (CEO)',
    title: 'Product Owner & Executive Sponsor',
    department: 'Executive',
    color: '#3B82F6', // Blue
    avatarSprite: 'avatar_ceo',
    deskPosition: { x: 355, y: 555 },
    meetingPosition: { x: 675, y: 250 },
    state: 'IDLE',
    currentTask: 'Supervising Studio Operations',
    skills: ['/idea-refine', '/interview-me', '/spec-driven-development'],
    bio: 'Pemberi brief proyek dan penentu arah strategis produk di NexusDev Studio.',
    lastActive: 'Just now',
  },
  'AGT-CTO': {
    id: 'AGT-CTO',
    name: 'Viktor',
    title: 'CTO & Principal Architect',
    department: 'Architecture',
    color: '#8B5CF6', // Purple
    avatarSprite: 'avatar_cto',
    deskPosition: { x: 142, y: 335 },
    meetingPosition: { x: 760, y: 185 },
    state: 'REVIEWING',
    currentTask: 'Reviewing System Scalability & Security Gates',
    skills: [
      '/code-review-and-quality',
      '/security-and-hardening',
      '/doubt-driven-development',
      '/accidental-data-loss-prevention',
      '/deprecation-and-migration',
      '/code-simplification',
    ],
    bio: 'Menjaga integritas arsitektur kode, standar keamanan, adversarial review, dan mencegah kehilangan data produksi.',
    activeSnippet: `// Viktor: /security-and-hardening & /code-review-and-quality
export function validateArchitecture(req: ProjectSpec) {
  assert(req.security.tls13, "TLS 1.3 Mandatory");
  assert(req.db.hasBackupGuard, "/accidental-data-loss-prevention verified");
  return { approved: true };
}`,
    lastActive: '1m ago',
  },
  'AGT-PM': {
    id: 'AGT-PM',
    name: 'Aria',
    title: 'Project Manager & Scrum Master',
    department: 'Management',
    color: '#EC4899', // Pink
    avatarSprite: 'avatar_pm',
    deskPosition: { x: 185, y: 210 },
    meetingPosition: { x: 805, y: 185 },
    state: 'THINKING',
    currentTask: 'Managing Sprint Backlog & Dependency Mapping',
    skills: [
      '/planning-and-task-breakdown',
      '/spec-driven-development',
      '/idea-refine',
      '/interview-me',
      '/documentation-and-adrs',
      '/incremental-implementation',
    ],
    bio: 'Mengatur alur sprint, menyusun spesifikasi sebelum koding, memecah task menjadi iterasi kecil, dan mendokumentasikan ADR.',
    activeSnippet: `# Aria: /planning-and-task-breakdown & /spec-driven-development
- [x] Epic 1: Spec & Architecture ADR Sign-off
- [ ] Epic 2: Autonomous Agent Interaction Engine
- [ ] Epic 3: CI/CD Quality Gate Enforcement`,
    lastActive: '2m ago',
  },
  'AGT-UIUX': {
    id: 'AGT-UIUX',
    name: 'Kael',
    title: 'Lead UI/UX Product Designer',
    department: 'Product & Design',
    color: '#F59E0B', // Amber
    avatarSprite: 'avatar_uiux',
    deskPosition: { x: 100, y: 210 },
    meetingPosition: { x: 850, y: 185 },
    state: 'CODING',
    currentTask: 'Generating Design Tokens & Accessibility Audit',
    skills: [
      '/antislop-ui',
      '/antislop-human',
      '/antislop-layoutmobile',
      '/antislop-copywriting',
      '/generative_ui',
      '/antislop',
    ],
    bio: 'Merancang antarmuka berkarakter tinggi bebas AI-slop, kontras WCAG human-friendly, mikro-kopi tajam, dan layout responsif.',
    activeSnippet: `/* Kael: /antislop-ui & /antislop-human WCAG 2.1 AA */
:root {
  --primary-brand: #6366f1;
  --office-floor-tile: #1e293b;
  --focus-ring-accessible: 2px solid #38bdf8;
}`,
    lastActive: '30s ago',
  },
  'AGT-FE': {
    id: 'AGT-FE',
    name: 'Nadia',
    title: 'Senior Frontend Engineer (Next.js)',
    department: 'Web Engineering',
    color: '#10B981', // Emerald
    avatarSprite: 'avatar_fe',
    deskPosition: { x: 542, y: 210 },
    meetingPosition: { x: 715, y: 315 },
    state: 'CODING',
    currentTask: 'Implementing Next.js App Router & Phaser Viewport',
    skills: [
      '/frontend-ui-engineering',
      '/performance-optimization',
      '/browser-testing-with-devtools',
      '/building-data-apps',
      '/source-driven-development',
    ],
    bio: 'Membangun UI kelas produksi dengan Next.js 15, optimasi Core Web Vitals, dan verifikasi runtime via Chrome DevTools.',
    activeSnippet: `// Nadia: /frontend-ui-engineering & /performance-optimization
export default function OfficeCanvas() {
  const { phaserRef } = usePhaserStudio();
  return <div ref={phaserRef} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl" />;
}`,
    lastActive: 'Just now',
  },
  'AGT-BE': {
    id: 'AGT-BE',
    name: 'Bima',
    title: 'Senior Backend & Data Engineer',
    department: 'Web Engineering',
    color: '#06B6D4', // Cyan
    avatarSprite: 'avatar_be',
    deskPosition: { x: 542, y: 335 },
    meetingPosition: { x: 760, y: 315 },
    state: 'CODING',
    currentTask: 'Constructing REST/GraphQL API & Data Pipelines',
    skills: [
      '/api-and-interface-design',
      '/schema-mapping',
      '/bigquery-sql',
      '/gcp-data-pipelines',
      '/dbt-bigquery',
      '/data-autocleaning',
    ],
    bio: 'Merancang kontrak API stabil, pemetaan skema database, optimasi query SQL/BigQuery, dan orkestrasi data pipeline.',
    activeSnippet: `// Bima: /api-and-interface-design & /schema-mapping
@SubscribeMessage('office:peer_discussion')
handlePeerSync(@MessageBody() payload: AgentPeerDiscussion) {
  return this.orchestrator.broadcastDiscussion(payload);
}`,
    lastActive: '45s ago',
  },
  'AGT-MOB': {
    id: 'AGT-MOB',
    name: 'Raka',
    title: 'Senior Mobile Engineer (Android & iOS)',
    department: 'Mobile Engineering',
    color: '#6366F1', // Indigo
    avatarSprite: 'avatar_mob',
    deskPosition: { x: 352, y: 250 },
    meetingPosition: { x: 805, y: 315 },
    state: 'CODING',
    currentTask: 'Building Expo Native Bridges & Responsive Touch Targets',
    skills: [
      '/antislop-layoutmobile',
      '/incremental-implementation',
      '/source-driven-development',
      '/performance-optimization',
      '/frontend-ui-engineering',
    ],
    bio: 'Membangun aplikasi mobile lintas platform iOS & Android dengan tap target presisi, layout adaptif, dan pengiriman inkremental.',
    activeSnippet: `// Raka: /antislop-layoutmobile & /incremental-implementation
export function MobileDashboard() {
  return (
    <View style={{ minHeight: 48, paddingHorizontal: 16 }}>
      <Text>Nexus Studio Native Viewport</Text>
    </View>
  );
}`,
    lastActive: '1m ago',
  },
  'AGT-QA': {
    id: 'AGT-QA',
    name: 'Sinta',
    title: 'Lead QA & Automation Engineer',
    department: 'Quality Assurance',
    color: '#EF4444', // Red
    avatarSprite: 'avatar_qa',
    deskPosition: { x: 1045, y: 185 },
    meetingPosition: { x: 850, y: 315 },
    state: 'TESTING',
    currentTask: 'Executing TDD Suite & Root-Cause Triage',
    skills: [
      '/test-driven-development',
      '/debugging-and-error-recovery',
      '/browser-testing-with-devtools',
      '/code-review-and-quality',
      '/doubt-driven-development',
    ],
    bio: 'Menegakkan siklus Red-Green-Refactor TDD, investigasi root-cause sistematis (Stop-the-Line), dan pengujian browser nyata.',
    activeSnippet: `// Sinta: /test-driven-development & /debugging-and-error-recovery
test('E2E: Typing WASD in chat input does not move character', async ({ page }) => {
  await page.click('[data-testid="agent-chat-input"]');
  await page.keyboard.type('wasd schedule');
  expect(await getPlayerMoved()).toBe(false);
});`,
    lastActive: '15s ago',
  },
  'AGT-OPS': {
    id: 'AGT-OPS',
    name: 'Dion',
    title: 'Senior DevOps & Cloud Engineer',
    department: 'DevOps & Infrastructure',
    color: '#14B8A6', // Teal
    avatarSprite: 'avatar_ops',
    deskPosition: { x: 1045, y: 345 },
    meetingPosition: { x: 885, y: 250 },
    state: 'IDLE',
    currentTask: 'Automating Quality Gates & Observability Pipelines',
    skills: [
      '/ci-cd-and-automation',
      '/shipping-and-launch',
      '/observability-and-instrumentation',
      '/git-workflow-and-versioning',
      '/google-cloud-auth-verification',
      '/enforcing-resource-attribution',
    ],
    bio: 'Mengotomatisasi quality gates CI/CD (Shift-Left), instrumentasi logging/metrics produksi, manajemen rilis, dan keamanan Cloud.',
    activeSnippet: `# Dion: /ci-cd-and-automation Quality Gate Pipeline
jobs:
  quality-gate:
    steps:
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test -- --coverage
      - run: npm run build`,
    lastActive: '4m ago',
  },
  'AGT-PA': {
    id: 'AGT-PA',
    name: 'Anggi',
    title: 'Executive Personal Assistant to CEO',
    department: 'Executive',
    color: '#F43F5E', // Rose
    avatarSprite: 'avatar_pa',
    deskPosition: { x: 475, y: 555 },
    meetingPosition: { x: 715, y: 185 },
    state: 'IDLE',
    currentTask: 'Mengatur Kalender Eksekutif & Koordinasi Antar-Divisi CEO',
    skills: [
      '/automation',
      '/context-engineering',
      '/interview-me',
      '/planning-and-task-breakdown',
      '/documentation-and-adrs',
    ],
    bio: 'Asisten pribadi eksekutif CEO yang mahir mengatur jadwal otomatis, menyelaraskan konteks antar-divisi, menyaring prioritas, dan mencatat notulensi keputusan.',
    activeSnippet: `// Anggi: /automation & /context-engineering Executive Schedule
export const todayAgenda = {
  priorities: [
    { time: '09:00', title: 'Daily Standup & Sync bersama Aria (/planning-and-task-breakdown)' },
    { time: '11:00', title: 'Security & Architecture Gate bersama Viktor (/security-and-hardening)' },
    { time: '14:00', title: 'CI/CD Release Readiness bersama Dion (/ci-cd-and-automation)' }
  ],
  status: 'Seluruh jadwal & pengingat otomatis CEO aktif.'
};`,
    lastActive: 'Just now',
  },
};

// ==========================================
// 6B. Official Agent Skills Registry (Mapped to Local SKILL.md)
// ==========================================

export const AGENT_SKILLS_REGISTRY: Record<AgentRole, AgentSkillSpec[]> = {
  'USR-CEO': [
    {
      id: 'idea-refine',
      slashCommand: '/idea-refine',
      name: 'Idea Refinement & Stress-Testing',
      description: 'Menajamkan ide mentah menjadi konsep produk yang matang melalui pemikiran divergen dan konvergen.',
      skillPath: '/Users/akagami/.gemini/config/skills/idea-refine/SKILL.md',
      keyRules: ['Eksplorasi alternatif sebelum konvergen ke satu solusi', 'Uji asumsi bisnis dan teknis sejak dini'],
    },
    {
      id: 'interview-me',
      slashCommand: '/interview-me',
      name: 'Deep Intent Discovery Interview',
      description: 'Menggali kebutuhan strategis satu per satu hingga mencapai kejelasan penuh sebelum eksekusi.',
      skillPath: '/Users/akagami/.gemini/config/skills/interview-me/SKILL.md',
      keyRules: ['Ajukan pertanyaan terfokus satu per satu', 'Hilangkan ambiguitas sebelum menulis spesifikasi'],
    },
    {
      id: 'spec-driven-development',
      slashCommand: '/spec-driven-development',
      name: 'Spec-Driven Product Ownership',
      description: 'Menetapkan spesifikasi produk sebagai sumber kebenaran utama sebelum implementasi dimulai.',
      skillPath: '/Users/akagami/.gemini/config/skills/spec-driven-development/SKILL.md',
      keyRules: ['Tulis spesifikasi dan kriteria penerimaan sebelum kode ditulis', 'Pastikan seluruh tim mengacu pada kontrak spec yang sama'],
    },
  ],
  'AGT-CTO': [
    {
      id: 'code-review-and-quality',
      slashCommand: '/code-review-and-quality',
      name: 'Multi-Axis Code Review & Quality Gate',
      description: 'Evaluasi perubahan kode pada 5 dimensi: kebenaran, keterbacaan, arsitektur, keamanan, dan performa.',
      skillPath: '/Users/akagami/.gemini/config/skills/code-review-and-quality/SKILL.md',
      keyRules: ['Periksa kebenaran logika dan batas modul sebelum merge', 'Tolak kompromi kualitas arsitektur demi jalan pintas sementara'],
    },
    {
      id: 'security-and-hardening',
      slashCommand: '/security-and-hardening',
      name: 'Security Hardening & Threat Modeling',
      description: 'Memperkuat kode terhadap kerentanan injeksi, autentikasi, kebocoran rahasia, dan integrasi pihak ketiga.',
      skillPath: '/Users/akagami/.gemini/config/skills/security-and-hardening/SKILL.md',
      keyRules: ['Validasi dan sanitasi seluruh input yang tidak tepercaya', 'Terapkan prinsip least-privilege dan enkripsi ketat'],
    },
    {
      id: 'doubt-driven-development',
      slashCommand: '/doubt-driven-development',
      name: 'Adversarial Doubt-Driven Review',
      description: 'Menguji setiap keputusan arsitektur secara kritis dan adversarial sebelum disetujui ke produksi.',
      skillPath: '/Users/akagami/.gemini/config/skills/doubt-driven-development/SKILL.md',
      keyRules: ['Verifikasi klaim keberhasilan dengan bukti nyata', 'Uji skenario terburuk sebelum menyetujui desain'],
    },
    {
      id: 'accidental-data-loss-prevention',
      slashCommand: '/accidental-data-loss-prevention',
      name: 'Accidental Data Loss Prevention Guard',
      description: 'Mencegah operasi destruktif (DROP, TRUNCATE, penghapusan bucket/resource produksi) tanpa verifikasi eksplisit.',
      skillPath: '/Users/akagami/.gemini/config/skills/accidental-data-loss-prevention/SKILL.md',
      keyRules: ['STOP dan minta konfirmasi eksplisit CEO sebelum operasi destruktif', 'Wajibkan rencana backup sebelum migrasi skema'],
    },
    {
      id: 'deprecation-and-migration',
      slashCommand: '/deprecation-and-migration',
      name: 'System Deprecation & Safe Migration',
      description: 'Mengelola transisi sistem lama ke arsitektur baru tanpa downtime atau regresi kontrak.',
      skillPath: '/Users/akagami/.gemini/config/skills/deprecation-and-migration/SKILL.md',
      keyRules: ['Sediakan jalur migrasi bertahap dan backward-compatibility', 'Hapus kode usang hanya setelah konsumen bermigrasi penuh'],
    },
    {
      id: 'code-simplification',
      slashCommand: '/code-simplification',
      name: 'Architectural Code Simplification',
      description: 'Menyederhanakan kompleksitas kode yang tidak perlu tanpa mengubah perilaku eksternal.',
      skillPath: '/Users/akagami/.gemini/config/skills/code-simplification/SKILL.md',
      keyRules: ['Kurangi abstraksi berlapis yang menyulitkan pemeliharaan', 'Utamakan kejelasan alur daripada kode yang terlalu rumit'],
    },
  ],
  'AGT-PM': [
    {
      id: 'planning-and-task-breakdown',
      slashCommand: '/planning-and-task-breakdown',
      name: 'Sprint Planning & Task Breakdown',
      description: 'Memecah spesifikasi besar menjadi daftar tugas terurut yang dapat dikerjakan secara paralel maupun bertahap.',
      skillPath: '/Users/akagami/.gemini/config/skills/planning-and-task-breakdown/SKILL.md',
      keyRules: ['Petakan dependensi antar-tim (FE, BE, Mobile, QA, DevOps)', 'Buat ukuran task yang terukur dan dapat diverifikasi'],
    },
    {
      id: 'spec-driven-development',
      slashCommand: '/spec-driven-development',
      name: 'Spec-Driven Requirement Engineering',
      description: 'Menyusun spesifikasi fungsional dan kriteria penerimaan yang jelas sebelum sprint dimulai.',
      skillPath: '/Users/akagami/.gemini/config/skills/spec-driven-development/SKILL.md',
      keyRules: ['Pastikan setiap user story memiliki acceptance criteria yang jelas', 'Sinkronkan perubahan scope ke dokumen spec'],
    },
    {
      id: 'idea-refine',
      slashCommand: '/idea-refine',
      name: 'Product Concept Refinement',
      description: 'Mengubah ide fitur menjadi rencana produk yang tajam dan siap dieksekusi lintas divisi.',
      skillPath: '/Users/akagami/.gemini/config/skills/idea-refine/SKILL.md',
      keyRules: ['Identifikasi risiko jadwal dan batasan teknis sejak awal', 'Fokuskan cakupan MVP agar cepat memberikan nilai'],
    },
    {
      id: 'interview-me',
      slashCommand: '/interview-me',
      name: 'Stakeholder Requirement Interview',
      description: 'Mewawancarai CEO atau pemilik produk untuk menggali kebutuhan tersirat secara terstruktur.',
      skillPath: '/Users/akagami/.gemini/config/skills/interview-me/SKILL.md',
      keyRules: ['Klarifikasi asumsi tersembunyi sebelum sprint berjalan', 'Capai keyakinan 95% atas tujuan fitur'],
    },
    {
      id: 'documentation-and-adrs',
      slashCommand: '/documentation-and-adrs',
      name: 'Architecture Decision Records (ADR)',
      description: 'Mencatat keputusan arsitektur, perubahan kontrak, dan dokumentasi sprint agar konteks tim selalu terjaga.',
      skillPath: '/Users/akagami/.gemini/config/skills/documentation-and-adrs/SKILL.md',
      keyRules: ['Catat konteks, opsi yang dipertimbangkan, dan alasan keputusan', 'Perbarui dokumentasi bersamaan dengan perubahan fitur'],
    },
    {
      id: 'incremental-implementation',
      slashCommand: '/incremental-implementation',
      name: 'Incremental Delivery Management',
      description: 'Memastikan fitur dikirimkan dalam potongan inkremental yang selalu bekerja dan teruji.',
      skillPath: '/Users/akagami/.gemini/config/skills/incremental-implementation/SKILL.md',
      keyRules: ['Hindari PR raksasa yang sulit direview', 'Setiap tahapan inkremental harus lulus build dan test'],
    },
  ],
  'AGT-UIUX': [
    {
      id: 'antislop-ui',
      slashCommand: '/antislop-ui',
      name: 'Anti-Slop Visual & UI Design',
      description: 'Membangun antarmuka visual dengan tipografi, warna, hierarki, dan komponen berkarakter tinggi bebas kesan generik AI.',
      skillPath: '/Users/akagami/.gemini/config/skills/antislop-ui/SKILL.md',
      keyRules: ['Hindari gradien klise dan tata letak template generik', 'Gunakan hierarki ruang, ritme tipografi, dan aksen warna yang presisi'],
    },
    {
      id: 'antislop-human',
      slashCommand: '/antislop-human',
      name: 'Human Accessibility & Contrast Audit',
      description: 'Memastikan rasio kontras warna WCAG, navigasi keyboard, focus ring, dan state interaktif ramah pengguna nyata.',
      skillPath: '/Users/akagami/.gemini/config/skills/antislop-human/SKILL.md',
      keyRules: ['Pastikan kontras teks memenuhi standar keterbacaan tinggi', 'Sediakan state hover, focus, loading, dan error yang jelas'],
    },
    {
      id: 'antislop-layoutmobile',
      slashCommand: '/antislop-layoutmobile',
      name: 'Responsive Reflow & Mobile Layout',
      description: 'Merancang grid responsif dari layar ponsel hingga desktop tanpa overflow dan dengan tap target ergonomis.',
      skillPath: '/Users/akagami/.gemini/config/skills/antislop-layoutmobile/SKILL.md',
      keyRules: ['Pastikan ukuran tap target minimal 44x44px pada perangkat sentuh', 'Cegah horizontal scroll dan tumpang-tindih elemen'],
    },
    {
      id: 'antislop-copywriting',
      slashCommand: '/antislop-copywriting',
      name: 'Sharp UX Microcopy & Tone',
      description: 'Menulis label tombol, pesan status, dan headline yang lugas, manusiawi, dan bebas basa-basi AI.',
      skillPath: '/Users/akagami/.gemini/config/skills/antislop-copywriting/SKILL.md',
      keyRules: ['Gunakan kalimat aktif, ringkas, dan jelas tujuannya', 'Hindari kata-kata hiperbola kosong'],
    },
    {
      id: 'generative_ui',
      slashCommand: '/generative_ui',
      name: 'Interactive Generative UI Widgets',
      description: 'Merancang komponen interaktif, visualisasi data, dan kontrol dinamis yang kaya secara visual.',
      skillPath: '/Users/akagami/.gemini/antigravity/builtin/skills/generative_ui/SKILL.md',
      keyRules: ['Visualisasikan state kompleks menjadi kontrol interaktif yang intuitif', 'Pertahankan konsistensi tema gelap studio'],
    },
  ],
  'AGT-FE': [
    {
      id: 'frontend-ui-engineering',
      slashCommand: '/frontend-ui-engineering',
      name: 'Production Frontend UI Engineering',
      description: 'Mengimplementasikan komponen React/Next.js berkualitas produksi dengan manajemen state dan arsitektur bersih.',
      skillPath: '/Users/akagami/.gemini/config/skills/frontend-ui-engineering/SKILL.md',
      keyRules: ['Pisahkan state UI lokal dan state sinkronisasi real-time dengan rapi', 'Tangani loading, empty, dan error boundary secara menyeluruh'],
    },
    {
      id: 'performance-optimization',
      slashCommand: '/performance-optimization',
      name: 'Core Web Vitals & Render Optimization',
      description: 'Mengoptimalkan waktu muat, mencegah re-render berlebih, dan menjaga kelancaran 60fps pada Canvas & React.',
      skillPath: '/Users/akagami/.gemini/config/skills/performance-optimization/SKILL.md',
      keyRules: ['Cegah re-instansiasi WebGL/Phaser pada siklus render React', 'Optimalkan ukuran bundle dan lazy-loading komponen berat'],
    },
    {
      id: 'browser-testing-with-devtools',
      slashCommand: '/browser-testing-with-devtools',
      name: 'Real Browser DevTools Verification',
      description: 'Memeriksa DOM, console error, network request, dan performa langsung di browser nyata.',
      skillPath: '/Users/akagami/.gemini/config/skills/browser-testing-with-devtools/SKILL.md',
      keyRules: ['Verifikasi 0 console error dan 0 network failure di runtime', 'Inspeksi elemen CSS dan layout secara langsung'],
    },
    {
      id: 'building-data-apps',
      slashCommand: '/building-data-apps',
      name: 'Interactive Data Dashboard & Apps',
      description: 'Membangun aplikasi web dan dashboard interaktif yang terhubung dengan sumber data real-time.',
      skillPath: '/Users/akagami/.gemini/config/skills/building-data-apps/SKILL.md',
      keyRules: ['Sajikan metrik dan telemetri secara real-time dan mudah dibaca', 'Integrasikan kontrol filter dan aksi langsung'],
    },
    {
      id: 'source-driven-development',
      slashCommand: '/source-driven-development',
      name: 'Official Source-Driven Implementation',
      description: 'Mendasarkan setiap implementasi API framework (Next.js 15, React 19, Phaser 3) pada dokumentasi resmi terbaru.',
      skillPath: '/Users/akagami/.gemini/config/skills/source-driven-development/SKILL.md',
      keyRules: ['Hindari pola deprecated dari versi framework lama', 'Ikuti kontrak resmi API library yang digunakan'],
    },
  ],
  'AGT-BE': [
    {
      id: 'api-and-interface-design',
      slashCommand: '/api-and-interface-design',
      name: 'Stable API & Contract Design',
      description: 'Merancang kontrak REST, GraphQL, WebSocket, dan batas modul yang konsisten dan backward-compatible.',
      skillPath: '/Users/akagami/.gemini/config/skills/api-and-interface-design/SKILL.md',
      keyRules: ['Definisikan skema input/output dan kode status error secara eksplisit', 'Jaga konsistensi kontrak antara Backend, Frontend, dan Mobile'],
    },
    {
      id: 'schema-mapping',
      slashCommand: '/schema-mapping',
      name: 'Database & Data Schema Mapping',
      description: 'Menganalisis, memetakan, dan mendokumentasikan transformasi antara skema sumber dan target secara presisi.',
      skillPath: '/Users/akagami/.gemini/config/skills/schema-mapping/SKILL.md',
      keyRules: ['Pastikan integritas tipe data dan relasi kunci asing', 'Dokumentasikan aturan transformasi dan default value'],
    },
    {
      id: 'bigquery-sql',
      slashCommand: '/bigquery-sql',
      name: 'High-Efficiency SQL & Query Tuning',
      description: 'Optimasi query SQL dan analitik data berkecepatan tinggi serta hemat biaya.',
      skillPath: '/Users/akagami/.gemini/config/skills/bigquery-sql/SKILL.md',
      keyRules: ['Gunakan partisi, indeks, dan proyeksi kolom spesifik (hindari SELECT *)', 'Optimalkan join dan agregasi skala besar'],
    },
    {
      id: 'gcp-data-pipelines',
      slashCommand: '/gcp-data-pipelines',
      name: 'Cloud Data Pipeline Architecture',
      description: 'Membangun dan mengorkestrasi pipeline ingest serta transformasi data yang andal.',
      skillPath: '/Users/akagami/.gemini/config/skills/gcp-data-pipelines/SKILL.md',
      keyRules: ['Pastikan idempotensi dan penanganan retry pada setiap tahap pipeline', 'Pantau SLA dan kualitas data masuk'],
    },
    {
      id: 'data-autocleaning',
      slashCommand: '/data-autocleaning',
      name: 'Automated Data Quality & Cleaning',
      description: 'Pembersihan otomatis, normalisasi, dan validasi kualitas data sebelum masuk ke lapisan aplikasi.',
      skillPath: '/Users/akagami/.gemini/config/skills/data-autocleaning/SKILL.md',
      keyRules: ['Deteksi anomali, duplikasi, dan nilai null sejak pintu masuk API', 'Standarisasi format timestamp dan string'],
    },
  ],
  'AGT-MOB': [
    {
      id: 'antislop-layoutmobile',
      slashCommand: '/antislop-layoutmobile',
      name: 'Mobile Ergonomics & Reflow Engineering',
      description: 'Memastikan tata letak mobile iOS & Android responsif, bebas overflow, dan memiliki area sentuh nyaman.',
      skillPath: '/Users/akagami/.gemini/config/skills/antislop-layoutmobile/SKILL.md',
      keyRules: ['Optimalkan navigasi satu tangan (thumb zone) dan safe-area', 'Pastikan transisi orientasi dan ukuran layar berjalan mulus'],
    },
    {
      id: 'incremental-implementation',
      slashCommand: '/incremental-implementation',
      name: 'Incremental Mobile Feature Delivery',
      description: 'Membangun modul native dan lintas-platform secara bertahap dengan verifikasi simulator di setiap langkah.',
      skillPath: '/Users/akagami/.gemini/config/skills/incremental-implementation/SKILL.md',
      keyRules: ['Uji setiap komponen layar pada viewport iOS dan Android secara inkremental', 'Jaga kestabilan bridge native'],
    },
    {
      id: 'performance-optimization',
      slashCommand: '/performance-optimization',
      name: 'Mobile Frame-Rate & Memory Optimization',
      description: 'Menjaga kelancaran animasi 60fps dan efisiensi memori pada perangkat Android dan iOS.',
      skillPath: '/Users/akagami/.gemini/config/skills/performance-optimization/SKILL.md',
      keyRules: ['Minimalkan beban thread UI utama dan optimalkan daftar panjang', 'Kurangi ukuran aset gambar dan bundle aplikasi'],
    },
    {
      id: 'source-driven-development',
      slashCommand: '/source-driven-development',
      name: 'Expo & Flutter Official SDK Patterns',
      description: 'Menggunakan API resmi terbaru dari React Native, Expo SDK, dan Flutter tanpa pola usang.',
      skillPath: '/Users/akagami/.gemini/config/skills/source-driven-development/SKILL.md',
      keyRules: ['Ikuti panduan resmi platform iOS Human Interface & Material Design 3', 'Gunakan modul SDK terverifikasi'],
    },
  ],
  'AGT-QA': [
    {
      id: 'test-driven-development',
      slashCommand: '/test-driven-development',
      name: 'Test-Driven Development (Red-Green-Refactor)',
      description: 'Menulis pengujian yang gagal terlebih dahulu untuk membuktikan bug atau spesifikasi, lalu memverifikasi perbaikannya.',
      skillPath: '/Users/akagami/.gemini/config/skills/test-driven-development/SKILL.md',
      keyRules: ['Tulis test reproduksi sebelum menulis kode fitur/perbaikan', 'Jaga cakupan regresi pada jalur kritis pengguna'],
    },
    {
      id: 'debugging-and-error-recovery',
      slashCommand: '/debugging-and-error-recovery',
      name: 'Systematic Root-Cause Debugging',
      description: 'Triage terstruktur (Reproduce -> Localize -> Reduce -> Fix Root Cause -> Guard) dengan aturan Stop-the-Line.',
      skillPath: '/Users/akagami/.gemini/config/skills/debugging-and-error-recovery/SKILL.md',
      keyRules: ['Perbaiki akar masalah (root cause), bukan sekadar gejalanya', 'Pasang regression test agar bug yang sama tidak pernah terulang'],
    },
    {
      id: 'browser-testing-with-devtools',
      slashCommand: '/browser-testing-with-devtools',
      name: 'Browser Runtime & Console Audit',
      description: 'Menguji alur pengguna secara end-to-end di browser nyata dan menangkap error runtime sedini mungkin.',
      skillPath: '/Users/akagami/.gemini/config/skills/browser-testing-with-devtools/SKILL.md',
      keyRules: ['Verifikasi interaksi DOM, event keyboard/klik, dan respons jaringan', 'Pastikan tidak ada uncaught exception di console'],
    },
    {
      id: 'doubt-driven-development',
      slashCommand: '/doubt-driven-development',
      name: 'Adversarial Edge-Case Verification',
      description: 'Menguji batas ekstrem, input kosong, kondisi balapan (race conditions), dan kegagalan jaringan.',
      skillPath: '/Users/akagami/.gemini/config/skills/doubt-driven-development/SKILL.md',
      keyRules: ['Jangan percaya asumsi "pasti berhasil" tanpa bukti pengujian', 'Uji skenario kegagalan dan fallback dengan sengaja'],
    },
  ],
  'AGT-OPS': [
    {
      id: 'ci-cd-and-automation',
      slashCommand: '/ci-cd-and-automation',
      name: 'CI/CD Pipeline & Automated Quality Gates',
      description: 'Mengotomatisasi gerbang kualitas (Lint -> Typecheck -> Unit Test -> Build -> Security Audit) pada setiap perubahan.',
      skillPath: '/Users/akagami/.gemini/config/skills/ci-cd-and-automation/SKILL.md',
      keyRules: ['Shift-Left: tangkap error di tahap lint/typecheck sebelum masuk ke staging', 'Tidak ada kode yang boleh di-merge jika ada satu pun quality gate yang gagal'],
    },
    {
      id: 'shipping-and-launch',
      slashCommand: '/shipping-and-launch',
      name: 'Production Launch & Rollback Strategy',
      description: 'Menyiapkan daftar periksa pra-rilis, staged rollout, health check, dan strategi rollback cepat.',
      skillPath: '/Users/akagami/.gemini/config/skills/shipping-and-launch/SKILL.md',
      keyRules: ['Pastikan prosedur rollback sudah teruji sebelum rilis produksi', 'Verifikasi health endpoint sesaat setelah deployment'],
    },
    {
      id: 'observability-and-instrumentation',
      slashCommand: '/observability-and-instrumentation',
      name: 'Production Observability & Telemetry',
      description: 'Memasang structured logging, metrik latensi, tracing, dan peringatan dini agar perilaku produksi selalu terpantau.',
      skillPath: '/Users/akagami/.gemini/config/skills/observability-and-instrumentation/SKILL.md',
      keyRules: ['Sertakan konteks korelasi pada setiap log error', 'Pantau kesehatan WebSocket, memori, dan waktu respons API'],
    },
    {
      id: 'git-workflow-and-versioning',
      slashCommand: '/git-workflow-and-versioning',
      name: 'Git Workflow & Semantic Versioning',
      description: 'Menjaga kebersihan riwayat commit, pencabangan, semantic versioning, dan sinkronisasi repositori.',
      skillPath: '/Users/akagami/.gemini/config/skills/git-workflow-and-versioning/SKILL.md',
      keyRules: ['Gunakan format commit konvensional yang jelas dan terukur', 'Pastikan working tree bersih dan tersinkronisasi dengan remote'],
    },
    {
      id: 'google-cloud-auth-verification',
      slashCommand: '/google-cloud-auth-verification',
      name: 'Cloud Pre-Flight & Auth Verification',
      description: 'Verifikasi kredensial dan kesiapan infrastruktur sebelum menjalankan pipeline atau deployment.',
      skillPath: '/Users/akagami/.gemini/config/skills/google-cloud-auth-verification/SKILL.md',
      keyRules: ['Verifikasi identitas akun aktif dan izin akses sebelum eksekusi cloud', 'Gunakan isolasi sandbox yang aman'],
    },
  ],
  'AGT-PA': [
    {
      id: 'automation',
      slashCommand: '/automation',
      name: 'Executive Schedule & Workflow Automation',
      description: 'Mengotomatisasi pengingat jadwal CEO, rekap harian pagi, dan sinkronisasi agenda lintas departemen.',
      skillPath: '/Users/akagami/.gemini/antigravity/builtin/skills/automation/SKILL.md',
      keyRules: ['Susun jadwal harian CEO secara proaktif tanpa bentrok', 'Kirimkan ringkasan eksekutif tepat waktu sebelum rapat dimulai'],
    },
    {
      id: 'context-engineering',
      slashCommand: '/context-engineering',
      name: 'Executive Context & Briefing Curation',
      description: 'Menyaring informasi dari seluruh departemen agar CEO selalu mendapatkan konteks yang paling relevan dan ringkas.',
      skillPath: '/Users/akagami/.gemini/config/skills/context-engineering/SKILL.md',
      keyRules: ['Sajikan poin keputusan inti tanpa membebani CEO dengan detail mentah', 'Jaga kesinambungan konteks antar-sesi rapat'],
    },
    {
      id: 'interview-me',
      slashCommand: '/interview-me',
      name: 'CEO Priority & Needs Alignment',
      description: 'Memahami preferensi, prioritas harian, dan kebutuhan khusus CEO dengan cepat dan akurat.',
      skillPath: '/Users/akagami/.gemini/config/skills/interview-me/SKILL.md',
      keyRules: ['Konfirmasi prioritas utama CEO setiap awal hari', 'Tangani perubahan mendadak pada jadwal dengan sigap'],
    },
    {
      id: 'planning-and-task-breakdown',
      slashCommand: '/planning-and-task-breakdown',
      name: 'Executive Agenda & Action Item Tracking',
      description: 'Mengubah keputusan CEO menjadi daftar tindak lanjut (action items) yang didelegasikan ke tiap kepala divisi.',
      skillPath: '/Users/akagami/.gemini/config/skills/planning-and-task-breakdown/SKILL.md',
      keyRules: ['Pastikan setiap hasil rapat memiliki PIC dan tenggat waktu yang jelas', 'Pantau progres tindak lanjut untuk dilaporkan kembali ke CEO'],
    },
  ],
};

// ==========================================
// 6C. Curated Autonomous Peer-to-Peer Office Discussions
// ==========================================

export const AUTONOMOUS_PEER_DISCUSSIONS: Omit<AgentPeerDiscussion, 'id' | 'startedAt'>[] = [
  {
    initiatorId: 'AGT-QA',
    targetId: 'AGT-OPS',
    topic: 'Integrasi Quality Gate E2E ke Pipeline CI/CD',
    skillApplied: '/ci-cd-and-automation & /test-driven-development',
    locationLabel: 'DevOps & Datacenter',
    turns: [
      {
        speakerId: 'AGT-QA',
        speakerName: 'Sinta (QA)',
        speakerColor: '#EF4444',
        skillUsed: '/test-driven-development',
        text: 'Dion, suite regression test baru sudah siap. Bisa kita kunci di pipeline sebelum merge?',
      },
      {
        speakerId: 'AGT-OPS',
        speakerName: 'Dion (DevOps)',
        speakerColor: '#14B8A6',
        skillUsed: '/ci-cd-and-automation',
        text: 'Siap Sinta! Sesuai /ci-cd-and-automation, saya pasang di tahap Shift-Left setelah tsc --noEmit.',
      },
      {
        speakerId: 'AGT-QA',
        speakerName: 'Sinta (QA)',
        speakerColor: '#EF4444',
        skillUsed: '/debugging-and-error-recovery',
        text: 'Mantap! Kalau ada test merah, otomatis blokir rilis sesuai aturan Stop-the-Line.',
      },
    ],
  },
  {
    initiatorId: 'AGT-PA',
    targetId: 'AGT-CTO',
    topic: 'Sinkronisasi Jadwal Architecture Sign-off CEO',
    skillApplied: '/automation & /security-and-hardening',
    locationLabel: 'Product & Design Studio',
    turns: [
      {
        speakerId: 'AGT-PA',
        speakerName: 'Anggi (PA CEO)',
        speakerColor: '#F43F5E',
        skillUsed: '/automation',
        text: 'Pak Viktor, saya sedang menyusun jadwal CEO pukul 11:00. Apakah berkas review arsitektur sudah siap?',
      },
      {
        speakerId: 'AGT-CTO',
        speakerName: 'Viktor (CTO)',
        speakerColor: '#8B5CF6',
        skillUsed: '/security-and-hardening',
        text: 'Sudah Anggi. Audit /security-and-hardening dan /code-review-and-quality sudah hijau semua.',
      },
      {
        speakerId: 'AGT-PA',
        speakerName: 'Anggi (PA CEO)',
        speakerColor: '#F43F5E',
        skillUsed: '/context-engineering',
        text: 'Baik! Ringkasan eksekutifnya langsung saya taruh di meja CEO sekarang. Terima kasih, Pak Viktor!',
      },
    ],
  },
  {
    initiatorId: 'AGT-FE',
    targetId: 'AGT-BE',
    topic: 'Sinkronisasi Kontrak API & Skema WebSocket',
    skillApplied: '/frontend-ui-engineering & /api-and-interface-design',
    locationLabel: 'Web Engineering Bay',
    turns: [
      {
        speakerId: 'AGT-FE',
        speakerName: 'Nadia (Frontend)',
        speakerColor: '#10B981',
        skillUsed: '/frontend-ui-engineering',
        text: 'Bima, untuk stream diskusi real-time di UI, apakah payload event office:peer_discussion sudah stabil?',
      },
      {
        speakerId: 'AGT-BE',
        speakerName: 'Bima (Backend)',
        speakerColor: '#06B6D4',
        skillUsed: '/api-and-interface-design',
        text: 'Sudah Nadia! Kontraknya backward-compatible sesuai /api-and-interface-design dan tipe datanya ada di @nexusdev/shared.',
      },
      {
        speakerId: 'AGT-FE',
        speakerName: 'Nadia (Frontend)',
        speakerColor: '#10B981',
        skillUsed: '/performance-optimization',
        text: 'Oke, saya optimalkan state listener-nya agar render UI tetap 60fps tanpa re-mount.',
      },
    ],
  },
  {
    initiatorId: 'AGT-UIUX',
    targetId: 'AGT-MOB',
    topic: 'Audit Kontras & Ergonomi Tap Target Mobile',
    skillApplied: '/antislop-ui & /antislop-layoutmobile',
    locationLabel: 'Mobile Engineering Bay',
    turns: [
      {
        speakerId: 'AGT-UIUX',
        speakerName: 'Kael (UI/UX)',
        speakerColor: '#F59E0B',
        skillUsed: '/antislop-human',
        text: 'Raka, saya baru cek preview iOS & Android. Pastikan tombol navigasi bawah minimal 48px sesuai /antislop-layoutmobile ya.',
      },
      {
        speakerId: 'AGT-MOB',
        speakerName: 'Raka (Mobile)',
        speakerColor: '#6366F1',
        skillUsed: '/antislop-layoutmobile',
        text: 'Siap Kael! Saya sudah sesuaikan padding safe-area dan kontras teksnya agar nyaman di jempol.',
      },
      {
        speakerId: 'AGT-UIUX',
        speakerName: 'Kael (UI/UX)',
        speakerColor: '#F59E0B',
        skillUsed: '/antislop-ui',
        text: 'Keren! Tampilannya bersih, berkarakter, dan bebas dari kesan template AI generik.',
      },
    ],
  },
  {
    initiatorId: 'AGT-PM',
    targetId: 'AGT-PA',
    topic: 'Penyelarasan Prioritas Sprint & Agenda Mingguan CEO',
    skillApplied: '/planning-and-task-breakdown & /context-engineering',
    locationLabel: 'Executive CEO Suite',
    turns: [
      {
        speakerId: 'AGT-PM',
        speakerName: 'Aria (PM)',
        speakerColor: '#EC4899',
        skillUsed: '/planning-and-task-breakdown',
        text: 'Anggi, ini daftar milestone Sprint terbaru yang sudah dipecah dengan /planning-and-task-breakdown.',
      },
      {
        speakerId: 'AGT-PA',
        speakerName: 'Anggi (PA CEO)',
        speakerColor: '#F43F5E',
        skillUsed: '/context-engineering',
        text: 'Terima kasih Aria! Saya rangkum poin krusialnya agar CEO bisa me-review dalam 2 menit sebelum rapat siang.',
      },
      {
        speakerId: 'AGT-PM',
        speakerName: 'Aria (PM)',
        speakerColor: '#EC4899',
        skillUsed: '/documentation-and-adrs',
        text: 'Siap, dokumen ADR juga sudah saya lampirkan kalau CEO butuh detail teknisnya.',
      },
    ],
  },
  {
    initiatorId: 'AGT-OPS',
    targetId: 'AGT-BE',
    topic: 'Diskusi Santai: Observability & Keamanan Database',
    skillApplied: '/observability-and-instrumentation & /bigquery-sql',
    locationLabel: 'Studio Lounge & Coffee Bar',
    isLoungeBreak: true,
    turns: [
      {
        speakerId: 'AGT-OPS',
        speakerName: 'Dion (DevOps)',
        speakerColor: '#14B8A6',
        skillUsed: '/observability-and-instrumentation',
        text: 'Sambil ngopi sebentar Bim—metrik latensi API kita hari ini stabil di bawah 25ms!',
      },
      {
        speakerId: 'AGT-BE',
        speakerName: 'Bima (Backend)',
        speakerColor: '#06B6D4',
        skillUsed: '/bigquery-sql',
        text: 'Mantap Dion! Efek optimasi indexing dan /schema-mapping kemarin sangat terasa.',
      },
      {
        speakerId: 'AGT-OPS',
        speakerName: 'Dion (DevOps)',
        speakerColor: '#14B8A6',
        skillUsed: '/shipping-and-launch',
        text: 'Sip, habis kopi ini kita kembali ke meja dan siapkan checklist /shipping-and-launch.',
      },
    ],
  },
];

// ==========================================
// 7. Default Room Zones Spec
// ==========================================

export const INITIAL_ROOMS_SPEC: RoomZone[] = [
  {
    id: 'boardroom',
    name: 'Boardroom (Ruang Rapat)',
    label: 'Meeting & HITL Center',
    description: 'Tempat diskusi menyeluruh, kickoff proyek, dan konfirmasi persetujuan CEO.',
    color: '#3B82F6',
    bounds: { x: 645, y: 100, width: 270, height: 300 },
    center: { x: 780, y: 250 },
    assignedRoles: ['USR-CEO', 'AGT-CTO', 'AGT-PM', 'AGT-PA'],
  },
  {
    id: 'design_studio',
    name: 'Product & Design Studio',
    label: 'UI/UX & PM Bay',
    description: 'Perancangan wireframe, design tokens, dan roadmap sprint.',
    color: '#F59E0B',
    bounds: { x: 40, y: 100, width: 205, height: 300 },
    center: { x: 142, y: 250 },
    assignedRoles: ['AGT-PM', 'AGT-UIUX', 'AGT-CTO'],
  },
  {
    id: 'mobile_bay',
    name: 'Mobile Engineering Bay',
    label: 'Android & iOS Lab',
    description: 'Pengembangan Expo React Native dan Flutter Web.',
    color: '#6366F1',
    bounds: { x: 265, y: 100, width: 175, height: 300 },
    center: { x: 352, y: 250 },
    assignedRoles: ['AGT-MOB'],
  },
  {
    id: 'web_bay',
    name: 'Web Engineering Bay',
    label: 'Full-Stack Web Center',
    description: 'Pengembangan Next.js App Router dan layanan backend Node.js.',
    color: '#10B981',
    bounds: { x: 460, y: 100, width: 165, height: 300 },
    center: { x: 542, y: 250 },
    assignedRoles: ['AGT-FE', 'AGT-BE'],
  },
  {
    id: 'qa_lab',
    name: 'Quality Assurance Lab',
    label: 'Automated Testing Lab',
    description: 'Uji otomatis Playwright, Jest, verifikasi regresi, dan bug triage.',
    color: '#EF4444',
    bounds: { x: 935, y: 100, width: 220, height: 140 },
    center: { x: 1045, y: 175 },
    assignedRoles: ['AGT-QA'],
  },
  {
    id: 'devops_room',
    name: 'DevOps & Datacenter',
    label: 'Server & CI/CD Hub',
    description: 'Kontainer Docker sandbox, pipeline CI/CD, dan pemantauan infra.',
    color: '#14B8A6',
    bounds: { x: 935, y: 260, width: 220, height: 140 },
    center: { x: 1045, y: 335 },
    assignedRoles: ['AGT-OPS'],
  },
  {
    id: 'ceo_office',
    name: 'Executive CEO Suite',
    label: 'Human Command Center',
    description: 'Meja kerja eksekutif untuk mengawasi operasional studio bersama Anggi (PA).',
    color: '#8B5CF6',
    bounds: { x: 265, y: 460, width: 300, height: 175 },
    center: { x: 415, y: 550 },
    assignedRoles: ['USR-CEO', 'AGT-PA'],
  },
  {
    id: 'breakroom',
    name: 'Studio Lounge & Coffee Bar',
    label: 'Recharge & Brainstorming',
    description: 'Area santai dan rekreasi karakter agen.',
    color: '#A855F7',
    bounds: { x: 645, y: 460, width: 350, height: 175 },
    center: { x: 820, y: 550 },
    assignedRoles: [],
  },
];

// ==========================================
// 8. Default CEO Executive Dashboard & PA (Anggi) Briefing Data
// ==========================================

export const INITIAL_EXECUTIVE_DASHBOARD: ExecutiveDashboardData = {
  briefingSummary:
    'Selamat bertugas, CEO! Saya Anggi (Personal Assistant Anda). Seluruh 8 departemen teknis berjalan sesuai target Sprint 1. Kontrak API & desain UI bebas AI-slop sudah selaras, serta pipeline CI/CD dalam status hijau (98.4% test pass). Hari ini ada 2 agenda keputusan arsitektur & rilis yang membutuhkan arahan Anda.',
  kpis: {
    sprintVelocity: '42 SP / Minggu (+18%)',
    codeCoverage: '94.2% E2E & Unit',
    pipelineStatus: 'ALL GATES GREEN',
    activeBlockers: 0,
    clientSatisfaction: '99.1% SLA Tercapai',
  },
  schedule: [
    {
      id: 'sched-01',
      time: '09:00 WIB',
      title: 'Daily Executive Standup & Sinkronisasi Backlog Sprint',
      category: 'STANDUP',
      participants: ['USR-CEO', 'AGT-PA', 'AGT-PM', 'AGT-CTO'],
      status: 'COMPLETED',
      notes: 'Aria (/planning-and-task-breakdown) telah memetakan 12 task lintas divisi. Tidak ada blocker kritis.',
      preparedBy: 'AGT-PA',
    },
    {
      id: 'sched-02',
      time: '11:00 WIB',
      title: 'Sign-Off Arsitektur Sistem, TLS 1.3 & Keamanan Database',
      category: 'ARCHITECTURE',
      participants: ['USR-CEO', 'AGT-CTO', 'AGT-BE', 'AGT-PA'],
      status: 'IN_PROGRESS',
      notes: 'Viktor (/security-and-hardening & /accidental-data-loss-prevention) telah memvalidasi skema database dan kontrak API.',
      preparedBy: 'AGT-PA',
    },
    {
      id: 'sched-03',
      time: '13:30 WIB',
      title: 'Review Desain UI/UX Anti-Slop & Simulator Mobile iOS/Android',
      category: 'REVIEW',
      participants: ['USR-CEO', 'AGT-UIUX', 'AGT-FE', 'AGT-MOB'],
      status: 'UPCOMING',
      notes: 'Kael (/antislop-ui) dan Raka (/antislop-layoutmobile) siap mendemokan ergonomi tap-target 48px dan kontras WCAG AA.',
      preparedBy: 'AGT-PA',
    },
    {
      id: 'sched-04',
      time: '15:30 WIB',
      title: 'Keputusan Go/No-Go Deployment Staging & Audit Quality Gate',
      category: 'RELEASE',
      participants: ['USR-CEO', 'AGT-OPS', 'AGT-QA', 'AGT-PA'],
      status: 'UPCOMING',
      notes: 'Sinta (/test-driven-development) dan Dion (/ci-cd-and-automation) telah menyiapkan laporan kesiapan rilis.',
      preparedBy: 'AGT-PA',
    },
    {
      id: 'sched-05',
      time: '17:00 WIB',
      title: 'Rekap Eksekutif Harian & Prioritas Besok bersama Anggi (PA)',
      category: 'CLIENT',
      participants: ['USR-CEO', 'AGT-PA'],
      status: 'UPCOMING',
      notes: 'Anggi (/automation & /context-engineering) menyusun notulensi otomatis dan jadwal harian berikutnya.',
      preparedBy: 'AGT-PA',
    },
  ],
  departmentReports: [
    {
      id: 'rep-pa',
      agentId: 'AGT-PA',
      department: 'Executive',
      headline: 'Orkestrasi Jadwal CEO, Briefing Lintas-Divisi & Notulensi Otomatis',
      progressPercent: 100,
      health: 'ON_TRACK',
      metricsLabel: '5 Agenda Terjadwal • 0 Bentrok Kalender',
      keyDeliverables: [
        'Menyusun Executive Morning Briefing untuk CEO (/context-engineering)',
        'Mengatur pengingat rapat otomatis & sinkronisasi dengan Aria PM (/automation)',
        'Merangkum laporan status dari 8 kepala engineering dalam 1 dashboard',
      ],
      activeSkill: '/automation & /context-engineering',
      updatedAt: 'Baru saja',
    },
    {
      id: 'rep-cto',
      agentId: 'AGT-CTO',
      department: 'Architecture',
      headline: 'Audit Keamanan Arsitektur, Kontrak Modul & Proteksi Data Produksi',
      progressPercent: 95,
      health: 'READY_FOR_SIGN_OFF',
      metricsLabel: '0 Kerentanan Kritis • TLS 1.3 Aktif',
      keyDeliverables: [
        'Multi-axis review pada lapisan WebSocket & REST API (/code-review-and-quality)',
        'Pemasangan guard anti-DROP/TRUNCATE pada database (/accidental-data-loss-prevention)',
        'Verifikasi adversarial terhadap race-condition (/doubt-driven-development)',
      ],
      activeSkill: '/security-and-hardening',
      updatedAt: '2 menit lalu',
    },
    {
      id: 'rep-pm',
      agentId: 'AGT-PM',
      department: 'Management',
      headline: 'Pemecahan Spesifikasi Produk, Peta Dependensi & ADR Sprint 1',
      progressPercent: 92,
      health: 'ON_TRACK',
      metricsLabel: '12/14 Story Selesai • 100% Spec Tercakup',
      keyDeliverables: [
        'Dokumen spesifikasi fungsional dan kriteria penerimaan (/spec-driven-development)',
        'Pemecahan task terurut untuk FE, BE, Mobile, QA, DevOps (/planning-and-task-breakdown)',
        'Pencatatan Architecture Decision Records (/documentation-and-adrs)',
      ],
      activeSkill: '/planning-and-task-breakdown',
      updatedAt: '3 menit lalu',
    },
    {
      id: 'rep-uiux',
      agentId: 'AGT-UIUX',
      department: 'Product & Design',
      headline: 'Design System Berkarakter Tinggi & Audit Aksesibilitas WCAG AA',
      progressPercent: 96,
      health: 'ON_TRACK',
      metricsLabel: 'Kontras > 7.1:1 • 0 Generic AI Slop',
      keyDeliverables: [
        'Token warna gelap studio & hierarki tipografi tajam (/antislop-ui)',
        'Audit kontras teks, navigasi keyboard, dan focus ring (/antislop-human)',
        'Mikro-kopi tombol dan pesan status berbahasa Indonesia lugas (/antislop-copywriting)',
      ],
      activeSkill: '/antislop-ui',
      updatedAt: '4 menit lalu',
    },
    {
      id: 'rep-fe',
      agentId: 'AGT-FE',
      department: 'Web Engineering',
      headline: 'Implementasi Next.js 15 App Router, Phaser 2D Engine & Real-time HUD',
      progressPercent: 94,
      health: 'ON_TRACK',
      metricsLabel: '60 FPS Stabil • First Load JS 151 kB',
      keyDeliverables: [
        'Integrasi mulus kanvas 2D Phaser dengan panel modal React (/frontend-ui-engineering)',
        'Optimasi siklus render dan pencegahan memory leak AudioContext (/performance-optimization)',
        'Verifikasi DOM dan 0 runtime error di browser (/browser-testing-with-devtools)',
      ],
      activeSkill: '/frontend-ui-engineering',
      updatedAt: '1 menit lalu',
    },
    {
      id: 'rep-be',
      agentId: 'AGT-BE',
      department: 'Web Engineering',
      headline: 'Layanan REST/WebSocket Gateway, Kontrak API & Pemetaan Skema',
      progressPercent: 93,
      health: 'ON_TRACK',
      metricsLabel: 'Latensi API 14ms • Uptime 100%',
      keyDeliverables: [
        'Endpoint orkestrasi kolaborasi agen & pembacaan SKILL.md (/api-and-interface-design)',
        'Pemetaan skema data proyek, tugas, dan laporan eksekutif (/schema-mapping)',
        'Validasi dan pembersihan payload input otomatis (/data-autocleaning)',
      ],
      activeSkill: '/api-and-interface-design',
      updatedAt: '2 menit lalu',
    },
    {
      id: 'rep-mob',
      agentId: 'AGT-MOB',
      department: 'Mobile Engineering',
      headline: 'Modul Mobile Lintas-Platform (iOS & Android) & Ergonomi Sentuh',
      progressPercent: 90,
      health: 'ON_TRACK',
      metricsLabel: 'Tap Target >= 48px • iOS & Android Ready',
      keyDeliverables: [
        'Reflow layout responsif dari layar iPhone hingga tablet (/antislop-layoutmobile)',
        'Pengiriman fitur bertahap pada simulator native (/incremental-implementation)',
        'Kepatuhan terhadap SDK Expo & Flutter terbaru (/source-driven-development)',
      ],
      activeSkill: '/antislop-layoutmobile',
      updatedAt: '5 menit lalu',
    },
    {
      id: 'rep-qa',
      agentId: 'AGT-QA',
      department: 'Quality Assurance',
      headline: 'Suite Pengujian TDD Otomatis & Root-Cause Triage (Stop-the-Line)',
      progressPercent: 97,
      health: 'READY_FOR_SIGN_OFF',
      metricsLabel: '48/48 Test Lulus • 0 Regresi Terbuka',
      keyDeliverables: [
        'Siklus pengujian Red-Green-Refactor pada fitur inti (/test-driven-development)',
        'Isolasi input keyboard WASD vs pengetikan chat (/debugging-and-error-recovery)',
        'Pengujian skenario ekstrem dan fallback jaringan (/doubt-driven-development)',
      ],
      activeSkill: '/test-driven-development',
      updatedAt: '1 menit lalu',
    },
    {
      id: 'rep-ops',
      agentId: 'AGT-OPS',
      department: 'DevOps & Infrastructure',
      headline: 'Otomatisasi Quality Gate CI/CD, Observability & Kesiapan Rilis',
      progressPercent: 98,
      health: 'READY_FOR_SIGN_OFF',
      metricsLabel: 'Build 3.9s • 0 Type Error • Git Synced',
      keyDeliverables: [
        'Pipeline Shift-Left: tsc --noEmit & next build lulus 100% (/ci-cd-and-automation)',
        'Pemantauan kesehatan server & WebSocket real-time (/observability-and-instrumentation)',
        'Checklist peluncuran produksi & strategi rollback (/shipping-and-launch)',
      ],
      activeSkill: '/ci-cd-and-automation',
      updatedAt: 'Baru saja',
    },
  ],
};


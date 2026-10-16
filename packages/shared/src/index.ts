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

export interface ServerToClientEvents {
  'office:init': (data: {
    agents: Record<AgentRole, AgentProfile>;
    rooms: RoomZone[];
    activeProject: Project;
    tasks: Task[];
    activeMeeting?: MeetingSession;
  }) => void;
  'player:moved': (data: { id: string; x: number; y: number; direction: string }) => void;
  'agent:status_updated': (data: {
    agentId: AgentRole;
    state: AgentState;
    currentTask?: string;
    activeSnippet?: string;
  }) => void;
  'agent:speech': (data: { agentId: AgentRole; message: string; durationMs: number }) => void;
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
    deskPosition: { x: 400, y: 550 },
    meetingPosition: { x: 700, y: 220 },
    state: 'IDLE',
    currentTask: 'Supervising Studio Operations',
    skills: ['Vision & Strategy', 'Executive Approvals', 'Resource Allocation'],
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
    deskPosition: { x: 200, y: 350 },
    meetingPosition: { x: 650, y: 170 },
    state: 'REVIEWING',
    currentTask: 'Reviewing System Scalability & Security Gates',
    skills: ['System Architecture', 'Code Review', 'Security Audit', 'Tech Stack Design'],
    bio: 'Menjaga integritas arsitektur kode, standar keamanan, dan memvalidasi PR penting.',
    activeSnippet: `// Viktor: Arch Review Gate
export function validateArchitecture(req: ProjectSpec) {
  assert(req.security.tls13, "TLS 1.3 Mandatory");
  assert(req.db.hasIndex, "Database queries must be indexed");
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
    deskPosition: { x: 320, y: 350 },
    meetingPosition: { x: 750, y: 170 },
    state: 'THINKING',
    currentTask: 'Managing Sprint Backlog & Dependency Mapping',
    skills: ['Agile Scrum', 'Requirement Decomposition', 'Risk Mitigation', 'Kanban Flow'],
    bio: 'Mengatur alur sprint, memecah brief menjadi user story, dan menangani eskalasi risiko.',
    activeSnippet: `# Aria: Sprint Backlog Plan
- [x] Epic 1: Auth & User Onboarding
- [ ] Epic 2: Realtime 2D Canvas Synchronization
- [ ] Epic 3: Mobile Simulator Bridge (Expo)`,
    lastActive: '2m ago',
  },
  'AGT-UIUX': {
    id: 'AGT-UIUX',
    name: 'Kael',
    title: 'Lead UI/UX Product Designer',
    department: 'Product & Design',
    color: '#F59E0B', // Amber
    avatarSprite: 'avatar_uiux',
    deskPosition: { x: 200, y: 200 },
    meetingPosition: { x: 800, y: 220 },
    state: 'CODING',
    currentTask: 'Generating Design Tokens & Responsive Wireframes',
    skills: ['Design Tokens', 'Figma to Code', 'Tailwind CSS', 'Mobile UI Patterns'],
    bio: 'Merancang antarmuka pixel-perfect untuk Web, Android, dan iOS dengan standar WCAG.',
    activeSnippet: `:root {
  --primary-brand: #6366f1;
  --office-floor-tile: #1e293b;
  --accent-glow: rgba(99, 102, 241, 0.4);
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
    deskPosition: { x: 450, y: 200 },
    meetingPosition: { x: 600, y: 220 },
    state: 'CODING',
    currentTask: 'Implementing Next.js App Router & Phaser Viewport',
    skills: ['Next.js 15', 'React 19', 'Tailwind CSS', 'Phaser.js', 'State Hydration'],
    bio: 'Mengembangkan antarmuka web interaktif berkecepatan tinggi dengan server rendering.',
    activeSnippet: `export default function OfficeCanvas() {
  const { phaserRef } = usePhaserStudio();
  return <div ref={phaserRef} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl" />;
}`,
    lastActive: 'Just now',
  },
  'AGT-BE': {
    id: 'AGT-BE',
    name: 'Bima',
    title: 'Senior Backend Engineer (Node.js)',
    department: 'Web Engineering',
    color: '#06B6D4', // Cyan
    avatarSprite: 'avatar_be',
    deskPosition: { x: 450, y: 350 },
    meetingPosition: { x: 650, y: 270 },
    state: 'CODING',
    currentTask: 'Constructing REST/GraphQL API & Prisma Schema',
    skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Prisma ORM', 'WebSocket Gateway'],
    bio: 'Membangun logika inti bisnis, kontrak OpenAPI, dan arsitektur basis data scalable.',
    activeSnippet: `@SubscribeMessage('player:move')
handlePlayerMove(@MessageBody() payload: MoveDto) {
  this.spatialService.updatePosition(payload);
  this.server.emit('player:moved', payload);
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
    deskPosition: { x: 320, y: 200 },
    meetingPosition: { x: 750, y: 270 },
    state: 'CODING',
    currentTask: 'Building Expo Native Bridges & Flutter Web Preview',
    skills: ['React Native', 'Expo SDK', 'Flutter Web', 'Kotlin', 'Swift'],
    bio: 'Membangun aplikasi mobile lintas platform untuk Google Play Store dan Apple App Store.',
    activeSnippet: `import { View, Text, StyleSheet } from 'react-native';

export function MobileDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nexus Studio Mobile</Text>
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
    deskPosition: { x: 1000, y: 200 },
    meetingPosition: { x: 600, y: 170 },
    state: 'TESTING',
    currentTask: 'Executing Automated Playwright E2E & API Sanity Tests',
    skills: ['Playwright', 'Jest', 'API Contract Test', 'Anti-Loop Circuit Breaker'],
    bio: 'Menjamin kualitas perangkat lunak tanpa celah sebelum dirilis ke lingkungan produksi.',
    activeSnippet: `test('E2E: Player can walk to Meeting Room and trigger HITL modal', async ({ page }) => {
  await page.goto('/studio');
  await page.keyboard.press('KeyW');
  await expect(page.locator('#meeting-modal')).toBeVisible();
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
    deskPosition: { x: 1000, y: 350 },
    meetingPosition: { x: 800, y: 170 },
    state: 'IDLE',
    currentTask: 'Configuring Docker Sandboxes & Multi-Stage CI Pipeline',
    skills: ['Docker', 'Kubernetes', 'GitHub Actions', 'Fastlane', 'Cloud Monitoring'],
    bio: 'Mengelola kontainerisasi aman, otomatisasi rilis CI/CD, dan pemantauan sistem awan.',
    activeSnippet: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build`,
    lastActive: '4m ago',
  },
  'AGT-PA': {
    id: 'AGT-PA',
    name: 'Anggi',
    title: 'Executive Personal Assistant to CEO',
    department: 'Executive',
    color: '#F43F5E', // Rose
    avatarSprite: 'avatar_pa',
    deskPosition: { x: 475, y: 550 },
    meetingPosition: { x: 710, y: 150 },
    state: 'IDLE',
    currentTask: 'Mengatur Kalender Eksekutif & Agenda Rapat CEO',
    skills: [
      'Calendar & Schedule Management',
      'Meeting Coordination & Minutes',
      'Executive Briefing & Triage',
      'Travel & Hospitality Logistics',
      'CEO Priority Guard',
    ],
    bio: 'Asisten pribadi eksekutif terpercaya CEO yang mahir mengorkestrasi jadwal rapat, menyaring prioritas masuk, menyiapkan berkas pertemuan, dan memastikan segala kebutuhan operasional harian CEO terpenuhi dengan sempurna.',
    activeSnippet: `// Anggi: CEO Daily Executive Agenda
export const todayAgenda = {
  date: new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
  priorities: [
    { time: '09:00', title: 'Daily Standup & Briefing Tim Studio', room: 'Boardroom' },
    { time: '11:00', title: 'Architecture Signoff bersama Viktor (CTO)', status: 'Prepared' },
    { time: '14:00', title: 'Live Mobile Viewport Demo dengan Raka', status: 'Ready' },
    { time: '16:00', title: 'Executive Review Hasil Pengujian QA Sinta', status: 'Confirmed' }
  ],
  notifications: 'Semua berkas rapat dan kopi segar telah tersedia di meja Anda, CEO.'
};`,
    lastActive: 'Just now',
  },
};

// ==========================================
// 7. Default Room Zones Spec
// ==========================================

export const INITIAL_ROOMS_SPEC: RoomZone[] = [
  {
    id: 'boardroom',
    name: 'Boardroom (Ruang Rapat Utama)',
    label: 'Meeting & HITL Center',
    description: 'Tempat diskusi menyeluruh, kickoff proyek, dan konfirmasi persetujuan CEO.',
    color: '#3B82F6',
    bounds: { x: 550, y: 100, width: 320, height: 220 },
    center: { x: 710, y: 210 },
    assignedRoles: ['USR-CEO', 'AGT-CTO', 'AGT-PM', 'AGT-PA'],
  },
  {
    id: 'design_studio',
    name: 'Product & Design Studio',
    label: 'UI/UX & PM Bay',
    description: 'Perancangan wireframe, design tokens, dan roadmap sprint.',
    color: '#F59E0B',
    bounds: { x: 140, y: 120, width: 250, height: 280 },
    center: { x: 260, y: 260 },
    assignedRoles: ['AGT-PM', 'AGT-UIUX'],
  },
  {
    id: 'web_bay',
    name: 'Web Engineering Bay',
    label: 'Full-Stack Web Center',
    description: 'Pengembangan Next.js App Router dan layanan backend Node.js.',
    color: '#10B981',
    bounds: { x: 410, y: 120, width: 120, height: 280 },
    center: { x: 470, y: 260 },
    assignedRoles: ['AGT-FE', 'AGT-BE'],
  },
  {
    id: 'mobile_bay',
    name: 'Mobile Engineering Bay',
    label: 'Android & iOS Lab',
    description: 'Pengembangan Expo React Native dan Flutter Web.',
    color: '#6366F1',
    bounds: { x: 280, y: 120, width: 120, height: 160 },
    center: { x: 340, y: 200 },
    assignedRoles: ['AGT-MOB'],
  },
  {
    id: 'qa_lab',
    name: 'Quality Assurance Lab',
    label: 'Automated Testing Lab',
    description: 'Uji otomatis Playwright, Jest, verifikasi regresi, dan bug triage.',
    color: '#EF4444',
    bounds: { x: 920, y: 120, width: 180, height: 150 },
    center: { x: 1010, y: 195 },
    assignedRoles: ['AGT-QA'],
  },
  {
    id: 'devops_room',
    name: 'DevOps & Server Datacenter',
    label: 'Server & CI/CD Hub',
    description: 'Kontainer Docker sandbox, pipeline CI/CD, dan pemantauan infra.',
    color: '#14B8A6',
    bounds: { x: 920, y: 280, width: 180, height: 150 },
    center: { x: 1010, y: 355 },
    assignedRoles: ['AGT-OPS'],
  },
  {
    id: 'ceo_office',
    name: 'Executive CEO Suite',
    label: 'Human Command Center',
    description: 'Meja kerja eksekutif untuk mengawasi operasional studio.',
    color: '#8B5CF6',
    bounds: { x: 300, y: 480, width: 220, height: 160 },
    center: { x: 410, y: 560 },
    assignedRoles: ['USR-CEO', 'AGT-PA'],
  },
  {
    id: 'breakroom',
    name: 'Studio Lounge & Coffee Bar',
    label: 'Recharge & Brainstorming',
    description: 'Area santai dan rekreasi karakter agen.',
    color: '#A855F7',
    bounds: { x: 600, y: 480, width: 350, height: 160 },
    center: { x: 775, y: 560 },
    assignedRoles: [],
  },
];

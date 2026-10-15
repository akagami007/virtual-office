import { EventEmitter } from 'events';
import {
  AgentRole,
  AgentState,
  Project,
  Task,
  ApprovalGate,
} from '@nexusdev/shared';
import { getLLMProvider, ILLMProvider } from '../llm/provider.js';

export type SDLCPhase =
  | 'INITIATION'
  | 'BACKLOG_DECOMPOSITION'
  | 'ARCH_VALIDATION'
  | 'DESIGN_AND_CONTRACT'
  | 'PARALLEL_DEV'
  | 'QA_VERIFICATION'
  | 'ESCALATION_HITL'
  | 'DEVOPS_PACKAGING'
  | 'COMPLETED';

export interface WorkflowEventMap {
  'phase:changed': (phase: SDLCPhase, meta?: any) => void;
  'agent:state': (agentId: AgentRole, state: AgentState, message: string) => void;
  'task:created': (task: Task) => void;
  'approval:requested': (gate: ApprovalGate) => void;
  'meeting:called': (topic: string, requiredAgents: AgentRole[]) => void;
}

export class SDLCWorkflowEngine extends EventEmitter {
  private currentPhase: SDLCPhase = 'INITIATION';
  private llm: ILLMProvider;
  private project: Project | null = null;
  private tasks: Map<string, Task> = new Map();
  private taskIterations: Map<string, number> = new Map();
  private maxAllowedIterations: number = 3;

  constructor(llmProvider?: ILLMProvider) {
    super();
    this.llm = llmProvider || getLLMProvider();
  }

  public getCurrentPhase(): SDLCPhase {
    return this.currentPhase;
  }

  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Phase 1: Initiation by CEO Brief
   */
  public async startProject(brief: {
    id: string;
    name: string;
    description: string;
    platform: 'WEB' | 'MOBILE' | 'FULLSTACK';
  }): Promise<void> {
    this.project = {
      id: brief.id,
      name: brief.name,
      description: brief.description,
      status: 'PLANNING',
      platform: brief.platform,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.setPhase('INITIATION');
    this.emit('meeting:called', `Kickoff & Validasi Brief: ${brief.name}`, [
      'USR-CEO',
      'AGT-PM',
      'AGT-CTO',
    ]);

    // Automatically transition to Backlog Decomposition
    await this.runBacklogDecomposition();
  }

  /**
   * Phase 2: PM Aria breaks down the user brief
   */
  public async runBacklogDecomposition(): Promise<void> {
    this.setPhase('BACKLOG_DECOMPOSITION');
    this.emit('agent:state', 'AGT-PM', 'THINKING', 'Aria sedang menganalisis brief dan menyusun backlog...');

    const prompt = `Proyek: ${this.project?.name}\nDeskripsi: ${this.project?.description}\nPlatform: ${this.project?.platform}`;
    const generatedTasks = await this.llm.generateStructuredJson<
      Array<{ title: string; description: string; assignee: AgentRole; priority: any }>
    >({
      agentRole: 'AGT-PM',
      prompt,
      schemaDescription: `Array<{ title: string, description: string, assignee: 'AGT-FE'|'AGT-BE'|'AGT-MOB', priority: 'HIGH'|'MEDIUM'|'CRITICAL' }>`,
    });

    generatedTasks.forEach((gt, idx) => {
      const task: Task = {
        id: `task-${Date.now()}-${idx}`,
        projectId: this.project?.id || 'default',
        title: gt.title,
        description: gt.description,
        assignee: gt.assignee,
        status: 'TODO',
        priority: gt.priority || 'MEDIUM',
        iteration: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tasks.set(task.id, task);
      this.taskIterations.set(task.id, 0);
      this.emit('task:created', task);
    });

    this.emit('agent:state', 'AGT-PM', 'IDLE', 'Backlog selesai disusun. Menyerahkan ke Viktor (CTO).');

    // Transition to Architecture Validation
    await this.runArchitectureValidation();
  }

  /**
   * Phase 3: CTO Viktor reviews architecture & security
   */
  public async runArchitectureValidation(): Promise<void> {
    this.setPhase('ARCH_VALIDATION');
    this.emit('agent:state', 'AGT-CTO', 'REVIEWING', 'Viktor sedang meninjau kelayakan arsitektur sistem...');

    const archReview = await this.llm.generateText({
      agentRole: 'AGT-CTO',
      prompt: `Tinjau rencana proyek: ${this.project?.name}. Validasi integrasi Next.js, Node.js, dan Expo Mobile.`,
    });

    // Create Approval Gate for CEO (HITL)
    const gate: ApprovalGate = {
      id: `gate-arch-${Date.now()}`,
      projectId: this.project?.id || 'default',
      type: 'ARCHITECTURE',
      title: 'Persetujuan Arsitektur Sistem (CTO Gate)',
      description: archReview,
      requestedBy: 'AGT-CTO',
      status: 'PENDING',
      diffPayload: {
        filename: 'ARCH_DECISION.md',
        details: archReview,
      },
      createdAt: new Date().toISOString(),
    };

    this.emit('approval:requested', gate);
    this.emit('agent:state', 'AGT-CTO', 'WAITING_APPROVAL', 'Menunggu persetujuan CEO atas spesifikasi arsitektur.');
  }

  /**
   * Callback when CEO approves or rejects the architecture gate
   */
  public async resolveArchitectureApproval(decision: 'APPROVE' | 'REJECT', feedback?: string): Promise<void> {
    if (decision === 'APPROVE') {
      this.emit('agent:state', 'AGT-CTO', 'IDLE', 'Arsitektur disetujui CEO. Melanjutkan ke Desain & Kontrak API.');
      await this.runDesignAndContract();
    } else {
      this.emit('agent:state', 'AGT-CTO', 'REVIEWING', `CEO meminta revisi: "${feedback}". Menyusun ulang arsitektur...`);
    }
  }

  /**
   * Phase 4: UI/UX Kael creates Design Tokens, BE Bima creates OpenAPI spec
   */
  public async runDesignAndContract(): Promise<void> {
    this.setPhase('DESIGN_AND_CONTRACT');
    this.emit('agent:state', 'AGT-UIUX', 'CODING', 'Kael sedang menyusun sistem Design Tokens...');
    this.emit('agent:state', 'AGT-BE', 'CODING', 'Bima sedang merancang kontrak OpenAPI 3.1 & Prisma Schema...');

    await Promise.all([
      this.llm.generateText({
        agentRole: 'AGT-UIUX',
        prompt: `Buat spesifikasi Design Token warna, tipografi, dan margin untuk aplikasi ${this.project?.name}.`,
      }),
      this.llm.generateText({
        agentRole: 'AGT-BE',
        prompt: `Buat endpoint OpenAPI dan skema entitas database untuk ${this.project?.name}.`,
      }),
    ]);

    this.emit('agent:state', 'AGT-UIUX', 'IDLE', 'Design tokens siap.');
    this.emit('agent:state', 'AGT-BE', 'IDLE', 'Kontrak API dipublikasikan.');

    // Transition to Parallel Development
    await this.runParallelDevelopment();
  }

  /**
   * Phase 5: Parallel Development (Nadia, Bima, Raka)
   */
  public async runParallelDevelopment(): Promise<void> {
    this.setPhase('PARALLEL_DEV');
    this.emit('agent:state', 'AGT-FE', 'CODING', 'Nadia sedang mengimplementasikan Next.js App Router & Komponen UI...');
    this.emit('agent:state', 'AGT-BE', 'CODING', 'Bima sedang mengimplementasikan route NestJS dan migrasi database...');
    this.emit('agent:state', 'AGT-MOB', 'CODING', 'Raka sedang membangun layar Expo React Native dengan pratinjau web...');

    // Update all TODO tasks to IN_PROGRESS
    this.tasks.forEach((task) => {
      if (task.status === 'TODO') {
        task.status = 'IN_PROGRESS';
        task.updatedAt = new Date().toISOString();
      }
    });

    // Simulate development execution
    setTimeout(async () => {
      this.tasks.forEach((task) => {
        if (task.status === 'IN_PROGRESS') {
          task.status = 'IN_REVIEW';
        }
      });

      this.emit('agent:state', 'AGT-FE', 'IDLE', 'Frontend build siap diuji.');
      this.emit('agent:state', 'AGT-BE', 'IDLE', 'Backend endpoints siap diuji.');
      this.emit('agent:state', 'AGT-MOB', 'IDLE', 'Mobile screens siap diuji.');

      await this.runQA();
    }, 1500);
  }

  /**
   * Phase 6: Quality Assurance Loop with Circuit Breaker
   */
  public async runQA(): Promise<void> {
    this.setPhase('QA_VERIFICATION');
    this.emit('agent:state', 'AGT-QA', 'TESTING', 'Sinta sedang mengeksekusi Playwright E2E & validasi API...');

    const qaResult = await this.llm.generateText({
      agentRole: 'AGT-QA',
      prompt: `Jalankan pengujian terhadap proyek ${this.project?.name}.`,
    });

    // Check circuit breaker status on tasks
    let hasFailedTask = false;
    let escalatedTask: Task | null = null;

    this.tasks.forEach((task) => {
      const iter = this.taskIterations.get(task.id) || 0;
      if (task.iteration > 0 && iter >= this.maxAllowedIterations) {
        hasFailedTask = true;
        escalatedTask = task;
        task.status = 'ESCALATED';
      } else {
        task.status = 'DONE';
      }
    });

    if (hasFailedTask && escalatedTask) {
      // Circuit Breaker tripped! Escalate to Human CEO
      this.setPhase('ESCALATION_HITL');
      this.emit('agent:state', 'AGT-QA', 'ERROR', `Circuit Breaker: Task "${(escalatedTask as Task).title}" gagal setelah 3 kali perbaikan.`);
      this.emit('meeting:called', `EMERGENCY ESCALATION: Kegagalan Pengujian Berulang pada ${(escalatedTask as Task).title}`, [
        'USR-CEO',
        'AGT-CTO',
        'AGT-PM',
        'AGT-QA',
        (escalatedTask as Task).assignee,
      ]);
    } else {
      // All QA tests passed! Transition to DevOps
      this.emit('agent:state', 'AGT-QA', 'IDLE', 'Semua tes otomatis lolos verifikasi.');
      await this.runDevOps();
    }
  }

  /**
   * Phase 7: DevOps Packaging & Deployment
   */
  public async runDevOps(): Promise<void> {
    this.setPhase('DEVOPS_PACKAGING');
    this.emit('agent:state', 'AGT-OPS', 'CODING', 'Dion sedang membangun Docker image dan konfigurasi CI/CD...');

    await this.llm.generateText({
      agentRole: 'AGT-OPS',
      prompt: `Buat Dockerfile multi-stage dan workflow GitHub Actions untuk ${this.project?.name}.`,
    });

    this.emit('agent:state', 'AGT-OPS', 'IDLE', 'Paket kontainer dan pipa CI/CD siap rilis.');
    this.setPhase('COMPLETED');
    this.emit('meeting:called', `Proyek ${this.project?.name} Telah Siap Dirilis ke Produksi`, [
      'USR-CEO',
      'AGT-PM',
      'AGT-CTO',
      'AGT-OPS',
    ]);
  }

  private setPhase(newPhase: SDLCPhase) {
    this.currentPhase = newPhase;
    this.emit('phase:changed', newPhase);
  }
}

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import {
  AgentProfile,
  AgentRole,
  ApprovalGate,
  ChatMessage,
  ClientToServerEvents,
  INITIAL_AGENTS_ROSTER,
  INITIAL_ROOMS_SPEC,
  Project,
  ServerToClientEvents,
  Task,
} from '@nexusdev/shared';
import {
  SDLCWorkflowEngine,
  getLLMProvider,
} from '@nexusdev/agent-orchestrator';
import { WorkspaceManager } from '@nexusdev/sandbox-runner';

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
const workspaceManager = new WorkspaceManager();
const workflowEngine = new SDLCWorkflowEngine(getLLMProvider(), workspaceManager);

// Auto-seed initial project workspace
workspaceManager.scaffoldProject(activeProject.id, 'FULLSTACK').catch(console.error);

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

app.get('/api/agents', (req, res) => {
  res.json(Object.values(agentsRoster));
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
  console.log(`🤖 Multi-Agent Engine: 8 Roles Active`);
  console.log(`=======================================================`);
});

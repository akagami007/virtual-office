'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  AgentPeerDiscussion,
  AgentProfile,
  AgentRole,
  ApprovalGate,
  AUTONOMOUS_PEER_DISCUSSIONS,
  ChatMessage,
  ClientToServerEvents,
  INITIAL_AGENTS_ROSTER,
  Project,
  ServerToClientEvents,
  Task,
} from '@nexusdev/shared';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

export function useSocketStudio() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents] = useState<Record<AgentRole, AgentProfile>>(INITIAL_AGENTS_ROSTER);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [pendingApproval, setPendingApproval] = useState<ApprovalGate | null>(null);
  const [meetingTranscript, setMeetingTranscript] = useState<ChatMessage[]>([]);
  const [activeMeetingTopic, setActiveMeetingTopic] = useState<string | null>(null);
  const [peerDiscussions, setPeerDiscussions] = useState<AgentPeerDiscussion[]>([
    {
      ...AUTONOMOUS_PEER_DISCUSSIONS[0],
      id: 'disc-init-01',
      startedAt: 'Baru saja',
    },
  ]);

  const addPeerDiscussion = useCallback((discussion: AgentPeerDiscussion) => {
    setPeerDiscussions((prev) => {
      const filtered = prev.filter((d) => d.id !== discussion.id);
      return [discussion, ...filtered].slice(0, 12);
    });
  }, []);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
      reconnectionAttempts: 3,
      timeout: 3000,
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to NexusDev Studio Backend Gateway');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Backend Gateway (Running in offline demo mode)');
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Office initialization
    socket.on('office:init', (data) => {
      if (data.agents) setAgents(data.agents);
      if (data.tasks) setTasks(data.tasks);
      if (data.activeProject) setActiveProject(data.activeProject);
    });

    // Peer-to-peer discussion broadcast from backend
    socket.on('office:peer_discussion', (discussion) => {
      addPeerDiscussion(discussion);
      if (typeof window !== 'undefined') {
        const scene = (window as any).__NEXUS_SCENE__;
        if (scene && typeof scene.playPeerDiscussion === 'function') {
          scene.playPeerDiscussion(discussion, true);
        }
      }
    });

    // Agent status updates
    socket.on('agent:status_updated', (data) => {
      setAgents((prev) => {
        const current = prev[data.agentId];
        if (!current) return prev;
        return {
          ...prev,
          [data.agentId]: {
            ...current,
            state: data.state,
            currentTask: data.currentTask || current.currentTask,
            lastActive: 'Just now',
          },
        };
      });

      // Also notify scene if available
      if (typeof window !== 'undefined') {
        const scene = (window as any).__NEXUS_SCENE__;
        if (scene && scene.updateAgentState) {
          scene.updateAgentState(data.agentId, data.state, data.currentTask);
        }
      }
    });

    // Meeting events
    socket.on('meeting:started', (meeting) => {
      setActiveMeetingTopic(meeting.topic);
      setMeetingTranscript(meeting.transcript || []);
      if (typeof window !== 'undefined') {
        const scene = (window as any).__NEXUS_SCENE__;
        if (scene && scene.callMeeting) {
          scene.callMeeting(meeting.topic);
        }
      }
    });

    socket.on('meeting:message', (msg) => {
      setMeetingTranscript((prev) => [...prev, msg]);
    });

    socket.on('hitl:approval_requested', (gate) => {
      setPendingApproval(gate);
    });

    socket.on('hitl:approval_resolved', () => {
      setPendingApproval(null);
    });

    socket.on('task:created', (newTask) => {
      setTasks((prev) => [...prev, newTask]);
    });

    socket.on('task:updated', (updated) => {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    });

    return () => {
      socket.disconnect();
    };
  }, [addPeerDiscussion]);

  const sendPlayerMove = useCallback((pos: { x: number; y: number; direction: string }) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('player:move', pos);
    }
  }, []);

  const callMeeting = useCallback((topic: string, requiredAgents: AgentRole[] = ['AGT-CTO', 'AGT-PM', 'AGT-QA']) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('meeting:call', { topic, requiredAgents });
    }
  }, []);

  const sendMeetingMessage = useCallback((message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('meeting:send_message', { message });
    }
  }, []);

  const submitHITLDecision = useCallback((approvalId: string, decision: 'APPROVE' | 'REJECT', feedback?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('hitl:submit_decision', { approvalId, decision, feedback });
    }
  }, []);

  const sendDirectChat = useCallback((agentId: AgentRole, message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('agent:direct_chat', { agentId, message });
    }
  }, []);

  const moveTaskStatus = useCallback((taskId: string, newStatus: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:move_status', { taskId, newStatus });
    }
  }, []);

  return {
    isConnected,
    agents,
    tasks,
    activeProject,
    pendingApproval,
    meetingTranscript,
    activeMeetingTopic,
    peerDiscussions,
    addPeerDiscussion,
    sendPlayerMove,
    callMeeting,
    sendMeetingMessage,
    submitHITLDecision,
    sendDirectChat,
    moveTaskStatus,
  };
}

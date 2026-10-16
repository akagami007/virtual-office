'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import HeaderHUD from '../components/HeaderHUD';
import InspectorDrawer from '../components/InspectorDrawer';
import KanbanBoardModal from '../components/KanbanBoardModal';
import MeetingRoomModal from '../components/MeetingRoomModal';
import AgentRosterModal from '../components/AgentRosterModal';
import WorkspaceExplorerModal from '../components/WorkspaceExplorerModal';
import MobileSimulatorModal from '../components/MobileSimulatorModal';
import QuickNavDock from '../components/QuickNavDock';
import LiveOfficeFeedPanel from '../components/LiveOfficeFeedPanel';
import {
  AgentPeerDiscussion,
  AgentProfile,
  AgentRole,
  INITIAL_AGENTS_ROSTER,
  RoomId,
  RoomZone,
} from '@nexusdev/shared';
import { OfficeScene } from '../phaser/scenes/OfficeScene';
import { useSocketStudio } from '../hooks/useSocketStudio';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

// Dynamically import Phaser canvas with SSR disabled
const OfficeCanvas = dynamic(() => import('../components/OfficeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#070a11] text-slate-400 gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center animate-pulse">
        <span className="w-6 h-6 rounded-md bg-indigo-500 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-200">
          Memuat NexusDev 2D Spatial Engine...
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Inisialisasi WebGL, A* Pathfinding, & Karakter Agen AI
        </p>
      </div>
    </div>
  ),
});

export default function StudioPage() {
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [currentRoom, setCurrentRoom] = useState<RoomZone | null>(null);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [isAutonomous, setIsAutonomous] = useState(true);

  // Real-time WebSocket connection to Backend Orchestrator
  const {
    isConnected,
    agents,
    activeProject,
    pendingApproval,
    peerDiscussions,
    addPeerDiscussion,
    sendPlayerMove,
    callMeeting,
  } = useSocketStudio();

  // Helper to access scene bridge
  const getScene = (): OfficeScene | undefined => {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { __NEXUS_SCENE__?: OfficeScene }).__NEXUS_SCENE__;
  };

  // If a critical HITL approval is requested, open Meeting modal automatically
  useEffect(() => {
    if (pendingApproval) {
      setIsMeetingOpen(true);
      const scene = getScene();
      if (scene) {
        scene.callMeeting(`Permintaan Persetujuan CEO: ${pendingApproval.title}`);
      }
    }
  }, [pendingApproval]);

  // Block Phaser keyboard & canvas walk when a full-screen modal is open
  useEffect(() => {
    const isModalOpen =
      isMeetingOpen || isKanbanOpen || isRosterOpen || isWorkspaceOpen || isMobileSimulatorOpen;
    const scene = getScene();
    if (scene && typeof scene.setKeyboardBlocked === 'function') {
      scene.setKeyboardBlocked(isModalOpen);
    }
  }, [isMeetingOpen, isKanbanOpen, isRosterOpen, isWorkspaceOpen, isMobileSimulatorOpen]);

  const handleAgentClick = useCallback((agent: AgentProfile) => {
    setSelectedAgent(agent);
  }, []);

  const handleRoomEnter = useCallback((room: RoomZone) => {
    setCurrentRoom(room);
  }, []);

  const handlePlayerMove = useCallback(
    (pos: { x: number; y: number }) => {
      sendPlayerMove({ x: pos.x, y: pos.y, direction: 'down' });
    },
    [sendPlayerMove]
  );

  const handlePeerDiscussionStarted = useCallback(
    (discussion: AgentPeerDiscussion) => {
      addPeerDiscussion(discussion);
    },
    [addPeerDiscussion]
  );

  const handleToggleAutonomous = useCallback((enabled: boolean) => {
    setIsAutonomous(enabled);
    const scene = getScene();
    if (scene && typeof scene.setAutonomousEnabled === 'function') {
      scene.setAutonomousEnabled(enabled);
    }
  }, []);

  const handleTriggerRandomDiscussion = useCallback(() => {
    const scene = getScene();
    if (scene && typeof scene.triggerRandomPeerDiscussion === 'function') {
      scene.triggerRandomPeerDiscussion();
    }
  }, []);

  const handleTriggerCustomDiscussion = useCallback(
    async (
      initiatorId: AgentRole,
      targetId: AgentRole,
      topic?: string,
      skillCommand?: string
    ) => {
      const initiator = INITIAL_AGENTS_ROSTER[initiatorId];
      const target = INITIAL_AGENTS_ROSTER[targetId];
      if (!initiator || !target) return;

      const resolvedSkill = skillCommand || initiator.skills[0] || '/code-review-and-quality';
      const targetSkill = target.skills[0] || '/api-and-interface-design';
      const resolvedTopic =
        topic || `Sinkronisasi ${resolvedSkill} antara ${initiator.name} & ${target.name}`;

      try {
        const res = await fetch(`${SERVER_URL}/api/office/collaborate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initiatorId,
            targetId,
            topic: resolvedTopic,
            skillCommand: resolvedSkill,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.discussion) {
            addPeerDiscussion(data.discussion);
            const scene = getScene();
            if (scene && typeof scene.playPeerDiscussion === 'function') {
              scene.playPeerDiscussion(data.discussion, true);
            }
            return;
          }
        }
      } catch {
        // Fallback to local instant discussion below
      }

      const fallbackDiscussion: AgentPeerDiscussion = {
        id: `disc-custom-${Date.now()}`,
        topic: resolvedTopic,
        initiatorId,
        targetId,
        skillApplied: `${resolvedSkill} & ${targetSkill}`,
        locationLabel: target.department,
        startedAt: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        turns: [
          {
            speakerId: initiatorId,
            speakerName: initiator.name,
            speakerColor: initiator.color,
            skillUsed: resolvedSkill,
            text: `Halo ${target.name.split(' ')[0]}, saya ke mejamu untuk menyelaraskan "${resolvedTopic}" memakai standar ${resolvedSkill}.`,
          },
          {
            speakerId: targetId,
            speakerName: target.name,
            speakerColor: target.color,
            skillUsed: targetSkill,
            text: `Siap ${initiator.name.split(' ')[0]}! Dari sisi ${target.department}, saya pastikan kontrak & implementasinya patuh aturan ${targetSkill}.`,
          },
          {
            speakerId: initiatorId,
            speakerName: initiator.name,
            speakerColor: initiator.color,
            skillUsed: resolvedSkill,
            text: `Mantap, kita langsung eksekusi di sprint aktif sekarang!`,
          },
        ],
      };

      addPeerDiscussion(fallbackDiscussion);
      const scene = getScene();
      if (scene && typeof scene.playPeerDiscussion === 'function') {
        scene.playPeerDiscussion(fallbackDiscussion, true);
      }
    },
    [addPeerDiscussion]
  );

  const handleJumpToRoom = (roomId: RoomId) => {
    const scene = getScene();
    if (scene) {
      scene.jumpToRoom(roomId);
    }
  };

  const handleJumpToAgent = (agentId: string) => {
    const scene = getScene();
    if (scene) {
      scene.jumpToAgent(agentId as AgentRole);
    }
  };

  const handleOpenMeeting = () => {
    const scene = getScene();
    if (scene) {
      scene.callMeeting('Persetujuan Arsitektur & Sinkronisasi Sprint 1');
    }
    callMeeting('Persetujuan Arsitektur & Sinkronisasi Sprint 1');
    setIsMeetingOpen(true);
  };

  const handleConcludeMeeting = () => {
    const scene = getScene();
    if (scene) {
      scene.concludeMeeting();
    }
    setIsMeetingOpen(false);
  };

  const handleMeetingTriggered = useCallback(() => {
    setIsMeetingOpen(true);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070a11]">
      {/* 1. Header HUD Overlay */}
      <HeaderHUD
        currentRoom={currentRoom}
        onOpenMeeting={handleOpenMeeting}
        onOpenKanban={() => setIsKanbanOpen(true)}
        onOpenRoster={() => setIsRosterOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
        activeAgentsCount={Object.keys(agents || INITIAL_AGENTS_ROSTER).length - 1} // minus CEO
        isConnected={isConnected}
      />

      {/* 2. 2D Spatial Phaser Viewport */}
      <OfficeCanvas
        onAgentClick={handleAgentClick}
        onRoomEnter={handleRoomEnter}
        onPlayerMove={handlePlayerMove}
        onMeetingTriggered={handleMeetingTriggered}
        onPeerDiscussionStarted={handlePeerDiscussionStarted}
      />

      {/* 2.5 Live Office Peer-to-Peer Interaction Feed & Controls */}
      <LiveOfficeFeedPanel
        discussions={peerDiscussions}
        isAutonomous={isAutonomous}
        onToggleAutonomous={handleToggleAutonomous}
        onTriggerRandomDiscussion={handleTriggerRandomDiscussion}
        onTriggerCustomDiscussion={handleTriggerCustomDiscussion}
        onSelectAgent={(agent) => setSelectedAgent(agent)}
        onFocusPair={(agentId) => handleJumpToAgent(agentId)}
      />

      {/* 3. Quick Navigation Floating Dock */}
      <QuickNavDock onJumpToRoom={handleJumpToRoom} />

      {/* 4. Inspector Drawer (Agent Details, Live Code, 1-on-1 Chat & Skill Inspector) */}
      {selectedAgent && (
        <InspectorDrawer
          agent={agents[selectedAgent.id] || selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onJumpToDesk={handleJumpToAgent}
          onOpenMobileSimulator={() => setIsMobileSimulatorOpen(true)}
          onTriggerSkillDiscussion={(initiatorId, targetId, topic, skillCommand) => {
            handleTriggerCustomDiscussion(initiatorId, targetId, topic, skillCommand);
          }}
        />
      )}

      {/* 5. Kanban Board Modal */}
      <KanbanBoardModal
        isOpen={isKanbanOpen}
        onClose={() => setIsKanbanOpen(false)}
        onSelectAgent={(role) => {
          const profile = (agents || INITIAL_AGENTS_ROSTER)[role];
          if (profile) setSelectedAgent(profile);
        }}
      />

      {/* 6. Boardroom Meeting & HITL Modal */}
      <MeetingRoomModal
        isOpen={isMeetingOpen}
        onClose={() => setIsMeetingOpen(false)}
        onConcludeMeeting={handleConcludeMeeting}
      />

      {/* 7. Agent Roster Directory Modal */}
      <AgentRosterModal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        onSelectAgent={(agent) => setSelectedAgent(agent)}
        onJumpToAgent={handleJumpToAgent}
      />

      {/* 8. Workspace Explorer & Sandbox Terminal Modal */}
      <WorkspaceExplorerModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        projectId="proj-nexus-01"
      />

      {/* 9. Mobile App Simulator & Native Build Pipelines */}
      <MobileSimulatorModal
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        projectName={activeProject?.name}
      />
    </main>
  );
}

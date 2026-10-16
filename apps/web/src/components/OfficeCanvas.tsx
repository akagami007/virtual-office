'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { createPhaserConfig } from '../phaser/config';
import { OfficeScene, SceneCallbacks } from '../phaser/scenes/OfficeScene';
import { AgentPeerDiscussion, AgentProfile, RoomZone } from '@nexusdev/shared';

// Safe monkey-patch for AudioContext.prototype.suspend to guard against closed context suspensions
if (typeof window !== 'undefined') {
  const AudioContextClass =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (AudioContextClass && AudioContextClass.prototype) {
    const origSuspend = AudioContextClass.prototype.suspend;
    if (origSuspend && !(origSuspend as unknown as { __isPatched?: boolean }).__isPatched) {
      AudioContextClass.prototype.suspend = function () {
        if (this.state === 'closed') {
          return Promise.resolve();
        }
        return origSuspend.call(this);
      };
      (AudioContextClass.prototype.suspend as unknown as { __isPatched?: boolean }).__isPatched = true;
    }
  }
}

interface OfficeCanvasProps {
  onAgentClick: (agent: AgentProfile) => void;
  onRoomEnter: (room: RoomZone) => void;
  onPlayerMove?: (pos: { x: number; y: number }) => void;
  onMeetingTriggered?: (topic: string) => void;
  onPeerDiscussionStarted?: (discussion: AgentPeerDiscussion) => void;
}

export default function OfficeCanvas({
  onAgentClick,
  onRoomEnter,
  onPlayerMove,
  onMeetingTriggered,
  onPeerDiscussionStarted,
}: OfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const callbacksRef = useRef<SceneCallbacks>({
    onAgentClick,
    onRoomEnter,
    onPlayerMove,
    onMeetingTriggered,
    onPeerDiscussionStarted,
  });

  // Keep latest callbacks updated in ref and propagate to active scene
  useEffect(() => {
    callbacksRef.current = {
      onAgentClick,
      onRoomEnter,
      onPlayerMove,
      onMeetingTriggered,
      onPeerDiscussionStarted,
    };

    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('OfficeScene') as OfficeScene;
      if (scene && scene.scene.isActive()) {
        scene.setCallbacks(callbacksRef.current);
      }
    }
  }, [onAgentClick, onRoomEnter, onPlayerMove, onMeetingTriggered, onPeerDiscussionStarted]);

  // Initialize Phaser Game instance ONCE on mount
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createPhaserConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Attach initial callbacks once scene is booted
    const checkSceneBoot = setInterval(() => {
      const scene = game.scene.getScene('OfficeScene') as OfficeScene;
      if (scene && scene.scene.isActive()) {
        scene.setCallbacks(callbacksRef.current);
        clearInterval(checkSceneBoot);
      }
    }, 100);

    return () => {
      clearInterval(checkSceneBoot);
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (err) {
          console.warn('[Phaser] Game destroy warning:', err);
        }
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#070a11] overflow-hidden select-none">
      <div
        ref={containerRef}
        id="phaser-office-container"
        className="w-full h-full flex items-center justify-center shadow-2xl"
      />
      {/* Subtle corner vignette overlay */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />
    </div>
  );
}

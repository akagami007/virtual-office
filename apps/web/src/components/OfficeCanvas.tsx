'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { createPhaserConfig } from '../phaser/config';
import { OfficeScene, SceneCallbacks } from '../phaser/scenes/OfficeScene';
import { AgentProfile, RoomZone } from '@nexusdev/shared';

interface OfficeCanvasProps {
  onAgentClick: (agent: AgentProfile) => void;
  onRoomEnter: (room: RoomZone) => void;
  onPlayerMove?: (pos: { x: number; y: number }) => void;
  onMeetingTriggered?: (topic: string) => void;
}

export default function OfficeCanvas({
  onAgentClick,
  onRoomEnter,
  onPlayerMove,
  onMeetingTriggered,
}: OfficeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createPhaserConfig(containerRef.current);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Attach callbacks once scene is booted
    const checkSceneBoot = setInterval(() => {
      const scene = game.scene.getScene('OfficeScene') as OfficeScene;
      if (scene && scene.scene.isActive()) {
        const callbacks: SceneCallbacks = {
          onAgentClick,
          onRoomEnter,
          onPlayerMove,
          onMeetingTriggered,
        };
        scene.setCallbacks(callbacks);
        clearInterval(checkSceneBoot);
      }
    }, 100);

    return () => {
      clearInterval(checkSceneBoot);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onAgentClick, onRoomEnter, onPlayerMove, onMeetingTriggered]);

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

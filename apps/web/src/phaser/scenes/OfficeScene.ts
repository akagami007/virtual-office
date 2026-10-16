import * as Phaser from 'phaser';
import {
  AgentPeerDiscussion,
  AgentProfile,
  AgentRole,
  AgentState,
  AUTONOMOUS_PEER_DISCUSSIONS,
  INITIAL_AGENTS_ROSTER,
  INITIAL_ROOMS_SPEC,
  RoomId,
  RoomZone,
} from '@nexusdev/shared';

export interface SceneCallbacks {
  onAgentClick?: (agent: AgentProfile) => void;
  onRoomEnter?: (room: RoomZone) => void;
  onPlayerMove?: (pos: { x: number; y: number }) => void;
  onMeetingTriggered?: (topic: string) => void;
  onPeerDiscussionStarted?: (discussion: AgentPeerDiscussion) => void;
}

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private targetPosition: Phaser.Math.Vector2 | null = null;
  private agentsMap: Map<AgentRole, {
    container: Phaser.GameObjects.Container;
    profile: AgentProfile;
    statusText: Phaser.GameObjects.Text;
    statusBg: Phaser.GameObjects.Graphics;
    speechBubble?: Phaser.GameObjects.Container;
    activeBubbleType?: 'proximity' | 'dialogue';
  }> = new Map();

  private isMeetingActive: boolean = false;
  private isKeyboardBlocked: boolean = false;
  private isAutonomousEnabled: boolean = true;
  private isPeerDiscussionPlaying: boolean = false;
  private peerDiscussionIndex: number = 0;
  private peerLinkGraphics!: Phaser.GameObjects.Graphics;
  private activePeerPair: { a: AgentRole; b: AgentRole; color: number } | null = null;
  private peerTimers: Phaser.Time.TimerEvent[] = [];
  private currentRoom: RoomId | null = null;
  private callbacks: SceneCallbacks = {};

  constructor() {
    super({ key: 'OfficeScene' });
  }

  public init(data: { callbacks?: SceneCallbacks }) {
    if (data && data.callbacks) {
      this.callbacks = data.callbacks;
    }
  }

  public setCallbacks(callbacks: SceneCallbacks) {
    this.callbacks = callbacks;
  }

  public setKeyboardBlocked(blocked: boolean) {
    this.isKeyboardBlocked = blocked;
    if (blocked) {
      this.targetPosition = null;
      if (this.player && this.player.body) {
        this.player.setVelocity(0, 0);
      }
      if (this.input && this.input.keyboard) {
        this.input.keyboard.resetKeys();
      }
    }
  }

  public preload() {
    this.generateProceduralTextures();
  }

  public create() {
    // 1. World Bounds setup (1200 x 750)
    this.physics.world.setBounds(0, 0, 1200, 750);

    // 2. Build Floorplan, Walls, and Furniture
    this.buildOfficeFloorplan();

    // 2.5 Connection line graphics for peer-to-peer discussions
    this.peerLinkGraphics = this.add.graphics();
    this.peerLinkGraphics.setDepth(3.5);

    // 3. Spawn AI Agents at their desks
    this.spawnAgents();

    // 4. Spawn Player (CEO)
    this.spawnPlayer();

    // 5. Setup Camera
    this.cameras.main.setBounds(0, 0, 1200, 750);
    this.cameras.main.setZoom(1.1);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 6. Setup Keyboard & Mouse Inputs
    this.setupControls();

    // 7. Start Living Office Autonomous Discussion Loop
    this.setupAutonomousLoop();

    // Expose scene to window for React bridge
    if (typeof window !== 'undefined') {
      (window as unknown as { __NEXUS_SCENE__?: OfficeScene }).__NEXUS_SCENE__ = this;
    }
  }

  public override update() {
    this.handlePlayerMovement();
    this.checkRoomProximity();
    this.checkAgentProximity();
    this.updateSpeechBubblesAndPeerLinks();
  }

  // ==========================================
  // Texture Generator (Procedural Pixel-Art)
  // ==========================================
  private generateProceduralTextures() {
    // Tile Wood (32x32)
    const gWood = this.make.graphics({ x: 0, y: 0 });
    gWood.fillStyle(0x1a2333, 1);
    gWood.fillRect(0, 0, 32, 32);
    gWood.lineStyle(1, 0x223048, 0.8);
    gWood.strokeRect(0, 0, 32, 32);
    gWood.lineStyle(1, 0x161e2b, 0.5);
    gWood.lineBetween(0, 16, 32, 16);
    gWood.generateTexture('tile_wood', 32, 32);
    gWood.destroy();

    // Carpet Boardroom (32x32)
    const gCarpet = this.make.graphics({ x: 0, y: 0 });
    gCarpet.fillStyle(0x1e1e38, 1);
    gCarpet.fillRect(0, 0, 32, 32);
    gCarpet.lineStyle(1, 0x2d2b56, 0.6);
    gCarpet.strokeRect(1, 1, 30, 30);
    gCarpet.generateTexture('tile_carpet', 32, 32);
    gCarpet.destroy();

    // Tech Grid (32x32)
    const gTech = this.make.graphics({ x: 0, y: 0 });
    gTech.fillStyle(0x111b27, 1);
    gTech.fillRect(0, 0, 32, 32);
    gTech.lineStyle(1, 0x164e63, 0.4);
    gTech.strokeRect(0, 0, 32, 32);
    gTech.generateTexture('tile_tech', 32, 32);
    gTech.destroy();

    // Desk Furniture (64x40)
    const gDesk = this.make.graphics({ x: 0, y: 0 });
    gDesk.fillStyle(0x283548, 1);
    gDesk.fillRoundedRect(0, 0, 64, 40, 4);
    gDesk.lineStyle(2, 0x475569, 1);
    gDesk.strokeRoundedRect(0, 0, 64, 40, 4);
    // Computer screen
    gDesk.fillStyle(0x0f172a, 1);
    gDesk.fillRect(16, 6, 32, 18);
    gDesk.fillStyle(0x38bdf8, 0.9); // Glowing monitor screen
    gDesk.fillRect(18, 8, 28, 14);
    // Keyboard
    gDesk.fillStyle(0x64748b, 0.8);
    gDesk.fillRect(20, 26, 24, 8);
    gDesk.generateTexture('furniture_desk', 64, 40);
    gDesk.destroy();

    // Conference Table (180x80)
    const gConf = this.make.graphics({ x: 0, y: 0 });
    gConf.fillStyle(0x312e81, 1);
    gConf.fillRoundedRect(0, 0, 180, 80, 12);
    gConf.lineStyle(3, 0x6366f1, 0.8);
    gConf.strokeRoundedRect(0, 0, 180, 80, 12);
    // Holographic centerpiece
    gConf.fillStyle(0x4338ca, 0.6);
    gConf.fillCircle(90, 40, 20);
    gConf.lineStyle(1, 0x818cf8, 1);
    gConf.strokeCircle(90, 40, 20);
    gConf.generateTexture('furniture_conf_table', 180, 80);
    gConf.destroy();

    // Server Rack (40x70)
    const gServer = this.make.graphics({ x: 0, y: 0 });
    gServer.fillStyle(0x090d16, 1);
    gServer.fillRect(0, 0, 40, 70);
    gServer.lineStyle(2, 0x0ea5e9, 0.8);
    gServer.strokeRect(0, 0, 40, 70);
    // Blinking rack lights
    for (let y = 10; y <= 55; y += 12) {
      gServer.fillStyle(0x1e293b, 1);
      gServer.fillRect(4, y, 32, 8);
      gServer.fillStyle(0x22c55e, 1);
      gServer.fillCircle(8, y + 4, 2);
      gServer.fillStyle(0x06b6d4, 1);
      gServer.fillCircle(15, y + 4, 2);
    }
    gServer.generateTexture('furniture_server', 40, 70);
    gServer.destroy();

    // Generate Avatar Sprites
    this.generateAvatarSprite('avatar_ceo', 0x3b82f6, 0x93c5fd);
    this.generateAvatarSprite('avatar_cto', 0x8b5cf6, 0xc4b5fd);
    this.generateAvatarSprite('avatar_pm', 0xec4899, 0xf9a8d4);
    this.generateAvatarSprite('avatar_uiux', 0xf59e0b, 0xfde68a);
    this.generateAvatarSprite('avatar_fe', 0x10b981, 0x6ee7b7);
    this.generateAvatarSprite('avatar_be', 0x06b6d4, 0x67e8f9);
    this.generateAvatarSprite('avatar_mob', 0x6366f1, 0xa5b4fc);
    this.generateAvatarSprite('avatar_qa', 0xef4444, 0xfca5a5);
    this.generateAvatarSprite('avatar_ops', 0x14b8a6, 0x5eead4);
    this.generateAvatarSprite('avatar_pa', 0xf43f5e, 0xfecdd3);
  }

  private generateAvatarSprite(key: string, primaryColor: number, accentColor: number) {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Head / Hair
    g.fillStyle(accentColor, 1);
    g.fillCircle(16, 10, 8);
    // Face
    g.fillStyle(0xfde047, 0.9);
    g.fillCircle(16, 11, 6);
    // Eyes
    g.fillStyle(0x1e293b, 1);
    g.fillCircle(14, 11, 1.2);
    g.fillCircle(18, 11, 1.2);
    // Body / Uniform
    g.fillStyle(primaryColor, 1);
    g.fillRoundedRect(8, 17, 16, 15, 3);
    // Badge / Pin
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(11, 20, 3, 4);
    g.generateTexture(key, 32, 34);
    g.destroy();
  }

  // ==========================================
  // Floorplan & Room Layout
  // ==========================================
  private buildOfficeFloorplan() {
    // 1. Draw base floor tiles
    for (let x = 0; x < 1200; x += 32) {
      for (let y = 0; y < 750; y += 32) {
        // Boardroom area gets luxury carpet
        if (x >= 640 && x <= 920 && y >= 95 && y <= 405) {
          this.add.image(x + 16, y + 16, 'tile_carpet');
        } else if (x >= 930 && y >= 95 && y <= 405) {
          // QA Lab & DevOps gets tech grid
          this.add.image(x + 16, y + 16, 'tile_tech');
        } else {
          // Standard dark wood tile
          this.add.image(x + 16, y + 16, 'tile_wood');
        }
      }
    }

    // 2. Draw Room Dividers & Ambient Glowing Borders
    const gRooms = this.add.graphics();
    INITIAL_ROOMS_SPEC.forEach((room) => {
      // Room perimeter outline
      gRooms.lineStyle(1, Phaser.Display.Color.HexStringToColor(room.color).color, 0.35);
      gRooms.strokeRoundedRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height, 8);

      // Room Header Label
      const label = this.add.text(
        room.bounds.x + 10,
        room.bounds.y + 8,
        room.name.toUpperCase(),
        {
          fontSize: '10px',
          color: room.color,
          fontStyle: 'bold',
          fontFamily: 'monospace',
          backgroundColor: '#0f172aee',
          padding: { x: 5, y: 3 },
        }
      );
      label.setDepth(2);
    });

    // 3. Furniture Placement
    // Boardroom: Conference Table in center
    const confTable = this.add.image(780, 250, 'furniture_conf_table');
    confTable.setDepth(2);

    // DevOps: Server Racks
    this.add.image(975, 345, 'furniture_server').setDepth(2);
    this.add.image(1115, 345, 'furniture_server').setDepth(2);

    // Whiteboard in Design Studio
    const gWb = this.add.graphics();
    gWb.fillStyle(0xf8fafc, 0.9);
    gWb.fillRoundedRect(95, 145, 95, 8, 2);
    gWb.lineStyle(2, 0x475569, 1);
    gWb.strokeRoundedRect(95, 145, 95, 8, 2);
    gWb.setDepth(2);

    // Lounge: Sofa and Water cooler
    const gLounge = this.add.graphics();
    gLounge.fillStyle(0x7c3aed, 0.8);
    gLounge.fillRoundedRect(710, 540, 100, 30, 6);
    gLounge.fillStyle(0x0284c7, 1);
    gLounge.fillCircle(860, 555, 10); // Water dispenser
    gLounge.setDepth(2);
  }

  // ==========================================
  // Agents Setup
  // ==========================================
  private spawnAgents() {
    const roles: AgentRole[] = [
      'AGT-CTO',
      'AGT-PM',
      'AGT-UIUX',
      'AGT-FE',
      'AGT-BE',
      'AGT-MOB',
      'AGT-QA',
      'AGT-OPS',
      'AGT-PA',
    ];

    roles.forEach((role) => {
      const profile = INITIAL_AGENTS_ROSTER[role];
      if (!profile) return;

      // 1. Desk placement
      const desk = this.add.image(profile.deskPosition.x, profile.deskPosition.y, 'furniture_desk');
      desk.setDepth(3);

      // 2. Container for Agent Avatar + Nametag + Status Pill
      const container = this.add.container(profile.deskPosition.x, profile.deskPosition.y - 12);
      container.setDepth(4);

      // Agent Sprite
      const sprite = this.add.sprite(0, 0, profile.avatarSprite);
      sprite.setInteractive({ useHandCursor: true });

      // Pulsing Glow on hover
      sprite.on('pointerover', () => {
        sprite.setScale(1.15);
        nameText.setColor('#ffffff');
      });
      sprite.on('pointerout', () => {
        sprite.setScale(1);
        nameText.setColor(profile.color);
      });

      // Click to select Agent
      sprite.on('pointerdown', () => {
        if (this.callbacks.onAgentClick) {
          this.callbacks.onAgentClick(profile);
        }
      });

      // Name label
      const nameText = this.add.text(0, -26, profile.name.split(' ')[0], {
        fontSize: '11px',
        color: profile.color,
        fontStyle: 'bold',
        fontFamily: 'sans-serif',
      }).setOrigin(0.5);

      // Status pill background
      const statusBg = this.add.graphics();
      this.drawStatusPill(statusBg, profile.state);

      // Status text
      const statusText = this.add.text(0, 22, profile.state, {
        fontSize: '8px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      }).setOrigin(0.5);

      container.add([sprite, nameText, statusBg, statusText]);

      this.agentsMap.set(role, {
        container,
        profile,
        statusText,
        statusBg,
      });
    });
  }

  private drawStatusPill(g: Phaser.GameObjects.Graphics, state: AgentState) {
    g.clear();
    let color = 0x64748b; // IDLE
    if (state === 'CODING') color = 0x10b981;
    if (state === 'TESTING') color = 0xef4444;
    if (state === 'REVIEWING') color = 0x8b5cf6;
    if (state === 'THINKING') color = 0xec4899;
    if (state === 'WAITING_APPROVAL') color = 0xf59e0b;

    g.fillStyle(color, 0.9);
    g.fillRoundedRect(-24, 16, 48, 12, 4);
    g.lineStyle(1, 0xffffff, 0.4);
    g.strokeRoundedRect(-24, 16, 48, 12, 4);
  }

  // ==========================================
  // Player Setup (CEO)
  // ==========================================
  private spawnPlayer() {
    const ceoProfile = INITIAL_AGENTS_ROSTER['USR-CEO'];
    const spawnX = ceoProfile.deskPosition.x;
    const spawnY = ceoProfile.deskPosition.y;

    // CEO desk (interactive to open CEO Command Center)
    const ceoDesk = this.add.image(spawnX, spawnY + 20, 'furniture_desk').setDepth(3);
    ceoDesk.setInteractive({ useHandCursor: true });
    ceoDesk.on('pointerdown', () => {
      if (this.callbacks.onAgentClick) {
        this.callbacks.onAgentClick(ceoProfile);
      }
    });

    // Player body
    this.player = this.physics.add.sprite(spawnX, spawnY - 10, 'avatar_ceo');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(5);
    this.player.body.setSize(24, 24);
    this.player.setInteractive({ useHandCursor: true });
    this.player.on('pointerdown', () => {
      if (this.callbacks.onAgentClick) {
        this.callbacks.onAgentClick(ceoProfile);
      }
    });

    // Player floating Nametag
    const ceoLabel = this.add.text(spawnX, spawnY - 32, 'CEO (You) • Klik Command', {
      fontSize: '10px',
      color: '#60a5fa',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      backgroundColor: '#1e3a8acc',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5).setDepth(6);

    // Sync label with player position
    this.events.on('postupdate', () => {
      ceoLabel.setPosition(this.player.x, this.player.y - 24);
    });
  }

  // ==========================================
  // Controls & Pathfinding
  // ==========================================
  private isTypingInInput(): boolean {
    if (typeof document === 'undefined') return false;
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if ((el as HTMLElement).isContentEditable) return true;
    return false;
  }

  private setupControls() {
    if (!this.input.keyboard) return;

    // Crucial: Disable Phaser global key capture so W, A, S, D, Space, and Arrows
    // never call event.preventDefault() when typing inside HTML <input> or <textarea>
    this.input.keyboard.disableGlobalCapture();

    this.cursors = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, false),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, false),
      space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false),
      shift: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false),
    };
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
    };

    // Click on canvas to walk
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
        if (this.isKeyboardBlocked) return;
        if (pointer.rightButtonDown() || pointer.event.defaultPrevented) return;

        // If user clicked on an interactive agent sprite, don't walk on top of their desk
        if (currentlyOver && currentlyOver.length > 0) return;

        // Blur any focused HTML text input when clicking back on the 2D canvas
        if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
          const tag = document.activeElement.tagName.toUpperCase();
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            document.activeElement.blur();
          }
        }

        this.targetPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
      }
    );
  }

  private handlePlayerMovement() {
    // Do not process WASD / Arrow movement when user is typing in an input or when a full modal is open
    if (this.isKeyboardBlocked || this.isTypingInInput()) {
      if (!this.targetPosition) {
        this.player.setVelocity(0, 0);
        return;
      }
    }

    const speed = 160;
    let vx = 0;
    let vy = 0;

    // Only read keyboard WASD / Arrow keys when not typing in an input field and no modal is blocking
    if (!this.isKeyboardBlocked && !this.isTypingInInput() && this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
      if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
      if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
      if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;
    }

    if (vx !== 0 || vy !== 0) {
      // Cancel click-to-move if keyboard is pressed
      this.targetPosition = null;
      this.player.setVelocity(vx, vy);
      if (this.callbacks.onPlayerMove) {
        this.callbacks.onPlayerMove({ x: this.player.x, y: this.player.y });
      }
    } else if (this.targetPosition) {
      // Click-to-move pathing
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        this.targetPosition.x,
        this.targetPosition.y
      );

      if (distance > 8) {
        this.physics.moveToObject(this.player, this.targetPosition, speed);
        if (this.callbacks.onPlayerMove) {
          this.callbacks.onPlayerMove({ x: this.player.x, y: this.player.y });
        }
      } else {
        this.player.setVelocity(0, 0);
        this.targetPosition = null;
      }
    } else {
      this.player.setVelocity(0, 0);
    }
  }

  // ==========================================
  // Proximity Detectors
  // ==========================================
  private checkRoomProximity() {
    let activeRoom: RoomZone | null = null;
    for (const room of INITIAL_ROOMS_SPEC) {
      if (
        this.player.x >= room.bounds.x &&
        this.player.x <= room.bounds.x + room.bounds.width &&
        this.player.y >= room.bounds.y &&
        this.player.y <= room.bounds.y + room.bounds.height
      ) {
        activeRoom = room;
        break;
      }
    }

    if (activeRoom && activeRoom.id !== this.currentRoom) {
      this.currentRoom = activeRoom.id;
      if (this.callbacks.onRoomEnter) {
        this.callbacks.onRoomEnter(activeRoom);
      }
    }
  }

  private checkAgentProximity() {
    this.agentsMap.forEach((agent) => {
      // Do not overwrite an active dialogue speech bubble with proximity prompt
      if (agent.activeBubbleType === 'dialogue') return;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        agent.container.x,
        agent.container.y
      );

      // Proximity threshold = 55px
      if (dist < 55) {
        if (!agent.speechBubble) {
          this.showProximityBubble(agent);
        }
      } else {
        if (agent.speechBubble && agent.activeBubbleType === 'proximity') {
          agent.speechBubble.destroy();
          agent.speechBubble = undefined;
          agent.activeBubbleType = undefined;
        }
      }
    });
  }

  private showProximityBubble(agent: {
    container: Phaser.GameObjects.Container;
    profile: AgentProfile;
    speechBubble?: Phaser.GameObjects.Container;
    activeBubbleType?: 'proximity' | 'dialogue';
  }) {
    const bubble = this.add.container(agent.container.x, agent.container.y - 48);
    bubble.setDepth(10);

    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.95);
    bg.fillRoundedRect(-50, -12, 100, 22, 5);
    bg.lineStyle(1, 0x6366f1, 0.8);
    bg.strokeRoundedRect(-50, -12, 100, 22, 5);

    const text = this.add.text(0, -1, 'Klik tuk bicara', {
      fontSize: '9px',
      color: '#e2e8f0',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bubble.add([bg, text]);
    agent.speechBubble = bubble;
    agent.activeBubbleType = 'proximity';
  }

  private updateSpeechBubblesAndPeerLinks() {
    // Keep speech bubbles anchored above moving agent containers
    this.agentsMap.forEach((agent) => {
      if (agent.speechBubble) {
        const yOffset = agent.activeBubbleType === 'dialogue' ? -54 : -48;
        agent.speechBubble.setPosition(agent.container.x, agent.container.y + yOffset);
      }
    });

    // Draw glowing collaboration line between conversing agents
    if (this.peerLinkGraphics) {
      this.peerLinkGraphics.clear();
      if (this.activePeerPair) {
        const agentA = this.agentsMap.get(this.activePeerPair.a);
        const agentB = this.agentsMap.get(this.activePeerPair.b);
        if (agentA && agentB) {
          this.peerLinkGraphics.lineStyle(2, this.activePeerPair.color, 0.55);
          this.peerLinkGraphics.lineBetween(
            agentA.container.x,
            agentA.container.y,
            agentB.container.x,
            agentB.container.y
          );
          this.peerLinkGraphics.fillStyle(this.activePeerPair.color, 0.85);
          this.peerLinkGraphics.fillCircle(agentA.container.x, agentA.container.y, 4);
          this.peerLinkGraphics.fillCircle(agentB.container.x, agentB.container.y, 4);
        }
      }
    }
  }

  private setupAutonomousLoop() {
    // Trigger initial peer discussion 3.5 seconds after studio boot
    this.time.delayedCall(3500, () => {
      if (this.isAutonomousEnabled && !this.isMeetingActive && !this.isPeerDiscussionPlaying) {
        this.triggerRandomPeerDiscussion();
      }
    });

    // Periodic living office cycle every 20 seconds
    this.time.addEvent({
      delay: 20000,
      loop: true,
      callback: () => {
        if (this.isAutonomousEnabled && !this.isMeetingActive && !this.isPeerDiscussionPlaying) {
          this.triggerRandomPeerDiscussion();
        }
      },
    });
  }

  public setAutonomousEnabled(enabled: boolean) {
    this.isAutonomousEnabled = enabled;
  }

  public getAutonomousEnabled(): boolean {
    return this.isAutonomousEnabled;
  }

  public triggerRandomPeerDiscussion(): AgentPeerDiscussion | null {
    if (this.isMeetingActive) return null;
    const preset =
      AUTONOMOUS_PEER_DISCUSSIONS[this.peerDiscussionIndex % AUTONOMOUS_PEER_DISCUSSIONS.length];
    this.peerDiscussionIndex += 1;

    const discussion: AgentPeerDiscussion = {
      ...preset,
      id: `disc-auto-${Date.now()}`,
      startedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    this.playPeerDiscussion(discussion);
    return discussion;
  }

  private clearActivePeerTimers() {
    this.peerTimers.forEach((t) => t.remove(false));
    this.peerTimers = [];
  }

  public playPeerDiscussion(discussion: AgentPeerDiscussion, panCamera: boolean = false) {
    if (this.isMeetingActive) return;

    const initiator = this.agentsMap.get(discussion.initiatorId);
    const target = this.agentsMap.get(discussion.targetId);
    if (!initiator || !target) return;

    // Cancel any previous peer discussion timers and reset previous pair to desks
    this.clearActivePeerTimers();
    if (this.activePeerPair) {
      const prevA = this.agentsMap.get(this.activePeerPair.a);
      const prevB = this.agentsMap.get(this.activePeerPair.b);
      if (prevA && prevA.profile.id !== initiator.profile.id && prevA.profile.id !== target.profile.id) {
        this.tweens.add({
          targets: prevA.container,
          x: prevA.profile.deskPosition.x,
          y: prevA.profile.deskPosition.y - 12,
          duration: 800,
        });
      }
      if (prevB && prevB.profile.id !== initiator.profile.id && prevB.profile.id !== target.profile.id) {
        this.tweens.add({
          targets: prevB.container,
          x: prevB.profile.deskPosition.x,
          y: prevB.profile.deskPosition.y - 12,
          duration: 800,
        });
      }
    }

    this.isPeerDiscussionPlaying = true;
    const lineColor = Phaser.Display.Color.HexStringToColor(initiator.profile.color).color;
    this.activePeerPair = {
      a: discussion.initiatorId,
      b: discussion.targetId,
      color: lineColor,
    };

    // Notify React UI Feed Panel
    if (this.callbacks.onPeerDiscussionStarted) {
      this.callbacks.onPeerDiscussionStarted(discussion);
    }

    // Save original states
    const origInitiatorState = initiator.profile.state;
    const origTargetState = target.profile.state;
    this.updateAgentState(discussion.initiatorId, 'REVIEWING');
    this.updateAgentState(discussion.targetId, 'THINKING');

    // Determine meeting coordinates: Coffee Lounge break vs Target's Desk
    let destInitiatorX = target.profile.deskPosition.x - 42;
    let destInitiatorY = target.profile.deskPosition.y - 8;
    let destTargetX = target.profile.deskPosition.x;
    let destTargetY = target.profile.deskPosition.y - 12;

    if (discussion.isLoungeBreak) {
      destInitiatorX = 735;
      destInitiatorY = 552;
      destTargetX = 790;
      destTargetY = 552;
    } else {
      // Keep inside room bounds nicely
      if (destInitiatorX < 55) destInitiatorX = target.profile.deskPosition.x + 42;
    }

    if (panCamera) {
      this.cameras.main.pan(
        (destInitiatorX + destTargetX) / 2,
        (destInitiatorY + destTargetY) / 2,
        650,
        'Power2'
      );
    }

    // Walk initiator (and target if Lounge break) to destination
    this.tweens.add({
      targets: initiator.container,
      x: destInitiatorX,
      y: destInitiatorY,
      duration: 1350,
      ease: 'Sine.easeInOut',
    });

    if (discussion.isLoungeBreak) {
      this.tweens.add({
        targets: target.container,
        x: destTargetX,
        y: destTargetY,
        duration: 1350,
        ease: 'Sine.easeInOut',
      });
    }

    // Schedule each dialogue turn sequentially after arrival
    const turnIntervalMs = 3400;
    const arrivalDelayMs = 1450;

    discussion.turns.forEach((turn, idx) => {
      const timer = this.time.delayedCall(arrivalDelayMs + idx * turnIntervalMs, () => {
        if (this.isMeetingActive) return;
        const skillPrefix = turn.skillUsed ? `${turn.skillUsed}: ` : '';
        this.showSpeechBubble(turn.speakerId, `${skillPrefix}${turn.text}`, turnIntervalMs - 250);
      });
      this.peerTimers.push(timer);
    });

    // Conclude discussion and walk back to desks
    const totalDurationMs = arrivalDelayMs + discussion.turns.length * turnIntervalMs + 400;
    const endTimer = this.time.delayedCall(totalDurationMs, () => {
      this.activePeerPair = null;
      this.isPeerDiscussionPlaying = false;

      if (!this.isMeetingActive) {
        this.tweens.add({
          targets: initiator.container,
          x: initiator.profile.deskPosition.x,
          y: initiator.profile.deskPosition.y - 12,
          duration: 1350,
          ease: 'Sine.easeInOut',
        });

        if (discussion.isLoungeBreak) {
          this.tweens.add({
            targets: target.container,
            x: target.profile.deskPosition.x,
            y: target.profile.deskPosition.y - 12,
            duration: 1350,
            ease: 'Sine.easeInOut',
          });
        }
      }

      this.updateAgentState(discussion.initiatorId, origInitiatorState);
      this.updateAgentState(discussion.targetId, origTargetState);
    });
    this.peerTimers.push(endTimer);
  }

  // ==========================================
  // Public Interactive Methods (React Bridge)
  // ==========================================
  public jumpToRoom(roomId: RoomId) {
    const room = INITIAL_ROOMS_SPEC.find((r) => r.id === roomId);
    if (!room) return;
    this.targetPosition = new Phaser.Math.Vector2(room.center.x, room.center.y);
    this.cameras.main.pan(room.center.x, room.center.y, 600, 'Power2');
  }

  public jumpToAgent(agentId: AgentRole) {
    const agent = this.agentsMap.get(agentId);
    if (!agent) return;
    this.targetPosition = new Phaser.Math.Vector2(
      agent.container.x,
      agent.container.y + 40
    );
    this.cameras.main.pan(agent.container.x, agent.container.y, 500, 'Power2');
  }

  public callMeeting(topic: string) {
    this.isMeetingActive = true;
    this.clearActivePeerTimers();
    this.activePeerPair = null;
    this.isPeerDiscussionPlaying = false;

    // Animate all agents walking into the Boardroom
    this.agentsMap.forEach((agent) => {
      this.tweens.add({
        targets: agent.container,
        x: agent.profile.meetingPosition.x,
        y: agent.profile.meetingPosition.y,
        duration: 1200,
        ease: 'Cubic.easeInOut',
      });
    });

    // Walk CEO to the head of the conference table
    this.tweens.add({
      targets: this.player,
      x: 675,
      y: 250,
      duration: 1000,
      ease: 'Cubic.easeInOut',
    });

    this.cameras.main.pan(780, 250, 800, 'Power2');
    if (this.callbacks.onMeetingTriggered) {
      this.callbacks.onMeetingTriggered(topic);
    }
  }

  public concludeMeeting() {
    this.isMeetingActive = false;
    // Animate all agents back to their respective desks
    this.agentsMap.forEach((agent) => {
      this.tweens.add({
        targets: agent.container,
        x: agent.profile.deskPosition.x,
        y: agent.profile.deskPosition.y - 12,
        duration: 1400,
        ease: 'Cubic.easeInOut',
      });
    });
  }

  public updateAgentState(agentId: AgentRole, newState: AgentState, currentTask?: string) {
    const agent = this.agentsMap.get(agentId);
    if (!agent) return;
    agent.profile.state = newState;
    if (currentTask) agent.profile.currentTask = currentTask;
    agent.statusText.setText(newState);
    this.drawStatusPill(agent.statusBg, newState);
  }

  public showSpeechBubble(agentId: AgentRole, message: string, durationMs: number = 4000) {
    const agent = this.agentsMap.get(agentId);
    if (!agent) return;

    if (agent.speechBubble) {
      agent.speechBubble.destroy();
      agent.speechBubble = undefined;
    }

    const shortMsg = message.length > 56 ? `${message.slice(0, 56)}...` : message;
    const bubble = this.add.container(agent.container.x, agent.container.y - 54);
    bubble.setDepth(12);

    const width = Math.max(125, shortMsg.length * 5.1 + 22);
    const bg = this.add.graphics();
    bg.fillStyle(0x0f172a, 0.96);
    bg.fillRoundedRect(-width / 2, -14, width, 26, 6);
    bg.lineStyle(1.5, Phaser.Display.Color.HexStringToColor(agent.profile.color).color, 0.95);
    bg.strokeRoundedRect(-width / 2, -14, width, 26, 6);

    const text = this.add.text(0, -1, shortMsg, {
      fontSize: '9.5px',
      color: '#f8fafc',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    bubble.add([bg, text]);
    agent.speechBubble = bubble;
    agent.activeBubbleType = 'dialogue';

    this.time.delayedCall(durationMs, () => {
      if (agent.speechBubble === bubble) {
        bubble.destroy();
        agent.speechBubble = undefined;
        agent.activeBubbleType = undefined;
      }
    });
  }
}

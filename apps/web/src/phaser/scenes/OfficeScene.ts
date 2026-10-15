import * as Phaser from 'phaser';
import {
  AgentProfile,
  AgentRole,
  AgentState,
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
  }> = new Map();

  private isMeetingActive: boolean = false;
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

  public preload() {
    this.generateProceduralTextures();
  }

  public create() {
    // 1. World Bounds setup (1200 x 750)
    this.physics.world.setBounds(0, 0, 1200, 750);

    // 2. Build Floorplan, Walls, and Furniture
    this.buildOfficeFloorplan();

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

    // Expose scene to window for React bridge
    if (typeof window !== 'undefined') {
      (window as unknown as { __NEXUS_SCENE__?: OfficeScene }).__NEXUS_SCENE__ = this;
    }
  }

  public override update() {
    this.handlePlayerMovement();
    this.checkRoomProximity();
    this.checkAgentProximity();
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
        if (x >= 550 && x <= 870 && y >= 90 && y <= 330) {
          this.add.image(x + 16, y + 16, 'tile_carpet');
        } else if (x >= 900 && y >= 90 && y <= 450) {
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
        room.bounds.x + 12,
        room.bounds.y + 10,
        room.name.toUpperCase(),
        {
          fontSize: '11px',
          color: room.color,
          fontStyle: 'bold',
          fontFamily: 'monospace',
          backgroundColor: '#0f172aee',
          padding: { x: 6, y: 3 },
        }
      );
      label.setDepth(2);
    });

    // 3. Furniture Placement
    // Boardroom: Conference Table in center
    const confTable = this.add.image(710, 210, 'furniture_conf_table');
    confTable.setDepth(2);

    // DevOps: Server Racks
    this.add.image(950, 340, 'furniture_server').setDepth(2);
    this.add.image(1000, 340, 'furniture_server').setDepth(2);
    this.add.image(1050, 340, 'furniture_server').setDepth(2);

    // Whiteboard in Design Studio
    const gWb = this.add.graphics();
    gWb.fillStyle(0xf8fafc, 0.9);
    gWb.fillRoundedRect(160, 150, 90, 8, 2);
    gWb.lineStyle(2, 0x475569, 1);
    gWb.strokeRoundedRect(160, 150, 90, 8, 2);
    gWb.setDepth(2);

    // Lounge: Sofa and Water cooler
    const gLounge = this.add.graphics();
    gLounge.fillStyle(0x7c3aed, 0.8);
    gLounge.fillRoundedRect(680, 540, 100, 30, 6);
    gLounge.fillStyle(0x0284c7, 1);
    gLounge.fillCircle(820, 555, 10); // Water dispenser
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

    // CEO desk
    this.add.image(spawnX, spawnY + 20, 'furniture_desk').setDepth(3);

    // Player body
    this.player = this.physics.add.sprite(spawnX, spawnY - 10, 'avatar_ceo');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(5);
    this.player.body.setSize(24, 24);

    // Player floating Nametag
    const ceoLabel = this.add.text(spawnX, spawnY - 32, 'CEO (You)', {
      fontSize: '11px',
      color: '#60a5fa',
      fontStyle: 'bold',
      fontFamily: 'sans-serif',
      backgroundColor: '#1e3a8a99',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(6);

    // Sync label with player position
    this.events.on('postupdate', () => {
      ceoLabel.setPosition(this.player.x, this.player.y - 24);
    });
  }

  // ==========================================
  // Controls & Pathfinding
  // ==========================================
  private setupControls() {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Click to walk
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // If clicked on an agent sprite, don't walk
      if (pointer.rightButtonDown() || pointer.event.defaultPrevented) return;
      this.targetPosition = new Phaser.Math.Vector2(pointer.worldX, pointer.worldY);
    });
  }

  private handlePlayerMovement() {
    const speed = 160;
    let vx = 0;
    let vy = 0;

    // Keyboard inputs
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += speed;

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
        if (agent.speechBubble) {
          agent.speechBubble.destroy();
          agent.speechBubble = undefined;
        }
      }
    });
  }

  private showProximityBubble(agent: {
    container: Phaser.GameObjects.Container;
    profile: AgentProfile;
    speechBubble?: Phaser.GameObjects.Container;
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
      x: 710,
      y: 280,
      duration: 1000,
      ease: 'Cubic.easeInOut',
    });

    this.cameras.main.pan(710, 210, 800, 'Power2');
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
}

import * as Phaser from 'phaser';
import { AgentRole } from '@nexusdev/shared';
import { HUMAN_CHARACTER_SPECS, HumanCharacterVisualSpec } from '../components/CharacterAvatar';

export type CharacterPose = 'idle_0' | 'idle_1' | 'blink' | 'walk_0' | 'walk_1' | 'work_0' | 'work_1';

const SPRITE_KEY_TO_ROLE: Record<string, AgentRole> = {
  avatar_ceo: 'USR-CEO',
  avatar_pa: 'AGT-PA',
  avatar_cto: 'AGT-CTO',
  avatar_pm: 'AGT-PM',
  avatar_uiux: 'AGT-UIUX',
  avatar_fe: 'AGT-FE',
  avatar_be: 'AGT-BE',
  avatar_mob: 'AGT-MOB',
  avatar_qa: 'AGT-QA',
  avatar_ops: 'AGT-OPS',
};

const POSES: CharacterPose[] = [
  'idle_0',
  'idle_1',
  'blink',
  'walk_0',
  'walk_1',
  'work_0',
  'work_1',
];

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function renderCharacterPoseToCtx(
  ctx: CanvasRenderingContext2D,
  spec: HumanCharacterVisualSpec,
  pose: CharacterPose
) {
  ctx.clearRect(0, 0, 44, 52);

  // Compute animation offsets for breathing, walking, and typing
  const bodyBobY =
    pose === 'idle_1' ? 1 : pose === 'walk_0' || pose === 'walk_1' ? -1 : 0;
  const headBobY =
    pose === 'idle_1'
      ? 1
      : pose === 'work_0'
      ? 0.8
      : pose === 'work_1'
      ? 1.4
      : 0;

  const leftLegOffsetY = pose === 'walk_0' ? -2.5 : pose === 'walk_1' ? 2 : 0;
  const rightLegOffsetY = pose === 'walk_1' ? -2.5 : pose === 'walk_0' ? 2 : 0;

  const leftArmSwingY =
    pose === 'walk_0'
      ? 2
      : pose === 'walk_1'
      ? -2
      : pose === 'work_0'
      ? -3.5
      : pose === 'work_1'
      ? -1.5
      : 0;
  const rightArmSwingY =
    pose === 'walk_1'
      ? 2
      : pose === 'walk_0'
      ? -2
      : pose === 'work_1'
      ? -3.5
      : pose === 'work_0'
      ? -1.5
      : 0;

  // 1. Soft Ground Drop Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
  ctx.beginPath();
  ctx.ellipse(22, 47, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Back Hair (for long-haired characters)
  if (
    spec.hairStyle === 'long_wave' ||
    spec.hairStyle === 'ponytail' ||
    spec.hairStyle === 'shoulder_neat' ||
    spec.hairStyle === 'bob_bangs'
  ) {
    ctx.fillStyle = spec.hairColor;
    drawRoundRect(ctx, 11, 10 + headBobY, 22, 18, 8);
    ctx.fill();
    if (spec.hairStyle === 'ponytail') {
      ctx.beginPath();
      ctx.ellipse(33, 17 + headBobY, 4, 6, 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Legs / Trousers & Shoes
  // Left Leg
  ctx.fillStyle = spec.pantsColor;
  drawRoundRect(ctx, 15, 34 + bodyBobY + leftLegOffsetY, 6, 10, 2.5);
  ctx.fill();
  ctx.fillStyle = spec.shoeColor;
  drawRoundRect(ctx, 14.5, 42 + bodyBobY + leftLegOffsetY, 7, 4, 2);
  ctx.fill();

  // Right Leg
  ctx.fillStyle = spec.pantsColor;
  drawRoundRect(ctx, 23, 34 + bodyBobY + rightLegOffsetY, 6, 10, 2.5);
  ctx.fill();
  ctx.fillStyle = spec.shoeColor;
  drawRoundRect(ctx, 22.5, 42 + bodyBobY + rightLegOffsetY, 7, 4, 2);
  ctx.fill();

  // 4. Torso / Jacket / Outfit
  ctx.fillStyle = spec.outfitPrimary;
  drawRoundRect(ctx, 13, 22 + bodyBobY, 18, 15, 5);
  ctx.fill();

  // Inner Shirt V-Neck / Collar
  ctx.fillStyle = spec.shirtInner;
  ctx.beginPath();
  ctx.moveTo(18, 22 + bodyBobY);
  ctx.lineTo(22, 30 + bodyBobY);
  ctx.lineTo(26, 22 + bodyBobY);
  ctx.closePath();
  ctx.fill();

  // Jacket Lapels / Trim
  ctx.strokeStyle = spec.outfitSecondary;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(18, 22 + bodyBobY);
  ctx.lineTo(20, 34 + bodyBobY);
  ctx.moveTo(26, 22 + bodyBobY);
  ctx.lineTo(24, 34 + bodyBobY);
  ctx.stroke();

  // Role-specific Torso Accessory (CEO tie, PA necklace, FE headphones on neck)
  if (spec.accessory === 'tie_pin') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(21, 24 + bodyBobY);
    ctx.lineTo(23, 24 + bodyBobY);
    ctx.lineTo(23.5, 33 + bodyBobY);
    ctx.lineTo(22, 35 + bodyBobY);
    ctx.lineTo(20.5, 33 + bodyBobY);
    ctx.closePath();
    ctx.fill();
  } else if (spec.accessory === 'necklace_clip') {
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(22, 24 + bodyBobY, 3.2, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (spec.accessory === 'lanyard') {
    ctx.fillStyle = '#38bdf8';
    drawRoundRect(ctx, 20, 29 + bodyBobY, 4, 5, 1);
    ctx.fill();
  }

  // 5. Left & Right Arms + Human Hands
  // Left Arm
  ctx.fillStyle = spec.outfitPrimary;
  drawRoundRect(ctx, 9.5, 23 + bodyBobY + leftArmSwingY * 0.5, 4.5, 11, 2.2);
  ctx.fill();
  ctx.fillStyle = spec.skinColor;
  ctx.beginPath();
  ctx.arc(11.7, 34.5 + bodyBobY + leftArmSwingY, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // Right Arm
  ctx.fillStyle = spec.outfitPrimary;
  drawRoundRect(ctx, 30, 23 + bodyBobY + rightArmSwingY * 0.5, 4.5, 11, 2.2);
  ctx.fill();
  ctx.fillStyle = spec.skinColor;
  ctx.beginPath();
  ctx.arc(32.3, 34.5 + bodyBobY + rightArmSwingY, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // 6. Neck
  ctx.fillStyle = spec.skinShadow;
  drawRoundRect(ctx, 19.5, 19 + headBobY, 5, 5, 2);
  ctx.fill();

  // 7. Ears
  ctx.fillStyle = spec.skinShadow;
  ctx.beginPath();
  ctx.arc(12, 14.5 + headBobY, 2.2, 0, Math.PI * 2);
  ctx.arc(32, 14.5 + headBobY, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // 8. Head / Face (Warm Human Skin Tone with subtle outline)
  ctx.fillStyle = spec.skinColor;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.lineWidth = 1;
  drawRoundRect(ctx, 12.5, 5.5 + headBobY, 19, 16.5, 7.5);
  ctx.fill();
  ctx.stroke();

  // Cheek Blush
  ctx.fillStyle = spec.blushColor;
  ctx.globalAlpha = 0.32;
  ctx.beginPath();
  ctx.ellipse(16, 16.5 + headBobY, 2, 1.1, 0, 0, Math.PI * 2);
  ctx.ellipse(28, 16.5 + headBobY, 2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyebrows
  ctx.strokeStyle = spec.hairColor;
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(16, 11.5 + headBobY);
  ctx.lineTo(19.5, 11.3 + headBobY);
  ctx.moveTo(24.5, 11.3 + headBobY);
  ctx.lineTo(28, 11.5 + headBobY);
  ctx.stroke();

  // Eyes (Open vs Blink frame)
  if (pose === 'blink') {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(16.2, 14.2 + headBobY);
    ctx.lineTo(19.5, 14.2 + headBobY);
    ctx.moveTo(24.5, 14.2 + headBobY);
    ctx.lineTo(27.8, 14.2 + headBobY);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(17.8, 14.2 + headBobY, 1.65, 0, Math.PI * 2);
    ctx.arc(26.2, 14.2 + headBobY, 1.65, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights (makes characters look alive!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(18.3, 13.6 + headBobY, 0.65, 0, Math.PI * 2);
    ctx.arc(26.7, 13.6 + headBobY, 0.65, 0, Math.PI * 2);
    ctx.fill();
  }

  // Friendly Smile
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(22, 16.8 + headBobY, 2.3, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Beard for DevOps (Dion)
  if (spec.hairStyle === 'cap_beard') {
    ctx.fillStyle = spec.hairColor;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(22, 16.2 + headBobY, 6.2, 0.12 * Math.PI, 0.88 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Glasses for Viktor (CTO), Kael (UI/UX), Sinta (QA)
  if (
    spec.accessory === 'glasses_round' ||
    spec.accessory === 'tinted_glasses' ||
    spec.accessory === 'glasses_cat'
  ) {
    ctx.strokeStyle = spec.accessory === 'glasses_cat' ? '#fb7185' : '#e2e8f0';
    ctx.lineWidth = 1.2;
    drawRoundRect(ctx, 14.8, 12.1 + headBobY, 6, 4.2, 1.5);
    ctx.stroke();
    drawRoundRect(ctx, 23.2, 12.1 + headBobY, 6, 4.2, 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20.8, 14 + headBobY);
    ctx.lineTo(23.2, 14 + headBobY);
    ctx.stroke();
  }

  // Headphones on head/neck for Nadia (FE) & Dion (DevOps)
  if (spec.accessory === 'headphones' || spec.accessory === 'cap_headset') {
    ctx.strokeStyle = spec.outfitSecondary;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(22, 13.5 + headBobY, 10.2, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    drawRoundRect(ctx, 10, 12 + headBobY, 3, 5.5, 1.5);
    ctx.fill();
    drawRoundRect(ctx, 31, 12 + headBobY, 3, 5.5, 1.5);
    ctx.fill();
  }

  // 9. Distinct Front Hair / Cap per Character
  ctx.fillStyle = spec.hairColor;
  if (spec.hairStyle === 'cap_beard') {
    // Teal cap for Dion
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.arc(22, 10.5 + headBobY, 9.8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#2dd4bf';
    drawRoundRect(ctx, 11, 8.8 + headBobY, 22, 2.5, 1.2);
    ctx.fill();
  } else if (spec.hairStyle === 'curly') {
    const curls = [
      [15, 7.5],
      [18.5, 6],
      [22, 5.5],
      [25.5, 6],
      [29, 7.5],
      [13.5, 10],
      [30.5, 10],
    ];
    curls.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy + headBobY, 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (spec.hairStyle === 'spiky') {
    ctx.beginPath();
    ctx.moveTo(12, 11 + headBobY);
    ctx.lineTo(14, 4 + headBobY);
    ctx.lineTo(18, 7 + headBobY);
    ctx.lineTo(22, 3 + headBobY);
    ctx.lineTo(26, 7 + headBobY);
    ctx.lineTo(30, 4 + headBobY);
    ctx.lineTo(32, 11 + headBobY);
    ctx.closePath();
    ctx.fill();
  } else {
    // Sleek / parted / bangs top hair
    ctx.beginPath();
    ctx.arc(22, 11 + headBobY, 9.8, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    // Side locks / bangs detail
    drawRoundRect(ctx, 12.2, 6 + headBobY, 19.6, 5.2, 2.6);
    ctx.fill();

    // Silver temple highlights for Viktor (CTO)
    if (spec.hairStyle === 'silver_part') {
      ctx.fillStyle = '#cbd5e1';
      drawRoundRect(ctx, 12.5, 9 + headBobY, 3, 3.5, 1);
      ctx.fill();
      drawRoundRect(ctx, 28.5, 9 + headBobY, 3, 3.5, 1);
      ctx.fill();
    }
  }
}

/**
 * Generates all multi-pose human textures and office furniture props for Phaser.
 */
export function registerHumanCharacterSprites(scene: Phaser.Scene) {
  Object.entries(SPRITE_KEY_TO_ROLE).forEach(([baseKey, role]) => {
    const spec = HUMAN_CHARACTER_SPECS[role];
    if (!spec) return;

    POSES.forEach((pose) => {
      const texKey = `${baseKey}_${pose}`;
      if (scene.textures.exists(texKey)) {
        scene.textures.remove(texKey);
      }
      const canvasTex = scene.textures.createCanvas(texKey, 44, 52);
      if (canvasTex) {
        const ctx = canvasTex.getContext();
        renderCharacterPoseToCtx(ctx, spec, pose);
        canvasTex.refresh();
      }
    });

    // Also register the default baseKey as idle_0 so existing sprite lookups seamlessly work
    if (scene.textures.exists(baseKey)) {
      scene.textures.remove(baseKey);
    }
    const defaultTex = scene.textures.createCanvas(baseKey, 44, 52);
    if (defaultTex) {
      const ctx = defaultTex.getContext();
      renderCharacterPoseToCtx(ctx, spec, 'idle_0');
      defaultTex.refresh();
    }
  });

  // Register Ergonomic Office Chair Texture
  if (!scene.textures.exists('furniture_chair')) {
    const chairTex = scene.textures.createCanvas('furniture_chair', 32, 32);
    if (chairTex) {
      const ctx = chairTex.getContext();
      // Chair wheels base shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.beginPath();
      ctx.ellipse(16, 27, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Seat cushion
      ctx.fillStyle = '#1e293b';
      drawRoundRect(ctx, 7, 14, 18, 10, 4);
      ctx.fill();
      // Backrest
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      drawRoundRect(ctx, 8, 4, 16, 13, 5);
      ctx.fill();
      ctx.stroke();
      chairTex.refresh();
    }
  }
}

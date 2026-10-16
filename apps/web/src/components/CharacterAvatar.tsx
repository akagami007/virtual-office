'use client';

import React from 'react';
import { AgentRole } from '@nexusdev/shared';

export interface HumanCharacterVisualSpec {
  role: AgentRole;
  skinColor: string;
  skinShadow: string;
  hairColor: string;
  hairStyle: 'ceo_slick' | 'long_wave' | 'silver_part' | 'bob_bangs' | 'undercut' | 'ponytail' | 'curly' | 'spiky' | 'shoulder_neat' | 'cap_beard';
  outfitPrimary: string;
  outfitSecondary: string;
  shirtInner: string;
  pantsColor: string;
  shoeColor: string;
  accessory: 'tie_pin' | 'necklace_clip' | 'glasses_round' | 'earpiece' | 'tinted_glasses' | 'headphones' | 'lanyard' | 'bandana' | 'glasses_cat' | 'cap_headset';
  blushColor: string;
  emotePool: string[];
  humanStatusText: string;
}

export const HUMAN_CHARACTER_SPECS: Record<AgentRole, HumanCharacterVisualSpec> = {
  'USR-CEO': {
    role: 'USR-CEO',
    skinColor: '#f5cfa8',
    skinShadow: '#e2b488',
    hairColor: '#1e293b',
    hairStyle: 'ceo_slick',
    outfitPrimary: '#1d4ed8', // Navy bespoke blazer
    outfitSecondary: '#3b82f6',
    shirtInner: '#f8fafc',
    pantsColor: '#0f172a',
    shoeColor: '#1c1917',
    accessory: 'tie_pin', // Red/gold executive tie
    blushColor: '#f43f5e',
    emotePool: ['👔', '🚀', '📈', '☕'],
    humanStatusText: 'Memimpin Studio',
  },
  'AGT-PA': {
    role: 'AGT-PA',
    skinColor: '#fde2c8',
    skinShadow: '#ecc4a2',
    hairColor: '#3f2314',
    hairStyle: 'long_wave',
    outfitPrimary: '#e11d48', // Chic rose blazer
    outfitSecondary: '#fb7185',
    shirtInner: '#fff1f2',
    pantsColor: '#1e293b',
    shoeColor: '#881337',
    accessory: 'necklace_clip',
    blushColor: '#fb7185',
    emotePool: ['📋', '📅', '✨', '☕'],
    humanStatusText: 'Menyusun Agenda CEO',
  },
  'AGT-CTO': {
    role: 'AGT-CTO',
    skinColor: '#f3ccb0',
    skinShadow: '#ddb090',
    hairColor: '#334155', // Charcoal with silver temples
    hairStyle: 'silver_part',
    outfitPrimary: '#6d28d9', // Smart architect jacket
    outfitSecondary: '#8b5cf6',
    shirtInner: '#1e1b4b', // Dark turtleneck
    pantsColor: '#1e293b',
    shoeColor: '#0f172a',
    accessory: 'glasses_round',
    blushColor: '#f472b6',
    emotePool: ['🧠', '🛡️', '⚡', '☕'],
    humanStatusText: 'Review Arsitektur',
  },
  'AGT-PM': {
    role: 'AGT-PM',
    skinColor: '#f8d8bc',
    skinShadow: '#e5be9c',
    hairColor: '#451a03',
    hairStyle: 'bob_bangs',
    outfitPrimary: '#db2777', // Stylish magenta cardigan
    outfitSecondary: '#f472b6',
    shirtInner: '#fdf2f8',
    pantsColor: '#1f2937',
    shoeColor: '#374151',
    accessory: 'earpiece',
    blushColor: '#f472b6',
    emotePool: ['📌', '🗂️', '💬', '🍵'],
    humanStatusText: 'Koordinasi Sprint',
  },
  'AGT-UIUX': {
    role: 'AGT-UIUX',
    skinColor: '#f6d4b6',
    skinShadow: '#e1b894',
    hairColor: '#78350f',
    hairStyle: 'undercut',
    outfitPrimary: '#d97706', // Creative amber overshirt
    outfitSecondary: '#fbbf24',
    shirtInner: '#18181b',
    pantsColor: '#27272a',
    shoeColor: '#f59e0b',
    accessory: 'tinted_glasses',
    blushColor: '#fb923c',
    emotePool: ['🎨', '✨', '✏️', '🧋'],
    humanStatusText: 'Eksplorasi Desain UI',
  },
  'AGT-FE': {
    role: 'AGT-FE',
    skinColor: '#fce0c5',
    skinShadow: '#e6c2a3',
    hairColor: '#1c1917',
    hairStyle: 'ponytail',
    outfitPrimary: '#059669', // Emerald hoodie
    outfitSecondary: '#34d399',
    shirtInner: '#ecfdf5',
    pantsColor: '#1e293b',
    shoeColor: '#10b981',
    accessory: 'headphones',
    blushColor: '#fb7185',
    emotePool: ['💻', '⚛️', '🎧', '☕'],
    humanStatusText: 'Ngoding Komponen UI',
  },
  'AGT-BE': {
    role: 'AGT-BE',
    skinColor: '#e8be99',
    skinShadow: '#cfa078',
    hairColor: '#171717',
    hairStyle: 'curly',
    outfitPrimary: '#0891b2', // Cyan tech flannel/vest
    outfitSecondary: '#22d3ee',
    shirtInner: '#0f172a',
    pantsColor: '#1e293b',
    shoeColor: '#334155',
    accessory: 'lanyard',
    blushColor: '#f87171',
    emotePool: ['🗄️', '⚙️', '☕', '🔥'],
    humanStatusText: 'Optimasi API & DB',
  },
  'AGT-MOB': {
    role: 'AGT-MOB',
    skinColor: '#edc4a0',
    skinShadow: '#d4a781',
    hairColor: '#27272a',
    hairStyle: 'spiky',
    outfitPrimary: '#4f46e5', // Indigo varsity bomber
    outfitSecondary: '#818cf8',
    shirtInner: '#eef2ff',
    pantsColor: '#1e1b4b',
    shoeColor: '#6366f1',
    accessory: 'bandana',
    blushColor: '#fb7185',
    emotePool: ['📱', '⚡', '🎮', '🥤'],
    humanStatusText: 'Build Aplikasi Mobile',
  },
  'AGT-QA': {
    role: 'AGT-QA',
    skinColor: '#fbe0c6',
    skinShadow: '#e5c4a5',
    hairColor: '#292524',
    hairStyle: 'shoulder_neat',
    outfitPrimary: '#dc2626', // Crimson smart sweater
    outfitSecondary: '#f87171',
    shirtInner: '#fef2f2',
    pantsColor: '#1e293b',
    shoeColor: '#450a0a',
    accessory: 'glasses_cat',
    blushColor: '#fb7185',
    emotePool: ['🔍', '✅', '🐞', '🍵'],
    humanStatusText: 'Uji Kualitas & E2E',
  },
  'AGT-OPS': {
    role: 'AGT-OPS',
    skinColor: '#e5b892',
    skinShadow: '#cc9c74',
    hairColor: '#1f2937',
    hairStyle: 'cap_beard',
    outfitPrimary: '#0d9488', // Teal utility jacket
    outfitSecondary: '#2dd4bf',
    shirtInner: '#134e4a',
    pantsColor: '#0f172a',
    shoeColor: '#1e293b',
    accessory: 'cap_headset',
    blushColor: '#f87171',
    emotePool: ['🚀', '🐳', '📡', '☕'],
    humanStatusText: 'Jaga Server & CI/CD',
  },
};

interface CharacterAvatarProps {
  role: AgentRole | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatusDot?: boolean;
  isOnline?: boolean;
}

const SIZE_MAP = {
  xs: 24,
  sm: 32,
  md: 42,
  lg: 54,
  xl: 68,
};

/**
 * Illustrated Human Character Portrait (Gather.town / Modern Studio RPG Style)
 * Replaces generic single-letter boxes across all UI panels with expressive human coworkers.
 */
export default function CharacterAvatar({
  role,
  size = 'md',
  className = '',
  showStatusDot = false,
  isOnline = true,
}: CharacterAvatarProps) {
  const spec =
    HUMAN_CHARACTER_SPECS[role as AgentRole] || HUMAN_CHARACTER_SPECS['USR-CEO'];
  const px = SIZE_MAP[size] || 42;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: px, height: px }}
    >
      <svg
        viewBox="0 0 64 64"
        width={px}
        height={px}
        className="rounded-xl overflow-hidden shadow-md border border-white/15"
      >
        <defs>
          <linearGradient id={`bg-${spec.role}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={spec.outfitPrimary} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Portrait Backdrop */}
        <rect width="64" height="64" rx="12" fill={`url(#bg-${spec.role})`} />
        <circle cx="32" cy="58" r="24" fill={spec.outfitSecondary} opacity="0.14" />

        {/* Back Hair for Long-Haired Characters */}
        {(spec.hairStyle === 'long_wave' ||
          spec.hairStyle === 'ponytail' ||
          spec.hairStyle === 'shoulder_neat' ||
          spec.hairStyle === 'bob_bangs') && (
          <path
            d={
              spec.hairStyle === 'ponytail'
                ? 'M16 24 C14 36 16 46 20 50 L44 50 C48 44 50 34 48 24 Z M45 22 C53 22 56 32 52 42 C48 39 46 33 45 27 Z'
                : 'M15 22 C12 34 13 47 17 54 L47 54 C51 47 52 34 49 22 Z'
            }
            fill={spec.hairColor}
          />
        )}

        {/* Shoulders & Torso Outfit */}
        <path
          d="M10 64 C10 47 20 43 32 43 C44 43 54 47 54 64 Z"
          fill={spec.outfitPrimary}
        />
        {/* Inner Shirt / Collar */}
        <path d="M24 43 L32 55 L40 43 Z" fill={spec.shirtInner} />
        {/* Lapels / Hoodie Strings */}
        <path
          d="M22 43 L28 56 L24 58 L18 46 Z M42 43 L36 56 L40 58 L46 46 Z"
          fill={spec.outfitSecondary}
          opacity="0.75"
        />

        {/* Tie for CEO / Lanyard for BE / Necklace for PA */}
        {spec.accessory === 'tie_pin' && (
          <path d="M30 46 L34 46 L35 62 L32 64 L29 62 Z" fill="#ef4444" />
        )}
        {spec.accessory === 'necklace_clip' && (
          <path
            d="M26 45 Q32 51 38 45"
            fill="none"
            stroke="#fde68a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {spec.accessory === 'headphones' && (
          <>
            <ellipse cx="22" cy="46" rx="4.5" ry="3.5" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
            <ellipse cx="42" cy="46" rx="4.5" ry="3.5" fill="#1e293b" stroke="#34d399" strokeWidth="1.5" />
          </>
        )}

        {/* Neck */}
        <rect x="27" y="36" width="10" height="10" rx="4" fill={spec.skinShadow} />

        {/* Ears */}
        <circle cx="17" cy="28" r="3.5" fill={spec.skinShadow} />
        <circle cx="47" cy="28" r="3.5" fill={spec.skinShadow} />

        {/* Head / Face */}
        <rect x="18" y="14" width="28" height="26" rx="12" fill={spec.skinColor} />

        {/* Cheeks Blush */}
        <ellipse cx="22.5" cy="30.5" rx="2.6" ry="1.4" fill={spec.blushColor} opacity="0.35" />
        <ellipse cx="41.5" cy="30.5" rx="2.6" ry="1.4" fill={spec.blushColor} opacity="0.35" />

        {/* Eyebrows */}
        <path
          d="M22.5 23 Q25.5 21.5 28.5 23"
          fill="none"
          stroke={spec.hairColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M35.5 23 Q38.5 21.5 41.5 23"
          fill="none"
          stroke={spec.hairColor}
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Eyes with Catchlight */}
        <circle cx="25.5" cy="26.8" r="2.2" fill="#0f172a" />
        <circle cx="38.5" cy="26.8" r="2.2" fill="#0f172a" />
        <circle cx="26.2" cy="26.1" r="0.8" fill="#ffffff" />
        <circle cx="39.2" cy="26.1" r="0.8" fill="#ffffff" />

        {/* Nose */}
        <path
          d="M32 27.5 L31 30.5 L33 30.8"
          fill="none"
          stroke={spec.skinShadow}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Friendly Human Smile */}
        <path
          d="M28.2 34 Q32 37 35.8 34"
          fill="none"
          stroke="#7c2d12"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Beard for DevOps (Dion) */}
        {spec.hairStyle === 'cap_beard' && (
          <path
            d="M19 31 C19 39 25 41 32 41 C39 41 45 39 45 31 C43 35 38 37.5 32 37.5 C26 37.5 21 35 19 31 Z"
            fill={spec.hairColor}
            opacity="0.85"
          />
        )}

        {/* Glasses Accessories */}
        {(spec.accessory === 'glasses_round' ||
          spec.accessory === 'tinted_glasses' ||
          spec.accessory === 'glasses_cat') && (
          <g>
            <rect
              x="20.5"
              y="23.5"
              width="10"
              height="6.8"
              rx={spec.accessory === 'glasses_round' ? 3.4 : 1.8}
              fill={spec.accessory === 'tinted_glasses' ? '#f59e0b33' : 'none'}
              stroke={spec.accessory === 'glasses_cat' ? '#f43f5e' : '#e2e8f0'}
              strokeWidth="1.6"
            />
            <rect
              x="33.5"
              y="23.5"
              width="10"
              height="6.8"
              rx={spec.accessory === 'glasses_round' ? 3.4 : 1.8}
              fill={spec.accessory === 'tinted_glasses' ? '#f59e0b33' : 'none'}
              stroke={spec.accessory === 'glasses_cat' ? '#f43f5e' : '#e2e8f0'}
              strokeWidth="1.6"
            />
            <line x1="30.5" y1="26.8" x2="33.5" y2="26.8" stroke="#e2e8f0" strokeWidth="1.5" />
          </g>
        )}

        {/* Front Hair / Hat by Style */}
        {spec.hairStyle === 'ceo_slick' && (
          <path
            d="M17 24 C16 14 23 10 33 10 C42 10 48 14 47 23 C43 17 36 16 28 17 C22 18 19 20 17 24 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'long_wave' && (
          <path
            d="M16 25 C16 13 24 10 32 10 C41 10 48 14 48 25 C44 18 38 16 31 18 C24 19 20 22 16 25 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'silver_part' && (
          <>
            <path
              d="M17 24 C16 13 24 10 33 10 C42 10 48 14 47 24 C43 18 35 16 26 18 C21 19 19 21 17 24 Z"
              fill={spec.hairColor}
            />
            <path d="M18 19 Q22 15 26 17" stroke="#cbd5e1" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M46 19 Q42 15 39 17" stroke="#cbd5e1" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </>
        )}
        {spec.hairStyle === 'bob_bangs' && (
          <path
            d="M16 25 C16 13 23 10 32 10 C41 10 48 13 48 25 C45 20 41 19 32 19 C23 19 19 20 16 25 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'undercut' && (
          <path
            d="M18 22 C17 12 26 9 36 10 C44 11 48 15 45 21 C40 16 30 16 18 22 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'ponytail' && (
          <path
            d="M17 24 C17 13 24 10 32 10 C40 10 47 13 47 24 C43 18 37 16 32 17 C26 16 21 18 17 24 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'curly' && (
          <g fill={spec.hairColor}>
            <circle cx="22" cy="16" r="5.5" />
            <circle cx="28" cy="13.5" r="6" />
            <circle cx="35" cy="13.5" r="6" />
            <circle cx="41" cy="16" r="5.5" />
            <circle cx="19" cy="20" r="4.5" />
            <circle cx="45" cy="20" r="4.5" />
          </g>
        )}
        {spec.hairStyle === 'spiky' && (
          <path
            d="M17 23 L19 13 L25 16 L29 9 L34 15 L40 10 L43 16 L48 14 L46 23 C41 18 23 18 17 23 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'shoulder_neat' && (
          <path
            d="M16 24 C16 13 23 10 32 10 C41 10 48 13 48 24 C43 18 37 17 32 17 C27 17 21 18 16 24 Z"
            fill={spec.hairColor}
          />
        )}
        {spec.hairStyle === 'cap_beard' && (
          <>
            <path d="M16 21 C16 11 24 9 32 9 C40 9 48 11 48 21 Z" fill="#0d9488" />
            <path d="M14 19 Q32 16 51 20 L48 22 Q32 19 16 22 Z" fill="#14b8a6" />
          </>
        )}
      </svg>

      {showStatusDot && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
            isOnline ? 'bg-emerald-400' : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
}

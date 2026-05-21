/**
 * Course tiers (gradient). Each lesson level maps to one tier; the sidebar
 * groups lessons by tier first, then by level under each tier.
 *
 * The mapping is intentionally a simple lookup so that JSON content stays
 * untouched — `level` field on each lesson decides its tier here.
 */

export type TierId = 0 | 1 | 2 | 3 | 4;

export interface TierMeta {
  id: TierId;
  shortLabel: string;
  name: string;
  tagline: string;
  icon: string;
}

export const TIERS: TierMeta[] = [
  {
    id: 0,
    shortLabel: 'T0',
    name: '预备课',
    tagline: '看不懂网页黑话？先来这里',
    icon: '🌱',
  },
  {
    id: 1,
    shortLabel: 'T1',
    name: '入门必修',
    tagline: 'Vibe coding 的最低生存技能',
    icon: '🧭',
  },
  {
    id: 2,
    shortLabel: 'T2',
    name: '日常调试',
    tagline: '接口、缓存、登录态—高频问题',
    icon: '🛠️',
  },
  {
    id: 3,
    shortLabel: 'T3',
    name: '进阶认知',
    tagline: '跟 AI 聊真实业务时要懂的词',
    icon: '🧠',
  },
  {
    id: 4,
    shortLabel: 'T4',
    name: '性能优化',
    tagline: '不紧急但上线后会救命',
    icon: '⚡',
  },
];

const LEVEL_TO_TIER: Record<number, TierId> = {
  0: 0,
  1: 1,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 3,
  11: 3,
  12: 4,
  13: 4,
};

export function levelToTier(level: number): TierId {
  return LEVEL_TO_TIER[level] ?? 1;
}

export function getTierMeta(id: TierId): TierMeta {
  return TIERS.find((t) => t.id === id) ?? TIERS[1];
}

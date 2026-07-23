export type RedactCategory = 'cookie' | 'authorization' | 'bearer' | 'email' | 'phone' | 'ip' | 'internalUrl';

export interface PatternDef {
  category: RedactCategory;
  label: string;
  emoji: string;
  pattern: RegExp;
}

const internalHostFragments = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'internal.',
  '.local',
  '.internal',
  '.lan',
  '.corp',
  '.intra',
];

const internalUrlAlternation = internalHostFragments.map((f) => f.replace(/\./g, '\\.')).join('|');

export const PATTERNS: PatternDef[] = [
  {
    category: 'cookie',
    label: 'Cookie',
    emoji: '🍪',
    pattern: /(?:Set-)?Cookie:\s*[^\r\n]+/gi,
  },
  {
    category: 'authorization',
    label: 'Authorization',
    emoji: '🔒',
    pattern: /Authorization:\s*[^\r\n]+/gi,
  },
  {
    category: 'bearer',
    label: 'Bearer token',
    emoji: '🔑',
    pattern: /(?:Bearer\s+[A-Za-z0-9._\-+/=]{8,}|eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/g,
  },
  {
    category: 'email',
    label: 'Email',
    emoji: '📧',
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    category: 'phone',
    label: 'Phone',
    emoji: '📞',
    pattern: /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/g,
  },
  {
    category: 'ip',
    label: 'IP',
    emoji: '🔢',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  },
  {
    category: 'internalUrl',
    label: 'Internal URL',
    emoji: '🌐',
    pattern: new RegExp(`https?:\\/\\/(?:[A-Za-z0-9.-]*(?:${internalUrlAlternation}))[^\\s'"\`<>]*`, 'gi'),
  },
];

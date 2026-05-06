import { PATTERNS, type PatternDef, type RedactCategory } from './patterns.js';

export type ReplacementStyle = 'tag' | 'asterisks' | 'label';

export interface RedactOptions {
  enabledCategories?: Partial<Record<RedactCategory, boolean>>;
  replacement?: ReplacementStyle;
}

export interface RedactionMatch {
  category: RedactCategory;
  label: string;
  emoji: string;
  start: number;
  end: number;
  original: string;
  replacement: string;
}

export interface RedactionSummary {
  category: RedactCategory;
  label: string;
  emoji: string;
  count: number;
  enabled: boolean;
}

export interface RedactionResult {
  original: string;
  redacted: string;
  matches: RedactionMatch[];
  summary: RedactionSummary[];
}

const DEFAULT_OPTIONS: Required<Omit<RedactOptions, 'enabledCategories'>> & {
  enabledCategories: Record<RedactCategory, boolean>;
} = {
  enabledCategories: {
    cookie: true,
    authorization: true,
    bearer: true,
    email: true,
    phone: true,
    ip: true,
    internalUrl: true,
  },
  replacement: 'tag',
};

function makeReplacement(def: PatternDef, style: ReplacementStyle): string {
  if (style === 'asterisks') return '***';
  if (style === 'label') return `[${def.category}]`;
  return `<REDACTED_${def.category.toUpperCase()}>`;
}

export function redact(input: string, options: RedactOptions = {}): RedactionResult {
  const enabled = { ...DEFAULT_OPTIONS.enabledCategories, ...options.enabledCategories };
  const style = options.replacement ?? DEFAULT_OPTIONS.replacement;

  const allMatches: RedactionMatch[] = [];

  for (const def of PATTERNS) {
    if (!enabled[def.category]) continue;
    const re = new RegExp(def.pattern.source, def.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(input))) {
      const original = m[0];
      // Skip empty matches to avoid infinite loops on zero-width regexes
      if (original.length === 0) {
        re.lastIndex++;
        continue;
      }
      allMatches.push({
        category: def.category,
        label: def.label,
        emoji: def.emoji,
        start: m.index,
        end: m.index + original.length,
        original,
        replacement: makeReplacement(def, style),
      });
    }
  }

  // Sort by start, then prefer longer matches when overlap (drop overlapped shorter ones)
  allMatches.sort((a, b) => a.start - b.start || b.end - b.end);
  const kept: RedactionMatch[] = [];
  let cursor = 0;
  for (const m of allMatches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))) {
    if (m.start >= cursor) {
      kept.push(m);
      cursor = m.end;
    }
  }

  // Build redacted string
  let out = '';
  let last = 0;
  for (const m of kept) {
    out += input.slice(last, m.start) + m.replacement;
    last = m.end;
  }
  out += input.slice(last);

  // Build summary across all categories (counts come from kept matches)
  const counts = new Map<RedactCategory, number>();
  for (const m of kept) counts.set(m.category, (counts.get(m.category) ?? 0) + 1);

  const summary: RedactionSummary[] = PATTERNS.map((p) => ({
    category: p.category,
    label: p.label,
    emoji: p.emoji,
    count: counts.get(p.category) ?? 0,
    enabled: enabled[p.category],
  }));

  return { original: input, redacted: out, matches: kept, summary };
}

import { marked } from 'marked';
import { glossary } from '~/data/glossary';

// Configure once at module load
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Render block-level markdown (paragraphs, lists, tables, code blocks)
export function md(text: string): string {
  return marked.parse(text) as string;
}

// Render inline-only markdown (no paragraph wrapping); useful for headlines/captions
export function mdInline(text: string): string {
  return marked.parseInline(text) as string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const sortedGlossary = [...glossary].sort((a, b) => b.term.length - a.term.length);

export function glossarizeText(text: string): string {
  const result = splitAndProcess(text, applyGlossary);
  return result;
}

function splitAndProcess(text: string, processor: (s: string) => string): string {
  let result = '';
  let remaining = text;
  let inCodeBlock = false;

  while (remaining.length > 0) {
    if (inCodeBlock) {
      const newlineIdx = remaining.indexOf('\n');
      if (newlineIdx === -1) {
        result += remaining;
        break;
      }
      const endMarker = remaining.indexOf('```', newlineIdx);
      if (endMarker === -1) {
        result += remaining;
        break;
      }
      result += remaining.slice(0, endMarker + 3);
      remaining = remaining.slice(endMarker + 3);
      inCodeBlock = false;
    } else {
      const fenceIdx = remaining.indexOf('```');
      if (fenceIdx === -1) {
        result += processInlineCode(remaining, processor);
        break;
      }
      result += processInlineCode(remaining.slice(0, fenceIdx), processor);
      result += '```';
      remaining = remaining.slice(fenceIdx + 3);
      inCodeBlock = true;
    }
  }

  return result;
}

function processInlineCode(text: string, processor: (s: string) => string): string {
  let result = '';
  let remaining = text;
  let inBacktick = false;

  while (remaining.length > 0) {
    if (inBacktick) {
      const endIdx = remaining.indexOf('`');
      if (endIdx === -1) {
        result += remaining;
        break;
      }
      result += remaining.slice(0, endIdx + 1);
      remaining = remaining.slice(endIdx + 1);
      inBacktick = false;
    } else {
      const tickIdx = remaining.indexOf('`');
      if (tickIdx === -1) {
        result += processor(remaining);
        break;
      }
      result += processor(remaining.slice(0, tickIdx));
      result += '`';
      remaining = remaining.slice(tickIdx + 1);
      inBacktick = true;
    }
  }

  return result;
}

function applyGlossary(text: string): string {
  if (sortedGlossary.length === 0) return text;

  // Single-pass replacement using one alternation regex. Longest terms come
  // first in `sortedGlossary`, and JS regex alternation tries alternatives in
  // order, so longer matches win when overlapping (e.g. "TLS / SSL" before
  // "SSL"). Doing it in one pass also prevents the previous bug where
  // iterating per-term would inject a <span> for term B inside the title=""
  // attribute of an already-wrapped term A.
  // Word-boundary the ASCII terms so "REST" doesn't match inside "RESTful";
  // CJK terms get no boundary (Chinese has no \b concept).
  const pattern = sortedGlossary
    .map((g) => {
      const escaped = escapeRegex(g.term);
      const isCJK = /^[一-鿿]/.test(g.term);
      return isCJK ? escaped : `\\b${escaped}\\b`;
    })
    .join('|');
  const regex = new RegExp(pattern, 'gi');

  // Split on HTML tags so we never run the replace inside an existing tag \u2014
  // that protects markdown that already contains raw HTML, and protects us
  // from re-processing the spans we just injected if this is ever called twice.
  const parts = text.split(/(<[^>]+>)/);
  return parts
    .map((part) => {
      if (!part || part.startsWith('<')) return part;
      return part.replace(regex, (match) => {
        const lookup = sortedGlossary.find((g) => g.term.toLowerCase() === match.toLowerCase()) ?? sortedGlossary[0];
        const esc = (s: string) =>
          s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const fullAttr = lookup.fullName ? ` data-glossary-fullname="${esc(lookup.fullName)}"` : '';
        return `<span class="glossary" role="button" tabindex="0" aria-label="查看术语 ${esc(lookup.term)} 的释义" data-glossary-term="${esc(lookup.term)}" data-glossary-def="${esc(lookup.definition)}"${fullAttr}>${match}</span>`;
      });
    })
    .join('');
}

export function mdGlossary(text: string): string {
  return md(glossarizeText(text));
}

export function mdInlineGlossary(text: string): string {
  return mdInline(glossarizeText(text));
}

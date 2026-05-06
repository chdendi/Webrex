import { marked } from "marked";
import { glossary } from "~/data/glossary";

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
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const sortedGlossary = [...glossary].sort(
  (a, b) => b.term.length - a.term.length,
);

export function glossarizeText(text: string): string {
  const result = splitAndProcess(text, applyGlossary);
  return result;
}

function splitAndProcess(
  text: string,
  processor: (s: string) => string,
): string {
  let result = "";
  let remaining = text;
  let inCodeBlock = false;

  while (remaining.length > 0) {
    if (inCodeBlock) {
      const newlineIdx = remaining.indexOf("\n");
      if (newlineIdx === -1) {
        result += remaining;
        break;
      }
      const endMarker = remaining.indexOf("```", newlineIdx);
      if (endMarker === -1) {
        result += remaining;
        break;
      }
      result += remaining.slice(0, endMarker + 3);
      remaining = remaining.slice(endMarker + 3);
      inCodeBlock = false;
    } else {
      const fenceIdx = remaining.indexOf("```");
      if (fenceIdx === -1) {
        result += processInlineCode(remaining, processor);
        break;
      }
      result += processInlineCode(remaining.slice(0, fenceIdx), processor);
      result += "```";
      remaining = remaining.slice(fenceIdx + 3);
      inCodeBlock = true;
    }
  }

  return result;
}

function processInlineCode(
  text: string,
  processor: (s: string) => string,
): string {
  let result = "";
  let remaining = text;
  let inBacktick = false;

  while (remaining.length > 0) {
    if (inBacktick) {
      const endIdx = remaining.indexOf("`");
      if (endIdx === -1) {
        result += remaining;
        break;
      }
      result += remaining.slice(0, endIdx + 1);
      remaining = remaining.slice(endIdx + 1);
      inBacktick = false;
    } else {
      const tickIdx = remaining.indexOf("`");
      if (tickIdx === -1) {
        result += processor(remaining);
        break;
      }
      result += processor(remaining.slice(0, tickIdx));
      result += "`";
      remaining = remaining.slice(tickIdx + 1);
      inBacktick = true;
    }
  }

  return result;
}

function applyGlossary(text: string): string {
  let result = text;
  for (const entry of sortedGlossary) {
    const escaped = escapeRegex(entry.term);
    const isCJK = /^[\u4e00-\u9fff]/.test(entry.term);
    const left = isCJK ? "" : "\\b";
    const right = isCJK ? "" : "\\b";
    const regex = new RegExp(`${left}${escaped}${right}`, "gi");
    result = result.replace(regex, (match) => {
      const escapedDef = entry.definition
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<span class="glossary" title="${escapedDef}" data-glossary-term="${entry.term.replace(/"/g, "&quot;")}">${match}</span>`;
    });
  }
  return result;
}

export function mdGlossary(text: string): string {
  return md(glossarizeText(text));
}

export function mdInlineGlossary(text: string): string {
  return mdInline(glossarizeText(text));
}

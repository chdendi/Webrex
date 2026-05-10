/**
 * Reusable CSS animation keyframes and class utilities.
 *
 * Import `animations.css` in your component or use the string-returning
 * helpers to inject <style> blocks inline.
 */

export const KEYFRAMES_CSS = /* css */ `
@keyframes wb-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

@keyframes wb-check {
  0% { transform: scale(1); }
  50% { transform: scale(1.35); }
  100% { transform: scale(1); }
}

@keyframes wb-fade-in-up {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes wb-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

/* Fireworks burst */
@keyframes wb-firework-rise {
  0% { transform: translateY(0) scale(0.3); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translateY(-1) scale(1); opacity: 0; }
}

@keyframes wb-firework-burst {
  0% { transform: translate(0, 0) scale(0); opacity: 1; }
  60% { opacity: 1; }
  100% { transform: translate(var(--wx), var(--wy)) scale(1); opacity: 0; }
}

@keyframes wb-sparkle-fade {
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  30% { opacity: 1; transform: scale(1) rotate(90deg); }
  80% { opacity: 0.6; }
  100% { opacity: 0; transform: scale(0.3) rotate(180deg); }
}

.wb-shake { animation: wb-shake 0.4s ease-in-out; }
.wb-check { animation: wb-check 0.4s ease-out; }
.wb-fade-in-up { animation: wb-fade-in-up 0.2s ease-out; }
.wb-pop { animation: wb-pop 0.4s ease-out; }
`;

/** CSS for the firework burst particles. */
export const FIREWORK_PARTICLE_CSS = /* css */ `
.wb-firework-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: wb-firework-burst 0.8s ease-out forwards;
}
.wb-sparkle {
  position: absolute;
  font-size: 14px;
  animation: wb-sparkle-fade 1s ease-out forwards;
}
`;

/** Configuration for a single firework burst. */
export interface FireworkBurst {
  x: number; // center X % (0-100)
  y: number; // center Y % (0-100)
  color: string;
  particleCount: number;
  delay: number; // ms
}

/** Predefined color palette for fireworks. */
export const FIREWORK_COLORS = [
  '#FF3B30', // red
  '#FF9500', // orange
  '#FFCC00', // yellow
  '#34C759', // green
  '#0071E3', // accent blue
  '#5856D6', // purple
  '#FF2D55', // pink
  '#5AC8FA', // sky blue
];

/** Generate randomized firework bursts. Default 5x exaggeration. */
export function generateFireworks(centerX = 50, centerY = 45, multiplier = 5): FireworkBurst[] {
  const base = 6; // original would be ~6 bursts
  const count = base * multiplier;
  const bursts: FireworkBurst[] = [];

  for (let i = 0; i < count; i++) {
    bursts.push({
      x: centerX + (Math.random() - 0.5) * 70,
      y: centerY + (Math.random() - 0.5) * 50,
      color: FIREWORK_COLORS[i % FIREWORK_COLORS.length],
      particleCount: 8 + Math.floor(Math.random() * 8),
      delay: Math.random() * 600,
    });
  }

  return bursts;
}

/** Generate HTML for a single firework burst's particles. */
export function renderFireworkParticles(burst: FireworkBurst): string {
  const { x, y, color, particleCount, delay } = burst;
  let html = '';
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * 360 + Math.random() * 20;
    const distance = 40 + Math.random() * 60;
    const rad = (angle * Math.PI) / 180;
    const wx = Math.cos(rad) * distance;
    const wy = Math.sin(rad) * distance;
    html += `<div class="wb-firework-particle" style="
      left:${x}%;
      top:${y}%;
      background:${color};
      --wx:${wx}px;
      --wy:${wy}px;
      animation-delay:${delay}ms;
      box-shadow: 0 0 4px ${color};
    "></div>`;
  }
  return html;
}

/** Generate HTML for sparkle emojis scattered around. */
export function renderSparkles(multiplier = 5): string {
  const emojis = ['✨', '🌟', '💫', '⭐', '🎉', '🎊', '🔥', '💥'];
  const count = 4 * multiplier;
  let html = '';
  for (let i = 0; i < count; i++) {
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    const delay = Math.random() * 800;
    html += `<span class="wb-sparkle" style="
      left:${x}%;
      top:${y}%;
      animation-delay:${delay}ms;
    ">${emojis[i % emojis.length]}</span>`;
  }
  return html;
}

export function renderCelebrationCSS() {
  return `<style>${KEYFRAMES_CSS}${FIREWORK_PARTICLE_CSS}</style>`;
}

/**
 * Full celebration HTML string: CSS + fireworks + sparkles.
 * Inject directly into a container that has position:relative and
 * overflow:hidden.
 */
export function renderCelebration(multiplier = 5): string {
  const bursts = generateFireworks(50, 45, multiplier);
  const fireworksHtml = bursts.map(renderFireworkParticles).join('');
  const sparklesHtml = renderSparkles(multiplier);

  return `${renderCelebrationCSS()}${fireworksHtml}${sparklesHtml}`;
}

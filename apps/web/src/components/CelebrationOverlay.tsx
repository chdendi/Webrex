import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import {
  KEYFRAMES_CSS,
  type FireworkBurst,
  generateFireworks,
  renderFireworkParticles,
  renderSparkles,
} from '~/lib/animation';

interface Props {
  multiplier?: number;
  duration?: number;
  onDone?: () => void;
}

/**
 * Full-screen celebration overlay with fireworks and sparkles.
 * Default multiplier=5 for exaggerated effect.
 *
 * Usage:
 *   <CelebrationOverlay multiplier={5} onDone={() => setShow(false)} />
 */
export default function CelebrationOverlay({ multiplier = 5, duration = 3000, onDone }: Props) {
  const [bursts] = useState<FireworkBurst[]>(() => generateFireworks(50, 45, multiplier));
  const [sparkles] = useState<string>(() => renderSparkles(multiplier));
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fadeOut = useCallback(() => {
    setVisible(false);
    timerRef.current = setTimeout(() => onDone?.(), 400);
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(fadeOut, duration);
    return () => clearTimeout(t);
  }, [duration, fadeOut]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const wrapperStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.4s ease-out',
  };

  return (
    <div style={wrapperStyle}>
      <style>{KEYFRAMES_CSS}</style>
      <style>{`
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
      `}</style>
      {bursts.map((burst) => (
        <div
          key={`${burst.x}-${burst.y}-${burst.color}`}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: generated from controlled config
          dangerouslySetInnerHTML={{
            __html: renderFireworkParticles(burst),
          }}
        />
      ))}
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: emoji-only controlled config
        dangerouslySetInnerHTML={{ __html: sparkles }}
      />
    </div>
  );
}

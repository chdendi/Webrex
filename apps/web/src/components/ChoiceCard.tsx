import { type CSSProperties, useEffect, useState } from 'react';

export interface ChoiceOption {
  label: string;
  correct: boolean;
}

interface Props {
  options: ChoiceOption[];
  /** Disabled after correct choice is made. Also suppresses further clicks. */
  disabled?: boolean;
  /** Called with the index of the chosen option and whether it was correct. */
  onChoose?: (index: number, correct: boolean) => void;
  /** Custom class for the container. */
  className?: string;
}

/**
 * Reusable choice interaction primitive.
 *
 * Renders a list of radio-button-style options with:
 * - ✅ check animation on correct choice
 * - 💥 shake animation on wrong choice
 * - Dims incorrect options after a correct choice
 * - Auto-disables after correct answer
 *
 * Extracted from VerifyCard's choice tier.
 */
export default function ChoiceCard({ options, disabled = false, onChoose, className }: Props) {
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);

  // Clear shake after animation
  useEffect(() => {
    if (shakeIdx !== null) {
      const t = setTimeout(() => setShakeIdx(null), 600);
      return () => clearTimeout(t);
    }
  }, [shakeIdx]);

  const handleChoice = (idx: number) => {
    if (correctIdx !== null || disabled) return;
    const opt = options[idx];
    if (!opt) return;

    if (opt.correct) {
      setCorrectIdx(idx);
      onChoose?.(idx, true);
    } else {
      setShakeIdx(idx);
      onChoose?.(idx, false);
    }
  };

  return (
    <div className={`flex flex-col gap-3${className ? ` ${className}` : ''}`}>
      <style>{`
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
        .wb-shake { animation: wb-shake 0.4s ease-in-out; }
        .wb-check { animation: wb-check 0.4s ease-out; }
      `}</style>
      {options.map((opt, i) => {
        const isCorrectChoice = correctIdx === i;
        const isShaking = shakeIdx === i;
        const isDimmed = correctIdx !== null && !isCorrectChoice;
        const isFrozen = correctIdx !== null || disabled;
        const key = `choice-${i}-${opt.label.slice(0, 8)}`;

        const buttonStyle: CSSProperties = {
          borderColor: isCorrectChoice
            ? 'var(--color-success)'
            : isShaking
              ? 'var(--color-danger)'
              : 'var(--color-border)',
          background: isCorrectChoice
            ? 'color-mix(in srgb, var(--color-success) 8%, transparent)'
            : isShaking
              ? 'color-mix(in srgb, var(--color-danger) 6%, transparent)'
              : 'var(--color-surface)',
          opacity: isDimmed ? 0.35 : 1,
          cursor: isFrozen ? 'default' : 'pointer',
        };

        const dotStyle: CSSProperties = {
          borderColor: isCorrectChoice
            ? 'var(--color-success)'
            : isShaking
              ? 'var(--color-danger)'
              : 'var(--color-border)',
          background: isCorrectChoice ? 'var(--color-success)' : 'transparent',
          color: isCorrectChoice ? '#fff' : 'var(--color-text-muted)',
        };

        const labelStyle: CSSProperties = {
          color: isCorrectChoice ? 'var(--color-success)' : 'var(--color-text)',
        };

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleChoice(i)}
            disabled={isFrozen}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              isShaking ? 'wb-shake' : ''
            }`}
            style={buttonStyle}
          >
            <span
              className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                isCorrectChoice ? 'wb-check' : ''
              }`}
              style={dotStyle}
            >
              {isCorrectChoice ? '✓' : String.fromCharCode(65 + i)}
            </span>
            <span className="text-[15px] font-medium" style={labelStyle}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

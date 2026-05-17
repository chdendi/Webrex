import { type CSSProperties, useEffect, useState } from 'react';

export interface ChoiceOption {
  label: string;
  correct: boolean;
  hint?: string;
}

interface Props {
  options: ChoiceOption[];
  /**
   * Optional bonus option that appears only after the user has clicked every
   * base option wrong at least once. Used by L0.5 — all 4 base options are
   * "half-truths"; clicking each in turn unlocks the real answer.
   */
  revealOption?: ChoiceOption;
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
export default function ChoiceCard({ options, revealOption, disabled = false, onChoose, className }: Props) {
  // When revealOption is set we use the "reveal-after-all-wrong" mode:
  //   - wrong clicks lock the chosen option individually (no re-clicks)
  //   - once all base options are locked-wrong, revealOption appears below
  // The reveal option is rendered as the (length)-th item.
  const useReveal = !!revealOption;
  const revealIdx = options.length;

  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [wrongLocked, setWrongLocked] = useState<Set<number>>(new Set());

  const allWrongClicked = useReveal && wrongLocked.size >= options.length;

  // Clear shake after animation
  useEffect(() => {
    if (shakeIdx !== null) {
      const t = setTimeout(() => setShakeIdx(null), 600);
      return () => clearTimeout(t);
    }
  }, [shakeIdx]);

  const handleChoice = (idx: number) => {
    if (correctIdx !== null || disabled) return;
    const isReveal = useReveal && idx === revealIdx;
    const opt = isReveal ? revealOption : options[idx];
    if (!opt) return;

    // In reveal mode, gate the bonus option until all base options are clicked.
    if (isReveal && !allWrongClicked) return;
    // Don't allow re-clicking an already-locked-wrong option.
    if (useReveal && wrongLocked.has(idx)) return;

    if (opt.correct) {
      setCorrectIdx(idx);
      onChoose?.(idx, true);
    } else {
      setShakeIdx(idx);
      if (useReveal) {
        setWrongLocked((prev) => {
          if (prev.has(idx)) return prev;
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
      }
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
        @keyframes wb-reveal {
          0% { opacity: 0; transform: translateY(8px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .wb-reveal { animation: wb-reveal 0.45s cubic-bezier(0.2, 0.7, 0.2, 1); }
      `}</style>
      {options.map((opt, i) => {
        const isCorrectChoice = correctIdx === i;
        const isShaking = shakeIdx === i;
        const isWrongLocked = useReveal && wrongLocked.has(i);
        const isDimmed = (correctIdx !== null && !isCorrectChoice) || (useReveal && isWrongLocked && !isShaking);
        const isFrozen = correctIdx !== null || disabled || isWrongLocked;
        const key = `choice-${i}-${opt.label.slice(0, 8)}`;

        const buttonStyle: CSSProperties = {
          borderColor: isCorrectChoice
            ? 'var(--color-primary-container)'
            : isShaking || isWrongLocked
              ? 'var(--color-error)'
              : 'var(--color-outline-variant)',
          borderWidth: isCorrectChoice || isShaking || isWrongLocked ? '2px' : '1px',
          background: isCorrectChoice
            ? 'var(--color-surface-container-low)'
            : isShaking || isWrongLocked
              ? 'color-mix(in srgb, var(--color-error) 6%, transparent)'
              : 'var(--color-surface-container-lowest)',
          opacity: isDimmed ? 0.55 : 1,
          cursor: isFrozen ? 'default' : 'pointer',
          boxShadow: isCorrectChoice ? '0 2px 8px rgba(0,113,227,0.08)' : 'none',
        };

        const dotStyle: CSSProperties = {
          borderColor: isCorrectChoice
            ? 'var(--color-success)'
            : isShaking || isWrongLocked
              ? 'var(--color-error)'
              : 'var(--color-outline-variant)',
          background: isCorrectChoice ? 'var(--color-success)' : isWrongLocked ? 'var(--color-error)' : 'transparent',
          color: isCorrectChoice || isWrongLocked ? '#fff' : 'var(--color-on-surface-variant)',
        };

        const labelStyle: CSSProperties = {
          color: 'var(--color-on-surface)',
          fontWeight: isCorrectChoice ? 600 : 500,
        };

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleChoice(i)}
            disabled={isFrozen}
            className={`flex items-start gap-4 p-5 rounded-2xl text-left transition-all ${
              isShaking ? 'wb-shake' : ''
            } ${!isFrozen ? 'hover:border-[color:var(--color-outline)]' : ''}`}
            style={buttonStyle}
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[13px] font-bold mt-0.5 ${
                isCorrectChoice ? 'wb-check' : ''
              }`}
              style={dotStyle}
            >
              {isCorrectChoice ? '✓' : isWrongLocked ? '✕' : String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1 text-[15px] leading-[1.55]" style={labelStyle}>
              {opt.label}
            </span>
          </button>
        );
      })}
      {useReveal && allWrongClicked && revealOption && (
        <button
          key="choice-reveal"
          type="button"
          onClick={() => handleChoice(revealIdx)}
          disabled={correctIdx !== null}
          className={`flex items-start gap-4 p-5 rounded-2xl text-left transition-all wb-reveal ${
            correctIdx === revealIdx ? '' : 'hover:border-[color:var(--color-outline)]'
          }`}
          style={{
            borderColor: correctIdx === revealIdx ? 'var(--color-primary-container)' : 'var(--color-success)',
            borderWidth: '2px',
            background:
              correctIdx === revealIdx
                ? 'var(--color-surface-container-low)'
                : 'color-mix(in srgb, var(--color-success) 6%, transparent)',
            cursor: correctIdx !== null ? 'default' : 'pointer',
            boxShadow:
              correctIdx === revealIdx
                ? '0 2px 8px rgba(0,113,227,0.08)'
                : '0 0 0 4px color-mix(in srgb, var(--color-success) 12%, transparent)',
          }}
        >
          <span
            className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[13px] font-bold mt-0.5 ${
              correctIdx === revealIdx ? 'wb-check' : ''
            }`}
            style={{
              borderColor: 'var(--color-success)',
              background: correctIdx === revealIdx ? 'var(--color-success)' : 'transparent',
              color: correctIdx === revealIdx ? '#fff' : 'var(--color-success)',
            }}
          >
            {correctIdx === revealIdx ? '✓' : 'E'}
          </span>
          <span
            className="flex-1 text-[15px] leading-[1.55]"
            style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}
          >
            {revealOption.label}
          </span>
        </button>
      )}
    </div>
  );
}

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  term: string;
  definition: string;
  children: ReactNode;
}

export default function GlossaryTooltip({ term, definition, children }: Props) {
  const [visible, setVisible] = useState(false);
  const [below, setBelow] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const position = useCallback(() => {
    if (!wrapperRef.current || !tooltipRef.current) return;
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 8;
    const edgeMargin = 8;

    let left = wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;
    let top = wrapperRect.top - tooltipRect.height - gap;
    let showBelow = false;

    if (top < edgeMargin) {
      top = wrapperRect.bottom + gap;
      showBelow = true;
    }

    if (left < edgeMargin) left = edgeMargin;
    if (left + tooltipRect.width > window.innerWidth - edgeMargin) {
      left = window.innerWidth - tooltipRect.width - edgeMargin;
    }

    setBelow(showBelow);
    setStyle({ left, top });
  }, []);

  useEffect(() => {
    if (!visible) return;
    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [visible, position]);

  return (
    <span className="relative inline">
      <button
        ref={wrapperRef}
        type="button"
        className="glossary inline border-0 bg-transparent p-0 font-inherit"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        {children}
      </button>
      {visible && (
        <div ref={tooltipRef} className="fixed z-[9999] pointer-events-none" style={style}>
          {!below && (
            <div className="flex justify-center">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
            </div>
          )}
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 max-w-[280px] leading-relaxed shadow-lg">
            <div className="font-semibold text-xs text-blue-300 mb-0.5">{term}</div>
            {definition}
          </div>
          {below && (
            <div className="flex justify-center">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-gray-900" />
            </div>
          )}
        </div>
      )}
    </span>
  );
}

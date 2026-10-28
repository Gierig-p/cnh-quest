import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../ui/hooks';

const PALETTE = ['#22b357', '#ffc83d', '#ff5a5f', '#1e96f0', '#8b5cf6', '#ff9f1c'];

/** Confete em CSS puro (transform/opacity), poucos elementos e desmonta sozinho. */
export function Confetti({ count = 44 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [alive, setAlive] = useState(true);
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.8 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        spin: 360 + Math.random() * 720,
        w: 7 + Math.random() * 6,
        round: i % 4 === 0,
        color: PALETTE[i % PALETTE.length],
      })),
    [count],
  );
  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 3800);
    return () => clearTimeout(t);
  }, []);
  if (reduce || !alive) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i
          key={i}
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.w * 1.6,
            borderRadius: p.round ? '50%' : 3,
            background: p.color,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** Pequena explosão de partículas ao redor do elemento pai (acerto, desbloqueio). O pai precisa de position: relative. */
export function Burst({ color = '#22b357', count = 10 }: { color?: string; count?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ ['--a' as string]: `${(360 / count) * i}deg`, background: i % 3 === 0 ? '#ffc83d' : color }} />
      ))}
    </span>
  );
}

/* ---------- diálogo ---------- */

const DialogCtx = createContext<() => void>(() => {});
/** Fecha o diálogo atual com a animação de saída. */
export const useDialogClose = () => useContext(DialogCtx);

export function Dialog({ labelledBy, onClose, children, tone }: { labelledBy: string; onClose: () => void; children: ReactNode; tone?: 'warn' }) {
  const reduce = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => {
    if (reduce) return onClose();
    setClosing(true);
    timer.current = setTimeout(onClose, 170);
  }, [onClose, reduce]);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      } else if (e.key === 'Tab' && ref.current) {
        // mantém o foco dentro do diálogo
        const f = ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], select, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      if (prev && document.contains(prev)) prev.focus();
    };
  }, [close]);

  return (
    <DialogCtx.Provider value={close}>
      <div className={`dialog-backdrop ${closing ? 'closing' : ''}`} role="presentation" onClick={close}>
        <div ref={ref} className={`dialog ${tone ?? ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </DialogCtx.Provider>
  );
}

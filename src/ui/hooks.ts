import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../state/AppState';
import { playSound, type SoundKind } from './sound';

/** Toca efeitos respeitando a preferência salva do aluno. */
export function useSound() {
  const { progress } = useApp();
  const enabled = progress.prefs.sound;
  return useCallback((kind: SoundKind) => playSound(kind, enabled), [enabled]);
}

function systemPrefersReduce() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** true quando o aluno (ajuste do app) ou o sistema pedem menos movimento. */
export function useReducedMotion() {
  const { progress } = useApp();
  const m = progress.prefs.motion;
  const [sys, setSys] = useState(systemPrefersReduce);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setSys(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return m === 'reduce' || (m === 'system' && sys);
}

/** Número que "sobe" até o valor final (XP, porcentagens). Sem animação quando há redução de movimento. */
export function useCountUp(target: number, { duration = 900, delay = 0, onTick }: { duration?: number; delay?: number; onTick?: () => void } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce || target <= 0 || typeof requestAnimationFrame !== 'function') {
      setValue(target);
      return;
    }
    let raf = 0;
    let start = 0;
    let lastStep = -1;
    const timer = setTimeout(() => {
      const step = (t: number) => {
        if (!start) start = t;
        const k = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        const v = Math.round(target * eased);
        setValue(v);
        const bucket = Math.floor(eased * 6);
        if (onTick && bucket !== lastStep && k < 1) {
          lastStep = bucket;
          onTick();
        }
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    // onTick é estável o suficiente para o efeito; não reiniciar a contagem por causa dele
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, delay, reduce]);
  return value;
}

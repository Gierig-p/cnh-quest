import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProgressState } from '../engine/progress';
import { createLocalStore, type ProgressStore } from '../storage/progressStore';

interface Ctx {
  progress: ProgressState;
  update: (fn: (p: ProgressState) => ProgressState) => void;
  reset: () => void;
  volatile: boolean;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppStateProvider({ children, store }: { children: ReactNode; store?: ProgressStore }) {
  const [s] = useState(() => store ?? createLocalStore());
  const [progress, setProgress] = useState(() => s.load());

  const update = useCallback(
    (fn: (p: ProgressState) => ProgressState) =>
      setProgress((p) => {
        const next = fn(p);
        s.save(next);
        return next;
      }),
    [s],
  );

  const reset = useCallback(() => {
    s.clear();
    setProgress(s.load());
  }, [s]);

  // ajuste de movimento do app (além da preferência do sistema)
  useEffect(() => {
    const m = progress.prefs.motion;
    if (m === 'system') document.documentElement.removeAttribute('data-motion');
    else document.documentElement.setAttribute('data-motion', m);
  }, [progress.prefs.motion]);

  // tema claro/escuro: sem atributo = segue o aparelho (prefers-color-scheme)
  useLayoutEffect(() => {
    const t = progress.prefs.theme ?? 'system';
    const root = document.documentElement;
    if (t === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', t);
    const dark = t === 'dark' || (t === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#131f24' : '#1b9e5a');
  }, [progress.prefs.theme]);

  const value = useMemo(() => ({ progress, update, reset, volatile: s.volatile }), [progress, update, reset, s]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp fora do AppStateProvider');
  return c;
}

import { initialProgress, type ProgressState } from '../engine/progress';

/**
 * Persistência do progresso. Hoje: localStorage, só neste navegador.
 * Para uma versão com contas, basta outra implementação desta interface (ex.: API REST).
 */
export interface ProgressStore {
  load(): ProgressState;
  save(state: ProgressState): void;
  clear(): void;
  /** true quando o armazenamento não está disponível e o progresso não vai sobreviver ao recarregar */
  readonly volatile: boolean;
}

const KEY = 'cnhquest:progress:v1';

export function migrate(raw: unknown): ProgressState {
  const base = initialProgress();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<ProgressState>;
  if (r.version !== 1) return base;
  return {
    ...base,
    ...r,
    daily: { ...base.daily, ...r.daily },
    streak: { ...base.streak, ...r.streak },
    prefs: { ...base.prefs, ...r.prefs },
    lessons: r.lessons ?? {},
    questions: r.questions ?? {},
    topics: r.topics ?? {},
    achievements: r.achievements ?? [],
    exams: r.exams ?? [],
  };
}

export function createLocalStore(storage: Storage | undefined = safeLocalStorage()): ProgressStore {
  let memory: ProgressState | null = null;
  const volatile = !storage;
  return {
    volatile,
    load() {
      if (!storage) return memory ?? initialProgress();
      try {
        const txt = storage.getItem(KEY);
        return txt ? migrate(JSON.parse(txt)) : initialProgress();
      } catch {
        return initialProgress();
      }
    },
    save(state) {
      memory = state;
      if (!storage) return;
      try {
        storage.setItem(KEY, JSON.stringify(state));
      } catch {
        /* cota cheia ou bloqueado: mantém em memória */
      }
    },
    clear() {
      memory = null;
      try {
        storage?.removeItem(KEY);
      } catch {
        /* ignore */
      }
    },
  };
}

function safeLocalStorage(): Storage | undefined {
  try {
    const s = window.localStorage;
    const probe = '__cnhquest_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return undefined;
  }
}

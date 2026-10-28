import type { ConceptCard, Lesson, LessonStep } from '../content/types';

/** Item da fila de uma sessão em andamento. */
export type SessionItem =
  | { kind: 'concept'; card: ConceptCard }
  | { kind: 'question'; questionId: string; retry: boolean }
  | { kind: 'review-intro' };

export interface SessionState {
  lessonId: string;
  queue: SessionItem[];
  index: number;
  /** resultado da 1ª tentativa de cada questão */
  firstTry: Record<string, boolean>;
  /** questões erradas ao menos uma vez, na ordem em que foram erradas */
  missed: string[];
  /** tentativas extras já agendadas por questão */
  retries: Record<string, number>;
  reviewIntroShown: boolean;
  /** vidas: só usadas se o aluno ativar o modo desafio */
  hearts: number | null;
  answered: number;
}

/** Cada questão errada volta no fim, no máximo esta quantidade de vezes. */
export const MAX_RETRIES = 2;

export function startSession(lesson: Pick<Lesson, 'id' | 'steps'>, opts: { hearts?: boolean } = {}): SessionState {
  return {
    lessonId: lesson.id,
    queue: lesson.steps.map(toItem),
    index: 0,
    firstTry: {},
    missed: [],
    retries: {},
    reviewIntroShown: false,
    hearts: opts.hearts ? 5 : null,
    answered: 0,
  };
}

/** Sessão avulsa a partir de uma lista de questões (revisão espaçada, pontos fracos). */
export function startPractice(id: string, questionIds: string[]): SessionState {
  return startSession({ id, steps: questionIds.map((questionId) => ({ kind: 'question', questionId })) });
}

function toItem(step: LessonStep): SessionItem {
  return step.kind === 'concept' ? { kind: 'concept', card: step.card } : { kind: 'question', questionId: step.questionId, retry: false };
}

export function currentItem(s: SessionState): SessionItem | undefined {
  return s.queue[s.index];
}

export function isFinished(s: SessionState): boolean {
  return s.index >= s.queue.length || s.hearts === 0;
}

/** Fração de avanço exibida na barra de progresso. */
export function progressRatio(s: SessionState): number {
  if (s.queue.length === 0) return 1;
  return Math.min(1, s.index / s.queue.length);
}

/** Registra a resposta da questão atual (não avança: o aluno ainda vê o feedback). */
export function answerCurrent(s: SessionState, correct: boolean): SessionState {
  const item = currentItem(s);
  if (!item || item.kind !== 'question') return s;
  const id = item.questionId;
  const next: SessionState = { ...s, answered: s.answered + 1 };
  if (!(id in s.firstTry)) next.firstTry = { ...s.firstTry, [id]: correct };
  if (!correct) {
    if (!s.missed.includes(id)) next.missed = [...s.missed, id];
    const used = s.retries[id] ?? 0;
    if (used < MAX_RETRIES) {
      next.retries = { ...s.retries, [id]: used + 1 };
      const queue = [...s.queue];
      if (!s.reviewIntroShown && !queue.some((q) => q.kind === 'review-intro')) queue.push({ kind: 'review-intro' });
      queue.push({ kind: 'question', questionId: id, retry: true });
      next.queue = queue;
    }
    if (s.hearts !== null) next.hearts = Math.max(0, s.hearts - 1);
  }
  return next;
}

export function advance(s: SessionState): SessionState {
  const item = currentItem(s);
  return { ...s, index: s.index + 1, reviewIntroShown: s.reviewIntroShown || item?.kind === 'review-intro' };
}

export interface SessionResult {
  lessonId: string;
  total: number;
  correctFirstTry: number;
  accuracy: number;
  missed: string[];
  /** terminou sem perder todas as vidas */
  completed: boolean;
}

export function summarize(s: SessionState): SessionResult {
  const ids = Object.keys(s.firstTry);
  const correct = ids.filter((id) => s.firstTry[id]).length;
  return {
    lessonId: s.lessonId,
    total: ids.length,
    correctFirstTry: correct,
    accuracy: ids.length ? correct / ids.length : 0,
    missed: s.missed,
    completed: s.hearts !== 0,
  };
}

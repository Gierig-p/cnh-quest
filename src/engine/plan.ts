import type { World } from '../content/types';
import { DAILY_GOALS, daysBetween, dayKey, lessonRounds, practiceXp, roundsDone, type ProgressState } from './progress';

/**
 * Plano até a prova (pedido do dono, 14/11/2026): com a data da prova marcada, calcula quanto
 * estudar por dia, de hoje até a véspera, para terminar o conteúdo do app e chegar com simulados feitos.
 *
 * Ideia guardada para o futuro: esta opção pode virar parte de um plano pago (ver ESTADO-DO-PROJETO.md,
 * "Ideias para depois"). Por enquanto é livre para todos.
 */

/** Minutos de uma rodada de lição (cerca de 8 questões; a 1ª rodada tem os cartões). */
export const ROUND_MIN = 6;
/** Minutos de revisão por dia, além das lições. */
export const REVIEW_MIN = 5;
/** Minutos de um simulado de 30 questões (o limite é 60, mas a maioria termina antes). */
export const EXAM_MIN = 30;
/** Acima disso por dia, o plano avisa que o tempo está curto. */
export const TIGHT_MIN = 60;

export type PlanPhase = 'past' | 'today' | 'study' | 'done';

export interface StudyPlan {
  phase: PlanPhase;
  /** Dias de estudo até a prova, contando hoje e sem contar o dia da prova. */
  daysLeft: number;
  /** Rodadas de lição que faltam no app. */
  roundsLeft: number;
  /** Rodadas por dia para terminar a tempo (fase "study"). */
  roundsPerDay: number;
  /** Minutos por dia sugeridos. */
  minutesPerDay: number;
  /** Dias finais guardados para simulados. */
  finalDays: number;
  /** Meta diária (XP) que cobre o XP das lições de cada dia do plano. */
  suggestedGoal: number;
  /** true quando o tempo por dia passa de TIGHT_MIN. */
  tight: boolean;
}

export { daysBetween };

/** Dias guardados no fim para simulados: 2 com uma semana ou mais, 1 com 3 a 6 dias, 0 com menos. */
export function finalDaysFor(daysLeft: number): number {
  if (daysLeft >= 7) return 2;
  if (daysLeft >= 3) return 1;
  return 0;
}

/** Meta diária (a meta conta XP) que cobre o XP pedido por dia. */
function goalForXp(xp: number): number {
  return (DAILY_GOALS.find((g) => g.xp >= xp) ?? DAILY_GOALS[DAILY_GOALS.length - 1]).xp;
}

/** XP das rodadas que faltam: a 1ª rodada vale o XP da lição; as de prática, menos. */
function xpLeft(s: ProgressState, worlds: World[]): number {
  let xp = 0;
  for (const w of worlds)
    for (const l of w.lessons)
      for (let r = roundsDone(s, l) + 1; r <= lessonRounds(l); r++) xp += r === 1 ? l.xp : practiceXp(l);
  return xp;
}

export function studyPlan(s: ProgressState, worlds: World[], examDate: string, now: Date): StudyPlan {
  const daysLeft = daysBetween(dayKey(now), examDate);
  const roundsLeft = worlds.reduce((n, w) => n + w.lessons.reduce((m, l) => m + lessonRounds(l) - roundsDone(s, l), 0), 0);
  const finalDays = finalDaysFor(daysLeft);
  const base = { daysLeft, roundsLeft, finalDays, roundsPerDay: 0, tight: false };

  if (daysLeft < 0) return { ...base, phase: 'past', minutesPerDay: 0, suggestedGoal: s.dailyGoal };
  if (daysLeft === 0) return { ...base, phase: 'today', minutesPerDay: 0, suggestedGoal: s.dailyGoal };
  // conteúdo do app terminado, ou já na reta final: simulado e revisão
  const finalMin = EXAM_MIN + REVIEW_MIN;
  // um simulado por dia não dá XP de lição: a meta mais leve basta para manter a ofensiva
  if (roundsLeft === 0) return { ...base, phase: 'done', minutesPerDay: finalMin, suggestedGoal: s.dailyGoal };
  // finalDaysFor deixa sempre ao menos 2 dias de lição quando guarda algum dia final
  const studyDays = daysLeft - finalDays;
  const roundsPerDay = Math.ceil(roundsLeft / studyDays);
  const minutes = roundsPerDay * ROUND_MIN + REVIEW_MIN;
  const suggestedGoal = goalForXp(Math.ceil(xpLeft(s, worlds) / studyDays));
  return { ...base, phase: 'study', roundsPerDay, minutesPerDay: minutes, suggestedGoal, tight: minutes > TIGHT_MIN };
}

/** "sex., 27/11" */
export function shortDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const wd = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short' });
  return `${wd}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

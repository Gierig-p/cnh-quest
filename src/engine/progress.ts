import type { Lesson, Question, World } from '../content/types';
import type { SessionResult } from './session';

export interface LessonProgress {
  completed: boolean;
  mastered: boolean;
  bestAccuracy: number;
  attempts: number;
}

export interface QuestionStat {
  seen: number;
  wrong: number;
  /** caixa de Leitner, 1 (rever logo) a 5 (dominada) */
  box: number;
  due: string;
}

export interface TopicStat {
  seen: number;
  correct: number;
}

export interface ExamRecord {
  at: string;
  configId: string;
  total: number;
  correct: number;
  passMin: number;
  passed: boolean;
  durationSec: number;
  wrongIds: string[];
}

export interface Prefs {
  sound: boolean;
  hearts: boolean;
  motion: 'system' | 'reduce' | 'full';
  examConfig: string;
}

export interface ProgressState {
  version: 1;
  xp: number;
  dailyGoal: number;
  daily: { date: string; xp: number };
  streak: { count: number; best: number; lastDay: string | null };
  lessons: Record<string, LessonProgress>;
  questions: Record<string, QuestionStat>;
  topics: Record<string, TopicStat>;
  achievements: string[];
  exams: ExamRecord[];
  prefs: Prefs;
  onboarded: boolean;
}

export const DAILY_GOALS = [
  { xp: 10, label: 'Leve', minutes: 5 },
  { xp: 20, label: 'Regular', minutes: 10 },
  { xp: 30, label: 'Firme', minutes: 15 },
  { xp: 50, label: 'Intensa', minutes: 20 },
];

export function initialProgress(): ProgressState {
  return {
    version: 1,
    xp: 0,
    dailyGoal: 20,
    daily: { date: '', xp: 0 },
    streak: { count: 0, best: 0, lastDay: null },
    lessons: {},
    questions: {},
    topics: {},
    achievements: [],
    exams: [],
    prefs: { sound: true, hearts: false, motion: 'system', examConfig: 'federal' },
    onboarded: false,
  };
}

/* ---------- datas locais (AAAA-MM-DD) ---------- */

export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/* ---------- repetição espaçada ---------- */

/** Intervalo em dias para cada caixa de Leitner. */
export const BOX_INTERVALS = [0, 1, 2, 4, 8, 16];

export function recordAnswer(s: ProgressState, q: Question, correct: boolean, now: Date, firstTry: boolean): ProgressState {
  const today = dayKey(now);
  const prev = s.questions[q.id] ?? { seen: 0, wrong: 0, box: 1, due: today };
  const box = correct ? Math.min(5, prev.box + (firstTry ? 1 : 0)) : 1;
  const stat: QuestionStat = {
    seen: prev.seen + 1,
    wrong: prev.wrong + (correct ? 0 : 1),
    box,
    due: correct ? addDays(today, BOX_INTERVALS[box]) : today,
  };
  const topics = { ...s.topics };
  if (firstTry) {
    const t = topics[q.topic] ?? { seen: 0, correct: 0 };
    topics[q.topic] = { seen: t.seen + 1, correct: t.correct + (correct ? 1 : 0) };
  }
  return { ...s, questions: { ...s.questions, [q.id]: stat }, topics };
}

/** Questões já vistas cuja revisão venceu. */
export function dueQuestions(s: ProgressState, now: Date): string[] {
  const today = dayKey(now);
  return Object.entries(s.questions)
    .filter(([, st]) => st.due <= today && st.box < 5)
    .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);
}

/* ---------- desempenho por assunto ---------- */

export interface TopicReport {
  topic: string;
  seen: number;
  accuracy: number;
  status: 'fraco' | 'em progresso' | 'dominado';
}

export function topicReport(s: ProgressState): TopicReport[] {
  return Object.entries(s.topics)
    .map(([topic, t]) => {
      const accuracy = t.seen ? t.correct / t.seen : 0;
      const status: TopicReport['status'] =
        t.seen >= 3 && accuracy < 0.7 ? 'fraco' : t.seen >= 4 && accuracy >= 0.85 ? 'dominado' : 'em progresso';
      return { topic, seen: t.seen, accuracy, status };
    })
    .sort((a, b) => a.accuracy - b.accuracy);
}

/* ---------- desbloqueio ---------- */

export type NodeState = 'locked' | 'available' | 'completed' | 'mastered';

/**
 * Lições abrem em sequência. A revisão (última lição do mundo) só abre com as demais concluídas.
 * O mundo só conta como concluído quando a revisão atinge o domínio mínimo.
 */
export function lessonState(s: ProgressState, world: World, lesson: Lesson, prevWorld?: World): NodeState {
  const p = s.lessons[lesson.id];
  if (p?.mastered) return 'mastered';
  if (p?.completed) return 'completed';
  const i = world.lessons.findIndex((l) => l.id === lesson.id);
  if (i > 0 && !s.lessons[world.lessons[i - 1].id]?.completed) return 'locked';
  if (i === 0 && prevWorld && !worldCompleted(s, prevWorld)) return 'locked';
  return 'available';
}

export function worldCompleted(s: ProgressState, world: World): boolean {
  const last = world.lessons[world.lessons.length - 1];
  return Boolean(s.lessons[last.id]?.mastered);
}

export function nextLesson(s: ProgressState, worlds: World[]): { world: World; lesson: Lesson } | null {
  for (const [wi, w] of worlds.entries()) for (const l of w.lessons) {
    const st = lessonState(s, w, l, worlds[wi - 1]);
    if (st === 'available') return { world: w, lesson: l };
    if (st === 'completed' && w.lessons[w.lessons.length - 1].id === l.id) return { world: w, lesson: l };
  }
  return null;
}

/* ---------- conclusão de lição ---------- */

export interface CompletionOutcome {
  state: ProgressState;
  xpGained: number;
  streakIncreased: boolean;
  goalReachedNow: boolean;
  newAchievements: string[];
  mastered: boolean;
}

export const ACHIEVEMENTS: Record<string, { title: string; description: string }> = {
  'primeira-licao': { title: 'Primeira marcha', description: 'Concluiu a primeira lição.' },
  perfeita: { title: 'Sem arranhões', description: 'Concluiu uma lição sem errar.' },
  'meta-diaria': { title: 'Meta batida', description: 'Atingiu a meta diária de XP.' },
  'ofensiva-3': { title: 'Três dias seguidos', description: 'Estudou 3 dias seguidos.' },
  'mundo-1': { title: 'Começou bem', description: 'Concluiu o Mundo 1.' },
  'primeiro-simulado': { title: 'Prova de fogo', description: 'Fez o primeiro simulado.' },
  aprovado: { title: 'Aprovado no simulado', description: 'Atingiu a nota mínima num simulado.' },
};

export function addXp(s: ProgressState, amount: number, now: Date) {
  const today = dayKey(now);
  const dailyBefore = s.daily.date === today ? s.daily.xp : 0;
  const daily = { date: today, xp: dailyBefore + amount };
  let streak = s.streak;
  let streakIncreased = false;
  if (amount > 0 && streak.lastDay !== today) {
    const count = streak.lastDay === addDays(today, -1) ? streak.count + 1 : 1;
    streak = { count, best: Math.max(streak.best, count), lastDay: today };
    streakIncreased = true;
  }
  const goalReachedNow = dailyBefore < s.dailyGoal && daily.xp >= s.dailyGoal;
  return { state: { ...s, xp: s.xp + amount, daily, streak }, streakIncreased, goalReachedNow };
}

export function completeLesson(s: ProgressState, lesson: Lesson, result: SessionResult, now: Date): CompletionOutcome {
  const perfect = result.total > 0 && result.correctFirstTry === result.total;
  const xpGained = result.completed ? lesson.xp + (perfect ? 5 : 0) : Math.round(lesson.xp / 3);
  const prev = s.lessons[lesson.id] ?? { completed: false, mastered: false, bestAccuracy: 0, attempts: 0 };
  const mastered = result.completed && result.accuracy >= lesson.masteryThreshold;
  const lp: LessonProgress = {
    completed: prev.completed || result.completed,
    mastered: prev.mastered || mastered,
    bestAccuracy: Math.max(prev.bestAccuracy, result.accuracy),
    attempts: prev.attempts + 1,
  };
  const x = addXp({ ...s, lessons: { ...s.lessons, [lesson.id]: lp } }, xpGained, now);
  let state = x.state;
  const unlocked: string[] = [];
  const grant = (id: string) => {
    if (!state.achievements.includes(id) && !unlocked.includes(id)) unlocked.push(id);
  };
  if (lp.completed) grant('primeira-licao');
  if (perfect && result.completed) grant('perfeita');
  if (x.goalReachedNow) grant('meta-diaria');
  if (state.streak.count >= 3) grant('ofensiva-3');
  if (lesson.id === 'w1-review' && lp.mastered) grant('mundo-1');
  state = { ...state, achievements: [...state.achievements, ...unlocked] };
  return {
    state,
    xpGained,
    streakIncreased: x.streakIncreased,
    goalReachedNow: x.goalReachedNow,
    newAchievements: unlocked,
    mastered,
  };
}

/** Nível derivado do XP total (curva suave). */
export function levelFromXp(xp: number) {
  let level = 1;
  let need = 50;
  let rest = xp;
  while (rest >= need) {
    rest -= need;
    level += 1;
    need = Math.round(need * 1.25);
  }
  return { level, into: rest, need };
}

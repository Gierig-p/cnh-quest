import type { Lesson, World } from '../content/types';
import type { ProgressState } from './progress';

/**
 * Revisões sorteadas: cada pessoa recebe uma seleção diferente das questões já ensinadas,
 * mas sempre cobrindo todos os cartões e misturando os tipos de exercício.
 * Também sorteia a rodada 1 das lições (1 versão por objetivo, `drawLessonSteps`).
 */

export interface PoolItem {
  questionId: string;
  /** cartão que ensina a questão */
  cardId: string;
}

/**
 * Questões que a revisão pode sortear: as das lições comuns (com cartões) do mundo.
 * Revisão da metade: só as lições antes dela. Revisão do mundo: todas.
 */
export function reviewPool(world: World, lesson: Lesson): PoolItem[] {
  const idx = world.lessons.findIndex((l) => l.id === lesson.id);
  const isWorldReview = idx === world.lessons.length - 1;
  const lessons = (isWorldReview ? world.lessons : world.lessons.slice(0, idx)).filter((l) => l.steps.some((s) => s.kind === 'concept'));
  const seen = new Set<string>();
  const pool: PoolItem[] = [];
  for (const l of lessons) {
    let cardId = '';
    for (const s of l.steps) {
      if (s.kind === 'concept') cardId = s.card.id;
      else if (cardId && !seen.has(s.questionId)) {
        seen.add(s.questionId);
        pool.push({ questionId: s.questionId, cardId });
      }
    }
  }
  return pool;
}

/**
 * Sorteia as questões da revisão:
 * 1. uma de cada cartão (todos os assuntos aparecem);
 * 2. completa até `size`, espalhando entre os cartões;
 * em ambos, as que o aluno errou e ainda não fixou vêm primeiro.
 * Por fim embaralha, evitando dois exercícios do mesmo tipo seguidos.
 */
export function reviewRoundIds(
  s: ProgressState,
  pool: PoolItem[],
  size: number,
  typeOf: (questionId: string) => string,
  rnd: () => number = Math.random,
): string[] {
  const shuffle = <T,>(xs: T[]) => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // menor = mais urgente: errada e em caixa baixa > nunca vista > já vista e certa
  const score = (id: string) => {
    const q = s.questions[id];
    if (!q) return 6;
    return q.wrong > 0 ? q.box : 6 + q.box;
  };
  const ranked = shuffle(pool).sort((a, b) => score(a.questionId) - score(b.questionId));

  const cards = [...new Set(pool.map((p) => p.cardId))];
  const perCardCap = Math.ceil(size / Math.max(1, cards.length)) + 1;
  const picked: PoolItem[] = [];
  const count = new Map<string, number>();
  const take = (p: PoolItem) => {
    picked.push(p);
    count.set(p.cardId, (count.get(p.cardId) ?? 0) + 1);
  };

  // 1. uma por cartão (se houver mais cartões que vagas, ficam os mais urgentes)
  for (const p of ranked) if (picked.length < size && !count.has(p.cardId)) take(p);
  // 2. completa respeitando um limite por cartão; se faltar, completa sem limite
  for (const capped of [true, false])
    for (const p of ranked) {
      if (picked.length >= size) break;
      if (picked.includes(p)) continue;
      if (capped && (count.get(p.cardId) ?? 0) >= perCardCap) continue;
      take(p);
    }

  return mixTypes(shuffle(picked.map((p) => p.questionId)), typeOf);
}

/** Reordena para não repetir o mesmo tipo de exercício em seguida, quando possível. */
export function mixTypes(ids: string[], typeOf: (id: string) => string): string[] {
  const rest = [...ids];
  const out: string[] = [];
  while (rest.length) {
    const last = out.length ? typeOf(out[out.length - 1]) : null;
    let i = rest.findIndex((id) => typeOf(id) !== last);
    if (i < 0) i = 0;
    out.push(rest.splice(i, 1)[0]);
  }
  return out;
}

/**
 * Rodada 1 de uma lição com banco de variações: mantém os cartões e, dentro de cada cartão,
 * sorteia 1 questão por objetivo (na ordem em que o objetivo aparece). Assim todo mundo aprende
 * as mesmas ideias, mas com exercícios diferentes. Prefere questões que a pessoa ainda não viu
 * e um tipo diferente do exercício anterior. Objetivo com uma só questão fica igual.
 */
export function drawLessonSteps(
  s: ProgressState,
  lesson: Pick<Lesson, 'steps'>,
  questionOf: (questionId: string) => { objective: string; type: string },
  rnd: () => number = Math.random,
): Lesson['steps'] {
  const out: Lesson['steps'] = [];
  let block: string[] = [];
  const flush = () => {
    const groups = new Map<string, string[]>();
    for (const id of block) {
      const key = questionOf(id).objective;
      groups.set(key, [...(groups.get(key) ?? []), id]);
    }
    let lastType: string | null = null;
    for (const ids of groups.values()) {
      let options = ids.filter((id) => !s.questions[id]);
      if (!options.length) options = ids;
      const otherType = options.filter((id) => questionOf(id).type !== lastType);
      if (otherType.length) options = otherType;
      const pick = options[Math.floor(rnd() * options.length)];
      lastType = questionOf(pick).type;
      out.push({ kind: 'question', questionId: pick });
    }
    block = [];
  };
  for (const st of lesson.steps) {
    if (st.kind === 'concept') {
      flush();
      out.push(st);
    } else block.push(st.questionId);
  }
  flush();
  return out;
}

/** Chave do sorteio salvo: uma por lição e rodada (revisões têm uma só). */
export function drawKey(lessonId: string, round: number, review: boolean): string {
  return review ? `${lessonId}:revisao` : `${lessonId}:r${round}`;
}

/**
 * Remonta a rodada 1 a partir das questões salvas: cada cartão seguido das questões salvas do seu bloco.
 * Devolve null se o salvo não serve mais (questão que saiu da lição ou bloco vazio) — aí sorteia de novo.
 */
export function rebuildLessonSteps(lesson: Pick<Lesson, 'steps'>, ids: string[]): Lesson['steps'] | null {
  // bloco = questões depois de cada cartão (bloco 0: as que vêm antes do 1º cartão, se houver)
  const blockOf = new Map<string, number>();
  let b = 0;
  for (const st of lesson.steps) {
    if (st.kind === 'concept') b++;
    else blockOf.set(st.questionId, b);
  }
  if (!ids.length || ids.some((id) => !blockOf.has(id))) return null;
  const saved = new Set(ids.map((id) => blockOf.get(id)));
  if ([...blockOf.values()].some((blk) => !saved.has(blk))) return null;
  const out: Lesson['steps'] = [];
  const emit = (blk: number) =>
    out.push(...ids.filter((id) => blockOf.get(id) === blk).map((questionId) => ({ kind: 'question' as const, questionId })));
  b = 0;
  emit(0);
  for (const st of lesson.steps)
    if (st.kind === 'concept') {
      out.push(st);
      emit(++b);
    }
  return out;
}

/**
 * Revisão de erros: perguntas que tratam do mesmo assunto da questão `id` (mesmo cartão),
 * em ordem de preferência — mesmo objetivo antes, depois tipo de exercício diferente; sorteadas dentro disso.
 * `cardOf` liga cada questão ao cartão que a ensina (`HINT_CARDS`).
 */
export function sameTopicQuestions(
  id: string,
  cardOf: Record<string, { id: string }>,
  questionOf: (questionId: string) => { objective: string; type: string } | undefined,
  rnd: () => number = Math.random,
): string[] {
  const card = cardOf[id]?.id;
  const me = questionOf(id);
  if (!card || !me) return [];
  const score = (x: string) => {
    const o = questionOf(x);
    if (!o) return 9;
    return (o.objective === me.objective ? 0 : 2) + (o.type === me.type ? 1 : 0);
  };
  const ids = Object.keys(cardOf).filter((x) => x !== id && cardOf[x].id === card);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.sort((a, b) => score(a) - score(b));
}

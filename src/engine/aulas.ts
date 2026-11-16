import type { ConceptCard, Lesson, World } from '../content/types';
import { lessonsWithCardsSeen, type ProgressState } from './progress';

/**
 * Aulas: os cartões de conceito já estudados, para rever o vídeo e o resumo na aba Revisar
 * (pedido do dono, 16/11/2026; plano em docs/codex/respostas/09_rever_conceitos.md).
 * Só consulta: abrir uma aula não dá XP nem mexe na trilha.
 */

export interface Aula {
  card: ConceptCard;
  lesson: Lesson;
  world: World;
}

/** Todas as aulas, na ordem da trilha. */
export function aulaCatalog(worlds: World[]): Aula[] {
  const out: Aula[] = [];
  for (const world of worlds)
    for (const lesson of world.lessons)
      for (const st of lesson.steps) if (st.kind === 'concept') out.push({ card: st.card, lesson, world });
  return out;
}

/** Aula já liberada: o cartão foi aberto numa lição, ou a rodada 1 da lição dele já foi feita. */
export function unlockedAulaIds(s: ProgressState, catalog: Aula[]): Set<string> {
  const ids = new Set(s.aulas ?? []);
  const lessons = new Set(lessonsWithCardsSeen(s));
  for (const a of catalog) if (lessons.has(a.lesson.id)) ids.add(a.card.id);
  return ids;
}

/** Marca a aula como liberada (não muda nada se já estava). */
export function unlockAula(s: ProgressState, cardId: string): ProgressState {
  if (s.aulas?.includes(cardId)) return s;
  return { ...s, aulas: [...(s.aulas ?? []), cardId] };
}

/** Questões que o cartão ensina: as que vêm depois dele na lição, até o próximo cartão. */
export function aulaQuestionIds(lesson: Pick<Lesson, 'steps'>, cardId: string): string[] {
  const out: string[] = [];
  let inside = false;
  for (const st of lesson.steps) {
    if (st.kind === 'concept') inside = st.card.id === cardId;
    else if (inside) out.push(st.questionId);
  }
  return out;
}

/**
 * Prática da aula: uma questão sorteada por objetivo (as versões do mesmo objetivo se revezam),
 * em ordem embaralhada, até `max`.
 */
export function aulaPracticeIds(
  lesson: Pick<Lesson, 'steps'>,
  cardId: string,
  objectiveOf: (questionId: string) => string,
  max = 8,
  rnd: () => number = Math.random,
): string[] {
  const groups = new Map<string, string[]>();
  for (const id of aulaQuestionIds(lesson, cardId)) {
    const key = objectiveOf(id);
    groups.set(key, [...(groups.get(key) ?? []), id]);
  }
  const picks = [...groups.values()].map((ids) => ids[Math.floor(rnd() * ids.length)]);
  for (let i = picks.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [picks[i], picks[j]] = [picks[j], picks[i]];
  }
  return picks.slice(0, max);
}

/** Texto para a busca: sem acento e em minúsculas. */
export function normalizeSearch(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** A aula combina com a busca? Procura no título, no resumo, nas palavras novas e no "Para guardar". */
export function aulaMatches(a: Aula, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const c = a.card;
  const text = [c.title, a.lesson.title, ...(c.video?.resumo ?? []), ...(c.terms ?? []).map((t) => t.term), c.remember ?? ''].join(' ');
  return normalizeSearch(text).includes(q);
}

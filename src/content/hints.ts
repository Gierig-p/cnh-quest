import { seededShuffle } from '../engine/grading';
import type { ConceptCard, Question, World } from './types';

/**
 * Botão "Dica" das lições. Nada é escrito à mão aqui: a dica usa só textos
 * já verificados — o "Para guardar" do cartão e o "por que está errada" das alternativas.
 */

/** Segundos na questão antes de a dica liberar. */
export const HINT_DELAY_S = 60;

/** Cartão de conceito que ensina cada questão: o último cartão antes dela na lição de origem. */
export function buildHintCards(worlds: World[]): Record<string, ConceptCard> {
  const map: Record<string, ConceptCard> = {};
  for (const w of worlds)
    for (const l of w.lessons) {
      let card: ConceptCard | undefined;
      for (const s of l.steps) {
        if (s.kind === 'concept') card = s.card;
        else if (card && card.remember && !map[s.questionId]) map[s.questionId] = card;
      }
    }
  return map;
}

/** 2º degrau da dica: o que fica "eliminado" ou revelado, sempre com a explicação já existente. */
export type HintReveal =
  | { kind: 'eliminate-option'; optionId: string; text: string; why: string }
  | { kind: 'eliminate-word'; word: string; why: string }
  | { kind: 'pair'; left: string; right: string }
  | { kind: 'first-step'; text: string };

export function hintReveal(q: Question, seed: string): HintReveal | null {
  switch (q.type) {
    case 'choice': {
      const wrong = seededShuffle(q.options.filter((o) => o.id !== q.correct && o.whyWrong), `dica-${seed}`)[0];
      return wrong ? { kind: 'eliminate-option', optionId: wrong.id, text: wrong.visual?.alt ?? wrong.text, why: wrong.whyWrong! } : null;
    }
    case 'fill': {
      const word = seededShuffle(q.bank.filter((w) => w !== q.answer && q.whyWrong[w]), `dica-${seed}`)[0];
      return word ? { kind: 'eliminate-word', word, why: q.whyWrong[word] } : null;
    }
    case 'match': {
      const p = seededShuffle(q.pairs, `dica-${seed}`)[0];
      return p ? { kind: 'pair', left: p.leftVisual?.alt ?? p.left, right: p.right } : null;
    }
    case 'order': {
      const first = q.items.find((i) => i.id === q.answer[0]);
      return first ? { kind: 'first-step', text: first.text } : null;
    }
    case 'truefalse':
      // só duas opções: eliminar uma entregaria a resposta sem ensinar
      return null;
  }
}

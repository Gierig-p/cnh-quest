import { seededShuffle } from '../engine/grading';
import type { ConceptCard, Question, World } from './types';

/**
 * Botão "Dica" das lições. Nada é escrito à mão aqui: a dica usa só textos
 * já verificados — o "Para guardar" do cartão e o "por que está errada" das alternativas.
 */

/** Segundos na questão antes de a dica liberar (pedido do dono, 16/11/2026: era 60). */
export const HINT_DELAY_S = 20;

/**
 * Questões em que ver o desenho da placa entregaria a resposta (cor, tipo da placa, qual placa é).
 * Nelas a miniatura e o balão da placa ficam escondidos e viram parte da Dica,
 * que já começa liberada (pedido do dono, 16/11/2026).
 */
export const SIGN_IN_HINT: ReadonlySet<string> = new Set([
  'w1-l3-q1', // qual destas placas é de advertência (a amarela)
  'w1-l3-q15', // idem
  'w2-l1-q2', // R-4a + R-5a (o desenho do retorno)
  'w2-l1-q9', // idem, lacuna
  'w2-l2-q2', // cor da placa A-24
  'w2-l2-q4', // A-15 tem o PARE desenhado
  'w2-l2-q8', // R-15 tem o desenho da altura
]);

/** Segundos até a dica liberar nesta questão. */
export const hintDelay = (questionId: string) => (SIGN_IN_HINT.has(questionId) ? 0 : HINT_DELAY_S);

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

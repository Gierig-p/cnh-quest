import type { TermDef, World } from './types';

/**
 * Glossário montado a partir das "Palavras novas" dos cartões de conceito.
 * Nada é escrito aqui à mão: o texto vem só dos cartões (conteúdo verificado).
 */
export interface GlossaryEntry extends TermDef {
  lessonId: string;
  cardId: string;
}

export function buildGlossary(worlds: World[]): GlossaryEntry[] {
  return worlds.flatMap((w) =>
    w.lessons.flatMap((l) =>
      l.steps.flatMap((s) => (s.kind === 'concept' ? (s.card.terms ?? []).map((t) => ({ ...t, lessonId: l.id, cardId: s.card.id })) : [])),
    ),
  );
}

/** Dica pronta para mostrar num exercício. */
export interface TermHint {
  term: string;
  meaning: string;
  /** ensinada na lição atual: destaque roxo "palavra nova" */
  isNew: boolean;
  skipIn: string[];
}

export interface HintIndex {
  /** forma em minúsculas → dica */
  byForm: Map<string, TermHint>;
  /** acha qualquer forma, a mais longa primeiro, só palavra inteira */
  pattern: RegExp | null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Quais palavras já foram ensinadas ao aluno neste momento:
 * - as das lições já concluídas;
 * - as dos cartões que ele já viu nesta sessão.
 * As da lição atual (`lessonId`) ficam marcadas como novas.
 */
export function buildHintIndex(
  glossary: GlossaryEntry[],
  ctx: { lessonId: string; seenCardIds: Iterable<string>; completedLessonIds: Iterable<string> },
): HintIndex {
  const seen = new Set(ctx.seenCardIds);
  const done = new Set(ctx.completedLessonIds);
  const byForm = new Map<string, TermHint>();
  const available = glossary.filter((e) => seen.has(e.cardId) || done.has(e.lessonId));
  // a lição atual vem primeiro: se a palavra foi ensinada de novo aqui, vale a explicação daqui
  const ordered = [...available.filter((e) => e.lessonId === ctx.lessonId), ...available.filter((e) => e.lessonId !== ctx.lessonId)];
  for (const e of ordered) {
    const hint: TermHint = { term: e.term, meaning: e.meaning, isNew: e.lessonId === ctx.lessonId, skipIn: e.skipIn ?? [] };
    for (const form of [e.term, ...(e.aliases ?? [])]) {
      const key = form.toLocaleLowerCase('pt-BR');
      if (!byForm.has(key)) byForm.set(key, hint);
    }
  }
  const forms = [...byForm.keys()].sort((a, b) => b.length - a.length);
  const pattern = forms.length ? new RegExp(`(?<![\\p{L}\\p{N}])(${forms.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'giu') : null;
  return { byForm, pattern };
}

export type TextPart = string | { text: string; hint: TermHint };

/** Divide o texto em trechos comuns e palavras com dica. */
export function splitTerms(text: string, index: HintIndex | null, questionId?: string): TextPart[] {
  if (!index?.pattern || !text) return [text];
  const parts: TextPart[] = [];
  let last = 0;
  for (const m of text.matchAll(index.pattern)) {
    const hint = index.byForm.get(m[0].toLocaleLowerCase('pt-BR'));
    if (!hint || (questionId && hint.skipIn.includes(questionId))) continue;
    if (m.index! > last) parts.push(text.slice(last, m.index));
    parts.push({ text: m[0], hint });
    last = m.index! + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

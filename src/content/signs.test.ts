import { describe, expect, it } from 'vitest';
import { QUESTIONS, WORLDS } from './index';
import { SIGN_CODE_RE, cardSigns, signCodesIn } from './signs';
import type { Question, Visual } from './types';

/** textos que o aluno lê na questão antes de responder (explicação e "por que errou" ficam de fora) */
function visibleTexts(q: Question): string[] {
  const t = [q.prompt, ...(q.situation ?? []).map((s) => (s.kind === 'fala' ? s.text : s.label))];
  switch (q.type) {
    case 'choice':
      return [...t, ...q.options.map((o) => o.text)];
    case 'truefalse':
      return [...t, q.statement];
    case 'fill':
      return [...t, q.sentence, ...q.bank];
    case 'match':
      return [...t, ...q.pairs.flatMap((p) => [p.left, p.right])];
    case 'order':
      return [...t, ...q.items.map((i) => i.text)];
  }
}

/** placas desenhadas na própria questão */
function drawnSigns(q: Question): string[] {
  const vs: (Visual | undefined)[] = [q.visual];
  if (q.type === 'choice') vs.push(...q.options.map((o) => o.visual));
  if (q.type === 'match') vs.push(...q.pairs.map((p) => p.leftVisual));
  return vs.flatMap((v) => (v?.kind === 'sign' && v.sign ? [v.sign] : []));
}

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

describe('placas citadas nas questões', () => {
  it('toda placa citada pelo código já foi desenhada antes (num cartão) ou aparece desenhada na própria questão', () => {
    const problemas: string[] = [];
    const ensinadas = new Set<string>();
    for (const w of WORLDS) {
      for (const l of w.lessons) {
        for (const s of l.steps) {
          if (s.kind === 'concept') {
            cardSigns(s.card).forEach((c) => ensinadas.add(c));
            continue;
          }
          const q = byId.get(s.questionId)!;
          const desenhadas = new Set(drawnSigns(q));
          for (const code of visibleTexts(q).flatMap(signCodesIn)) {
            if (!ensinadas.has(code) && !desenhadas.has(code)) problemas.push(`${q.id}: ${code}`);
          }
        }
      }
    }
    expect(problemas).toEqual([]);
  });

  it('todo código de placa citado numa questão tem desenho e nome no app', () => {
    const desconhecidos = QUESTIONS.flatMap((q) =>
      visibleTexts(q).flatMap((t) => (t.match(SIGN_CODE_RE) ?? []).filter((c) => signCodesIn(c).length === 0).map((c) => `${q.id}: ${c}`)),
    );
    expect(desconhecidos).toEqual([]);
  });
});

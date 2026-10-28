import type { Question } from '../content/types';

export type Answer =
  | { type: 'choice'; optionId: string }
  | { type: 'truefalse'; value: boolean }
  | { type: 'fill'; word: string }
  | { type: 'order'; ids: string[] }
  | { type: 'match'; pairs: Record<string, string> };

export interface Feedback {
  correct: boolean;
  /** texto da resposta correta, para exibir */
  correctText: string;
  /** por que a escolha do aluno está errada (quando errou) */
  whyWrong?: string;
}

export function grade(q: Question, a: Answer): Feedback {
  switch (q.type) {
    case 'choice': {
      const right = q.options.find((o) => o.id === q.correct)!;
      const chosen = a.type === 'choice' ? q.options.find((o) => o.id === a.optionId) : undefined;
      const correct = chosen?.id === q.correct;
      return { correct, correctText: right.text, whyWrong: correct ? undefined : chosen?.whyWrong };
    }
    case 'truefalse': {
      const correct = a.type === 'truefalse' && a.value === q.answer;
      return { correct, correctText: q.answer ? 'Verdadeiro' : 'Falso', whyWrong: correct ? undefined : q.whyWrong };
    }
    case 'fill': {
      const word = a.type === 'fill' ? a.word : '';
      const correct = word === q.answer;
      return { correct, correctText: q.sentence.replace('___', q.answer), whyWrong: correct ? undefined : q.whyWrong[word] };
    }
    case 'order': {
      const ids = a.type === 'order' ? a.ids : [];
      const correct = ids.join() === q.answer.join();
      const byId = Object.fromEntries(q.items.map((i) => [i.id, i.text]));
      return { correct, correctText: q.answer.map((id, i) => `${i + 1}. ${byId[id]}`).join('  '), whyWrong: correct ? undefined : q.whyWrong };
    }
    case 'match': {
      const pairs = a.type === 'match' ? a.pairs : {};
      const correct = q.pairs.every((p) => pairs[p.id] === p.id);
      return {
        correct,
        correctText: q.pairs.map((p) => `${p.left} → ${p.right}`).join(' · '),
        whyWrong: correct ? undefined : q.whyWrong,
      };
    }
  }
}

/** Embaralhamento determinístico (mesma semente = mesma ordem), útil para testes e para não reordenar a cada render. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

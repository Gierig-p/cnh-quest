import { describe, expect, it } from 'vitest';
import { QUESTION_BY_ID, WORLDS } from './index';
import { reviewPool } from '../engine/review';

const ruaLessons = WORLDS.flatMap((w) => w.lessons.filter((l) => l.id.endsWith('-rua')).map((l) => ({ w, l })));
const situationIds = ruaLessons.flatMap(({ l }) => l.steps.flatMap((s) => (s.kind === 'question' ? [s.questionId] : [])));

describe('lições "Na rua" (situações narradas)', () => {
  it('cada mundo tem uma lição "Na rua", logo antes da revisão do mundo', () => {
    for (const w of WORLDS) {
      const ids = w.lessons.map((l) => l.id);
      expect(ids[ids.length - 2]).toBe(`${w.id}-rua`);
    }
  });

  it('toda questão da lição tem situação com fala, e não entra no simulado nem na revisão', () => {
    for (const id of situationIds) {
      const q = QUESTION_BY_ID[id];
      expect(q?.situation?.some((x) => x.kind === 'fala' && x.text.trim())).toBe(true);
      expect(q.examEligible).toBeFalsy();
    }
    for (const { w } of ruaLessons) {
      const review = w.lessons.find((l) => l.review)!;
      const pool = reviewPool(w, review).map((p) => p.questionId);
      expect(pool.filter((id) => situationIds.includes(id))).toEqual([]);
    }
  });

  it('toda situação tem o áudio gerado em public/audio/situacoes', () => {
    const files = Object.keys(import.meta.glob('/public/audio/situacoes/*.mp3', { query: '?url' }));
    expect(situationIds.filter((id) => !files.includes(`/public/audio/situacoes/${id}.mp3`))).toEqual([]);
  });
});

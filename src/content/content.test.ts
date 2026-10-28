import { describe, expect, it } from 'vitest';
import { QUESTIONS, WORLDS } from './index';
import { questionsBySource, validateContent } from './validate';
import type { Question } from './types';
import { PLANNED_WORLDS, REFERENCE_MODULES, worldReferenceModules } from './referenceModules';

describe('conteúdo', () => {
  it('passa em todas as regras de integridade', () => {
    expect(validateContent(QUESTIONS, WORLDS)).toEqual([]);
  });

  it('detecta questão sem resposta correta e id duplicado', () => {
    const base = QUESTIONS.find((q) => q.type === 'choice') as Extract<Question, { type: 'choice' }>;
    const broken = { ...base, correct: 'zzz' };
    const issues = validateContent([broken, broken], []);
    expect(issues.map((i) => i.message)).toEqual(
      expect.arrayContaining(['identificador duplicado', 'resposta correta ausente ou ambígua']),
    );
  });

  it('localiza questões afetadas por um artigo', () => {
    const affected = questionsBySource(QUESTIONS, 'ctb', 'art. 89');
    expect(affected.length).toBeGreaterThan(2);
  });

  it('liga cada lição a um módulo de referência coerente com suas questões', () => {
    const w1 = WORLDS[0];
    expect(w1.lessons.map((l) => [l.id, l.referenceModule])).toEqual([
      ['w1-l1', 1],
      ['w1-l2', 3],
      ['w1-l3', 1],
      ['w1-review', 1],
    ]);
    expect(worldReferenceModules(w1)).toEqual([1, 3]);
    const wrong = { ...w1, lessons: [{ ...w1.lessons[1], referenceModule: 4 as const }] };
    expect(validateContent(QUESTIONS, [wrong]).map((i) => i.message)).toContain(
      'módulo de referência não corresponde ao assunto de nenhuma questão da lição',
    );
  });

  it('a trilha planejada cobre os 4 módulos e cada módulo registra a origem do nome', () => {
    const covered = new Set(PLANNED_WORLDS.flatMap((w) => w.referenceModules));
    expect([...covered].sort()).toEqual([1, 2, 3, 4]);
    expect(PLANNED_WORLDS.map((w) => w.order)).toEqual([3, 4, 5, 6, 7, 8]);
    for (const m of Object.values(REFERENCE_MODULES)) expect(m.origin.length).toBeGreaterThan(20);
  });
});

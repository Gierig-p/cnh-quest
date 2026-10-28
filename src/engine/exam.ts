import { MODULE_TO_REFERENCE } from '../content/referenceModules';
import type { ChoiceQuestion, ExamConfig, Question, ReferenceModuleId } from '../content/types';
import { seededShuffle } from './grading';

export interface ExamPaper {
  configId: string;
  questionIds: string[];
  /** ordem das alternativas por questão */
  optionOrder: Record<string, string[]>;
  requested: number;
  passMin: number;
  durationMin: number;
  /** true quando o banco verificado ainda tem menos questões que o formato oficial */
  reduced: boolean;
}

export function examPool(questions: Question[]): ChoiceQuestion[] {
  return questions.filter(
    (q): q is ChoiceQuestion => q.type === 'choice' && q.examEligible === true && q.review === 'verificado' && q.options.length === 4,
  );
}

/**
 * Monta uma prova alternando módulos (a distribuição oficial por tema não foi publicada;
 * ver docs/matriz-conteudo-detran.md). Se o banco for menor que o formato, a nota mínima é proporcional.
 */
export function buildExam(questions: Question[], config: ExamConfig, seed: string): ExamPaper {
  const pool = examPool(questions);
  const byModule = new Map<string, ChoiceQuestion[]>();
  for (const q of seededShuffle(pool, seed)) {
    byModule.set(q.module, [...(byModule.get(q.module) ?? []), q]);
  }
  const picked: ChoiceQuestion[] = [];
  const lists = [...byModule.values()];
  while (picked.length < config.questionCount && lists.some((l) => l.length)) {
    for (const l of lists) {
      const q = l.shift();
      if (q && picked.length < config.questionCount) picked.push(q);
    }
  }
  const n = picked.length;
  const reduced = n < config.questionCount;
  const passMin = reduced ? Math.ceil((config.passMin / config.questionCount) * n) : config.passMin;
  return {
    configId: config.id,
    questionIds: picked.map((q) => q.id),
    optionOrder: Object.fromEntries(picked.map((q) => [q.id, seededShuffle(q.options.map((o) => o.id), seed + q.id)])),
    requested: config.questionCount,
    passMin,
    durationMin: reduced ? Math.max(5, Math.round((config.durationMin / config.questionCount) * n)) : config.durationMin,
    reduced,
  };
}

export interface ExamScore {
  total: number;
  correct: number;
  passed: boolean;
  wrongIds: string[];
  unanswered: number;
  byModule: Record<string, { total: number; correct: number }>;
  /** Resultado por módulo de referência (1–4), em ordem, só com os módulos presentes na prova. */
  byReference: { module: ReferenceModuleId; total: number; correct: number }[];
}

export function scoreExam(paper: ExamPaper, answers: Record<string, string | undefined>, byId: Record<string, Question>): ExamScore {
  let correct = 0;
  let unanswered = 0;
  const wrongIds: string[] = [];
  const byModule: ExamScore['byModule'] = {};
  for (const id of paper.questionIds) {
    const q = byId[id] as ChoiceQuestion;
    const m = (byModule[q.module] ??= { total: 0, correct: 0 });
    m.total += 1;
    const a = answers[id];
    if (!a) unanswered += 1;
    if (a === q.correct) {
      correct += 1;
      m.correct += 1;
    } else wrongIds.push(id);
  }
  const ref = new Map<ReferenceModuleId, { total: number; correct: number }>();
  for (const [m, r] of Object.entries(byModule)) {
    const k = MODULE_TO_REFERENCE[m as Question['module']];
    const acc = ref.get(k) ?? { total: 0, correct: 0 };
    ref.set(k, { total: acc.total + r.total, correct: acc.correct + r.correct });
  }
  const byReference = ([1, 2, 3, 4] as ReferenceModuleId[]).filter((k) => ref.has(k)).map((k) => ({ module: k, ...ref.get(k)! }));
  return { total: paper.questionIds.length, correct, passed: correct >= paper.passMin, wrongIds, unanswered, byModule, byReference };
}

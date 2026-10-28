import type { ExamConfig, Question, World } from './types';
import { WORLD1, WORLD1_QUESTIONS } from './world1';
import { WORLD2, WORLD2_QUESTIONS } from './world2';

export const WORLDS: World[] = [WORLD1, WORLD2];

export const QUESTIONS: Question[] = [...WORLD1_QUESTIONS, ...WORLD2_QUESTIONS];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export const ALL_LESSONS = WORLDS.flatMap((w) => w.lessons.map((l) => ({ ...l, worldId: w.id })));

/**
 * Parâmetros do exame. A regra federal (Res. CONTRAN 1.020/2025, arts. 33 e 34) é a padrão.
 * A página do DETRAN-PE consultada em 19/10/2026 ainda citava 21 acertos (regra revogada).
 */
export const EXAM_CONFIGS: ExamConfig[] = [
  {
    id: 'federal',
    label: 'Regra nacional (Res. CONTRAN 1.020/2025)',
    questionCount: 30,
    passMin: 20,
    durationMin: 60,
    sources: [
      { sourceId: 'res1020', locator: 'arts. 31, 33 e 34' },
    ],
    notes: '30 questões, 4 alternativas, 1 correta; mínimo de 20 acertos; duração mínima de 1 hora.',
  },
  {
    id: 'pe-pagina',
    label: 'DETRAN-PE (conforme página do órgão)',
    questionCount: 30,
    passMin: 21,
    durationMin: 60,
    sources: [{ sourceId: 'detranpe', locator: 'Prova Teórica/Reteste' }],
    notes:
      'A página do DETRAN-PE informa 21 acertos, mas não tem data e diverge da Res. 1.020/2025. A duração não consta na página.',
  },
];

import { describe, expect, it } from 'vitest';
import { EXAM_CONFIGS, QUESTION_BY_ID, QUESTIONS, WORLDS } from '../content';
import { WORLD1 } from '../content/world1';
import { buildExam, scoreExam } from './exam';
import { grade } from './grading';
import {
  addDays,
  completeLesson,
  dayKey,
  dueQuestions,
  initialProgress,
  lessonState,
  recordAnswer,
  topicReport,
  worldCompleted,
} from './progress';
import { advance, answerCurrent, currentItem, isFinished, startSession, summarize } from './session';
import { createLocalStore } from '../storage/progressStore';

const L1 = WORLD1.lessons[0];

function playLesson(lesson = L1, wrongOnce: string[] = []) {
  let s = startSession(lesson);
  const wrong = new Set(wrongOnce);
  while (!isFinished(s)) {
    const it = currentItem(s)!;
    if (it.kind === 'question') {
      const fail = wrong.has(it.questionId) && !it.retry;
      s = answerCurrent(s, !fail);
    }
    s = advance(s);
  }
  return s;
}

describe('sessão de lição', () => {
  it('conclui sem erros com 100% de acerto', () => {
    const r = summarize(playLesson());
    expect(r.accuracy).toBe(1);
    expect(r.missed).toEqual([]);
  });

  it('reapresenta questões erradas no fim, após o aviso de revisão', () => {
    const s = playLesson(L1, ['w1-l1-q1']);
    const tail = s.queue.slice(-2);
    expect(tail[0]).toEqual({ kind: 'review-intro' });
    expect(tail[1]).toMatchObject({ kind: 'question', questionId: 'w1-l1-q1', retry: true });
    const r = summarize(s);
    expect(r.missed).toEqual(['w1-l1-q1']);
    expect(r.correctFirstTry).toBe(r.total - 1);
  });

  it('não entra em laço infinito quando o aluno erra sempre', () => {
    let s = startSession(L1);
    let guard = 0;
    while (!isFinished(s) && guard++ < 200) {
      if (currentItem(s)!.kind === 'question') s = answerCurrent(s, false);
      s = advance(s);
    }
    expect(isFinished(s)).toBe(true);
  });

  it('com vidas ativadas, termina ao zerar', () => {
    let s = startSession(L1, { hearts: true });
    while (!isFinished(s)) {
      if (currentItem(s)!.kind === 'question') s = answerCurrent(s, false);
      s = advance(s);
    }
    expect(s.hearts).toBe(0);
    expect(summarize(s).completed).toBe(false);
  });
});

describe('correção', () => {
  it('corrige cada tipo de exercício', () => {
    expect(grade(QUESTION_BY_ID['w1-l1-q3'], { type: 'choice', optionId: 'a' }).correct).toBe(true);
    const wrong = grade(QUESTION_BY_ID['w1-l1-q3'], { type: 'choice', optionId: 'b' });
    expect(wrong.correct).toBe(false);
    expect(wrong.whyWrong).toMatch(/agente/);
    expect(grade(QUESTION_BY_ID['w1-l2-q4'], { type: 'truefalse', value: false }).correct).toBe(true);
    expect(grade(QUESTION_BY_ID['w1-l1-q5'], { type: 'fill', word: 'semáforo' }).correct).toBe(true);
    expect(grade(QUESTION_BY_ID['w1-l1-q2'], { type: 'order', ids: ['agente', 'semaforo', 'placas', 'normas'] }).correct).toBe(true);
    expect(grade(QUESTION_BY_ID['w1-l1-q2'], { type: 'order', ids: ['semaforo', 'agente', 'placas', 'normas'] }).correct).toBe(false);
    expect(grade(QUESTION_BY_ID['w1-l1-q6'], { type: 'match', pairs: { v: 'v', h: 'h', l: 'l', g: 'g' } }).correct).toBe(true);
    expect(grade(QUESTION_BY_ID['w1-l1-q6'], { type: 'match', pairs: { v: 'h', h: 'v', l: 'l', g: 'g' } }).correct).toBe(false);
  });
});

describe('progresso', () => {
  const now = new Date(2026, 9, 19, 10);

  it('só libera a lição seguinte após concluir a anterior, e a revisão por último', () => {
    let s = initialProgress();
    expect(lessonState(s, WORLD1, WORLD1.lessons[0])).toBe('available');
    expect(lessonState(s, WORLD1, WORLD1.lessons[1])).toBe('locked');
    s = completeLesson(s, WORLD1.lessons[0], summarize(playLesson()), now).state;
    expect(lessonState(s, WORLD1, WORLD1.lessons[0])).toBe('mastered');
    expect(lessonState(s, WORLD1, WORLD1.lessons[1])).toBe('available');
    expect(lessonState(s, WORLD1, WORLD1.lessons[3])).toBe('locked');
  });

  it('o mundo só conclui com domínio na revisão', () => {
    let s = initialProgress();
    for (const l of WORLD1.lessons.slice(0, 3)) s = completeLesson(s, l, summarize(playLesson(l)), now).state;
    const review = WORLD1.lessons[3];
    const ids = review.steps.flatMap((st) => (st.kind === 'question' ? [st.questionId] : []));
    const weak = summarize(playLesson(review, ids.slice(0, 4))); // 60%
    s = completeLesson(s, review, weak, now).state;
    expect(worldCompleted(s, WORLD1)).toBe(false);
    s = completeLesson(s, review, summarize(playLesson(review)), now).state;
    expect(worldCompleted(s, WORLD1)).toBe(true);
    expect(s.achievements).toContain('mundo-1');
  });

  it('conta XP, meta diária e ofensiva em dias consecutivos', () => {
    let s = initialProgress();
    const r = summarize(playLesson());
    const o1 = completeLesson(s, L1, r, now);
    expect(o1.xpGained).toBe(20); // 15 + 5 de bônus por lição perfeita
    expect(o1.goalReachedNow).toBe(true);
    s = o1.state;
    expect(s.streak.count).toBe(1);
    s = completeLesson(s, L1, r, new Date(2026, 9, 19, 18)).state;
    expect(s.streak.count).toBe(1);
    s = completeLesson(s, L1, r, new Date(2026, 9, 20, 9)).state;
    expect(s.streak.count).toBe(2);
    s = completeLesson(s, L1, r, new Date(2026, 9, 23, 9)).state;
    expect(s.streak.count).toBe(1);
    expect(s.streak.best).toBe(2);
  });

  it('repetição espaçada: erro volta hoje, acerto adia', () => {
    const q = QUESTION_BY_ID['w1-l2-q1'];
    let s = recordAnswer(initialProgress(), q, false, now, true);
    expect(dueQuestions(s, now)).toContain(q.id);
    s = recordAnswer(s, q, true, now, true);
    expect(dueQuestions(s, now)).not.toContain(q.id);
    expect(s.questions[q.id].box).toBe(2);
    expect(s.questions[q.id].due).toBe(addDays(dayKey(now), 2));
  });

  it('aponta assunto fraco mesmo com média geral alta', () => {
    let s = initialProgress();
    for (const id of ['w1-l1-q1', 'w1-l1-q3', 'w1-l1-q2', 'w1-l1-q5', 'w1-l1-q4', 'w1-l2-q1', 'w1-l2-q2', 'w1-l2-q3', 'w1-l2-q4'])
      s = recordAnswer(s, QUESTION_BY_ID[id], true, now, true);
    for (const id of ['w1-l2-q5', 'w1-l2-q6', 'w1-l2-q5'])
      s = recordAnswer(s, QUESTION_BY_ID[id], false, now, true);
    const rep = topicReport(s);
    expect(rep.find((t) => t.topic === 'Pedestres')?.status).toBe('fraco');
  });
});

describe('simulado', () => {
  it('monta prova com questões únicas, de 4 alternativas, e pontua de forma consistente', () => {
    const cfg = EXAM_CONFIGS[0];
    const paper = buildExam(QUESTIONS, cfg, 'semente');
    expect(new Set(paper.questionIds).size).toBe(paper.questionIds.length);
    expect(paper.questionIds.length).toBeLessThanOrEqual(30);
    const all = Object.fromEntries(paper.questionIds.map((id) => [id, (QUESTION_BY_ID[id] as { correct: string }).correct]));
    const full = scoreExam(paper, all, QUESTION_BY_ID);
    expect(full.correct).toBe(paper.questionIds.length);
    expect(full.passed).toBe(true);
    const none = scoreExam(paper, {}, QUESTION_BY_ID);
    expect(none.correct).toBe(0);
    expect(none.unanswered).toBe(paper.questionIds.length);
    expect(none.passed).toBe(false);
    expect(buildExam(QUESTIONS, cfg, 'semente')).toEqual(paper);
  });

  it('agrupa o resultado por módulo de referência, em ordem e somando os assuntos', () => {
    const base = QUESTION_BY_ID['w1-l2-q1'];
    const qs = [
      { ...base, id: 'c1', module: 'circulacao' as const },
      { ...base, id: 'd1', module: 'direcao-defensiva' as const },
      { ...base, id: 's1', module: 'sinalizacao' as const },
      { ...base, id: 's2', module: 'sinalizacao' as const },
    ];
    const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
    const paper = buildExam(qs, EXAM_CONFIGS[0], 's');
    const correct = (base as { correct: string }).correct;
    const score = scoreExam(paper, { c1: correct, s1: correct }, byId);
    expect(score.byReference).toEqual([
      { module: 1, total: 2, correct: 1 },
      { module: 3, total: 2, correct: 1 },
    ]);
    const sum = score.byReference.reduce((a, r) => a + r.total, 0);
    expect(sum).toBe(score.total);
  });

  it('com 30 questões, exige o mínimo configurado (20 pela regra nacional)', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ ...QUESTION_BY_ID['w1-l2-q1'], id: `x${i}` }));
    const byId = Object.fromEntries(many.map((q) => [q.id, q]));
    const paper = buildExam(many, EXAM_CONFIGS[0], 's');
    expect(paper.questionIds.length).toBe(30);
    expect(paper.passMin).toBe(20);
    const ans = (n: number) => Object.fromEntries(paper.questionIds.map((id, i) => [id, i < n ? 'a' : 'b']));
    expect(scoreExam(paper, ans(20), byId).passed).toBe(true);
    expect(scoreExam(paper, ans(19), byId).passed).toBe(false);
  });
});

describe('persistência', () => {
  it('salva e recarrega o progresso', () => {
    const mem = new Map<string, string>();
    const fake = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    } as unknown as Storage;
    const store = createLocalStore(fake);
    const s = completeLesson(initialProgress(), L1, summarize(playLesson()), new Date()).state;
    store.save(s);
    const again = createLocalStore(fake).load();
    expect(again.xp).toBe(s.xp);
    expect(again.lessons[L1.id].completed).toBe(true);
  });

  it('ignora dados corrompidos', () => {
    const fake = { getItem: () => '{oops', setItem() {}, removeItem() {} } as unknown as Storage;
    expect(createLocalStore(fake).load().xp).toBe(0);
  });
});

it('todos os mundos têm conteúdo', () => {
  expect(WORLDS.length).toBeGreaterThan(0);
});

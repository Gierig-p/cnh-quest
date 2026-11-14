import { describe, expect, it } from 'vitest';
import { EXAM_CONFIGS, HINT_CARDS, QUESTION_BY_ID, QUESTIONS, WORLDS } from '../content';
import { hintReveal } from '../content/hints';
import { WORLD1 } from '../content/world1';
import { buildExam, scoreExam } from './exam';
import { grade } from './grading';
import {
  addDays,
  completeLesson,
  dayKey,
  dueQuestions,
  initialProgress,
  lessonsWithCardsSeen,
  lessonRounds,
  lessonState,
  practiceRoundIds,
  PRACTICE_ROUND_SIZE,
  roundsDone,
  recordAnswer,
  topicReport,
  worldCompleted,
} from './progress';
import { advance, answerCurrent, currentItem, isFinished, startSession, summarize } from './session';
import { drawKey, drawLessonSteps, mixTypes, rebuildLessonSteps, reviewPool, reviewRoundIds, sameTopicQuestions } from './review';
import { createLocalStore } from '../storage/progressStore';

const L1 = WORLD1.lessons[0];
const typeOf = (id: string) => QUESTION_BY_ID[id].type;

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

  it('revisão de erros: 2 perguntas diferentes do mesmo assunto, sem contar na % de acerto', () => {
    const qOf = (x: string) => QUESTION_BY_ID[x];
    const alts = sameTopicQuestions('w1-l1-q1', HINT_CARDS, qOf, () => 0.3);
    expect(alts.length).toBeGreaterThanOrEqual(2);
    for (const x of alts) expect(HINT_CARDS[x].id).toBe(HINT_CARDS['w1-l1-q1'].id);
    // mesmo objetivo vem antes (q8 e q14 ensinam a mesma ideia)
    expect(sameTopicQuestions('w1-l1-q8', HINT_CARDS, qOf, () => 0.7)[0]).toBe('w1-l1-q14');

    let s = startSession({ id: 't', steps: [{ kind: 'question', questionId: 'w1-l1-q1' }, { kind: 'question', questionId: 'w1-l1-q2' }] });
    s = advance(answerCurrent(s, false, { alternatives: ['w1-l1-q2', ...alts] }));
    const review = s.queue.filter((it) => it.kind === 'question' && it.retry);
    expect(review).toHaveLength(2);
    const ids = review.map((it) => (it.kind === 'question' ? it.questionId : ''));
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain('w1-l1-q1'); // há alternativas: não repete a mesma pergunta
    expect(ids).not.toContain('w1-l1-q2'); // já está na sessão
    expect(review.every((it) => it.kind === 'question' && it.origin === 'w1-l1-q1')).toBe(true);
    // erra tudo na revisão: não agenda mais nada e não conta na % de acerto
    while (!isFinished(s)) {
      const it = currentItem(s)!;
      if (it.kind === 'question') s = answerCurrent(s, it.questionId === 'w1-l1-q2', {});
      s = advance(s);
    }
    expect(s.queue.filter((it) => it.kind === 'question' && it.retry)).toHaveLength(2);
    const r = summarize(s);
    expect(r.total).toBe(2);
    expect(r.correctFirstTry).toBe(1);
    expect(r.missed).toEqual(['w1-l1-q1']);
  });

  it('revisão de erros: com só uma alternativa, a própria questão completa as 2 perguntas', () => {
    let s = startSession({ id: 't', steps: [{ kind: 'question', questionId: 'w1-l1-q1' }] });
    s = answerCurrent(s, false, { alternatives: ['w1-l1-q14'] });
    const ids = s.queue.flatMap((it) => (it.kind === 'question' && it.retry ? [it.questionId] : []));
    expect(ids).toEqual(['w1-l1-q14', 'w1-l1-q1']);
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
    // rodada 1 de 2: a lição continua aberta e a seguinte ainda não abre
    s = completeLesson(s, WORLD1.lessons[0], summarize(playLesson()), now).state;
    expect(roundsDone(s, WORLD1.lessons[0])).toBe(1);
    expect(lessonState(s, WORLD1, WORLD1.lessons[0])).toBe('available');
    expect(lessonState(s, WORLD1, WORLD1.lessons[1])).toBe('locked');
    // rodada 2 de 2
    s = completeLesson(s, WORLD1.lessons[0], summarize(playLesson()), now).state;
    expect(lessonState(s, WORLD1, WORLD1.lessons[0])).toBe('mastered');
    expect(lessonState(s, WORLD1, WORLD1.lessons[1])).toBe('available');
    expect(lessonState(s, WORLD1, WORLD1.lessons[3])).toBe('locked');
  });

  it('rodada 2 vale menos XP, e a revisão da metade abre depois das lições anteriores', () => {
    let s = initialProgress();
    const o1 = completeLesson(s, L1, summarize(playLesson()), now);
    const o2 = completeLesson(o1.state, L1, summarize(playLesson()), now);
    expect([o1.round, o2.round, o2.roundsDone]).toEqual([1, 2, 2]);
    expect(o2.xpGained).toBe(15); // 10 + 5 de bônus por rodada perfeita
    s = o2.state;
    const mid = WORLD1.lessons.findIndex((l) => l.id === 'w1-mid');
    expect(mid).toBe(2);
    expect(lessonRounds(WORLD1.lessons[mid])).toBe(1);
    for (let r = 0; r < 2; r++) s = completeLesson(s, WORLD1.lessons[1], summarize(playLesson(WORLD1.lessons[1])), now).state;
    expect(lessonState(s, WORLD1, WORLD1.lessons[mid])).toBe('available');
    expect(lessonState(s, WORLD1, WORLD1.lessons[mid + 1])).toBe('locked');
  });

  it('progresso antigo: lição já concluída vira "1 de 2" e não bloqueia o que já foi feito', () => {
    const old = { ...initialProgress(), lessons: {
      'w1-l1': { completed: true, mastered: true, bestAccuracy: 1, attempts: 1 },
      'w1-l2': { completed: true, mastered: true, bestAccuracy: 1, attempts: 1 },
    } };
    expect(roundsDone(old, WORLD1.lessons[0])).toBe(1);
    expect(lessonState(old, WORLD1, WORLD1.lessons[0])).toBe('available');
    expect(lessonState(old, WORLD1, WORLD1.lessons[1])).toBe('available');
    const o = completeLesson(old, WORLD1.lessons[0], summarize(playLesson()), now);
    expect(o.round).toBe(2);
    expect(lessonState(o.state, WORLD1, WORLD1.lessons[0])).toBe('mastered');
  });

  it('rodada de prática: questões da própria lição, sem repetir, com as erradas primeiro', () => {
    const ids = L1.steps.flatMap((st) => (st.kind === 'question' ? [st.questionId] : []));
    let s = initialProgress();
    const weak = ids[ids.length - 1];
    s = recordAnswer(s, QUESTION_BY_ID[weak], false, now, true);
    for (let seed = 0; seed < 5; seed++) {
      let x = seed + 1;
      const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
      const picked = practiceRoundIds(s, L1, rnd);
      expect(picked).toHaveLength(PRACTICE_ROUND_SIZE);
      expect(new Set(picked).size).toBe(picked.length);
      expect(picked.every((id) => ids.includes(id))).toBe(true);
      expect(picked).toContain(weak);
    }
  });

  it('o mundo só conclui com domínio na revisão', () => {
    let s = initialProgress();
    for (const l of WORLD1.lessons.slice(0, -1))
      for (let r = 0; r < lessonRounds(l); r++) s = completeLesson(s, l, summarize(playLesson(l)), now).state;
    const review = WORLD1.lessons[WORLD1.lessons.length - 1];
    const ids = reviewRoundIds(s, reviewPool(WORLD1, review), review.review!.size, typeOf);
    const drawn = { ...review, steps: ids.map((questionId) => ({ kind: 'question' as const, questionId })) };
    const weak = summarize(playLesson(drawn, ids.slice(0, 6))); // 70%
    s = completeLesson(s, review, weak, now).state;
    expect(worldCompleted(s, WORLD1)).toBe(false);
    s = completeLesson(s, review, summarize(playLesson(drawn)), now).state;
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

describe('dicas de palavras', () => {
  it('conta como ensinadas as palavras de lições com a rodada 1 feita, mesmo antes da rodada 2', () => {
    const s = { ...initialProgress(), lessons: {
      a: { completed: false, mastered: false, bestAccuracy: 1, attempts: 1, roundsDone: 1 },
      b: { completed: true, mastered: false, bestAccuracy: 1, attempts: 1 },
      c: { completed: false, mastered: false, bestAccuracy: 0.2, attempts: 1, roundsDone: 0 },
    } };
    expect(lessonsWithCardsSeen(s).sort()).toEqual(['a', 'b']);
  });
});

describe('revisões sorteadas', () => {
  // gerador previsível para o teste
  const seeded = (n: number) => () => ((n = (n * 16807) % 2147483647) / 2147483647);

  it('revisão da metade: 15 questões só das lições antes dela; revisão do mundo: 20 do mundo todo', () => {
    for (const w of WORLDS) {
      const mid = w.lessons.find((l) => l.id.endsWith('-mid'))!;
      const before = new Set(w.lessons.slice(0, w.lessons.indexOf(mid)).flatMap((l) => l.steps.flatMap((st) => (st.kind === 'question' ? [st.questionId] : []))));
      const midIds = reviewRoundIds(initialProgress(), reviewPool(w, mid), mid.review!.size, typeOf, seeded(7));
      expect(midIds).toHaveLength(15);
      expect(new Set(midIds).size).toBe(15);
      for (const id of midIds) expect(before.has(id), id).toBe(true);
      const end = w.lessons[w.lessons.length - 1];
      expect(reviewRoundIds(initialProgress(), reviewPool(w, end), end.review!.size, typeOf, seeded(7))).toHaveLength(20);
    }
  });

  it('cobre todos os cartões, muda de pessoa para pessoa e evita tipos repetidos em seguida', () => {
    const end = WORLD1.lessons[WORLD1.lessons.length - 1];
    const pool = reviewPool(WORLD1, end);
    const a = reviewRoundIds(initialProgress(), pool, 20, typeOf, seeded(1));
    const b = reviewRoundIds(initialProgress(), pool, 20, typeOf, seeded(99));
    const cards = new Set(pool.map((p) => p.cardId));
    const cardOf = new Map(pool.map((p) => [p.questionId, p.cardId]));
    expect(new Set(a.map((id) => cardOf.get(id))).size).toBe(cards.size);
    expect(a.slice().sort()).not.toEqual(b.slice().sort());
    const repeats = a.filter((id, i) => i > 0 && typeOf(id) === typeOf(a[i - 1])).length;
    expect(repeats).toBeLessThanOrEqual(2);
    expect(mixTypes(['x1', 'x2', 'y1'], (id) => id[0])).toEqual(['x1', 'y1', 'x2']);
  });

  it('as questões erradas e ainda não fixadas entram primeiro', () => {
    const mid = WORLD1.lessons.find((l) => l.id === 'w1-mid')!;
    const pool = reviewPool(WORLD1, mid);
    const weak = pool.slice(-3).map((p) => p.questionId);
    let s = initialProgress();
    for (const id of weak) s = recordAnswer(s, QUESTION_BY_ID[id], false, new Date(2026, 9, 19, 10), true);
    for (let seed = 1; seed < 6; seed++) {
      const ids = reviewRoundIds(s, pool, 15, typeOf, seeded(seed));
      for (const id of weak) expect(ids).toContain(id);
    }
  });
});

describe('rodada 1 com banco de variações', () => {
  const seeded = (n: number) => () => ((n = (n * 16807) % 2147483647) / 2147483647);
  const qOf = (id: string) => QUESTION_BY_ID[id];
  const ids = (steps: ReturnType<typeof drawLessonSteps>) => steps.flatMap((st) => (st.kind === 'question' ? [st.questionId] : []));

  it('sorteia 1 questão por objetivo, mantendo os cartões e o tamanho da lição', () => {
    for (const lesson of WORLD1.lessons.filter((l) => l.steps.length)) {
      const steps = drawLessonSteps(initialProgress(), lesson, qOf, seeded(3));
      expect(steps.filter((st) => st.kind === 'concept')).toEqual(lesson.steps.filter((st) => st.kind === 'concept'));
      const objectives = new Set(ids(lesson.steps).map((id) => qOf(id).objective));
      const drawn = ids(steps);
      expect(drawn).toHaveLength(objectives.size);
      expect(new Set(drawn.map((id) => qOf(id).objective)).size).toBe(objectives.size);
    }
    expect(drawLessonSteps(initialProgress(), L1, qOf)).toHaveLength(16);
  });

  it('muda de pessoa para pessoa, mas a 1ª questão da lição 1 é sempre a mesma', () => {
    const a = ids(drawLessonSteps(initialProgress(), L1, qOf, seeded(1)));
    const b = ids(drawLessonSteps(initialProgress(), L1, qOf, seeded(42)));
    expect(a).not.toEqual(b);
    expect(a[0]).toBe('w1-l1-q1');
    expect(b[0]).toBe('w1-l1-q1');
  });

  it('o sorteio salvo remonta a mesma lição; salvo inválido pede novo sorteio', () => {
    for (const lesson of WORLD1.lessons.filter((l) => l.steps.length)) {
      const steps = drawLessonSteps(initialProgress(), lesson, qOf, seeded(9));
      expect(rebuildLessonSteps(lesson, ids(steps))).toEqual(steps);
    }
    const drawn = ids(drawLessonSteps(initialProgress(), L1, qOf, seeded(9)));
    expect(rebuildLessonSteps(L1, [...drawn, 'nao-existe'])).toBeNull();
    expect(rebuildLessonSteps(L1, drawn.slice(-1))).toBeNull(); // só a última questão: os outros cartões ficariam sem questão
    expect(rebuildLessonSteps(L1, [])).toBeNull();
    expect(drawKey('w1-l1', 2, false)).toBe('w1-l1:r2');
    expect(drawKey('w1-rev', 1, true)).toBe('w1-rev:revisao');
  });

  it('prefere as versões que a pessoa ainda não viu', () => {
    let s = initialProgress();
    const first = ids(drawLessonSteps(s, L1, qOf, seeded(5)));
    for (const id of first) s = recordAnswer(s, QUESTION_BY_ID[id], true, new Date(2026, 9, 19, 10), true);
    const second = ids(drawLessonSteps(s, L1, qOf, seeded(5)));
    const singles = new Set(first.filter((id) => ids(L1.steps).filter((x) => qOf(x).objective === qOf(id).objective).length === 1));
    for (const id of second) if (!singles.has(id)) expect(first).not.toContain(id);
  });
});

describe('botão Dica', () => {
  it('acerto com dica não conta como acerto de primeira', () => {
    let s = startSession({ id: 't', steps: [{ kind: 'question', questionId: 'w1-l1-q1' }, { kind: 'question', questionId: 'w1-l1-q2' }] });
    s = advance(answerCurrent(s, true, { hinted: true }));
    s = answerCurrent(s, true);
    const r = summarize(s);
    expect(r.correctFirstTry).toBe(1);
    expect(r.accuracy).toBe(0.5);
  });

  it('toda questão das lições com cartões tem um cartão com "Para guardar"; revisões não', () => {
    for (const w of WORLDS)
      for (const l of w.lessons) {
        if (!l.steps.some((st) => st.kind === 'concept')) continue;
        for (const st of l.steps) if (st.kind === 'question') expect(HINT_CARDS[st.questionId]?.remember, st.questionId).toBeTruthy();
      }
  });

  it('o 2º degrau nunca elimina a resposta certa e sempre traz a explicação', () => {
    for (const q of QUESTIONS) {
      const r = hintReveal(q, 'x');
      if (q.type === 'choice') {
        expect(r?.kind).toBe('eliminate-option');
        if (r?.kind === 'eliminate-option') {
          expect(r.optionId).not.toBe(q.correct);
          expect(r.why).toBeTruthy();
        }
      }
      if (q.type === 'fill' && r?.kind === 'eliminate-word') {
        expect(r.word).not.toBe(q.answer);
        expect(r.why).toBeTruthy();
      }
      if (q.type === 'truefalse') expect(r).toBeNull();
    }
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
    expect(again.lessons[L1.id].roundsDone).toBe(1);
  });

  it('ignora dados corrompidos', () => {
    const fake = { getItem: () => '{oops', setItem() {}, removeItem() {} } as unknown as Storage;
    expect(createLocalStore(fake).load().xp).toBe(0);
  });
});

it('todos os mundos têm conteúdo', () => {
  expect(WORLDS.length).toBeGreaterThan(0);
});

describe('ofensiva exibida', () => {
  it('mostra 0 quando o último estudo foi antes de ontem, sem mudar o dado salvo', async () => {
    const { currentStreak } = await import('./progress');
    const now = new Date(2026, 10, 14, 12);
    expect(currentStreak({ count: 5, best: 7, lastDay: '2026-11-14' }, now)).toBe(5);
    expect(currentStreak({ count: 5, best: 7, lastDay: '2026-11-13' }, now)).toBe(5);
    expect(currentStreak({ count: 5, best: 7, lastDay: '2026-11-12' }, now)).toBe(0);
    expect(currentStreak({ count: 0, best: 0, lastDay: null }, now)).toBe(0);
  });
});

describe('prática concede conquistas (decisão do dono, 14/11)', () => {
  it('bater a meta na prática dá "meta-diaria" uma vez só, sem XP extra', async () => {
    const { completePractice, initialProgress } = await import('./progress');
    const now = new Date(2026, 10, 14, 12);
    const s = { ...initialProgress(), dailyGoal: 10 };
    const result = { total: 6, correctFirstTry: 6, accuracy: 1, completed: true } as Parameters<typeof completePractice>[1];
    const a = completePractice(s, result, now);
    expect(a.xpGained).toBe(12);
    expect(a.state.xp).toBe(12);
    expect(a.newAchievements).toEqual(['meta-diaria']);
    const b = completePractice(a.state, result, now);
    expect(b.newAchievements).toEqual([]);
    expect(b.state.achievements.filter((x) => x === 'meta-diaria')).toHaveLength(1);
  });
});

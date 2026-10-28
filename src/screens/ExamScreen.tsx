import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXAM_CONFIGS, QUESTION_BY_ID, QUESTIONS } from '../content';
import { MODULE_TO_REFERENCE, REFERENCE_MODULES } from '../content/referenceModules';
import type { ChoiceQuestion, ModuleId } from '../content/types';
import { Exercise } from '../components/Exercises';
import { Confetti, Dialog, useDialogClose } from '../components/Fx';
import { IconTimer } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { buildExam, examPool, scoreExam, type ExamPaper, type ExamScore } from '../engine/exam';
import { recordAnswer } from '../engine/progress';
import { useApp } from '../state/AppState';
import { useCountUp, useSound } from '../ui/hooks';
import { SourceList } from './LessonPlayer';

const MODULE_LABEL: Record<string, string> = {
  sinalizacao: 'Sinalização',
  infracoes: 'Infrações',
  circulacao: 'Circulação e conduta',
  'direcao-defensiva': 'Direção defensiva',
  'primeiros-socorros': 'Primeiros socorros',
  'meio-ambiente': 'Meio ambiente',
};

type Phase = { name: 'intro' } | { name: 'running'; paper: ExamPaper; seed: string; started: number } | { name: 'result'; paper: ExamPaper; seed: string; score: ExamScore; answers: Record<string, string> };

export function ExamScreen({ onPracticeWrong }: { onPracticeWrong: (ids: string[]) => void }) {
  const { progress, update } = useApp();
  const play = useSound();
  const [phase, setPhase] = useState<Phase>({ name: 'intro' });
  const config = EXAM_CONFIGS.find((c) => c.id === progress.prefs.examConfig) ?? EXAM_CONFIGS[0];
  const poolSize = examPool(QUESTIONS).length;

  const start = () => {
    const seed = String(Date.now());
    setPhase({ name: 'running', paper: buildExam(QUESTIONS, config, seed), seed, started: Date.now() });
  };

  const finish = useCallback(
    (paper: ExamPaper, seed: string, answers: Record<string, string>, started: number) => {
      const score = scoreExam(paper, answers, QUESTION_BY_ID);
      const now = new Date();
      update((p) => {
        let s = p;
        for (const id of paper.questionIds) s = recordAnswer(s, QUESTION_BY_ID[id], answers[id] === (QUESTION_BY_ID[id] as ChoiceQuestion).correct, now, true);
        const ach = [...s.achievements];
        if (!ach.includes('primeiro-simulado')) ach.push('primeiro-simulado');
        if (score.passed && !ach.includes('aprovado')) ach.push('aprovado');
        return {
          ...s,
          achievements: ach,
          exams: [
            ...s.exams,
            { at: now.toISOString(), configId: paper.configId, total: score.total, correct: score.correct, passMin: paper.passMin, passed: score.passed, durationSec: Math.round((Date.now() - started) / 1000), wrongIds: score.wrongIds },
          ],
        };
      });
      play(score.passed ? 'celebrate' : 'complete');
      setPhase({ name: 'result', paper, seed, score, answers });
    },
    [update, play],
  );

  if (phase.name === 'intro') {
    return (
      <div className="stack">
        <h1 className="page-title">Simulado</h1>
        <section className="card stack hero-card yellow">
          <div className="row">
            <Lumi mood="think" size={70} />
            <div className="grow">
              <h2>{config.label}</h2>
              <p className="muted">{config.notes}</p>
              <p className="muted" style={{ marginTop: 6 }}><SourceList refs={config.sources} /></p>
            </div>
          </div>
          <ul className="muted" style={{ margin: 0 }}>
            <li>Sem explicações durante a prova — elas aparecem no final.</li>
            <li>Você pode navegar entre as questões e mudar respostas até entregar.</li>
            <li>A prova é entregue automaticamente quando o tempo acaba.</li>
          </ul>
          {poolSize < config.questionCount && (
            <p className="notice">
              O banco verificado tem <strong>{poolSize}</strong> questões no formato oficial (4 alternativas). Até chegarmos a {config.questionCount}, o simulado usa todas elas, com nota mínima e tempo proporcionais.
            </p>
          )}
          <p className="notice info">As questões são originais e seguem o conteúdo oficial; não são as questões aplicadas pelo DETRAN. A distribuição de questões por assunto da prova oficial ainda não foi publicada pela SENATRAN.</p>
          <button className="btn yellow wide" onClick={() => { play('transition'); start(); }} disabled={poolSize === 0}>Começar simulado</button>
        </section>
      </div>
    );
  }

  if (phase.name === 'running') return <ExamRunner paper={phase.paper} seed={phase.seed} started={phase.started} onSubmit={(a) => finish(phase.paper, phase.seed, a, phase.started)} />;

  const { score, paper, answers } = phase;
  return (
    <div className="stack">
      <h1 className="page-title">Resultado</h1>
      {score.passed && <Confetti />}
      <section className={`card result-hero ${score.passed ? 'pass' : 'fail'}`}>
        <Lumi mood={score.passed ? 'cheer' : 'sad'} size={100} />
        <h2 className="result-title">{score.passed ? 'Aprovado no simulado' : 'Ainda não foi desta vez'}</h2>
        <ScoreLine correct={score.correct} total={score.total} />
        <p className="muted">Mínimo para aprovação: {paper.passMin}{paper.reduced ? ` (proporcional a ${config.passMin}/${config.questionCount})` : ''}{score.unanswered ? ` · ${score.unanswered} em branco` : ''}</p>
      </section>

      <section className="card" aria-labelledby="by-ref-h">
        <h2 id="by-ref-h">Desempenho por módulo</h2>
        <ul className="list ref-results">
          {score.byReference.map((r) => {
            const pct = Math.round((r.correct / r.total) * 100);
            const weak = r.correct / r.total < 0.7;
            const subjects = Object.entries(score.byModule).filter(([m]) => MODULE_TO_REFERENCE[m as ModuleId] === r.module);
            return (
              <li key={r.module} className="stack" style={{ gap: 6 }}>
                <div className="row">
                  <span className="grow"><strong>Módulo {r.module}</strong> · {REFERENCE_MODULES[r.module].title}</span>
                  <span className={`pill ${weak ? 'fraco' : 'dominado'}`}>{r.correct} de {r.total} · {pct}%</span>
                </div>
                <div className={`ref-bar ${weak ? 'fraco' : ''}`} role="progressbar" aria-label={`Módulo ${r.module}: ${pct}% de acertos`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                {subjects.length > 1 && (
                  <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                    {subjects.map(([m, s]) => `${MODULE_LABEL[m] ?? m}: ${s.correct}/${s.total}`).join(' · ')}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {score.byReference.some((r) => r.correct / r.total < 0.7) && (
          <p className="notice" style={{ marginTop: 12 }}>Mesmo com boa nota geral, revise os módulos em vermelho (abaixo de 70%) antes da prova.</p>
        )}
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>A divisão em módulos segue os 4 módulos do curso CNH do Brasil. Em qual módulo cada questão entra é decisão do CNH Quest, feita pelo assunto.</p>
      </section>

      {score.wrongIds.length > 0 && (
        <section className="card stack">
          <h2>Questões erradas ({score.wrongIds.length})</h2>
          {score.wrongIds.map((id) => {
            const q = QUESTION_BY_ID[id] as ChoiceQuestion;
            const chosen = q.options.find((o) => o.id === answers[id]);
            const right = q.options.find((o) => o.id === q.correct)!;
            return (
              <article key={id} className="wrong-item">
                <p style={{ fontWeight: 800 }}>{q.prompt}</p>
                <p className="muted">Sua resposta: {chosen ? chosen.text : 'em branco'}</p>
                <p style={{ color: 'var(--green-dark)', fontWeight: 800 }}>Correta: {right.text}</p>
                {chosen?.whyWrong && <p className="muted">Por que a sua não: {chosen.whyWrong}</p>}
                <p className="muted">{q.explanation}</p>
                <p className="muted" style={{ fontSize: 13 }}><SourceList refs={q.sources} /></p>
              </article>
            );
          })}
          <button className="btn blue wide" onClick={() => onPracticeWrong(score.wrongIds)}>Treinar estas questões</button>
        </section>
      )}
      <button className="btn ghost wide" onClick={() => setPhase({ name: 'intro' })}>Fazer outro simulado</button>
    </div>
  );
}

function ExamRunner({ paper, seed, started, onSubmit }: { paper: ExamPaper; seed: string; started: number; onSubmit: (a: Record<string, string>) => void }) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());
  const endAt = started + paper.durationMin * 60_000;
  const left = Math.max(0, Math.round((endAt - now) / 1000));
  const ids = paper.questionIds;
  const q = QUESTION_BY_ID[ids[i]];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [i]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left === 0) onSubmit(answers);
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const answered = Object.keys(answers).length;
  const ans = answers[q.id];
  const answerObj = useMemo(() => (ans ? { type: 'choice' as const, optionId: ans } : null), [ans]);

  return (
    <div className="stack">
      <div className="exam-top">
        <strong className="grow">Questão {i + 1} de {ids.length}</strong>
        <div className="exam-progress" aria-hidden="true"><span style={{ width: `${(answered / ids.length) * 100}%` }} /></div>
        <span className={`timer ${left < 300 ? 'low' : ''}`} role="timer" aria-label={`Tempo restante ${mm} minutos e ${ss} segundos`}><IconTimer size={18} /> {mm}:{ss}</span>
      </div>
      <section className="card exam-q" key={q.id} aria-labelledby="exam-q">
        <h2 id="exam-q" style={{ fontSize: 21 }}>{q.prompt}</h2>
        <div style={{ marginTop: 14 }}>
          <Exercise q={q} seed={`${seed}-${q.id}`} answer={answerObj} checked={null} onAnswer={(a) => a?.type === 'choice' && setAnswers((p) => ({ ...p, [q.id]: a.optionId }))} />
        </div>
      </section>
      <div className="row">
        <button className="btn ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Anterior</button>
        <span className="grow" />
        {i < ids.length - 1 ? (
          <button className="btn blue" onClick={() => setI(i + 1)}>Próxima</button>
        ) : (
          <button className="btn yellow" onClick={() => setConfirm(true)}>Entregar</button>
        )}
      </div>
      <section className="card">
        <h2>Navegação · {answered}/{ids.length} respondidas</h2>
        <div className="qgrid">
          {ids.map((id, k) => (
            <button key={id} className={answers[id] ? 'answered' : ''} aria-current={k === i} aria-label={`Questão ${k + 1}${answers[id] ? ', respondida' : ', sem resposta'}`} onClick={() => setI(k)}>
              {k + 1}
            </button>
          ))}
        </div>
        <button className="btn yellow wide" style={{ marginTop: 14 }} onClick={() => setConfirm(true)}>Entregar prova</button>
      </section>
      {confirm && (
        <Dialog labelledBy="submit-h" onClose={() => setConfirm(false)}>
          <SubmitBody missing={ids.length - answered} onSubmit={() => onSubmit(answers)} />
        </Dialog>
      )}
    </div>
  );
}


function ScoreLine({ correct, total }: { correct: number; total: number }) {
  const shown = useCountUp(correct, { duration: 900, delay: 200 });
  const pct = Math.round((correct / total) * 100);
  return (
    <p className="result-score">
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{correct}</span> de {total} acertos · {pct}%
    </p>
  );
}

function SubmitBody({ missing, onSubmit }: { missing: number; onSubmit: () => void }) {
  const close = useDialogClose();
  return (
    <>
      <h2 id="submit-h">Entregar a prova?</h2>
      <p>{missing > 0 ? `Ainda há ${missing} questões sem resposta. Elas contam como erro.` : 'Todas as questões foram respondidas.'}</p>
      <div className="stack">
        <button className="btn yellow" autoFocus onClick={onSubmit}>Entregar</button>
        <button className="btn ghost" onClick={close}>Voltar à prova</button>
      </div>
    </>
  );
}

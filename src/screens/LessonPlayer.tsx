import { useCallback, useEffect, useRef, useState } from 'react';
import { QUESTION_BY_ID } from '../content';
import { SOURCES } from '../content/sources';
import type { SourceRef } from '../content/types';
import { Exercise, isAnswerReady, typeLabel } from '../components/Exercises';
import { Burst, Dialog, useDialogClose } from '../components/Fx';
import { IconCheck, IconClose, IconHeart, IconSparkle, IconWrong } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { Visual } from '../components/Visual';
import { grade, type Answer, type Feedback } from '../engine/grading';
import { recordAnswer } from '../engine/progress';
import { advance, answerCurrent, currentItem, isFinished, progressRatio, type SessionState } from '../engine/session';
import { useApp } from '../state/AppState';
import { useSound } from '../ui/hooks';

const PRAISE = ['Isso aí!', 'Mandou bem!', 'Correto!', 'Na mosca!', 'Muito bem!'];

export function SourceList({ refs }: { refs: SourceRef[] }) {
  return (
    <span className="src">
      Fonte:{' '}
      {refs.map((r, i) => {
        const s = SOURCES[r.sourceId];
        return (
          <span key={i}>
            {i > 0 && '; '}
            <a href={s.url} target="_blank" rel="noreferrer">{s.title.split(' — ')[0]}</a>, {r.locator}
          </span>
        );
      })}
    </span>
  );
}

export function LessonPlayer({
  initial,
  onExit,
  onFinish,
}: {
  initial: SessionState;
  onExit: () => void;
  onFinish: (s: SessionState) => void;
}) {
  const { update } = useApp();
  const [s, setS] = useState(initial);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [heartHit, setHeartHit] = useState(false);
  // sequência de acertos seguidos nesta sessão (só visual; não altera XP nem progresso)
  const [combo, setCombo] = useState(0);
  const footRef = useRef<HTMLDivElement>(null);
  const advancing = useRef(false);
  const play = useSound();

  const item = currentItem(s);
  const q = item?.kind === 'question' ? QUESTION_BY_ID[item.questionId] : undefined;

  useEffect(() => {
    if (isFinished(s)) onFinish(s);
  }, [s, onFinish]);

  const check = useCallback(() => {
    if (!q || !item || item.kind !== 'question' || !isAnswerReady(q, answer)) return;
    const f = grade(q, answer!);
    setFb(f);
    const nextCombo = f.correct ? combo + 1 : 0;
    setCombo(nextCombo);
    play(f.correct ? 'correct' : 'wrong');
    if (f.correct && nextCombo >= 3 && nextCombo % 2 === 1) setTimeout(() => play('combo'), 260);
    const firstTry = !(q.id in s.firstTry);
    update((p) => recordAnswer(p, q, f.correct, new Date(), firstTry));
    setS((prev) => answerCurrent(prev, f.correct));
    if (!f.correct && s.hearts !== null) {
      setHeartHit(true);
      setTimeout(() => setHeartHit(false), 450);
    }
    requestAnimationFrame(() => footRef.current?.querySelector<HTMLButtonElement>('.btn')?.focus());
  }, [q, item, answer, play, combo, s, update]);

  const next = useCallback(() => {
    // evita avanço duplo (duplo clique / Enter repetido)
    if (advancing.current) return;
    advancing.current = true;
    requestAnimationFrame(() => (advancing.current = false));
    setFb(null);
    setAnswer(null);
    setS((prev) => advance(prev));
  }, []);

  const onAnswer = useCallback(
    (a: Answer | null) => {
      // a ordenação preenche a resposta inicial sozinha: isso não é um gesto do aluno
      if (a && !(a.type === 'order' && answer === null)) play('select');
      setAnswer(a);
    },
    [play, answer],
  );

  // Enter: verificar / continuar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || confirmQuit) return;
      // botões comuns tratam o próprio Enter; numa alternativa (radio), Enter verifica
      if (e.target instanceof HTMLButtonElement && e.target.getAttribute('role') !== 'radio') return;
      e.preventDefault();
      if (!item) return;
      if (item.kind !== 'question' || fb) next();
      else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, fb, check, next, confirmQuit]);

  if (!item) return null;
  const ratio = progressRatio(s);
  const seed = `${item.kind === 'question' ? item.questionId : 'c'}-${s.index}`;
  const lastCorrect = fb?.correct;
  const footClass = fb ? (fb.correct ? 'ok' : 'bad') : '';
  const showCombo = Boolean(fb?.correct && combo >= 3);

  return (
    <div className="lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={() => setConfirmQuit(true)} aria-label="Sair da lição">
          <IconClose />
        </button>
        <div className="progress" role="progressbar" aria-label="Progresso da lição" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
          <span style={{ width: `${Math.max(4, ratio * 100)}%` }} />
          {combo >= 2 && (
            <em className="combo-chip" key={combo} aria-hidden="true">
              <IconSparkle size={12} /> {combo} seguidas
            </em>
          )}
        </div>
        {s.hearts !== null && (
          <span className={`hearts ${heartHit ? 'hit' : ''} ${s.hearts <= 1 ? 'low' : ''}`} aria-label={`${s.hearts} vidas`}>
            <IconHeart size={26} />
            <span className="n" key={s.hearts}>{s.hearts}</span>
          </span>
        )}
      </header>

      <main className="lesson-body" key={s.index}>
        {item.kind === 'concept' && (
          <section className="concept" aria-labelledby="concept-title">
            <div className="q-tag new"><IconSparkle size={14} /> Conceito novo</div>
            <h1 id="concept-title" className="q-title">{item.card.title}</h1>
            <div className="bubble-row">
              <Lumi mood="wave" size={92} />
              <p className="bubble">{item.card.body}</p>
            </div>
            {item.card.visual && (
              <div className="q-visual pop-in">
                <Visual v={item.card.visual} size={150} />
              </div>
            )}
            {item.card.terms && item.card.terms.length > 0 && (
              <div className="c-box c-terms">
                <h2 className="c-head">📖 Palavras novas</h2>
                <dl>
                  {item.card.terms.map((t) => (
                    <div key={t.term}>
                      <dt>{t.term}</dt>
                      <dd>{t.meaning}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {item.card.points && item.card.points.length > 0 && (
              <div className="c-box c-points">
                <h2 className="c-head">🧭 Passo a passo</h2>
                <ol>
                  {item.card.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            )}
            {item.card.example && (
              <div className="c-box c-example">
                <h2 className="c-head">🚗 Na prática</h2>
                <p>{item.card.example}</p>
              </div>
            )}
            {item.card.remember && (
              <div className="c-box c-remember">
                <h2 className="c-head">💡 Para guardar</h2>
                <p>{item.card.remember}</p>
              </div>
            )}
            <p className="source-line"><SourceList refs={item.card.sources} /></p>
          </section>
        )}

        {item.kind === 'review-intro' && (
          <section className="concept review-intro">
            <Lumi mood="think" size={130} />
            <h1 className="q-title">Vamos rever o que você errou</h1>
            <p className="muted">Errar faz parte. Agora você já sabe a explicação — tente de novo.</p>
          </section>
        )}

        {item.kind === 'question' && q && (
          <section aria-labelledby="q-title">
            <div className={`q-tag ${item.retry ? 'retry' : ''}`}>{item.retry ? '↻ Revisão' : typeLabel(q)}</div>
            <h1 id="q-title" className="q-title">{q.prompt}</h1>
            <Exercise q={q} seed={seed} answer={answer} onAnswer={onAnswer} checked={fb ? { correct: fb.correct } : null} />
          </section>
        )}
      </main>

      <footer className={`lesson-foot ${footClass}`} ref={footRef}>
        <div className="foot-inner">
          {fb && q ? (
            <div className="feedback" role="status" aria-live="assertive">
              <span className="fb-icon" aria-hidden="true">
                {lastCorrect ? <IconCheck size={30} /> : <IconWrong size={30} />}
                {lastCorrect && <Burst count={8} />}
              </span>
              <div className="grow">
                <p className="fb-title">
                  {lastCorrect ? PRAISE[s.index % PRAISE.length] : 'Resposta correta:'}
                  {showCombo && <span className="fb-combo"> · {combo} acertos seguidos!</span>}
                </p>
                <div className="fb-text">
                  {!lastCorrect && <p className="fb-answer"><strong>{fb.correctText}</strong></p>}
                  {!lastCorrect && fb.whyWrong && <p>Por que a sua não: {fb.whyWrong}</p>}
                  <p>{q.explanation}</p>
                  <p className="memo">💡 {q.mnemonic}</p>
                  <p><SourceList refs={q.sources} /></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grow desktop-only">{item.kind === 'question' && <span className="kbd-hint">Dica: use as teclas <kbd>1</kbd>–<kbd>9</kbd> e <kbd>Enter</kbd>.</span>}</div>
          )}
          {item.kind === 'question' && !fb ? (
            <button className="btn" disabled={!q || !isAnswerReady(q, answer)} onClick={check}>
              Verificar
            </button>
          ) : (
            <button
              className={`btn ${fb && !fb.correct ? 'red' : ''}`}
              onClick={() => {
                play('transition');
                next();
              }}
              autoFocus={!fb}
            >
              Continuar
            </button>
          )}
        </div>
      </footer>

      {confirmQuit && (
        <Dialog labelledBy="quit-title" onClose={() => setConfirmQuit(false)}>
          <QuitDialogBody onExit={onExit} />
        </Dialog>
      )}
    </div>
  );
}

function QuitDialogBody({ onExit }: { onExit: () => void }) {
  const close = useDialogClose();
  return (
    <>
      <Lumi mood="sad" size={84} />
      <h2 id="quit-title">Quer mesmo sair?</h2>
      <p>As respostas já dadas ficam salvas no seu histórico, mas a lição não será concluída.</p>
      <div className="stack">
        <button className="btn" autoFocus onClick={close}>Continuar estudando</button>
        <button className="btn ghost" onClick={onExit}>Sair da lição</button>
      </div>
    </>
  );
}

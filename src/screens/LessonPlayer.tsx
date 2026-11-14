import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY, HINT_CARDS, QUESTION_BY_ID } from '../content';
import { buildHintIndex } from '../content/glossary';
import { HINT_DELAY_S, hintReveal, type HintReveal } from '../content/hints';
import { SOURCES } from '../content/sources';
import type { SourceRef } from '../content/types';
import { Exercise, isAnswerReady, typeLabel } from '../components/Exercises';
import { Burst, Dialog, useDialogClose } from '../components/Fx';
import { IconCheck, IconClose, IconHeart, IconSparkle, IconWrong } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { TermHintsContext, TermText, useHasNewTerm } from '../components/TermText';
import { Visual } from '../components/Visual';
import { grade, type Answer, type Feedback } from '../engine/grading';
import { lessonsWithCardsSeen, recordAnswer } from '../engine/progress';
import { advance, answerCurrent, currentItem, isFinished, progressRatio, type SessionState } from '../engine/session';
import { sameTopicQuestions } from '../engine/review';
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

/** Etiqueta "Palavra nova" quando a questão usa uma palavra ensinada nesta lição. */
function NewWordTag({ texts }: { texts: string[] }) {
  if (!useHasNewTerm(texts)) return null;
  return (
    <div className="q-tag new">
      <IconSparkle size={14} /> Palavra nova
    </div>
  );
}

export function LessonPlayer({
  initial,
  practice = false,
  allowHints = false,
  onExit,
  onFinish,
}: {
  initial: SessionState;
  /** rodada só de prática (sem cartões): marca cada exercício como "Prática" */
  practice?: boolean;
  /** botão "Dica" (só nas lições com cartões; nunca em revisões nem no simulado) */
  allowHints?: boolean;
  onExit: () => void;
  onFinish: (s: SessionState) => void;
}) {
  const { update, progress } = useApp();
  const [s, setS] = useState(initial);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [heartHit, setHeartHit] = useState(false);
  // botão "Dica": 0 = não usada, 1 = "Para guardar" do cartão, 2 = elimina/revela uma parte
  const [hintStep, setHintStep] = useState(0);
  const [confirmHint, setConfirmHint] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // sequência de acertos seguidos nesta sessão (só visual; não altera XP nem progresso)
  const [combo, setCombo] = useState(0);
  const footRef = useRef<HTMLDivElement>(null);
  const advancing = useRef(false);
  // trava: cada questão (posição na fila) só é verificada uma vez
  const checkedAt = useRef(-1);
  // sons e efeitos atrasados; cancelados ao avançar ou sair da lição
  const timers = useRef<number[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  const cancelLater = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => cancelLater, [cancelLater]);
  const play = useSound();

  const item = currentItem(s);
  const q = item?.kind === 'question' ? QUESTION_BY_ID[item.questionId] : undefined;

  // dicas de palavras: só as já ensinadas (lições concluídas + cartões já vistos nesta sessão)
  const seenCards = s.queue.slice(0, s.index).flatMap((it) => (it.kind === 'concept' ? [it.card.id] : [])).join();
  const doneLessons = lessonsWithCardsSeen(progress).join();
  const hintIndex = useMemo(
    () => buildHintIndex(GLOSSARY, { lessonId: s.lessonId, seenCardIds: seenCards ? seenCards.split(',') : [], completedLessonIds: doneLessons ? doneLessons.split(',') : [] }),
    [s.lessonId, seenCards, doneLessons],
  );
  const hints = useMemo(() => ({ index: hintIndex, questionId: q?.id }), [hintIndex, q?.id]);

  // dica da questão: cartão que a ensina + o que pode ser eliminado (sem dica nas questões de "↻ Revisão")
  const hintCard = allowHints && q && item?.kind === 'question' && !item.retry ? HINT_CARDS[q.id] : undefined;
  const seedForHint = `${q?.id ?? 'c'}-${s.index}`;
  const reveal = useMemo(() => (hintCard && q ? hintReveal(q, seedForHint) : null), [hintCard, q, seedForHint]);
  const hinted = hintStep > 0;

  // cada questão começa sem dica e com o relógio zerado
  useEffect(() => {
    setHintStep(0);
    setElapsed(0);
  }, [s.index]);

  // a dica só libera depois de HINT_DELAY_S segundos na questão
  useEffect(() => {
    if (!hintCard || fb || elapsed >= HINT_DELAY_S) return;
    const t = setTimeout(() => setElapsed((e) => e + 1), 1000);
    return () => clearTimeout(t);
  }, [hintCard, fb, elapsed]);

  useEffect(() => {
    if (isFinished(s)) onFinish(s);
  }, [s, onFinish]);

  const check = useCallback(() => {
    if (!q || !item || item.kind !== 'question' || !isAnswerReady(q, answer)) return;
    if (checkedAt.current === s.index) return;
    checkedAt.current = s.index;
    const f = grade(q, answer!);
    setFb(f);
    const nextCombo = f.correct ? combo + 1 : 0;
    setCombo(nextCombo);
    play(f.correct ? 'correct' : 'wrong');
    if (f.correct && nextCombo >= 3 && nextCombo % 2 === 1) later(() => play('combo'), 260);
    // com dica, não conta como acerto de primeira
    const firstTry = !item.retry && !(q.id in s.firstTry) && !hinted;
    update((p) => recordAnswer(p, q, f.correct, new Date(), firstTry));
    // erro: a revisão do fim usa outras perguntas do mesmo assunto
    const alternatives = f.correct || item.retry ? undefined : sameTopicQuestions(q.id, HINT_CARDS, (x) => QUESTION_BY_ID[x]);
    setS((prev) => answerCurrent(prev, f.correct, { hinted, alternatives }));
    if (!f.correct && s.hearts !== null) {
      setHeartHit(true);
      later(() => setHeartHit(false), 450);
    }
    requestAnimationFrame(() => {
      const foot = footRef.current;
      if (!foot) return;
      foot.querySelector<HTMLButtonElement>('.btn')?.focus({ preventScroll: true });
      // mostra a explicação: inteira se couber; se for maior que a tela, a partir do começo
      foot.scrollIntoView?.({ block: foot.offsetHeight > window.innerHeight ? 'start' : 'end' });
    });
  }, [q, item, answer, play, combo, s, update, hinted, later]);

  // pares: cada par já é corrigido na hora; ao formar o último, verifica sozinho
  useEffect(() => {
    if (fb || !q || q.type !== 'match' || !isAnswerReady(q, answer)) return;
    const t = setTimeout(check, 450);
    return () => clearTimeout(t);
  }, [fb, q, answer, check]);

  const confirmUseHint = useCallback(() => {
    setConfirmHint(false);
    setHintStep(1);
  }, []);

  const moreHint = useCallback(() => {
    setHintStep(2);
    // se a resposta marcada foi a eliminada, ela sai
    if (reveal?.kind === 'eliminate-option' && answer?.type === 'choice' && answer.optionId === reveal.optionId) setAnswer(null);
    if (reveal?.kind === 'eliminate-word' && answer?.type === 'fill' && answer.word === reveal.word) setAnswer(null);
  }, [reveal, answer]);

  // a cada item novo, o foco vai para o enunciado: o leitor de tela lê a pergunta nova
  // e o Tab começa do alto, não do botão que ficou no rodapé
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    mainRef.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [s.index]);

  const next = useCallback(() => {
    // evita avanço duplo (duplo clique / Enter repetido)
    if (advancing.current) return;
    advancing.current = true;
    requestAnimationFrame(() => (advancing.current = false));
    cancelLater();
    setFb(null);
    setAnswer(null);
    setS((prev) => advance(prev));
  }, [cancelLater]);

  const onAnswer = useCallback(
    (a: Answer | null) => {
      // a ordenação preenche a resposta inicial sozinha: isso não é um gesto do aluno
      // pares tocam o próprio som (certo/errado) a cada tentativa
      if (a && a.type !== 'match' && !(a.type === 'order' && answer === null)) play('select');
      setAnswer(a);
    },
    [play, answer],
  );

  // Enter: verificar / continuar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || confirmQuit || confirmHint) return;
      // botões comuns tratam o próprio Enter; numa alternativa (radio), Enter verifica
      if (e.target instanceof HTMLButtonElement && e.target.getAttribute('role') !== 'radio') return;
      e.preventDefault();
      if (!item) return;
      if (item.kind !== 'question' || fb) next();
      else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, fb, check, next, confirmQuit, confirmHint]);

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

      <main className="lesson-body" key={s.index} ref={mainRef}>
        {item.kind === 'concept' && (
          <section className="concept" aria-labelledby="concept-title">
            <div className="q-tag new"><IconSparkle size={14} /> Conceito novo</div>
            <h1 id="concept-title" className="q-title" tabIndex={-1}>{item.card.title}</h1>
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
            <h1 className="q-title" tabIndex={-1}>Vamos rever o que você errou</h1>
            <p className="muted">Errar faz parte. Agora você já sabe a explicação — tente de novo.</p>
          </section>
        )}

        {item.kind === 'question' && q && (
          <TermHintsContext.Provider value={hints}>
            <section aria-labelledby="q-title">
              <div className="q-tags">
                <div className={`q-tag ${item.retry ? 'retry' : ''}`}>{item.retry ? '↻ Revisão' : practice ? `Prática · ${typeLabel(q)}` : typeLabel(q)}</div>
                <NewWordTag texts={[q.prompt, q.type === 'truefalse' ? q.statement : q.type === 'fill' ? q.sentence : '']} />
                {hintCard && !fb && (
                  <HintButton
                    left={HINT_DELAY_S - elapsed}
                    step={hintStep}
                    hasMore={Boolean(reveal)}
                    onClick={() => (hintStep === 0 ? setConfirmHint(true) : moreHint())}
                  />
                )}
              </div>
              <h1 id="q-title" className="q-title" tabIndex={-1}><TermText text={q.prompt} /></h1>
              {hintCard && hintStep > 0 && <HintBox title={hintCard.title} remember={hintCard.remember!} reveal={hintStep > 1 ? reveal : null} />}
              <Exercise
                q={q}
                seed={seed}
                answer={answer}
                onAnswer={onAnswer}
                checked={fb ? { correct: fb.correct } : null}
                eliminated={hintStep > 1 ? (reveal?.kind === 'eliminate-option' ? reveal.optionId : reveal?.kind === 'eliminate-word' ? reveal.word : undefined) : undefined}
              />
            </section>
          </TermHintsContext.Provider>
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
                  {lastCorrect && hinted && <p className="fb-hinted">💡 Acerto com dica: não conta como acerto de primeira.</p>}
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

      {confirmHint && (
        <Dialog labelledBy="hint-title" tone="warn" onClose={() => setConfirmHint(false)}>
          <HintDialogBody onConfirm={confirmUseHint} />
        </Dialog>
      )}

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

function HintButton({ left, step, hasMore, onClick }: { left: number; step: number; hasMore: boolean; onClick: () => void }) {
  if (step >= 2 || (step === 1 && !hasMore)) return null;
  const waiting = left > 0;
  return (
    <button type="button" className="btn ghost sm hint-btn" disabled={waiting} onClick={onClick}>
      💡 {waiting ? `Dica em ${left}s` : step === 0 ? 'Dica' : 'Mais uma dica'}
    </button>
  );
}

function revealText(r: HintReveal): string {
  switch (r.kind) {
    case 'eliminate-option':
      return `Pode riscar “${r.text}”: ${r.why}`;
    case 'eliminate-word':
      return `Pode tirar “${r.word}”: ${r.why}`;
    case 'pair':
      return `Um dos pares: “${r.left}” combina com “${r.right}”.`;
    case 'first-step':
      return `O primeiro é: “${r.text}”.`;
  }
}

function HintBox({ title, remember, reveal }: { title: string; remember: string; reveal: HintReveal | null }) {
  return (
    <div className="hint-box" role="note" aria-label="Dica" aria-live="polite">
      <Lumi mood="think" size={56} />
      <div className="grow">
        <p className="hint-head">💡 Lembre do cartão “{title}”</p>
        <p>{remember}</p>
        {reveal && <p className="hint-reveal">{revealText(reveal)}</p>}
      </div>
    </div>
  );
}

function HintDialogBody({ onConfirm }: { onConfirm: () => void }) {
  const close = useDialogClose();
  return (
    <>
      <Lumi mood="think" size={84} />
      <h2 id="hint-title">Usar a dica?</h2>
      <p>A dica ajuda a lembrar o conceito, mas tem um custo: <strong>esta questão não vai contar como acerto de primeira.</strong></p>
      <p>Isso diminui a sua pontuação na lição: a % de acertos cai, você perde o bônus de lição perfeita e pode não alcançar o domínio da lição.</p>
      <div className="stack">
        <button className="btn" autoFocus onClick={close}>Tentar sem dica</button>
        <button className="btn ghost" onClick={onConfirm}>Usar a dica</button>
      </div>
    </>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GLOSSARY, HINT_CARDS, QUESTION_BY_ID } from '../content';
import { buildHintIndex } from '../content/glossary';
import { HINT_DELAY_S, hintReveal, type HintReveal } from '../content/hints';
import { SOURCES } from '../content/sources';
import type { ConceptCard, SourceRef } from '../content/types';
import { Exercise, isAnswerReady, typeLabel } from '../components/Exercises';
import { Burst, Dialog, useDialogClose } from '../components/Fx';
import { IconCheck, IconClose, IconHeart, IconSparkle, IconWrong } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { NarrationButton } from '../components/NarrationButton';
import { SituationBox } from '../components/SituationBox';
import { SpeakButton, speechText } from '../components/SpeakButton';
import { TermHintsContext, TermText, useHasNewTerm } from '../components/TermText';
import { ConceptBlocks, cardParts } from '../components/ConceptView';
import { grade, type Answer, type Feedback } from '../engine/grading';
import { lessonsWithCardsSeen, recordAnswer } from '../engine/progress';
import { advance, answerCurrent, currentItem, isFinished, progressRatio, type SessionState } from '../engine/session';
import { sameTopicQuestions } from '../engine/review';
import { useApp } from '../state/AppState';
import { useReducedMotion, useSound } from '../ui/hooks';
import { HOWTO, howtoSeen, markHowtoSeen } from '../ui/howto';
import type { SoundKind } from '../ui/sound';

/** Marcos do combo (Entrega 2 do PLANO-v2): só celebração; nada de XP extra. */
const MARCOS: Record<number, { som: SoundKind; frase: string }> = {
  3: { som: 'streak3', frase: '3 acertos seguidos!' },
  5: { som: 'streak5', frase: '5 seguidos: sinal verde!' },
  10: { som: 'streak10', frase: '10 seguidos: pista livre!' },
};

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
  const reduced = useReducedMotion();

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
  // instrução da primeira vez deste tipo de exercício (decidida ao abrir a questão)
  const qType = q?.type;
  const howto = useMemo(() => (qType && !howtoSeen(qType) ? HOWTO[qType] : null), [qType, s.index]);

  // cartão longo em partes (Entrega 3): cada item começa na parte 1, com a correção resumida
  const parts = useMemo(() => (item?.kind === 'concept' ? cardParts(item.card) : []), [item]);
  const [part, setPart] = useState(0);
  // fim da explicação (última parte do cartão) com uma questão logo depois: o botão leva às perguntas
  const toQuestions = item?.kind === 'concept' && part >= parts.length - 1 && s.queue[s.index + 1]?.kind === 'question';
  const [moreFb, setMoreFb] = useState(false);
  const [showCard, setShowCard] = useState(false);

  // cada questão começa sem dica e com o relógio zerado
  useEffect(() => {
    setHintStep(0);
    setElapsed(0);
    setPart(0);
    setMoreFb(false);
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
    markHowtoSeen(q.type);
    setFb(f);
    const nextCombo = f.correct ? combo + 1 : 0;
    setCombo(nextCombo);
    // nos marcos (3, 5, 10) o som do marco substitui o do acerto; depois do 10 só o número cresce
    const marco = f.correct ? MARCOS[nextCombo] : undefined;
    play(marco ? marco.som : f.correct ? 'correct' : 'wrong');
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
    // cartão em partes: primeiro mostra a próxima parte, do alto da tela
    if (part < parts.length - 1) {
      setPart((p) => p + 1);
      requestAnimationFrame(() => {
        mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
        window.scrollTo?.({ top: 0 });
      });
      return;
    }
    cancelLater();
    setFb(null);
    setAnswer(null);
    setS((prev) => advance(prev));
  }, [cancelLater, part, parts.length]);

  /** Volta para a parte anterior do cartão de conceito. */
  const prevPart = useCallback(() => {
    if (part === 0) return;
    setPart((p) => Math.max(0, p - 1));
    requestAnimationFrame(() => {
      mainRef.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
      window.scrollTo?.({ top: 0 });
    });
  }, [part]);

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
      if (e.key !== 'Enter' || confirmQuit || confirmHint || showCard) return;
      // botões comuns tratam o próprio Enter; numa alternativa (radio), Enter verifica
      if (e.target instanceof HTMLButtonElement && e.target.getAttribute('role') !== 'radio') return;
      e.preventDefault();
      if (!item) return;
      if (item.kind !== 'question' || fb) next();
      else check();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, fb, check, next, confirmQuit, confirmHint, showCard]);

  if (!item) return null;
  const ratio = progressRatio(s);
  const seed = `${item.kind === 'question' ? item.questionId : 'c'}-${s.index}`;
  const lastCorrect = fb?.correct;
  const footClass = fb ? (fb.correct ? 'ok' : 'bad') : '';
  const marco = fb?.correct ? MARCOS[combo] : undefined;
  // celebração curta (< 1 s): some ao avançar (fb zera), ao abrir diálogo e com movimento reduzido
  const celebra = marco && !confirmQuit && !confirmHint && !reduced;
  // pares: todos formados no fim, mas com tentativas erradas no caminho
  const matchSlip = fb && !fb.correct && answer?.type === 'match' ? (answer.mistakes ?? 0) : 0;
  // rever o cartão que ensinou a questão: só nas lições comuns (não na prática nem na revisão)
  const againCard = fb && q && allowHints && !practice ? HINT_CARDS[q.id] : undefined;

  return (
    <div className="lesson">
      <header className="lesson-top">
        <button className="icon-btn" onClick={() => setConfirmQuit(true)} aria-label="Sair da lição">
          <IconClose />
        </button>
        <div className="progress" role="progressbar" aria-label="Progresso da lição" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)}>
          <span style={{ clipPath: `inset(0 ${(100 - Math.max(4, ratio * 100)).toFixed(2)}% 0 0 round 9px)` }} />
          {combo >= 2 && (
            <em className={`combo-chip ${celebra ? 'pulse' : ''}`} key={combo} aria-hidden="true">
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
            <div className="q-tags">
              <div className="q-tag new"><IconSparkle size={14} /> Conceito novo</div>
              {parts.length > 1 && <div className="q-tag part-tag">Parte {part + 1} de {parts.length}</div>}
            </div>
            <h1 id="concept-title" className="q-title" tabIndex={-1}>{item.card.title}</h1>
            {!item.card.video && <NarrationButton cardId={item.card.id} />}
            <div className={parts.length > 1 ? 'card-part' : undefined} key={part}>
              <ConceptBlocks card={item.card} show={parts[part] ?? []} sources={part === parts.length - 1} />
            </div>
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
              {q.situation && <SituationBox questionId={q.id} lines={q.situation} />}
              <h1 id="q-title" className="q-title" tabIndex={-1}><TermText text={q.prompt} /></h1>
              {progress.prefs.readAloud && !fb && <SpeakButton text={speechText(q, seed)} />}
              {howto && !fb && <p className="howto" id="q-howto">👆 {howto}</p>}
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
                {lastCorrect && !marco && <Burst count={8} />}
              </span>
              <div className="grow">
                <p className="fb-title">
                  {lastCorrect ? PRAISE[s.index % PRAISE.length] : 'Resposta correta:'}
                  {marco && <span className="fb-combo"> · {marco.frase}</span>}
                </p>
                {celebra && combo === 5 && (
                  <span className="cele cele-5" aria-hidden="true">
                    <Lumi mood="wave" size={44} />
                    <span className="mini-light"><i /><i /><i /></span>
                  </span>
                )}
                {celebra && combo === 10 && (
                  <span className="cele cele-10" aria-hidden="true">
                    <span className="mini-road"><i className="mini-car" /></span>
                  </span>
                )}
                <div className="fb-text">
                  {lastCorrect && hinted && <p className="fb-hinted">💡 Acerto com dica: não conta como acerto de primeira.</p>}
                  {!lastCorrect && <p className="fb-answer"><strong>{fb.correctText}</strong></p>}
                  {matchSlip > 0 && (
                    <p className="fb-slip">
                      Você chegou a todos os pares, mas errou {matchSlip === 1 ? '1 vez' : `${matchSlip} vezes`} no caminho. Por isso esta conta como erro.
                    </p>
                  )}
                  {!lastCorrect && fb.whyWrong && <p>Por que a sua não: {fb.whyWrong}</p>}
                  <p>{q.explanation}</p>
                  {moreFb && (
                    <div id="fb-more">
                      <p className="memo">💡 {q.mnemonic}</p>
                      <p><SourceList refs={q.sources} /></p>
                    </div>
                  )}
                  {(!moreFb || againCard) && (
                    <div className="fb-links">
                      {!moreFb && (
                        <button type="button" className="link-btn" aria-expanded={false} aria-controls="fb-more" onClick={() => setMoreFb(true)}>
                          Ver explicação completa
                        </button>
                      )}
                      {againCard && (
                        <button type="button" className="link-btn" onClick={() => setShowCard(true)}>
                          📖 Ver a explicação de novo
                        </button>
                      )}
                    </div>
                  )}
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
            <>
            {item.kind === 'concept' && part > 0 && (
              <button
                type="button"
                className="btn ghost back-btn"
                onClick={() => {
                  play('transition');
                  prevPart();
                }}
              >
                Voltar
              </button>
            )}
            <button
              className={`btn ${fb && !fb.correct ? 'red' : ''}`}
              onClick={() => {
                play('transition');
                next();
              }}
              autoFocus={!fb}
            >
              {toQuestions ? 'Ir para as perguntas' : 'Continuar'}
            </button>
            </>
          )}
        </div>
      </footer>

      {confirmHint && (
        <Dialog labelledBy="hint-title" tone="warn" onClose={() => setConfirmHint(false)}>
          <HintDialogBody onConfirm={confirmUseHint} />
        </Dialog>
      )}

      {showCard && againCard && (
        <Dialog labelledBy="again-title" onClose={() => setShowCard(false)}>
          <AgainDialogBody card={againCard} />
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

function AgainDialogBody({ card }: { card: ConceptCard }) {
  const close = useDialogClose();
  // abre do começo do cartão: o foco vai para o título, não para o "Fechar" lá embaixo
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);
  return (
    <div className="again concept">
      <h2 id="again-title" ref={titleRef} tabIndex={-1}>{card.title}</h2>
      <ConceptBlocks card={card} show={card.video ? ['resumo', 'guardar'] : cardParts({ ...card, id: '' })[0]} lumiSize={64} />
      <button className="btn wide" onClick={close}>Fechar</button>
    </div>
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

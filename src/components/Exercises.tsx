import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { ChoiceQuestion, FillBlankQuestion, MatchQuestion, OrderQuestion, Question, TrueFalseQuestion } from '../content/types';
import type { Answer } from '../engine/grading';
import { seededShuffle } from '../engine/grading';
import { Visual } from './Visual';

export interface ExerciseProps<Q extends Question> {
  q: Q;
  /** semente para embaralhar (muda a cada tentativa) */
  seed: string;
  answer: Answer | null;
  onAnswer: (a: Answer | null) => void;
  /** depois de "Verificar": mostra o resultado e bloqueia */
  checked: null | { correct: boolean };
}

export function Exercise(props: ExerciseProps<Question>) {
  const { q } = props;
  switch (q.type) {
    case 'choice':
      return <ChoiceEx {...(props as ExerciseProps<ChoiceQuestion>)} />;
    case 'truefalse':
      return <TrueFalseEx {...(props as ExerciseProps<TrueFalseQuestion>)} />;
    case 'fill':
      return <FillEx {...(props as ExerciseProps<FillBlankQuestion>)} />;
    case 'order':
      return <OrderEx {...(props as ExerciseProps<OrderQuestion>)} />;
    case 'match':
      return <MatchEx {...(props as ExerciseProps<MatchQuestion>)} />;
  }
}

export function typeLabel(q: Question): string {
  switch (q.type) {
    case 'choice':
      return q.layout === 'grid' ? 'Identifique a placa' : q.visual?.kind === 'scene' ? 'Situação de trânsito' : q.visual?.kind === 'sign' ? 'Leia a placa' : 'Escolha a resposta';
    case 'truefalse':
      return 'Julgue a afirmação';
    case 'fill':
      return 'Complete a frase';
    case 'order':
      return 'Coloque em ordem';
    case 'match':
      return 'Associe os pares';
  }
}

/* ---------- grupo de rádio acessível, com atalhos 1–9 ---------- */

interface RadioItem {
  id: string;
  label: React.ReactNode;
  ariaLabel: string;
  visual?: React.ReactNode;
}

function RadioGroup({
  items,
  selected,
  onSelect,
  locked,
  correctId,
  layout = 'list',
  label,
}: {
  items: RadioItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  locked: boolean;
  correctId?: string;
  layout?: 'list' | 'grid';
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (locked) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= items.length) {
        e.preventDefault();
        onSelect(items[n - 1].id);
        refs.current[n - 1]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, locked, onSelect]);

  const onArrow = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d || locked) return;
    e.preventDefault();
    const j = (i + d + items.length) % items.length;
    onSelect(items[j].id);
    refs.current[j]?.focus();
  };

  const focusIndex = Math.max(0, items.findIndex((it) => it.id === selected));

  return (
    <div className={`options ${layout === 'grid' ? 'grid' : ''}`} role="radiogroup" aria-label={label}>
      {items.map((it, i) => {
        const isSel = selected === it.id;
        const state = locked ? (it.id === correctId ? 'is-correct' : isSel ? 'is-wrong' : '') : '';
        return (
          <button
            key={it.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={isSel}
            aria-label={`${it.ariaLabel}${state === 'is-correct' ? ' (resposta correta)' : state === 'is-wrong' ? ' (sua resposta, incorreta)' : ''}`}
            tabIndex={i === focusIndex ? 0 : -1}
            className={`opt ${state}`}
            disabled={locked}
            onClick={() => onSelect(it.id)}
            onKeyDown={(e) => onArrow(e, i)}
          >
            <span className="key" aria-hidden="true">{i + 1}</span>
            {it.visual}
            <span className="opt-text">{it.label}</span>
            {state === 'is-correct' && <span className="mark" aria-hidden="true">✓</span>}
            {state === 'is-wrong' && <span className="mark" aria-hidden="true">✗</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- escolha ---------- */

function ChoiceEx({ q, seed, answer, onAnswer, checked }: ExerciseProps<ChoiceQuestion>) {
  const opts = useMemo(() => seededShuffle(q.options, seed), [q, seed]);
  const selected = answer?.type === 'choice' ? answer.optionId : null;
  const grid = q.layout === 'grid';
  return (
    <>
      {q.visual && (
        <div className="q-visual">
          <Visual v={q.visual} size={150} />
        </div>
      )}
      <RadioGroup
        label={q.prompt}
        layout={grid ? 'grid' : 'list'}
        locked={Boolean(checked)}
        correctId={q.correct}
        selected={selected}
        onSelect={(id) => onAnswer({ type: 'choice', optionId: id })}
        items={opts.map((o) => ({
          id: o.id,
          ariaLabel: o.visual?.alt ?? o.text,
          label: grid ? <span className="opt-caption">{o.text}</span> : o.text,
          visual: o.visual ? <Visual v={o.visual} size={grid ? 96 : 56} /> : undefined,
        }))}
      />
    </>
  );
}

/* ---------- verdadeiro ou falso ---------- */

function TrueFalseEx({ q, answer, onAnswer, checked }: ExerciseProps<TrueFalseQuestion>) {
  const selected = answer?.type === 'truefalse' ? String(answer.value) : null;
  return (
    <>
      {q.visual && (
        <div className="q-visual">
          <Visual v={q.visual} />
        </div>
      )}
      <p className="statement">“{q.statement}”</p>
      <RadioGroup
        label={q.statement}
        locked={Boolean(checked)}
        correctId={String(q.answer)}
        selected={selected}
        onSelect={(id) => onAnswer({ type: 'truefalse', value: id === 'true' })}
        items={[
          { id: 'true', label: 'Verdadeiro', ariaLabel: 'Verdadeiro' },
          { id: 'false', label: 'Falso', ariaLabel: 'Falso' },
        ]}
      />
    </>
  );
}

/* ---------- completar lacuna ---------- */

function FillEx({ q, seed, answer, onAnswer, checked }: ExerciseProps<FillBlankQuestion>) {
  const bank = useMemo(() => seededShuffle(q.bank, seed), [q, seed]);
  const word = answer?.type === 'fill' ? answer.word : null;
  const [before, after] = q.sentence.split('___');
  const locked = Boolean(checked);
  return (
    <>
      <p className="sentence">
        {before}
        <span className="blank" aria-live="polite" aria-label={word ? `Lacuna preenchida com ${word}` : 'Lacuna vazia'}>
          {word && (
            <button
              type="button"
              className={`chip placed ${checked ? (checked.correct ? 'is-correct' : 'is-wrong') : ''}`}
              disabled={locked}
              onClick={() => onAnswer(null)}
              aria-label={`Remover ${word}`}
            >
              {word}
            </button>
          )}
        </span>
        {after}
      </p>
      <div className="bank" role="group" aria-label="Banco de palavras">
        {bank.map((w) => (
          <button key={w} type="button" className={`chip ${w === word ? 'used' : ''}`} disabled={locked || w === word} onClick={() => onAnswer({ type: 'fill', word: w })}>
            {w}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- ordenar ---------- */

function OrderEx({ q, answer, onAnswer, checked }: ExerciseProps<OrderQuestion>) {
  const ids = answer?.type === 'order' ? answer.ids : q.items.map((i) => i.id);
  const [moved, setMoved] = useState<string | null>(null);
  const byId = Object.fromEntries(q.items.map((i) => [i.id, i.text]));
  useEffect(() => {
    if (!answer) onAnswer({ type: 'order', ids: q.items.map((i) => i.id) });
  }, [answer, onAnswer, q]);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[i], next[j]] = [next[j], next[i]];
    setMoved(next[j]);
    onAnswer({ type: 'order', ids: next });
  };
  const locked = Boolean(checked);
  return (
    <ol className="order-list" aria-label="Itens para ordenar">
      {ids.map((id, i) => {
        const right = checked ? q.answer[i] === id : null;
        return (
          <li key={id} className={`order-item ${moved === id ? 'moved' : ''} ${right === null ? '' : right ? 'is-correct' : 'is-wrong'}`}>
            <span className="pos">{i + 1}</span>
            <span>{byId[id]}</span>
            {right !== null && <span className="mark" aria-label={right ? 'posição correta' : 'posição incorreta'}>{right ? '✓' : '✗'}</span>}
            <span className="moves">
              <button type="button" className="icon-btn" disabled={locked || i === 0} onClick={() => move(i, -1)} aria-label={`Subir "${byId[id]}"`}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
              <button type="button" className="icon-btn" disabled={locked || i === ids.length - 1} onClick={() => move(i, 1)} aria-label={`Descer "${byId[id]}"`}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- associar pares ---------- */

function MatchEx({ q, seed, answer, onAnswer, checked }: ExerciseProps<MatchQuestion>) {
  const rights = useMemo(() => seededShuffle(q.pairs.map((p) => ({ id: p.id, text: p.right })), seed), [q, seed]);
  const pairs = answer?.type === 'match' ? answer.pairs : {};
  const [pick, setPick] = useState<string | null>(null);
  const locked = Boolean(checked);
  const usedRight = new Set(Object.values(pairs));
  const complete = Object.keys(pairs).length === q.pairs.length;

  const setPairs = (next: Record<string, string>) => {
    onAnswer(Object.keys(next).length === q.pairs.length ? { type: 'match', pairs: next } : Object.keys(next).length ? { type: 'match', pairs: next } : null);
  };
  const clickLeft = (id: string) => {
    if (pairs[id]) {
      const { [id]: _, ...rest } = pairs;
      void _;
      setPairs(rest);
      setPick(id);
    } else setPick(pick === id ? null : id);
  };
  const clickRight = (rid: string) => {
    if (!pick) return;
    setPairs({ ...pairs, [pick]: rid });
    setPick(null);
  };
  const rightLabel = (rid: string) => rights.find((r) => r.id === rid)?.text ?? '';

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {pick ? `Selecionado: ${q.pairs.find((p) => p.id === pick)?.left}. Agora escolha o par.` : complete ? 'Todos os pares formados.' : ''}
      </p>
      <div className="match">
        <div className="col" role="group" aria-label="Coluna da esquerda">
          {q.pairs.map((p) => {
            const paired = pairs[p.id];
            const st = checked && paired ? (paired === p.id ? 'is-correct' : 'is-wrong') : '';
            return (
              <button
                key={p.id}
                type="button"
                className={`opt ${paired && !checked ? 'paired' : ''} ${st}`}
                aria-pressed={pick === p.id}
                disabled={locked}
                onClick={() => clickLeft(p.id)}
                aria-label={`${p.left}${paired ? `, associado a ${rightLabel(paired)}` : ''}`}
              >
                {p.leftVisual ? <span className="sw"><Visual v={p.leftVisual} size={54} /></span> : null}
                <span>{p.left}</span>
              </button>
            );
          })}
        </div>
        <div className="col" role="group" aria-label="Coluna da direita">
          {rights.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`opt ${usedRight.has(r.id) && !checked ? 'paired' : ''}`}
              disabled={locked || usedRight.has(r.id) || !pick}
              onClick={() => clickRight(r.id)}
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/** Uma resposta só pode ser verificada quando está completa. */
export function isAnswerReady(q: Question, a: Answer | null): boolean {
  if (!a) return false;
  if (q.type === 'match') return a.type === 'match' && Object.keys(a.pairs).length === q.pairs.length;
  return true;
}

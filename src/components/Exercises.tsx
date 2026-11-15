import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import type { ChoiceQuestion, FillBlankQuestion, MatchQuestion, OrderQuestion, Question, TrueFalseQuestion } from '../content/types';
import type { Answer } from '../engine/grading';
import { seededShuffle } from '../engine/grading';
import { Visual } from './Visual';
import { TermText } from './TermText';
import { useSound } from '../ui/hooks';

export interface ExerciseProps<Q extends Question> {
  q: Q;
  /** semente para embaralhar (muda a cada tentativa) */
  seed: string;
  answer: Answer | null;
  onAnswer: (a: Answer | null) => void;
  /** depois de "Verificar": mostra o resultado e bloqueia */
  checked: null | { correct: boolean };
  /** alternativa (escolha) ou palavra (lacuna) riscada pela dica */
  eliminated?: string;
}

export function Exercise(props: ExerciseProps<Question>) {
  const { q } = props;
  switch (q.type) {
    case 'choice':
      return <ChoiceEx {...(props as ExerciseProps<ChoiceQuestion>)} />;
    case 'truefalse':
      return <TrueFalseEx {...(props as ExerciseProps<TrueFalseQuestion>)} />;
    case 'fill':
      return <><QVisual q={q} checked={props.checked} /><FillEx {...(props as ExerciseProps<FillBlankQuestion>)} /></>;
    case 'order':
      return <><QVisual q={q} checked={props.checked} /><OrderEx {...(props as ExerciseProps<OrderQuestion>)} /></>;
    case 'match':
      return <><QVisual q={q} checked={props.checked} /><MatchEx {...(props as ExerciseProps<MatchQuestion>)} /></>;
  }
}

/** imagem do enunciado nos tipos que não a desenham por conta própria (lacuna, ordenar, pares) */
function QVisual({ q, checked }: { q: Question; checked: ExerciseProps<Question>['checked'] }) {
  if (!q.visual) return null;
  return (
    <div className="q-visual">
      <Visual v={q.visual} size={150} checked={checked} />
    </div>
  );
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
  disabledId,
}: {
  items: RadioItem[];
  selected: string | null;
  onSelect: (id: string) => void;
  locked: boolean;
  correctId?: string;
  layout?: 'list' | 'grid';
  label: string;
  /** alternativa riscada pela dica: não pode ser escolhida */
  disabledId?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (locked) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      // com um diálogo aberto (sair, dica), as teclas 1–9 não mexem na questão de trás
      if (document.querySelector('[aria-modal="true"]')) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= items.length && items[n - 1].id !== disabledId) {
        e.preventDefault();
        onSelect(items[n - 1].id);
        refs.current[n - 1]?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, locked, onSelect, disabledId]);

  const onArrow = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    if (!d || locked) return;
    e.preventDefault();
    let j = (i + d + items.length) % items.length;
    if (items[j].id === disabledId) j = (j + d + items.length) % items.length;
    onSelect(items[j].id);
    refs.current[j]?.focus();
  };

  // o botão que recebe o Tab: o escolhido ou, sem escolha, o primeiro que não foi riscado pela dica
  const selIndex = items.findIndex((it) => it.id === selected);
  const focusIndex = selIndex >= 0 ? selIndex : Math.max(0, items.findIndex((it) => locked || it.id !== disabledId));

  return (
    <div className={`options ${layout === 'grid' ? 'grid' : ''}`} role="radiogroup" aria-label={label}>
      {items.map((it, i) => {
        const isSel = selected === it.id;
        const off = it.id === disabledId && !locked;
        const state = locked ? (it.id === correctId ? 'is-correct' : isSel ? 'is-wrong' : '') : '';
        return (
          <button
            key={it.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={isSel}
            aria-label={`${it.ariaLabel}${state === 'is-correct' ? ' (resposta correta)' : state === 'is-wrong' ? ' (sua resposta, incorreta)' : off ? ' (eliminada pela dica)' : ''}`}
            tabIndex={i === focusIndex ? 0 : -1}
            className={`opt ${state} ${off ? 'is-eliminated' : ''}`}
            disabled={locked || off}
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

function ChoiceEx({ q, seed, answer, onAnswer, checked, eliminated }: ExerciseProps<ChoiceQuestion>) {
  const opts = useMemo(() => seededShuffle(q.options, seed), [q, seed]);
  const selected = answer?.type === 'choice' ? answer.optionId : null;
  const grid = q.layout === 'grid';
  return (
    <>
      {q.visual && (
        <div className="q-visual">
          <Visual v={q.visual} size={150} checked={checked} />
        </div>
      )}
      <RadioGroup
        label={q.prompt}
        layout={grid ? 'grid' : 'list'}
        locked={Boolean(checked)}
        correctId={q.correct}
        disabledId={eliminated}
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
          <Visual v={q.visual} checked={checked} />
        </div>
      )}
      <p className="statement">“<TermText text={q.statement} />”</p>
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

function FillEx({ q, seed, answer, onAnswer, checked, eliminated }: ExerciseProps<FillBlankQuestion>) {
  const bank = useMemo(() => seededShuffle(q.bank, seed), [q, seed]);
  const word = answer?.type === 'fill' ? answer.word : null;
  const [before, after] = q.sentence.split('___');
  const locked = Boolean(checked);
  return (
    <>
      <p className="sentence">
        <TermText text={before} />
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
        <TermText text={after ?? ''} />
      </p>
      <div className="bank" role="group" aria-label="Banco de palavras">
        {bank.map((w) => (
          <button
            key={w}
            type="button"
            className={`chip ${w === word ? 'used' : ''} ${w === eliminated && !locked ? 'is-eliminated' : ''}`}
            disabled={locked || w === word || w === eliminated}
            aria-label={w === eliminated ? `${w} (eliminada pela dica)` : undefined}
            onClick={() => onAnswer({ type: 'fill', word: w })}
          >
            {w}
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------- ordenar ---------- */

/** Move o item da posição `from` para `to` (usado ao soltar um item arrastado). */
export function moveItem<T>(xs: T[], from: number, to: number): T[] {
  const next = [...xs];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

/**
 * Para onde vai o item arrastado: quantos dos outros itens têm o centro acima do centro dele.
 * `centers` são os centros (eixo vertical) de cada item antes de começar a arrastar.
 */
export function dropIndex(centers: number[], from: number, draggedCenter: number): number {
  return centers.filter((c, j) => j !== from && c < draggedCenter).length;
}

function OrderEx({ q, answer, onAnswer, checked }: ExerciseProps<OrderQuestion>) {
  const ids = answer?.type === 'order' ? answer.ids : q.items.map((i) => i.id);
  const [moved, setMoved] = useState<string | null>(null);
  // arrastar: item segurado, quanto já desceu/subiu e para onde iria se soltasse agora
  const [drag, setDrag] = useState<{ from: number; dy: number; to: number; active: boolean } | null>(null);
  const geo = useRef<{ startY: number; centers: number[]; step: number; pointer: number } | null>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
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

  // o arraste começa só pela alça (⠿): no resto do item, o dedo rola a página normalmente
  const onPointerDown = (e: RPointerEvent<HTMLElement>, i: number) => {
    if (locked || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const rects = itemRefs.current.map((el) => el?.getBoundingClientRect());
    const centers = rects.map((r) => (r ? r.top + r.height / 2 : 0));
    const r = rects[i];
    const next = rects[i + 1] ?? rects[i - 1];
    // distância entre dois itens vizinhos (altura + espaço)
    const step = r && next ? Math.abs(next.top - r.top) : (r?.height ?? 60) + 10;
    geo.current = { startY: e.clientY, centers, step, pointer: e.pointerId };
    setDrag({ from: i, dy: 0, to: i, active: false });
  };
  const onPointerMove = (e: RPointerEvent<HTMLLIElement>) => {
    const g = geo.current;
    if (!drag || !g || e.pointerId !== g.pointer) return;
    const dy = e.clientY - g.startY;
    // só vira "arrastar" depois de um pequeno movimento (um toque simples não mexe em nada)
    if (!drag.active && Math.abs(dy) < 6) return;
    if (!drag.active) e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
    setDrag({ ...drag, active: true, dy, to: dropIndex(g.centers, drag.from, g.centers[drag.from] + dy) });
  };
  const endDrag = (e: RPointerEvent<HTMLLIElement>, cancel = false) => {
    const g = geo.current;
    if (!drag || !g || e.pointerId !== g.pointer) return;
    geo.current = null;
    setDrag(null);
    if (cancel || !drag.active || drag.to === drag.from) return;
    const next = moveItem(ids, drag.from, drag.to);
    setMoved(ids[drag.from]);
    onAnswer({ type: 'order', ids: next });
  };
  // deslocamento visual de cada item enquanto um deles é arrastado
  const shiftOf = (i: number) => {
    if (!drag?.active || !geo.current) return 0;
    if (i === drag.from) return drag.dy;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) return -geo.current.step;
    if (drag.to < drag.from && i >= drag.to && i < drag.from) return geo.current.step;
    return 0;
  };

  return (
    <ol className={`order-list ${drag?.active ? 'is-dragging' : ''}`} aria-label="Itens para ordenar">
      {ids.map((id, i) => {
        const right = checked ? q.answer[i] === id : null;
        const shift = shiftOf(i);
        return (
          <li
            key={id}
            ref={(el) => (itemRefs.current[i] = el)}
            className={`order-item ${moved === id && !drag ? 'moved' : ''} ${drag?.active && drag.from === i ? 'dragging' : ''} ${locked ? '' : 'draggable'} ${right === null ? '' : right ? 'is-correct' : 'is-wrong'}`}
            style={shift ? { transform: `translateY(${shift}px)` } : undefined}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endDrag(e)}
            onPointerCancel={(e) => endDrag(e, true)}
          >
            {!locked && (
              <span className="grip" aria-hidden="true" title="Arraste para mudar a ordem" onPointerDown={(e) => onPointerDown(e, i)}>
                <svg width="16" height="22" viewBox="0 0 16 22">
                  {[4, 11, 18].map((y) => [5, 11].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" />))}
                </svg>
              </span>
            )}
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
  const mistakes = answer?.type === 'match' ? answer.mistakes ?? 0 : 0;
  // seleção pode começar por qualquer coluna, como no Duolingo
  const [pick, setPick] = useState<{ side: 'l' | 'r'; id: string } | null>(null);
  // par certo acabou de ser formado (pisca verde) / par errado (treme vermelho e solta)
  const [flash, setFlash] = useState<{ ok: boolean; l: string; r: string } | null>(null);
  const [live, setLive] = useState('');
  const play = useSound();
  const locked = Boolean(checked);
  const matched = new Set(Object.keys(pairs)); // ids de pares certos (esquerda e direita têm o mesmo id)
  const complete = matched.size === q.pairs.length;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), flash.ok ? 450 : 650);
    return () => clearTimeout(t);
  }, [flash]);

  const leftText = (id: string) => q.pairs.find((p) => p.id === id)?.left ?? '';
  const rightText = (id: string) => q.pairs.find((p) => p.id === id)?.right ?? '';

  const tryPair = (l: string, r: string) => {
    setPick(null);
    if (l === r) {
      setFlash({ ok: true, l, r });
      setLive(`Certo: ${leftText(l)} com ${rightText(r)}.`);
      play('select');
      onAnswer({ type: 'match', pairs: { ...pairs, [l]: r }, mistakes });
    } else {
      setFlash({ ok: false, l, r });
      setLive(`Não combina: ${leftText(l)} e ${rightText(r)}. Tente outro par.`);
      play('wrong');
      onAnswer({ type: 'match', pairs, mistakes: mistakes + 1 });
    }
  };
  const click = (side: 'l' | 'r', id: string) => {
    if (locked || matched.has(id)) return;
    setLive('');
    if (!pick || pick.side === side) {
      setPick(pick?.side === side && pick.id === id ? null : { side, id });
      return;
    }
    if (side === 'r') tryPair(pick.id, id);
    else tryPair(id, pick.id);
  };

  const stateOf = (side: 'l' | 'r', id: string) => {
    if (flash && flash[side] === id) return flash.ok ? 'is-correct' : 'is-wrong';
    if (matched.has(id)) return 'paired';
    return '';
  };

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {live || (pick ? `Selecionado: ${pick.side === 'l' ? leftText(pick.id) : rightText(pick.id)}. Agora escolha o par.` : complete ? 'Todos os pares formados.' : '')}
      </p>
      <div className="match">
        <div className="col" role="group" aria-label="Coluna da esquerda">
          {q.pairs.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`opt ${stateOf('l', p.id)}`}
              aria-pressed={pick?.side === 'l' && pick.id === p.id}
              disabled={locked || matched.has(p.id)}
              onClick={() => click('l', p.id)}
              aria-label={`${p.left}${matched.has(p.id) ? `, associado a ${p.right}` : ''}`}
            >
              {p.leftVisual ? <span className="sw"><Visual v={p.leftVisual} size={54} /></span> : null}
              <span>{p.left}</span>
            </button>
          ))}
        </div>
        <div className="col" role="group" aria-label="Coluna da direita">
          {rights.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`opt ${stateOf('r', r.id)}`}
              aria-pressed={pick?.side === 'r' && pick.id === r.id}
              disabled={locked || matched.has(r.id)}
              onClick={() => click('r', r.id)}
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

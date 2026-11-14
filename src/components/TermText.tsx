import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { splitTerms, type HintIndex, type TermHint } from '../content/glossary';

/**
 * Dicas de palavras ativas na tela. Só a lição fornece; sem provedor (ex.: simulado),
 * o texto aparece sem dicas, como na prova de verdade.
 */
export const TermHintsContext = createContext<{ index: HintIndex; questionId?: string } | null>(null);

/** Texto com as palavras já ensinadas destacadas; tocar mostra o significado. */
export function TermText({ text }: { text: string }) {
  const ctx = useContext(TermHintsContext);
  const parts = splitTerms(text, ctx?.index ?? null, ctx?.questionId);
  return (
    <>
      {parts.map((p, i) => (typeof p === 'string' ? p : <Term key={i} text={p.text} hint={p.hint} />))}
    </>
  );
}

/** A questão tem alguma palavra nova (ensinada nesta lição)? */
export function useHasNewTerm(texts: string[]): boolean {
  const ctx = useContext(TermHintsContext);
  if (!ctx) return false;
  return texts.some((t) => splitTerms(t, ctx.index, ctx.questionId).some((p) => typeof p !== 'string' && p.hint.isNew));
}

function Term({ text, hint }: { text: string; hint: TermHint }) {
  const [open, setOpen] = useState(false);
  // aberto por clique/toque fica fixo; aberto só pelo mouse fecha ao sair
  const pinned = useRef(false);
  const close = () => {
    pinned.current = false;
    setOpen(false);
  };
  const [shift, setShift] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const id = useId();

  // fecha com Esc ou com toque fora
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // não deixa o balão sair da tela no celular
  useLayoutEffect(() => {
    if (!open || !tip.current) return setShift(0);
    const r = tip.current.getBoundingClientRect();
    const gap = 12;
    const w = window.innerWidth;
    if (r.right > w - gap) setShift(w - gap - r.right);
    else if (r.left < gap) setShift(gap - r.left);
  }, [open]);

  return (
    <span className="term-wrap" ref={wrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => !pinned.current && setOpen(false)}>
      <button
        type="button"
        className={`term ${hint.isNew ? 'is-new' : ''} ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={`${text}: ver significado`}
        onClick={() => {
          if (open && pinned.current) return close();
          pinned.current = true;
          setOpen(true);
        }}
      >
        {text}
      </button>
      {open && (
        <span className="term-tip" role="tooltip" id={id} ref={tip} style={{ ['--shift' as string]: `${shift}px` }}>
          <strong>{hint.term}</strong>
          {hint.meaning}
        </span>
      )}
    </span>
  );
}

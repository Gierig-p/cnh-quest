import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Fragment, type ReactNode } from 'react';
import { splitTerms, type HintIndex, type TermHint } from '../content/glossary';
import { SIGN_CODE_RE, SIGN_NAMES, isSignCode } from '../content/signs';
import { SignArt } from './SignArt';

/**
 * Dicas de palavras ativas na tela. Só a lição fornece; sem provedor (ex.: simulado),
 * o texto aparece sem dicas, como na prova de verdade.
 */
export const TermHintsContext = createContext<{ index: HintIndex; questionId?: string; hideSigns?: boolean } | null>(null);

/** Texto com as palavras já ensinadas destacadas; tocar mostra o significado. */
export function TermText({ text }: { text: string }) {
  const ctx = useContext(TermHintsContext);
  const parts = splitTerms(text, ctx?.index ?? null, ctx?.questionId);
  return (
    <>
      {parts.map((p, i) => (typeof p === 'string' ? p : p.hint.sign && ctx?.hideSigns ? p.text : <Term key={i} text={p.text} hint={p.hint} />))}
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
        className={`term ${hint.sign ? 'is-sign' : ''} ${hint.isNew ? 'is-new' : ''} ${open ? 'open' : ''}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={hint.sign ? `Placa ${text}: ver desenho` : `${text}: ver significado`}
        onClick={() => {
          if (open && pinned.current) return close();
          pinned.current = true;
          setOpen(true);
        }}
      >
        {hint.sign && <SignArt code={hint.sign} size={20} title="" />}
        {text}
      </button>
      {open && (
        <span className={`term-tip ${hint.sign ? 'is-sign' : ''}`} role="tooltip" id={id} ref={tip} style={{ ['--shift' as string]: `${shift}px` }}>
          {hint.sign && (
            <span className="term-tip-sign">
              <SignArt code={hint.sign} size={88} title={`Placa ${hint.term}`} />
            </span>
          )}
          <strong>{hint.term}</strong>
          {hint.meaning}
        </span>
      )}
    </span>
  );
}

/**
 * Texto sem toque (dentro de botões: alternativas, banco de palavras, pares, itens):
 * cada código de placa já apresentado ao aluno ganha uma miniatura ao lado.
 * `always`: mostra a miniatura de toda placa conhecida (usado no próprio cartão, que apresenta a placa).
 * Sem provedor (simulado), o texto fica puro, como na prova.
 */
export function SignInline({ text, always = false }: { text: string; always?: boolean }) {
  const ctx = useContext(TermHintsContext);
  const show = (code: string) => isSignCode(code) && (always || Boolean(ctx?.index.signs.has(code)));
  // sem provedor (simulado) ou com a placa guardada para a Dica: texto puro
  if (!text || (!always && (!ctx || ctx.hideSigns))) return <>{text}</>;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(SIGN_CODE_RE)) {
    if (!show(m[0])) continue;
    if (m.index! > last) out.push(text.slice(last, m.index));
    out.push(
      <span className="sign-mini" key={m.index}>
        <SignArt code={m[0] as never} size={20} title={SIGN_NAMES[m[0] as keyof typeof SIGN_NAMES] ?? m[0]} />
        {m[0]}
      </span>,
    );
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}

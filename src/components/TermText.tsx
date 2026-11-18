import { createContext, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  // posição do balão na tela (fixa, fora de qualquer caixa que corte o conteúdo)
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean; maxH: number } | null>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const id = useId();

  // fecha com Esc ou com toque fora
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!wrap.current?.contains(t) && !tip.current?.contains(t)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // coloca o balão dentro da tela: abaixo da palavra, ou acima se não couber
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      if (!btn.current || !tip.current) return;
      const rects = btn.current.getClientRects();
      const r = rects.length ? rects[0] : btn.current.getBoundingClientRect();
      const gap = 12;
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = window.innerHeight;
      const tw = tip.current.offsetWidth;
      const th = tip.current.scrollHeight;
      const cx = r.left + r.width / 2;
      const left = Math.max(gap, Math.min(cx - tw / 2, vw - gap - tw));
      const below = vh - r.bottom - 10 - gap;
      const aboveSpace = r.top - 10 - gap;
      const above = th > below && aboveSpace > below;
      const maxH = Math.max(80, above ? aboveSpace : below);
      const h = Math.min(th, maxH);
      const top = above ? r.top - 10 - h : r.bottom + 10;
      setPos({ left, top, above, maxH });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  return (
    <span className="term-wrap" ref={wrap} onMouseEnter={() => setOpen(true)} onMouseLeave={() => !pinned.current && setOpen(false)}>
      <button
        type="button"
        ref={btn}
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
      {open &&
        createPortal(
          <span
            className={`term-tip ${hint.sign ? 'is-sign' : ''} ${pos?.above ? 'above' : ''}`}
            role="tooltip"
            id={id}
            ref={tip}
            style={{
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              maxHeight: pos?.maxH,
              visibility: pos ? 'visible' : 'hidden',
            }}
          >
            {hint.sign && (
              <span className="term-tip-sign">
                <SignArt code={hint.sign} size={88} title={`Placa ${hint.term}`} />
              </span>
            )}
            <strong>{hint.term}</strong>
            {hint.meaning}
          </span>,
          document.body,
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

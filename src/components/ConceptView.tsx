import type { ConceptCard } from '../content/types';
import { Lumi } from './Lumi';
import { Visual } from './Visual';
import { SourceList } from '../screens/LessonPlayer';
import { VideoConceito } from './VideoConceito';

/** Blocos de um cartão de conceito, na ordem em que aparecem. */
export type CardBlock = 'body' | 'terms' | 'points' | 'example' | 'video' | 'resumo' | 'guardar';

/**
 * Cartões longos são mostrados em partes ("Parte 1 de N"), Entrega 3 do PLANO-v2.
 * O dono aprovou o cartão de teste (c-preferencia) em 14/11/2026; vale para todo cartão
 * com mais de LONG_CARD letras. Os curtos seguem inteiros.
 */
export const LONG_CARD = 700;

/** Texto máximo (em letras) por parte; a figura conta como 150. */
const PART_MAX = 520;

function blockSize(card: ConceptCard, b: CardBlock): number {
  switch (b) {
    case 'body':
      return card.body.length + (card.visual ? 150 : 0);
    case 'terms':
      return (card.terms ?? []).reduce((n, t) => n + t.term.length + t.meaning.length, 0);
    case 'points':
      return (card.points ?? []).reduce((n, p) => n + p.length, 0);
    case 'example':
      return (card.example ?? '').length + (card.remember ?? '').length;
    default:
      return 0;
  }
}

/**
 * Divide o cartão em partes: blocos inteiros, juntando os vizinhos enquanto couberem.
 * A fala da Lumi (com a figura) e o Passo a passo ficam sempre na mesma parte (pedido do dono,
 * 14/11/2026): a regra e as exceções juntas. As Palavras novas entram entre eles se couberem;
 * senão, vêm na parte seguinte.
 */
export function cardParts(card: ConceptCard): CardBlock[][] {
  // cartão com vídeo: o vídeo numa página, o resumo na outra
  if (card.video) return card.id ? [['video'], ['resumo', 'terms', 'guardar']] : [['video', 'resumo', 'terms', 'guardar']];
  const blocks = (['body', 'terms', 'points', 'example'] as CardBlock[]).filter((b) => blockSize(card, b) > 0);
  if (!card.id || blocks.reduce((n, b) => n + blockSize(card, b), 0) <= LONG_CARD) return [blocks];
  const has = (b: CardBlock) => blocks.includes(b);
  const sum = (bs: CardBlock[]) => bs.reduce((n, b) => n + blockSize(card, b), 0);
  // unidades que não se separam
  const units: CardBlock[][] = [];
  if (has('body') && has('points')) {
    const comTermos: CardBlock[] = ['body', 'terms', 'points'];
    if (has('terms') && sum(comTermos) <= PART_MAX) units.push(comTermos);
    else {
      units.push(['body', 'points']);
      if (has('terms')) units.push(['terms']);
    }
  } else {
    for (const b of ['body', 'terms', 'points'] as CardBlock[]) if (has(b)) units.push([b]);
  }
  if (has('example')) units.push(['example']);
  const parts: CardBlock[][] = [];
  let size = Infinity;
  for (const u of units) {
    const n = sum(u);
    if (size + n > PART_MAX) {
      parts.push([...u]);
      size = n;
    } else {
      parts[parts.length - 1].push(...u);
      size += n;
    }
  }
  return parts;
}

/** Conteúdo do cartão (sem título), só com os blocos pedidos. */
export function ConceptBlocks({ card, show, sources = true, lumiSize = 92 }: { card: ConceptCard; show: CardBlock[]; sources?: boolean; lumiSize?: number }) {
  const has = (b: CardBlock) => show.includes(b);
  return (
    <>
      {has('body') && (
        <>
          <div className="bubble-row">
            <Lumi mood="wave" size={lumiSize} />
            <p className="bubble">{card.body}</p>
          </div>
          {card.visual && (
            <div className="q-visual pop-in">
              <Visual v={card.visual} size={180} />
            </div>
          )}
        </>
      )}
      {has('video') && card.video && <VideoConceito id={card.video.id} title={card.title} />}
      {has('resumo') && card.video && (
        <div className="c-box c-resumo">
          <h2 className="c-head">📝 Resumo</h2>
          <ul>
            {card.video.resumo.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {has('terms') && card.terms && card.terms.length > 0 && (
        <div className="c-box c-terms">
          <h2 className="c-head">📖 Palavras novas</h2>
          <dl>
            {card.terms.map((t) => (
              <div key={t.term}>
                <dt>{t.term}</dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {has('points') && card.points && card.points.length > 0 && (
        <div className="c-box c-points">
          <h2 className="c-head">🧭 Passo a passo</h2>
          <ol>
            {card.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </div>
      )}
      {has('example') && card.example && (
        <div className="c-box c-example">
          <h2 className="c-head">🚗 Na prática</h2>
          <p>{card.example}</p>
        </div>
      )}
      {has('example') && card.remember && (
        <div className="c-box c-remember">
          <h2 className="c-head">💡 Para guardar</h2>
          <p>{card.remember}</p>
        </div>
      )}
      {has('guardar') && card.remember && (
        <div className="c-box c-remember">
          <h2 className="c-head">💡 Para guardar</h2>
          <p>{card.remember}</p>
        </div>
      )}
      {sources && <p className="source-line"><SourceList refs={card.sources} /></p>}
    </>
  );
}

/**
 * Vídeo do cartão c4-naturezas ("As quatro naturezas"), Mundo 4, lote 1 de 16/11/2026.
 * As quatro naturezas com o valor da multa e os pontos, o fator multiplicador e o exemplo do fone.
 * Tempos em content/videos/naturezas.json.
 */
import type { ReactNode } from 'react';
import { Balao } from './Mundo2';
import { Cabine, zoomCabine } from './Mundo4';
import { NAT, TINTA, chip, naturezas, papel, cnh, quadro, bolinhas, ruaFundo, surge } from './infracoesUI';
import { RA, clamp, ease, escuro, fazerVideo, lerp, type Quadro } from './videoBase';
import tempos from '../../content/videos/naturezas.json';

const XV = RA - 1.65;

/** medidor de 4 cores (leve a gravíssima) com o ponteiro em `k` (0 a 1) */
function medidor(cx: number, cy: number, r: number, k: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  const pt = (a: number, rr: number) => `${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr}`;
  const a = Math.PI + k * Math.PI;
  return (
    <g opacity={o}>
      <path d={`M${pt(Math.PI, r + 7)} A${r + 7} ${r + 7} 0 0 1 ${pt(0, r + 7)} Z`} fill="#fff" />
      {NAT.map((n, i) => {
        const a0 = Math.PI + (i / 4) * Math.PI + 0.03, a1 = Math.PI + ((i + 1) / 4) * Math.PI - 0.03;
        return <path key={n.nome} d={`M${pt(a0, r)} A${r} ${r} 0 0 1 ${pt(a1, r)}`} fill="none" stroke={n.cor} strokeWidth={8} />;
      })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * (r - 6)} y2={cy + Math.sin(a) * (r - 6)} stroke={TINTA} strokeWidth={2.6} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3.4} fill={TINTA} />
    </g>
  );
}

const todas = () => 1;

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. toda infração tem uma natureza: o quanto ela é séria
    case 0: {
      const q = ruaFundo(lt);
      const kk = 0.5 + 0.48 * Math.sin(lt * 1.6 - 1.4);
      return { ...q, over: () => (
        <>
          {medidor(262, 62, 34, kk, surge(lt, 0.4))}
          {chip(262, 80, 'O quanto é séria', TINTA, surge(lt, 1.6))}
        </>
      ) };
    }
    // 1. as quatro naturezas
    case 1: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.35 * surge(lt, 0))}
          {naturezas((i) => surge(lt, 0.9 + i * 0.75), null, () => 0, 104)}
        </>
      ) };
    }
    // 2. a natureza define a multa e os pontos
    case 2: {
      const q = ruaFundo(lt);
      const pts = Math.round(lerp(0, 7, clamp((lt - 3.4) / 1.4)));
      return { ...q, over: () => (
        <>
          {escuro(0.4)}
          {papel(62, 50, 1.25, 'MULTA', '#d93a35', surge(lt, 1.6), 'R$')}
          {chip(98, 152, 'Valor da multa', TINTA, surge(lt, 1.9))}
          {cnh(176, 68, 1.25, pts, surge(lt, 3.0))}
          {chip(224, 152, 'Pontos na habilitação', TINTA, surge(lt, 3.3))}
        </>
      ) };
    }
    // 3 a 6. cada natureza com o valor e os pontos
    case 3:
    case 4:
    case 5:
    case 6: {
      const n = k - 3;
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.4)}
          {naturezas(todas, n, (i) => (i < n ? 1 : i === n ? surge(lt, 0.6) : 0), 104)}
        </>
      ) };
    }
    // 7. em algumas gravíssimas, a multa é multiplicada: 3, 5 ou 10 vezes
    case 7: {
      const q = ruaFundo(lt);
      const xs = [['× 3', 3.6], ['× 5', 4.5], ['× 10', 5.4]] as const;
      return { ...q, over: () => (
        <>
          {escuro(0.4)}
          {naturezas(todas, 3, todas, 104)}
          {chip(92, 32, 'Muito perigosas', '#d93a35', surge(lt, 1.2), 10)}
          {xs.map(([t, a], i) => (
            <g key={t}>{chip(178 + i * 44, 32, t, '#fff', surge(lt, a), 13, '#d93a35')}</g>
          ))}
        </>
      ) };
    }
    // 8. fator multiplicador
    case 8: {
      const q = ruaFundo(lt);
      const z = 0.8 + 0.2 * ease(lt / 0.5);
      return { ...q, over: () => (
        <>
          {escuro(0.5)}
          <g transform={`translate(160 92) scale(${z})`}>
            {quadro(-90, -42, 180, 84, ease(lt / 0.4), (
              <>
                <text x={90} y={34} textAnchor="middle" fontSize={15} fontWeight={800} fill={TINTA}>Fator multiplicador</text>
                <text x={90} y={68} textAnchor="middle" fontSize={26} fontWeight={900} fill="#d93a35">× 3  × 5  × 10</text>
              </>
            ))}
          </g>
        </>
      ) };
    }
    // 9. exemplo: fone ligado ao celular é média
    case 9: {
      const q = ruaFundo(lt * 0.8 + 2);
      const yv = 4 - 2.2 * (lt * 0.8 + 2);
      const fim = surge(lt, 4.6);
      return { ...q, over: (pr) => (
        <>
          {1 - fim > 0.01 && (
            <g opacity={1 - fim}>
              <Balao at={pr([XV, yv, 1.4])} x={204} y={8} w={108} h={96}>
                {zoomCabine('vnat-fone', <Cabine fones />)}
              </Balao>
              {chip(258, 116, 'Fone ligado ao celular', '#1d2430', surge(lt, 0.8))}
            </g>
          )}
          {escuro(0.4 * fim)}
          {quadro(80, 50, 160, 96, fim, (
            <>
              <rect x={0} y={0} width={160} height={26} rx={9} fill={NAT[1].cor} />
              <rect x={0} y={16} width={160} height={10} fill={NAT[1].cor} />
              <text x={80} y={18} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff">Média</text>
              <text x={80} y={50} textAnchor="middle" fontSize={17} fontWeight={900} fill={TINTA}>{NAT[1].valor}</text>
              {bolinhas(80, 66, 4, NAT[1].cor, 3.4)}
              <text x={80} y={86} textAnchor="middle" fontSize={11} fontWeight={800} fill="#55606e">4 pontos</text>
            </>
          ))}
        </>
      ) };
    }
    // 10. para guardar: leve 3, média 4, grave 5, gravíssima 7
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Para guardar', '#2f6db5', surge(lt, 0.2), 11)}
          {naturezas((i) => surge(lt, 0.9 + i * 0.9), null, (i) => surge(lt, 1.1 + i * 0.9), 104)}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

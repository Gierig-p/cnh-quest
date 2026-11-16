/**
 * Vídeo do cartão c4-suspensao ("Suspensão: pontos em 12 meses"), Mundo 4, lote 1 de 16/11/2026.
 * Os pontos somam; o limite depende das gravíssimas (20, 30, 40); atividade remunerada 40;
 * prazo de 6 meses a 1 ano; infrações que já trazem a suspensão; a volta com o curso de reciclagem.
 * Tempos em content/videos/suspensao.json.
 */
import type { ReactNode } from 'react';
import { utilitario } from './veiculos';
import { Lata } from './Mundo4';
import { NAT, TINTA, bolinhas, calendario, chip, cnh, item, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { RA, clamp, ease, escuro, fazerVideo, lerp, type Quadro } from './videoBase';
import tempos from '../../content/videos/suspensao.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const SUSP = { text: 'SUSPENSA', cor: VM };

/** as três linhas da regra: quantas gravíssimas → limite de pontos */
const LINHAS = [
  { n: 2, rot: '2 ou mais', lim: '20 pontos' },
  { n: 1, rot: '1', lim: '30 pontos' },
  { n: 0, rot: 'nenhuma', lim: '40 pontos' },
];

/** tabela da regra; `vis(i)` mostra a linha, `dest` destaca uma delas */
function tabela(vis: (i: number) => number, dest: number | null, o = 1): ReactNode {
  return quadro(40, 30, 240, 136, o, (
    <>
      <text x={70} y={20} textAnchor="middle" fontSize={10} fontWeight={800} fill={VM}>Gravíssimas</text>
      <text x={182} y={20} textAnchor="middle" fontSize={10} fontWeight={800} fill={TINTA}>Limite em 12 meses</text>
      <line x1={12} y1={28} x2={228} y2={28} stroke="#dde1e7" strokeWidth={1.4} />
      {LINHAS.map((l, i) => {
        const a = vis(i);
        if (a < 0.01) return null;
        const y = 52 + i * 30;
        const on = dest === null || dest === i;
        return (
          <g key={l.rot} opacity={a * (on ? 1 : 0.35)}>
            {dest === i && <rect x={6} y={y - 16} width={228} height={26} rx={7} fill="#fdecea" />}
            {l.n > 0 ? bolinhas(48, y - 3, l.n, VM, 5) : <circle cx={48} cy={y - 3} r={5} fill="none" stroke="#b9c0ca" strokeWidth={1.6} />}
            <text x={l.n === 2 ? 66 : 62} y={y + 1} fontSize={10} fontWeight={800} fill={TINTA}>{l.rot}</text>
            <text x={150} y={y + 1} fontSize={11} fill="#8a93a0" fontWeight={800}>→</text>
            <text x={182} y={y + 2} textAnchor="middle" fontSize={dest === i ? 15 : 13} fontWeight={900} fill={TINTA}>{l.lim}</text>
          </g>
        );
      })}
    </>
  ));
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. os pontos vão somando
    case 0: {
      const q = ruaFundo(lt);
      const soma = [[0.6, 3], [1.6, 4], [2.6, 5]] as const;
      const pts = soma.reduce((s, [a, p]) => s + (lt > a + 0.3 ? p : 0), 0);
      return { ...q, over: () => (
        <>
          {escuro(0.35 * surge(lt, 0))}
          {cnh(118, 54, 1.1, pts, surge(lt, 0.1))}
          {soma.map(([a, p], i) => {
            const t = clamp((lt - a) / 0.9);
            return t > 0 && t < 1 ? <g key={i}>{chip(250, lerp(120, 70, ease(t)), `+${p}`, NAT[p - 3].cor, 1 - t * t, 12)}</g> : null;
          })}
        </>
      ) };
    }
    // 1. passou do limite em 12 meses: suspenso
    case 1: {
      const q = ruaFundo(lt);
      const pts = Math.round(lerp(12, 41, clamp((lt - 0.4) / 1.6)));
      return { ...q, over: () => (
        <>
          {escuro(0.4)}
          {calendario(40, 58, '12 meses', surge(lt, 0.8), 1.25)}
          {cnh(118, 54, 1.1, pts, 1, { ...SUSP, k: surge(lt, 2.4) })}
          {chip(160, 140, 'Fica um tempo proibido de dirigir', TINTA, surge(lt, 3.8))}
        </>
      ) };
    }
    // 2 a 5. o limite depende das gravíssimas
    case 2:
    case 3:
    case 4:
    case 5: {
      const q = ruaFundo(lt);
      const dest = k === 2 ? null : k - 3;
      const vis = (i: number) => (k === 2 ? 0 : i < k - 3 ? 1 : i === k - 3 ? surge(lt, 0.4) : 0);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {tabela(vis, dest, k === 2 ? surge(lt, 0.2) : 1)}
          {k === 2 && chip(160, 110, 'O limite depende das gravíssimas', VM, surge(lt, 1.2), 10)}
        </>
      ) };
    }
    // 6. quem dirige como trabalho: 40 pontos, sejam as infrações quais forem
    case 6: {
      const yv = 4 - 2.2 * lt;
      const q = ruaFundo(lt, [utilitario({ x: RA - 1.65, y: yv - 10, tipo: 'caminhao' })]);
      return { ...q, over: () => (
        <>
          {chip(160, 26, 'Dirige como trabalho, ganhando por isso', AZ, surge(lt, 0.5), 9.4)}
          {quadro(196, 52, 112, 70, surge(lt, 3.0), (
            <>
              <text x={56} y={32} textAnchor="middle" fontSize={20} fontWeight={900} fill={TINTA}>40</text>
              <text x={56} y={48} textAnchor="middle" fontSize={10} fontWeight={800} fill={TINTA}>pontos</text>
              <text x={56} y={62} textAnchor="middle" fontSize={7.6} fontWeight={700} fill="#55606e">sejam quais forem</text>
            </>
          ))}
        </>
      ) };
    }
    // 7. pelos pontos, de 6 meses a 1 ano
    case 7: {
      const q = ruaFundo(lt);
      const b = ease((lt - 1.0) / 1.6);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(30, 60, 260, 80, surge(lt, 0.1), (
            <>
              <text x={130} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={TINTA}>Tempo de suspensão</text>
              <rect x={24} y={38} width={212} height={12} rx={6} fill="#eef0f3" />
              <rect x={24} y={38} width={70 + 142 * b} height={12} rx={6} fill={VM} />
              <text x={30} y={68} fontSize={11} fontWeight={800} fill={TINTA}>6 meses</text>
              <text x={230} y={68} textAnchor="end" fontSize={11} fontWeight={800} fill={TINTA} opacity={b}>1 ano</text>
            </>
          ))}
        </>
      ) };
    }
    // 8. algumas infrações, como beber e dirigir, já trazem a suspensão sozinhas
    case 8: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(36, 50, 64, 80, surge(lt, 1.6), <g transform="translate(9 6) scale(1.5)"><Lata /></g>)}
          {chip(160, 90, '→', '#fff', surge(lt, 2.6), 14, TINTA)}
          {cnh(186, 62, 1.1, null, surge(lt, 2.6), { ...SUSP, k: surge(lt, 3.2) })}
          {chip(160, 156, 'Já traz a suspensão sozinha', VM, surge(lt, 3.6), 10)}
        </>
      ) };
    }
    // 9. a CNH volta depois do prazo e do curso de reciclagem; pontos zerados
    case 9: {
      const q = ruaFundo(lt);
      const volta = surge(lt, 5.0, 0.5);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(14, 50, 168, 96, surge(lt, 0.2), (
            <>
              {item(12, 30, 'Cumprir o prazo', AZ, 1, 11)}
              {visto(152, 26, surge(lt, 1.8), 7)}
              {item(12, 60, 'Curso de reciclagem', AZ, surge(lt, 2.6), 11)}
              {visto(152, 56, surge(lt, 3.4), 7)}
            </>
          ))}
          {cnh(194, 62, 1.1, volta > 0.5 ? 0 : 41, surge(lt, 0.4), { ...SUSP, k: 1 - volta })}
          {chip(236, 140, 'Pontos zerados', '#2fa36b', surge(lt, 5.6), 10)}
        </>
      ) };
    }
    // 10. para guardar
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {tabela((i) => surge(lt, 0.6 + i * 1.5), null)}
          {chip(160, 16, 'Para guardar', AZ, surge(lt, 0.1), 11)}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

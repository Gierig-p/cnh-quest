/**
 * Vídeo do cartão c4-velocidade-sinal ("Velocidade, sinal vermelho e ultrapassagem"), Mundo 4, lote 2 de 16/11/2026.
 * As faixas de excesso de velocidade (até 20%, até 50%, mais de 50%), o exemplo de 100 km/h numa via de 60,
 * avançar o vermelho ou a parada obrigatória, e onde ultrapassar pela contramão é gravíssima × 5.
 * Tempos em content/videos/velocidade-sinal.json.
 */
import type { ReactNode } from 'react';
import { utilitario } from './veiculos';
import { NAT, TINTA, chip, item, quadro, ruaFundo, surge } from './infracoesUI';
import { RA, clamp, ease, escuro, fazerVideo, lerp, placa, type Quadro } from './videoBase';
import tempos from '../../content/videos/velocidade-sinal.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const XV = RA - 1.65;

/** semáforo em pixels, com a luz vermelha acesa */
function semaforo(x: number, y: number, s = 1, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={50} width={6} height={22} fill="#3b4250" />
      <rect x={-13} y={0} width={26} height={54} rx={6} fill="#222a35" />
      <circle cx={0} cy={11} r={7} fill="#ff4b4b" />
      <circle cx={0} cy={11} r={10} fill="#ff4b4b" opacity={0.25} />
      <circle cx={0} cy={27} r={6} fill="#4d4a2a" />
      <circle cx={0} cy={43} r={6} fill="#24402c" />
    </g>
  );
}

/** desenho de ultrapassagem: um carro passa o outro pela faixa da esquerda */
function ultrapassa(x: number, y: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <rect x={-24} y={-30} width={48} height={60} rx={6} fill="#4a5260" />
      <line x1={0} y1={-26} x2={0} y2={26} stroke="#f2c21b" strokeWidth={2.4} />
      <rect x={6} y={-6} width={11} height={18} rx={3} fill="#8f98a3" />
      <path d="M12 22 Q12 12 -11 6 L-11 -12" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
      <path d="M-15 -10 L-11 -18 L-7 -10 Z" fill="#fff" />
    </g>
  );
}

/** a régua do excesso de velocidade, em % acima do limite (0 a 80) */
const PX = (pc: number) => 22 + pc * 2.9;
const FAIXAS = [
  { de: 0, ate: 20, n: NAT[1] },
  { de: 20, ate: 50, n: NAT[2] },
  { de: 50, ate: 80, n: NAT[3] },
];
function regua(x: number, y: number, vis: (i: number) => number, dest: number | null, marca: number | null, o = 1): ReactNode {
  return quadro(x, y, 280, 104, o, (
    <>
      <text x={140} y={18} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={TINTA}>Acima da velocidade máxima</text>
      {FAIXAS.map((f, i) => {
        const a = vis(i);
        if (a < 0.01) return null;
        const on = dest === null || dest === i;
        return (
          <g key={f.n.nome} opacity={a * (on ? 1 : 0.35)}>
            <rect x={PX(f.de)} y={36} width={PX(f.ate) - PX(f.de)} height={dest === i ? 18 : 14} rx={3} fill={f.n.cor} />
            <text x={(PX(f.de) + PX(f.ate)) / 2} y={70} textAnchor="middle" fontSize={dest === i ? 12 : 10.5} fontWeight={800} fill={f.n.cor}>{f.n.nome}</text>
          </g>
        );
      })}
      {[['Limite', 0], ['+20%', 20], ['+50%', 50]].map(([t, pc]) => (
        <g key={t}>
          <line x1={PX(pc as number)} y1={30} x2={PX(pc as number)} y2={58} stroke={TINTA} strokeWidth={1.4} />
          <text x={PX(pc as number)} y={88} textAnchor="middle" fontSize={9} fontWeight={800} fill="#55606e">{t}</text>
        </g>
      ))}
      {marca !== null && (
        <g transform={`translate(${PX(marca)} 30)`}>
          <path d="M-6 -10 L6 -10 L0 0 Z" fill={TINTA} />
        </g>
      )}
    </>
  ));
}

const ONDE = ['Curva sem visibilidade', 'Subida sem visibilidade', 'Faixa de pedestres', 'Ponte, viaduto ou túnel', 'Linha amarela contínua'];

function trecho(k: number, lt: number): Quadro {
  const q = ruaFundo(lt);
  switch (k) {
    // 0. três infrações que caem muito: velocidade, sinal vermelho, ultrapassagem
    case 0: {
      const it = [
        [placa('R-19', 70, 84, 50, surge(lt, 1.6), 60), 'Correr demais', 1.6],
        [semaforo(160, 52, 0.85, surge(lt, 2.8)), 'Avançar o vermelho', 2.8],
        [ultrapassa(250, 84, surge(lt, 4.2)), 'Ultrapassar onde não pode', 4.2],
      ] as const;
      return { ...q, over: () => (
        <>
          {escuro(0.45 * surge(lt, 0.8))}
          {it.map(([n, t, a], i) => (
            <g key={i}>{n}{chip([64, 160, 252][i], [134, 156, 134][i], t, TINTA, surge(lt, a as number), 8.6)}</g>
          ))}
        </>
      ) };
    }
    // 1. a conta é sobre a velocidade máxima da via
    case 1:
      return { ...q, over: () => (
        <>
          {placa('R-19', 264, 56, 56, surge(lt, 0.3), 60)}
          {chip(260, 104, 'Velocidade máxima', AZ, surge(lt, 1.6), 9.6)}
        </>
      ) };
    // 2 a 4. até 20% média, até 50% grave, mais de 50% gravíssima
    case 2:
    case 3:
    case 4: {
      const n = k - 2;
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {regua(20, 30, (i) => (i < n ? 1 : i === n ? surge(lt, 0.5) : 0), n, null)}
          {k === 4 && chip(110, 158, 'multa × 3', VM, surge(lt, 3.0), 11)}
          {k === 4 && chip(210, 158, 'suspensão', VM, surge(lt, 4.4), 11)}
        </>
      ) };
    }
    // 5. exemplo: 100 km/h numa via de 60
    case 5: {
      const v = Math.round(lerp(60, 100, ease((lt - 2.4) / 1.6)));
      const pc = ((v - 60) / 60) * 100;
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {placa('R-19', 48, 40, 40, surge(lt, 0.5), 60)}
          {quadro(76, 22, 100, 38, surge(lt, 1.6), (
            <text x={50} y={26} textAnchor="middle" fontSize={17} fontWeight={900} fill={v >= 100 ? VM : TINTA}>{v} km/h</text>
          ))}
          {regua(20, 72, () => 1, v > 90 ? 2 : null, surge(lt, 2.2) > 0.5 ? clamp(pc / 80) * 80 : null, surge(lt, 2.0))}
          {chip(160, 188, 'Gravíssima + suspensão', VM, surge(lt, 5.4), 10)}
        </>
      ) };
    }
    // 6. avançar o sinal vermelho ou a parada obrigatória
    case 6:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {semaforo(100, 40, 1.1, surge(lt, 0.5))}
          {placa('R-1', 200, 74, 56, surge(lt, 1.6))}
          {chip(160, 150, 'Avançar: gravíssima', VM, surge(lt, 2.8), 11)}
        </>
      ) };
    // 7. ultrapassar pela contramão em lugares perigosos: gravíssima × 5
    case 7: {
      const yv = 4 - 2.2 * lt;
      const xv = lerp(XV, -1.75, ease((lt - 0.6) / 1.2));
      const qq = ruaFundo(lt, [utilitario({ x: XV, y: yv - 7 + 1.2 * lt, tipo: 'caminhao' })], 4, xv);
      return { ...qq, over: () => (
        <>
          {chip(160, 24, 'Contramão em lugar perigoso', TINTA, surge(lt, 1.8), 10)}
          {chip(130, 48, 'Gravíssima', VM, surge(lt, 3.4), 11)}
          {chip(200, 48, '× 5', '#fff', surge(lt, 4.4), 13, VM)}
        </>
      ) };
    }
    // 8 e 9. onde
    case 8:
    case 9: {
      const a = k === 8 ? [0.6, 1.4, 2.6, 99, 99] : [-1, -1, -1, 0.6, 2.4];
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(40, 26, 240, 148, k === 8 ? surge(lt, 0) : 1, (
            <>
              <text x={120} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={VM}>Ultrapassar pela contramão: × 5</text>
              {ONDE.map((t, i) => <g key={t}>{item(20, 50 + i * 22, t, VM, a[i] < 0 ? 1 : surge(lt, a[i]), 10.5)}</g>)}
            </>
          ))}
        </>
      ) };
    }
    // 10. para guardar
    default:
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {regua(20, 52, (i) => surge(lt, [0.8, 2.6, 4.2][i]), null, null)}
        </>
      ) };
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

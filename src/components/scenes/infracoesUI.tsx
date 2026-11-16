/**
 * Peças desenhadas na tela (pixels, quadro de 320 x 200) para os vídeos do Mundo 4 (16/11/2026):
 * as quatro naturezas, a CNH com os pontos, o papel da multa, etiquetas e carimbos.
 */
import type { ReactNode } from 'react';
import { camLook } from './engine';
import { car } from './models';
import { RA, VOCE, ease, ruaChao, ruaObjs, type Quadro } from './videoBase';

export const TINTA = '#1d2430';

/** as quatro naturezas (CTB art. 258), na ordem */
export const NAT = [
  { nome: 'Leve', cor: '#38a86f', valor: 'R$ 88,38', pts: 3 },
  { nome: 'Média', cor: '#d9a21b', valor: 'R$ 130,16', pts: 4 },
  { nome: 'Grave', cor: '#ea7b2c', valor: 'R$ 195,23', pts: 5 },
  { nome: 'Gravíssima', cor: '#d93a35', valor: 'R$ 293,47', pts: 7 },
] as const;

/** surge (0 → 1) a partir de `a` segundos */
export const surge = (lt: number, a: number, f = 0.35) => ease((lt - a) / f);

/** etiqueta colorida com texto branco, centrada em (x, y) */
export function chip(x: number, y: number, text: string, cor: string, o = 1, fs = 9, txt = '#fff'): ReactNode {
  if (o < 0.01) return null;
  const w = text.length * fs * 0.58 + 14;
  const h = fs + 9;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2} fill={cor} stroke="#0003" />
      <text x={x} y={y + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={800} fill={txt}>{text}</text>
    </g>
  );
}

/** cartão branco com sombra (fundo de listas e tabelas) */
export function quadro(x: number, y: number, w: number, h: number, o = 1, children?: ReactNode): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={9} fill="#0004" />
      <rect x={x} y={y} width={w} height={h} rx={9} fill="#ffffff" />
      <g transform={`translate(${x} ${y})`}>{children}</g>
    </g>
  );
}

/** bolinhas dos pontos, centradas em (x, y) */
export function bolinhas(x: number, y: number, n: number, cor: string, r = 2.6, o = 1): ReactNode {
  const gap = r * 2.6;
  const x0 = x - ((n - 1) * gap) / 2;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => <circle key={i} cx={x0 + i * gap} cy={y} r={r} fill={cor} />)}
    </g>
  );
}

/**
 * As quatro naturezas lado a lado, na faixa de baixo da tela.
 * `vis(i)`: opacidade de cada coluna; `dest`: coluna em destaque (as outras ficam apagadas);
 * `info`: mostra o valor da multa e os pontos.
 */
export function naturezas(vis: (i: number) => number, dest: number | null, info: (i: number) => number, y = 116): ReactNode {
  const w = 70, gap = 6, x0 = (320 - (4 * w + 3 * gap)) / 2;
  return (
    <g>
      {NAT.map((n, i) => {
        const a = vis(i);
        if (a < 0.01) return null;
        const x = x0 + i * (w + gap);
        const dim = dest === null || dest === i ? 1 : 0.4;
        const up = dest === i ? -6 : 0;
        const h = 22 + 40 * info(i) + 6 * i;
        const yy = y + 62 - h + up;
        return (
          <g key={n.nome} opacity={a * dim}>
            <rect x={x + 1.5} y={yy + 2.5} width={w} height={h} rx={7} fill="#0004" />
            <rect x={x} y={yy} width={w} height={h} rx={7} fill="#fff" stroke={dest === i ? n.cor : 'none'} strokeWidth={2.4} />
            <rect x={x} y={yy} width={w} height={17} rx={7} fill={n.cor} />
            <rect x={x} y={yy + 10} width={w} height={7} fill={n.cor} />
            <text x={x + w / 2} y={yy + 12.2} textAnchor="middle" fontSize={n.nome.length > 6 ? 8.6 : 9.6} fontWeight={800} fill="#fff">{n.nome}</text>
            <g opacity={info(i)}>
              <text x={x + w / 2} y={yy + 31} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={TINTA}>{n.valor}</text>
              {bolinhas(x + w / 2, yy + 41, n.pts, n.cor, 2.3)}
              <text x={x + w / 2} y={yy + 54} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#55606e">{n.pts} pontos</text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** a CNH (carteira) em pixels, com o contador de pontos no canto e um carimbo opcional */
export function cnh(x: number, y: number, s: number, pontos: number | null, o = 1, carimbo?: { text: string; cor: string; k: number }): ReactNode {
  if (o < 0.01) return null;
  const w = 76 * s, h = 50 * s;
  return (
    <g opacity={o}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={5 * s} fill="#0004" />
      <rect x={x} y={y} width={w} height={h} rx={5 * s} fill="#cfe7c4" stroke="#7fae73" strokeWidth={1} />
      <rect x={x} y={y} width={w} height={11 * s} rx={5 * s} fill="#2f8f5b" />
      <rect x={x} y={y + 6 * s} width={w} height={5 * s} fill="#2f8f5b" />
      <text x={x + 6 * s} y={y + 8.4 * s} fontSize={7 * s} fontWeight={800} fill="#fff">CNH</text>
      <rect x={x + 6 * s} y={y + 15 * s} width={17 * s} height={21 * s} rx={2 * s} fill="#9fb8c9" />
      <circle cx={x + 14.5 * s} cy={y + 22 * s} r={4.2 * s} fill="#e8c4a0" />
      <rect x={x + 8.5 * s} y={y + 28 * s} width={12 * s} height={8 * s} rx={3 * s} fill="#3c5a7a" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={x + 28 * s} y={y + (17 + i * 6) * s} width={(i % 2 ? 26 : 38) * s} height={2.6 * s} rx={1.3 * s} fill="#7fae73" />
      ))}
      {pontos !== null && (
        <g>
          <circle cx={x + w - 2 * s} cy={y + h - 2 * s} r={11 * s} fill="#fff" stroke={TINTA} strokeWidth={1.4} />
          <text x={x + w - 2 * s} y={y + h - 0.6 * s} textAnchor="middle" fontSize={10 * s} fontWeight={800} fill={TINTA}>{pontos}</text>
          <text x={x + w - 2 * s} y={y + h + 5.6 * s} textAnchor="middle" fontSize={4.6 * s} fontWeight={800} fill={TINTA}>pontos</text>
        </g>
      )}
      {carimbo && carimbo.k > 0.01 && (
        <g opacity={carimbo.k} transform={`rotate(-12 ${x + w / 2} ${y + h / 2})`}>
          <rect x={x + w / 2 - 34 * s} y={y + h / 2 - 9 * s} width={68 * s} height={18 * s} rx={3 * s} fill="#fff" fillOpacity={0.85} stroke={carimbo.cor} strokeWidth={2.2} />
          <text x={x + w / 2} y={y + h / 2 + 4 * s} textAnchor="middle" fontSize={11 * s} fontWeight={900} fill={carimbo.cor}>{carimbo.text}</text>
        </g>
      )}
    </g>
  );
}

/** o papel de uma notificação (multa ou advertência), com título e linhas */
export function papel(x: number, y: number, s: number, titulo: string, cor: string, o = 1, extra?: string): ReactNode {
  if (o < 0.01) return null;
  const w = 58 * s, h = 70 * s;
  return (
    <g opacity={o}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={3 * s} fill="#0004" />
      <rect x={x} y={y} width={w} height={h} rx={3 * s} fill="#fdfcf7" />
      <rect x={x} y={y} width={w} height={13 * s} rx={3 * s} fill={cor} />
      <text x={x + w / 2} y={y + 9.2 * s} textAnchor="middle" fontSize={(titulo.length > 9 ? 6.4 : 8) * s} fontWeight={800} fill="#fff">{titulo}</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 6 * s} y={y + (20 + i * 7) * s} width={(i % 2 ? 34 : 46) * s} height={2.4 * s} rx={1.2 * s} fill="#c9ced6" />
      ))}
      {extra && <text x={x + w / 2} y={y + 63 * s} textAnchor="middle" fontSize={8.4 * s} fontWeight={800} fill={cor}>{extra}</text>}
    </g>
  );
}

/** carimbo inclinado */
export function carimbo(x: number, y: number, text: string, cor: string, o = 1, fs = 12): ReactNode {
  if (o < 0.01) return null;
  const w = text.length * fs * 0.62 + 16;
  const k = 1.25 - 0.25 * o;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(-10) scale(${k})`}>
      <rect x={-w / 2} y={-fs * 0.95} width={w} height={fs * 1.9} rx={4} fill="#fff" fillOpacity={0.9} stroke={cor} strokeWidth={2.4} />
      <text x={0} y={fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight={900} fill={cor}>{text}</text>
    </g>
  );
}

/** calendário pequeno com um texto (ex.: "12 meses") */
export function calendario(x: number, y: number, text: string, o = 1, s = 1): ReactNode {
  if (o < 0.01) return null;
  const w = 46 * s, h = 42 * s;
  return (
    <g opacity={o}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={5 * s} fill="#0004" />
      <rect x={x} y={y} width={w} height={h} rx={5 * s} fill="#fff" />
      <rect x={x} y={y} width={w} height={11 * s} rx={5 * s} fill="#d93a35" />
      <rect x={x} y={y + 6 * s} width={w} height={5 * s} fill="#d93a35" />
      {[0, 1].map((i) => <rect key={i} x={x + (11 + i * 20) * s} y={y - 3 * s} width={3.4 * s} height={7 * s} rx={1.5 * s} fill={TINTA} />)}
      <text x={x + w / 2} y={y + 29 * s} textAnchor="middle" fontSize={(text.length > 7 ? 8.6 : 11) * s} fontWeight={800} fill={TINTA}>{text}</text>
    </g>
  );
}

/** marca de certo (verde) em pixels */
export function visto(x: number, y: number, o = 1, r = 8): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="#2fa36b" stroke="#fff" strokeWidth={1.6} />
      <path d={`M${x - r * 0.45} ${y} l${r * 0.32} ${r * 0.34} l${r * 0.62} ${-r * 0.7}`} fill="none" stroke="#fff" strokeWidth={r * 0.28} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** um item de lista: bolinha colorida + texto, alinhado à esquerda em (x, y) */
export function item(x: number, y: number, text: string, cor: string, o = 1, fs = 10): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <circle cx={x + 5} cy={y - fs * 0.34} r={4.2} fill={cor} />
      <text x={x + 14} y={y} fontSize={fs} fontWeight={800} fill={TINTA}>{text}</text>
    </g>
  );
}

/** cartão-resumo com título colorido e uma frase */
export function etiqueta(x: number, y: number, w: number, titulo: string, frase: string, cor: string, o = 1): ReactNode {
  return quadro(x, y, w, 48, o, (
    <>
      <rect x={0} y={0} width={w} height={20} rx={9} fill={cor} />
      <rect x={0} y={12} width={w} height={8} fill={cor} />
      <text x={w / 2} y={14} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#fff">{titulo}</text>
      <text x={w / 2} y={37} textAnchor="middle" fontSize={frase.length > 20 ? 9.4 : 11} fontWeight={800} fill={TINTA}>{frase}</text>
    </>
  ));
}

/** martelo de juiz (pixels), centrado em (x, y) */
export function martelo(x: number, y: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <rect x={-26} y={20} width={52} height={8} rx={3} fill="#8a5a3c" />
      <g transform="rotate(-35)">
        <rect x={-3} y={-6} width={6} height={36} rx={2} fill="#b07a55" />
        <rect x={-15} y={-18} width={30} height={14} rx={3} fill="#8a5a3c" />
        <rect x={-15} y={-14} width={4} height={6} fill="#6e4630" />
        <rect x={11} y={-14} width={4} height={6} fill="#6e4630" />
      </g>
    </g>
  );
}


/** cápsula de remédio/droga (pixels), centrada em (x, y) */
export function pilula(x: number, y: number, o = 1, s = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(-35) scale(${s})`}>
      <rect x={-18} y={-8} width={36} height={16} rx={8} fill="#f4f1e6" stroke="#0003" />
      <path d="M0 -8 L10 -8 A8 8 0 0 1 10 8 L0 8 Z" fill="#7a3fb0" />
    </g>
  );
}

/** grades de prisão (pixels), canto em (x, y), 44 x 50 */
export function grade(x: number, y: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={44} height={50} rx={4} fill="#3b4250" />
      {[8, 18, 28, 38].map((bx) => <rect key={bx} x={bx - 2} y={2} width={4} height={46} rx={2} fill="#c9ced4" />)}
      <rect x={0} y={20} width={44} height={4} fill="#c9ced4" />
    </g>
  );
}

/** taça de vinho (pixels), centrada em (x, y) */
export function taca(x: number, y: number, o = 1, s = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-12 -24 L12 -24 Q12 0 0 2 Q-12 0 -12 -24 Z" fill="#eef3f8" stroke="#9aa5b1" strokeWidth={1.4} />
      <path d="M-11 -14 L11 -14 Q10 0 0 1 Q-10 0 -11 -14 Z" fill="#8e1f3a" />
      <rect x={-1.5} y={2} width={3} height={18} fill="#9aa5b1" />
      <rect x={-10} y={19} width={20} height={4} rx={2} fill="#9aa5b1" />
    </g>
  );
}

/** um "não": círculo vermelho cortado, centrado em (x, y) */
export function nao(x: number, y: number, r: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  const d = r * 0.7;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#d93a35" strokeWidth={r * 0.16} />
      <line x1={x - d} y1={y - d} x2={x + d} y2={y + d} stroke="#d93a35" strokeWidth={r * 0.16} />
    </g>
  );
}

/** envelope (pixels), canto em (x, y), 64 x 42 vezes `s`, com uma faixa colorida e um rótulo embaixo */
export function envelope(x: number, y: number, s: number, cor: string, o = 1, rotulo?: string): ReactNode {
  if (o < 0.01) return null;
  const w = 64 * s, h = 42 * s;
  return (
    <g opacity={o}>
      <rect x={x + 1.5} y={y + 2.5} width={w} height={h} rx={4 * s} fill="#0004" />
      <rect x={x} y={y} width={w} height={h} rx={4 * s} fill="#fdfcf7" />
      <path d={`M${x + 2 * s} ${y + 3 * s} L${x + w / 2} ${y + h * 0.58} L${x + w - 2 * s} ${y + 3 * s}`} fill="none" stroke="#c9ced6" strokeWidth={2 * s} strokeLinejoin="round" />
      <rect x={x + w - 18 * s} y={y + h - 12 * s} width={13 * s} height={8 * s} rx={1.5 * s} fill={cor} />
      {rotulo && <text x={x + w / 2} y={y + h + 13 * s} textAnchor="middle" fontSize={9 * s} fontWeight={800} fill="#fff" stroke="#0008" strokeWidth={2.6} paintOrder="stroke">{rotulo}</text>}
    </g>
  );
}

/** chave de carro (pixels), centrada em (x, y) */
export function chave(x: number, y: number, o = 1, s = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(-30) scale(${s})`}>
      <rect x={-22} y={-11} width={22} height={22} rx={7} fill="#2b3340" />
      <circle cx={-15} cy={0} r={3} fill="#fdfcf7" />
      <rect x={0} y={-3} width={24} height={6} rx={2} fill="#b9c2cc" />
      <rect x={14} y={3} width={3} height={4} fill="#b9c2cc" />
      <rect x={20} y={3} width={3} height={5} fill="#b9c2cc" />
    </g>
  );
}

/** seta simples (pixels) de (x1, y1) até (x2, y2), na cor `cor` */
export function seta(x1: number, y1: number, x2: number, y2: number, o = 1, cor = '#fff'): ReactNode {
  if (o < 0.01) return null;
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (d: number, da: number) => `${x2 - d * Math.cos(a + da)} ${y2 - d * Math.sin(a + da)}`;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - 4 * Math.cos(a)} y2={y2 - 4 * Math.sin(a)} stroke={cor} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${x2} ${y2} L${p(9, 0.5)} L${p(9, -0.5)} Z`} fill={cor} />
    </g>
  );
}

/* ---------------- fundo de rua para os quadros com painel ---------------- */

const RUA = ruaChao();
const RUA_OBJS = ruaObjs(6);

/** rua de mão dupla com o seu carro andando devagar; a câmera fica alta para sobrar espaço embaixo */
export function ruaFundo(lt: number, extra: Quadro['objs'] = [], y0 = 4, xv = RA - 1.65): Quadro {
  const yv = y0 - 2.2 * lt;
  return {
    cam: camLook(1.6, yv - 7, 0, 16, 44, 9),
    ground: RUA,
    objs: [...RUA_OBJS, car({ x: xv, y: yv, color: VOCE }), ...extra],
  };
}

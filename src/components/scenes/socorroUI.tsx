/**
 * Peças comuns dos vídeos dos cartões do Mundo 6 ("Emergências e primeiros socorros"), a partir de 18/11/2026.
 * O local do sinistro na estrada, as pessoas que ajudam, a lista dos 6 passos, o cartão de telefone e o celular.
 */
import type { ReactNode } from 'react';
import { box, camLook, type Obj, type Part, type V3 } from './engine';
import { person, type Arms, type Look } from './models';
import { campo, estrada } from './Mundo2';
import { carroBatido } from './Mundo6';
import { TINTA, chip, quadro } from './infracoesUI';
import { type Pr, type Quadro } from './videoBase';

export { SENHOR, MOCO } from './Mundo6';
export { MOCA, RAPAZ, SENHORA, MENINO } from './Mundo3';

export const AZ = '#2f6db5';
export const VERDE = '#2fa36b';
export const LARANJA = '#ea7b2c';
export const VERM = '#d93a35';
export const CINZA = '#8a96a6';

/** onde fica o carro batido (faixa da direita da estrada) */
export const XB = 1.9, YB = -12;
export const BATIDO = (cor = '#4f7fc4', heading = 0.55) => carroBatido(XB, YB, heading, cor, 4);

const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);

/** a estrada de mão dupla com a câmera olhando para (x, yc); `s` = zoom */
export function local(yc: number, s: number, objs: Obj[], over?: Quadro['over'], chao: Part[] = [], x = 1.6, yaw = 14): Quadro {
  return { cam: camLook(x, yc, 0, yaw, 40, s), ground: [...ESTRADA, ...chao], objs: [...CAMPO, ...objs], over };
}

/** braços de quem fala ao telefone (mão direita na orelha) */
export const TEL: Arms = { r: [0.35, 2.75] };
/** braço erguido acenando (sinalizando, ou chamando) */
export const ACENA = (lt: number): Arms => ({ r: [1.2 + 0.35 * Math.sin(lt * 9), 2.6] });
/** braço apontando para a frente */
export const APONTA: Arms = { r: [0.2, 1.55] };

/** pessoa andando de (x0, y0) a (x1, y1) entre a e b segundos; depois para */
export function anda(lt: number, look: Look, x0: number, y0: number, x1: number, y1: number, a: number, b: number, s = 1.25, arms?: Arms): Obj {
  const k = Math.max(0, Math.min(1, (lt - a) / (b - a)));
  const andando = k > 0 && k < 1;
  const face = Math.atan2(x1 - x0, -(y1 - y0));
  return person(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k, look, andando ? lt * 9 : 0, face, s, arms);
}

/** topo da cabeça de uma pessoa de escala `s` em (x, y) */
export const cabeca = (x: number, y: number, s = 1.25): V3 => [x, y, 1.62 * (s / 1.12)];

/** celular pequeno na orelha (pixels), preso à cabeça */
export function fone(pr: Pr, x: number, y: number, s = 1.25, o = 1): ReactNode {
  if (o < 0.01) return null;
  const [hx, hy] = pr([x + 0.2, y, 1.45 * (s / 1.12)]);
  return <rect x={hx - 1.6} y={hy - 3.4} width={3.2} height={6} rx={1} fill="#1d2430" stroke="#fff" strokeWidth={0.6} opacity={o} />;
}

/** os 6 passos da sequência do socorro */
export const PASSOS = ['Calma', 'Segurança', 'Pedir socorro', 'Controlar', 'Ver as vítimas', 'Ações com as vítimas'];

/** lista dos passos num cartão branco: mostra `n` itens (pode ser fracionário) e destaca os de `ativo` */
export function passos(n: number, ativo: number[], o = 1, x = 8, y = 22): ReactNode {
  if (o < 0.01) return null;
  return quadro(x, y, 144, 152, o, (
    <>
      {PASSOS.map((p, i) => {
        const v = Math.max(0, Math.min(1, n - i));
        if (v < 0.01) return null;
        const on = ativo.includes(i);
        return (
          <g key={i} opacity={on || ativo.length === 0 ? v : 0.45 * v}>
            <circle cx={16} cy={18 + i * 23} r={9} fill={on ? AZ : CINZA} />
            <text x={16} y={21.5 + i * 23} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">{i + 1}</text>
            <text x={30} y={22 + i * 23} fontSize={on ? 10.5 : 10} fontWeight={800} fill={TINTA}>{p}</text>
          </g>
        );
      })}
    </>
  ));
}

/** cartão do telefone de emergência: número grande e quem atende */
export function numero(x: number, y: number, num: string, nome: string, cor: string, o = 1, s = 1): ReactNode {
  if (o < 0.01) return null;
  const w = 112 * s, h = 58 * s;
  return (
    <g opacity={o}>
      <rect x={x - w / 2 + 1.5} y={y - h / 2 + 2.5} width={w} height={h} rx={10 * s} fill="#0004" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10 * s} fill="#fff" />
      <path d={`M${x - w / 2} ${y - h / 2 + 10 * s} Q${x - w / 2} ${y - h / 2} ${x - w / 2 + 10 * s} ${y - h / 2} L${x + w / 2 - 10 * s} ${y - h / 2} Q${x + w / 2} ${y - h / 2} ${x + w / 2} ${y - h / 2 + 10 * s} L${x + w / 2} ${y + 4 * s} L${x - w / 2} ${y + 4 * s} Z`} fill={cor} />
      {gancho(x - w / 2 + 15 * s, y - 9 * s, 0.8 * s, '#fff')}
      <text x={x + 9 * s} y={y - 2 * s} textAnchor="middle" fontSize={27 * s} fontWeight={900} fill="#fff">{num}</text>
      <text x={x} y={y + 19 * s} textAnchor="middle" fontSize={11 * s} fontWeight={800} fill={TINTA}>{nome}</text>
    </g>
  );
}

/** desenho do fone de gancho (pixels), centrado em (x, y) */
export function gancho(x: number, y: number, s = 1, cor = TINTA): ReactNode {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s}) rotate(-20)`}
      d="M-9 -6 Q-11 -10 -7 -11 L-4 -11 Q-2 -11 -2 -8 L-2 -5 Q-2 -3 -4 -2.5 Q-3 2 2 4 Q3 2 5 2 L8 2 Q11 2 11 4 L11 7 Q11 10 8 10 Q-8 9 -9 -6 Z"
      fill={cor}
    />
  );
}

/** celular grande (pixels) com duas linhas na tela */
export function celular(x: number, y: number, l1: string, l2: string, o = 1, cor = VERDE, s = 1): ReactNode {
  if (o < 0.01) return null;
  const w = 64 * s, h = 112 * s;
  return (
    <g opacity={o}>
      <rect x={x - w / 2 + 2} y={y - h / 2 + 3} width={w} height={h} rx={10 * s} fill="#0005" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10 * s} fill="#1d2430" />
      <rect x={x - w / 2 + 4 * s} y={y - h / 2 + 10 * s} width={w - 8 * s} height={h - 22 * s} rx={4 * s} fill="#f4f7fa" />
      <rect x={x - 8 * s} y={y - h / 2 + 4 * s} width={16 * s} height={2.4 * s} rx={1.2} fill="#3a4554" />
      <text x={x} y={y - 18 * s} textAnchor="middle" fontSize={8 * s} fontWeight={800} fill={CINZA}>{l1}</text>
      <text x={x} y={y + 2 * s} textAnchor="middle" fontSize={(l2.length > 6 ? 9 : 17) * s} fontWeight={900} fill={TINTA}>{l2}</text>
      <circle cx={x} cy={y + 28 * s} r={11 * s} fill={cor} />
      {gancho(x, y + 28 * s, 0.62 * s, '#fff')}
    </g>
  );
}

/** anel que cresce e encolhe: respirar fundo */
export function respiro(x: number, y: number, lt: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  const k = 0.5 - 0.5 * Math.cos(lt * 1.6);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={18 + 12 * k} fill="#5aa0ff" opacity={0.18} />
      <circle cx={x} cy={y} r={12 + 9 * k} fill="none" stroke="#5aa0ff" strokeWidth={2.4} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">{k > 0.5 ? 'inspira' : 'solta'}</text>
    </g>
  );
}

/** linha do tempo com blocos coloridos (pixels): [rótulo, cor, início, fim] em frações da largura */
export function faixaTempo(x: number, y: number, w: number, blocos: [string, string, number, number][], k: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 4} y={y - 14} width={w + 8} height={28} rx={8} fill="#ffffffe6" />
      {blocos.map(([t, c, a, b], i) => {
        const fim = Math.min(b, k);
        if (fim <= a) return null;
        return (
          <g key={i}>
            <rect x={x + a * w} y={y - 9} width={(fim - a) * w - 1.5} height={18} rx={5} fill={c} />
            {fim - a > 0.12 && <text x={x + (a + (fim - a) / 2) * w} y={y + 3.4} textAnchor="middle" fontSize={8.5} fontWeight={800} fill="#fff">{t}</text>}
          </g>
        );
      })}
      <line x1={x + Math.min(k, 1) * w} y1={y - 13} x2={x + Math.min(k, 1) * w} y2={y + 13} stroke={TINTA} strokeWidth={1.6} />
    </g>
  );
}

/** telefone de emergência laranja num poste, no acostamento */
export function telefonePoste(x: number, y: number): Obj {
  return {
    parts: [
      box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, 1.1, '#9aa3ad'),
      box(x - 0.28, y - 0.2, 1.0, x + 0.28, y + 0.2, 1.75, (k) => (k === 'top' ? '#f59a3c' : k === 's' ? '#ea7b2c' : k === 'w' ? '#f08a2c' : '#d86a1c')),
      box(x - 0.29, y - 0.12, 1.15, x - 0.27, y + 0.12, 1.6, '#3a4554'),
      box(x - 0.36, y - 0.26, 1.75, x + 0.36, y + 0.26, 1.82, '#c8601c'),
    ],
    shadow: true,
  };
}

/** placa azul de beira de estrada, de frente para quem vem do sul (o desenho é feito em pixels por cima) */
export function placaEstrada(x: number, y: number, w = 2.6, h = 1.5, z = 1.4): Obj {
  return {
    parts: [
      box(x - w / 2 + 0.15, y - 0.05, 0, x - w / 2 + 0.25, y + 0.05, z, '#9aa3ad'),
      box(x + w / 2 - 0.25, y - 0.05, 0, x + w / 2 - 0.15, y + 0.05, z, '#9aa3ad'),
      box(x - w / 2, y - 0.04, z, x + w / 2, y + 0.06, z + h, (k) => (k === 'top' ? '#1f5c9e' : k === 's' ? '#2265ad' : '#1b4f88')),
    ],
    shadow: true,
  };
}

/** desenho da placa de telefone de emergência na face sul da placa (pixels) */
export function faceTelefone(pr: Pr, x: number, y: number, w = 2.6, h = 1.5, z = 1.4, o = 1): ReactNode {
  if (o < 0.01) return null;
  const [ax, ay] = pr([x - w / 2 + 0.12, y + 0.07, z + h - 0.12]);
  const [bx, by] = pr([x + w / 2 - 0.12, y + 0.07, z + 0.12]);
  const cx = (ax + bx) / 2, cy = (ay + by) / 2, ww = Math.abs(bx - ax);
  const k = ww / 100;
  return (
    <g opacity={o}>
      <rect x={cx - 46 * k} y={cy - 13 * k} width={26 * k} height={26 * k} rx={5 * k} fill="#fff" />
      {gancho(cx - 33 * k, cy, 0.85 * k, '#2265ad')}
      <text x={cx + 14 * k} y={cy - 2 * k} textAnchor="middle" fontSize={10.5 * k} fontWeight={900} fill="#fff">TELEFONE DE</text>
      <text x={cx + 14 * k} y={cy + 11 * k} textAnchor="middle" fontSize={10.5 * k} fontWeight={900} fill="#fff">EMERGÊNCIA</text>
    </g>
  );
}

/** chip com um ponto de interrogação, para perguntar quem está ali */
export const pergunta = (pr: Pr, p: V3, text: string, o: number): ReactNode => {
  if (o < 0.01) return null;
  const [x, y] = pr(p);
  return chip(x, y - 10, text, AZ, o, 9);
};

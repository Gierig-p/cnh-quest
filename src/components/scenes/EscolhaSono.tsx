/**
 * Vídeo de escolha do sono de madrugada (w5-rua-3, 17/11/2026).
 * Introdução: quatro da manhã, estrada escura de mão dupla; um corte entra na cabine (a mesma `cabine`
 * de VideoPosicao.tsx, de noite) e a câmera chega perto do rosto: os olhos pesam e o motorista boceja.
 * A imagem para na pergunta ("O que você faz?").
 * Finais pelo ID da alternativa:
 *  a: liga o som alto (notas saindo do alto-falante); boceja de novo e a cena para.
 *  b (certa): seta para a direita, reduz, sai da pista e para num pátio iluminado; apaga os faróis;
 *     um corte mostra o motorista descansando (olhos fechados, "z").
 *  c: acelera na estrada (riscos de velocidade) e a cena para.
 *  d: abre a janela (vento entrando); boceja de novo e a cena para.
 * Nos errados, depois do aviso, um corte volta ao ponto da decisão e mostra o jeito seguro (igual ao b, mais curto).
 * Na estrada, a câmera acompanha o seu carro e a paisagem é que passa (igual a EscolhaDistancia).
 */
import type { ReactNode } from 'react';
import { Scene3D, box, camLook, rect, type Obj, type Part } from './engine';
import { bush, car, house, lampPost, tree } from './models';
import { estrada, noite } from './Mundo2';
import { clamp, ease, janela, lerp, luz, pisca, relogio, tag, VOCE, type Pr } from './videoBase';
import { cabine } from './VideoPosicao';
import { aviso, etiqueta, interroga, visto, xis } from './escolhaUI';
import tempos from '../../content/escolhas/w5-rua-3.json';

export type Parte = 'intro' | 'a' | 'b' | 'c' | 'd';
type Tempo = { dur: number; falas: { ini: number; fim: number }[] };
export const TEMPOS = tempos as Record<Parte, Tempo>;

/* ---------------- tempos ---------------- */

const V = 6; // velocidade na estrada (m/s de desenho)
const X = 1.75; // centro da sua faixa
/** a pergunta (última fala) */
export const T_DEC = TEMPOS.intro.falas[TEMPOS.intro.falas.length - 1].ini - 0.3;
/** corte da estrada para a cabine, logo antes de "os seus olhos pesam" */
const CAB = TEMPOS.intro.falas[2].ini - 0.4;
/** bocejo da introdução */
const BOCEJO = TEMPOS.intro.falas[2].ini + 1.2;
/** onde o carro estava na hora da decisão */
const S0 = V * T_DEC;

/** nos finais errados, o "jeito seguro" começa meio segundo antes da fala dele */
const corteDe = (p: Parte) => TEMPOS[p].falas[2].ini - 0.5;
export const CORTE: Record<Parte, number> = { intro: Infinity, a: corteDe('a'), b: Infinity, c: corteDe('c'), d: corteDe('d') };
/** a cena para (finais errados) */
export const CONGELA: Record<Parte, number> = { intro: T_DEC, a: 2.2, b: Infinity, c: 1.8, d: 2.2 };

/** jeito seguro: fim da freada (começa a curva), carro parado no pátio e corte para o descanso */
interface Ritmo {
  m1: number;
  fim: number;
  descansa: number;
}
const RITMO_B: Ritmo = { m1: 0.8, fim: 2.8, descansa: TEMPOS.b.falas[1].ini + 0.2 };
const ritmoCorte = (p: Parte): Ritmo => ({ m1: 0.5, fim: 2.0, descansa: TEMPOS[p].falas[3].ini - CORTE[p] + 0.1 });
const RITMO: Record<Parte, Ritmo> = { intro: RITMO_B, a: ritmoCorte('a'), b: RITMO_B, c: ritmoCorte('c'), d: ritmoCorte('d') };

/* ---------------- movimento ---------------- */

const V2 = 3; // velocidade ao começar a curva
const B1 = 3; // primeiro ponto de controle da curva (m à frente)

/** sobe e desce uma vez entre a e a + d */
const bump = (t: number, a: number, d: number) => Math.sin(Math.PI * clamp((t - a) / d));
/** olhos pesando: abre e fecha devagar, cada vez mais */
function sono(t: number): number {
  const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * Math.max(0, t - TEMPOS.intro.falas[2].ini)) / 2.0);
  return t < TEMPOS.intro.falas[2].ini ? 0.25 : 0.25 + 0.6 * w;
}

/** reduz, sai da pista por uma curva e para na vaga do pátio (s = ao longo da estrada) */
function caminho(s: number, r: Ritmo) {
  const PR = S0 + ((V + V2) / 2) * r.m1;
  if (s < r.m1) {
    const v = lerp(V, V2, s / r.m1);
    return { sC: S0 + ((V + v) / 2) * s, x: X, rumo: 0, PR };
  }
  const D = r.fim - r.m1;
  const tau = clamp((s - r.m1) / D);
  // começa na velocidade V2 e para devagar
  const c = (V2 * D) / (3 * B1);
  const u = c * tau + (3 - 2 * c) * tau * tau + (c - 2) * tau ** 3;
  const P: [number, number][] = [[PR, X], [PR + B1, X], [PR + 8, 5], [PR + 8, 11.8]];
  const m = 1 - u;
  const pos = (i: number) => m * m * m * P[0][i] + 3 * m * m * u * P[1][i] + 3 * m * u * u * P[2][i] + u * u * u * P[3][i];
  const der = (i: number) => 3 * m * m * (P[1][i] - P[0][i]) + 6 * m * u * (P[2][i] - P[1][i]) + 3 * u * u * (P[3][i] - P[2][i]);
  return { sC: pos(0), x: pos(1), rumo: u >= 1 ? Math.PI / 2 : Math.atan2(der(1), der(0)), PR };
}

interface Estado {
  vista: 'rua' | 'cabine';
  /** tempo do mundo (carros que vêm de frente) */
  W: number;
  sC: number;
  x: number;
  rumo: number;
  freio: boolean;
  seta: boolean;
  /** faróis acesos (0 a 1) */
  farol: number;
  /** quanto acelerou (riscos de velocidade) */
  veloz: number;
  /** pátio: posição ao longo da estrada onde começa a curva (null = sem pátio) */
  PR: number | null;
  /** cabine */
  zoom: number;
  olho: number;
  boca: number;
  vidro: number;
  lt: number;
  dorme: boolean;
  seg: boolean;
  s: number;
  r: Ritmo;
}

const BASE: Omit<Estado, 'vista' | 'W' | 'sC'> = {
  x: X, rumo: 0, freio: false, seta: false, farol: 1, veloz: 0, PR: null,
  zoom: 0, olho: 0.25, boca: 0, vidro: 0, lt: 0, dorme: false, seg: false, s: 0, r: RITMO_B,
};

function seguro(s: number, r: Ritmo): Estado {
  const c = caminho(s, r);
  const base = { ...BASE, W: T_DEC + s, sC: c.sC, PR: c.PR, seg: true, s, r };
  if (s >= r.descansa) return { ...base, vista: 'cabine', zoom: 0.45, olho: 1, lt: T_DEC + r.fim, dorme: true };
  return { ...base, vista: 'rua', x: c.x, rumo: c.rumo, freio: s > 0.15 && s < r.fim + 0.25, seta: s < r.fim + 0.1, farol: 1 - ease((s - r.fim - 0.25) / 0.4) };
}

function estado(parte: Parte, t: number): Estado {
  if (parte === 'intro') {
    if (t < CAB) return { ...BASE, vista: 'rua', W: t, sC: V * t };
    const tt = Math.min(t, T_DEC);
    const boca = bump(tt, BOCEJO, 1.9);
    return { ...BASE, vista: 'cabine', W: tt, sC: V * tt, zoom: ease((t - CAB - 0.2) / 1.6), olho: Math.max(sono(tt), 0.75 * boca), boca, lt: tt };
  }
  if (parte === 'b') return seguro(t, RITMO_B);
  if (t >= CORTE[parte]) return seguro(t - CORTE[parte], RITMO[parte]);
  const tt = Math.min(t, CONGELA[parte]);
  if (parte === 'c') {
    // acelera de V até 11 entre 0,2 s e 1,6 s
    const a = 5 / 1.4;
    const k = clamp((tt - 0.2) / 1.4) * 1.4;
    return { ...BASE, vista: 'rua', W: T_DEC + tt, sC: S0 + V * tt + (a / 2) * k * k + a * 1.4 * Math.max(0, tt - 1.6), veloz: clamp((tt - 0.2) / 1.4) };
  }
  // a e d: na cabine, a câmera recua um pouco e o bocejo volta
  const boca = bump(tt, 1.1, 2.0);
  return {
    ...BASE,
    vista: 'cabine',
    W: T_DEC + tt,
    sC: S0 + V * tt,
    zoom: 1 - 0.6 * ease(t / 0.9),
    olho: Math.max(sono(T_DEC + tt), 0.75 * boca),
    boca,
    vidro: parte === 'd' ? ease((tt - 0.2) / 1.0) : 0,
    lt: T_DEC + tt,
  };
}

/* ---------------- estrada ---------------- */

const CHAO = estrada('tracejada').slice(0, -1); // sem a linha do meio: o tracejado é desenhado andando

/** paisagem que passa (sC = onde está o seu carro); `vao` = trecho da direita sem cerca nem árvore (o pátio) */
function paisagem(sC: number, vao: [number, number] | null) {
  const y = (s: number) => -(s - sC);
  const dentro = (x: number, s: number) => vao !== null && x > 0 && s > vao[0] - 1 && s < vao[1] + 1;
  const chao: Part[] = [];
  const objs: Obj[] = [];
  for (let k = Math.floor((sC - 20) / 8); k * 8 < sC + 50; k++) chao.push(rect(-0.08, y(k * 8 + 3), 0.08, y(k * 8), '#f2c21b'));
  for (let k = Math.floor((sC - 20) / 4); k * 4 < sC + 50; k++)
    for (const x of [-9, 9]) if (!dentro(x, k * 4)) objs.push({ parts: [box(x - 0.06, y(k * 4) - 0.06, 0, x + 0.06, y(k * 4) + 0.06, 1.05, '#8a6a48')], shadow: true });
  const PER = 36;
  const enfeites: [number, number, 'arvore' | 'moita', number][] = [[-12.5, 4, 'arvore', 1], [13, 11, 'arvore', 3], [-14, 21, 'arvore', 2], [11, 27, 'moita', 2], [-10.5, 31, 'moita', 1], [15, 33, 'arvore', 4]];
  for (let k = Math.floor((sC - 25) / PER); k * PER < sC + 55; k++)
    for (const [x, d, tipo, sd] of enfeites) {
      const ss = k * PER + d;
      const yy = y(ss);
      if (yy < -45 || yy > 22 || dentro(x, ss)) continue;
      objs.push(tipo === 'arvore' ? tree(x, yy, 1.1, sd) : bush(x, yy, 0.9, sd));
    }
  // arames da cerca: contínuos (ficam parados), com a abertura do pátio
  for (const x of [-9, 9]) {
    const trechos: [number, number][] = x > 0 && vao ? [[-70, y(vao[1])], [y(vao[0]), 40]] : [[-70, 40]];
    for (const [a, b] of trechos) if (b > a) objs.push({ parts: [rect(x - 0.03, a, x + 0.03, b, '#8a6a48', 0.95), rect(x - 0.03, a, x + 0.03, b, '#8a6a48', 0.55)] });
  }
  return { chao, objs };
}

/** pátio iluminado à direita (parada de descanso): começa 1 m depois de PR e vai até PR + 15 */
function patio(PR: number, y: (s: number) => number) {
  const chao: Part[] = [rect(6, y(PR + 15), 17, y(PR + 1), '#5f666f')];
  for (const d of [2.75, 6.25, 9.75, 13.25]) chao.push(rect(9.6, y(PR + d) - 0.07, 14.2, y(PR + d) + 0.07, '#e9e9e4'));
  const objs: Obj[] = [
    car({ x: 11.8, y: y(PR + 11.5), heading: Math.PI / 2, color: '#8f98a3' }),
    lampPost(16, y(PR + 4.5), -1),
    lampPost(16, y(PR + 11.5), -1),
    house(18, y(PR + 13.5), 24, y(PR + 2.5), '#e8dcc0', '#7a4a3a', 'w'),
    // poste da placa de estacionamento na entrada (a placa é desenhada acesa, por cima da noite)
    { parts: [box(6.5, y(PR + 0.6) - 0.05, 0, 6.6, y(PR + 0.6) + 0.05, 2.2, '#c9cdd2')], shadow: true },
  ];
  return { chao, objs };
}

/** facho dos faróis no chão, virado para onde o carro aponta */
function fachoRumo(pr: Pr, x: number, y: number, rumo: number, o: number): ReactNode {
  if (o <= 0.01) return null;
  const f = [Math.sin(rumo), -Math.cos(rumo)];
  const r = [Math.cos(rumo), Math.sin(rumo)];
  const p = (a: number, b: number) => pr([x + f[0] * a + r[0] * b, y + f[1] * a + r[1] * b, 0]).map((v) => v.toFixed(1)).join(' ');
  return <path d={`M${p(2.1, -0.7)}L${p(2.1, 0.7)}L${p(13, 3)}L${p(13, -3)}Z`} fill="#fff4c8" opacity={o} />;
}

/** luzes do seu carro de noite: faróis, lanternas (mais fortes na freada) e a seta da direita */
function luzesCarro(pr: Pr, e: Estado, t: number): ReactNode {
  const f = [Math.sin(e.rumo), -Math.cos(e.rumo)];
  const r = [Math.cos(e.rumo), Math.sin(e.rumo)];
  const at = (a: number, b: number, z: number): [number, number, number] => [e.x + f[0] * a + r[0] * b, f[1] * a + r[1] * b, z];
  const seta = e.seta && pisca(t, 'r');
  return (
    <>
      {e.farol > 0.05 && [-0.6, 0.6].map((b) => luz(pr, at(2.15, b, 0.75), 1.5 * e.farol, '#fff6c8', `f${b}`))}
      {e.farol > 0.05 && [-0.6, 0.6].map((b) => luz(pr, at(-2.15, b, 0.75), e.freio ? 1.9 : 1.2, '#ff3b30', `l${b}`))}
      {seta && [2.0, -2.0].map((a) => luz(pr, at(a, 0.82, 0.72), 1.5, '#ffb020', `s${a}`))}
    </>
  );
}

/* ---------------- cabine ---------------- */

/** nota musical (pixels da cabine) */
const nota = (x: number, y: number, o: number, k: number): ReactNode => (
  <g key={k} opacity={o} fill="#ffd84a" stroke="#ffd84a">
    <ellipse cx={x} cy={y} rx={2.8} ry={2.1} transform={`rotate(-20 ${x} ${y})`} stroke="none" />
    <line x1={x + 2.5} y1={y - 0.5} x2={x + 2.5} y2={y - 11} strokeWidth={1.3} />
    <path d={`M${x + 2.5} ${y - 11} q4 2 4 6`} fill="none" strokeWidth={1.3} />
  </g>
);

function vistaCabine(e: Estado, parte: Parte, tt: number): ReactNode {
  const z = lerp(1, 1.6, e.zoom);
  const fx = lerp(160, 170, e.zoom);
  const fy = lerp(100, 92, e.zoom);
  const hx = 158.5;
  const hy = 70;
  return (
    <>
      <rect x={0} y={0} width={320} height={200} fill="#151a22" />
      <g transform={`translate(160 100) scale(${z.toFixed(3)}) translate(${-fx} ${-fy})`}>
        {cabine({ dobra: 1, apoio: 1, lt: e.lt, noite: true, parado: e.dorme, olho: e.olho, boca: e.boca, vidro: e.vidro })}
        {/* som alto: notas saindo do alto-falante da porta */}
        {parte === 'a' && !e.seg && [0, 1, 2].map((k) => {
          const ph = (tt * 0.7 + k / 3) % 1;
          return nota(162 + k * 9 + Math.sin(ph * 6) * 3, 150 - ph * 46, Math.sin(Math.PI * ph) * clamp((tt - 0.2) / 0.3), k);
        })}
        {/* descansando: "z" subindo da cabeça */}
        {e.dorme && [0, 1, 2].map((k) => {
          const ph = (e.s * 0.45 + k / 3) % 1;
          return (
            <text key={k} x={hx + 12 + ph * 14} y={hy - 12 - ph * 26} fontSize={7 + ph * 7} fontWeight={900} fill="#dfe8f3" opacity={Math.sin(Math.PI * ph)} fontFamily="Nunito, system-ui, sans-serif">z</text>
          );
        })}
      </g>
    </>
  );
}

/** som alto: chip com alto-falante e barras de volume no canto (pixels) */
function chipSom(o: number, t: number): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={10} y={44} width={74} height={24} rx={12} fill="#1d2430" opacity={0.85} />
      <path d="M19 52 h6 l5 -4 v16 l-5 -4 h-6 z" fill="#ffd84a" />
      {[0, 1, 2, 3, 4].map((k) => {
        const h = 4 + 10 * (0.5 + 0.5 * Math.sin(t * 9 + k * 1.7));
        return <rect key={k} x={38 + k * 8} y={63 - h} width={5} height={h} rx={1.5} fill="#ffd84a" />;
      })}
    </g>
  );
}

/** relógio das 4 da manhã no canto (pixels) */
function chipHora(o: number): ReactNode {
  if (o <= 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={10} y={44} width={74} height={24} rx={12} fill="#ffffff" opacity={0.95} />
      {relogio(23, 56, 4, 1, 8)}
      <text x={56} y={61} textAnchor="middle" fontSize={13} fontWeight={900} fill="#1d2430" fontFamily="Nunito, system-ui, sans-serif">04:00</text>
    </g>
  );
}

/** riscos de velocidade nas bordas (pixels) */
function riscos(k: number, t: number): ReactNode {
  if (k <= 0.01) return null;
  return (
    <g stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.55 * k}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const lado = i % 2 ? 1 : -1;
        const ph = (t * 2.2 + i * 0.37) % 1;
        const x = 160 + lado * (110 + ph * 40);
        const y = 60 + ph * 120 + (i % 3) * 8;
        return <line key={i} x1={x} y1={y} x2={x + lado * 8} y2={y + 22} />;
      })}
    </g>
  );
}

/* ---------------- quadro ---------------- */

const ETIQUETA: Record<'a' | 'c' | 'd', string> = { a: 'Som alto não tira o sono', c: 'Com sono, os reflexos ficam lentos', d: 'O vento não resolve o sono' };

/** quadro da cena: `parte` (introdução ou ID da alternativa) no tempo `t` dela */
export function Cena({ parte, t, id = 'eso' }: { parte: Parte; t: number; id?: string }) {
  const e = estado(parte, t);
  const congela = CONGELA[parte];
  const errado = parte === 'a' || parte === 'c' || parte === 'd';
  const tt = Math.min(t, congela);
  // cortes com escurecida rápida: estrada → cabine (introdução), erro → jeito seguro, pátio → descanso
  const bate = (a: number) => Math.max(0, 1 - Math.abs(t - a) / 0.18);
  const ini = parte === 'b' ? 0 : errado ? CORTE[parte] : Infinity;
  const corte = Math.max(parte === 'intro' ? bate(CAB) : 0, errado ? bate(CORTE[parte]) : 0, Number.isFinite(ini) ? bate(ini + e.r.descansa) : 0);

  const ui = (pr: Pr | null) => (
    <>
      {parte === 'intro' && (
        <>
          {pr && tag(pr, [X, 0.4, 2.2], 'Você', janela(t, 0, 2.2, 0.3))}
          {chipHora(janela(t, 0.4))}
          {aviso('O que você faz?', '#2f6fd6', ease((t - T_DEC) / 0.3), interroga, 'direita')}
        </>
      )}
      {parte === 'a' && !e.seg && chipSom(janela(t, 0.2), tt)}
      {parte === 'b' && aviso('Boa escolha', '#1f9d55', janela(t, 0.2, 2.4), visto)}
      {errado && t < CORTE[parte] && (
        <>
          {t >= congela && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.22} />}
          {t >= congela + 0.6 && etiqueta(ETIQUETA[parte])}
          {aviso('Essa escolha aumenta o perigo', '#d93a35', ease((t - congela) / 0.25), xis)}
        </>
      )}
      {errado && t >= CORTE[parte] && aviso('Jeito seguro', '#1f9d55', janela(e.s, 0.15, 2.3), visto)}
      {e.seg && e.vista === 'rua' && e.s >= e.r.fim && etiqueta('Parou fora da pista')}
      {e.seg && e.vista === 'cabine' && etiqueta('Descansa antes de seguir')}
      {corte > 0 && <rect x={0} y={0} width={320} height={200} fill="#0b1220" opacity={0.9 * corte} />}
    </>
  );

  if (e.vista === 'cabine') {
    return (
      <svg viewBox="0 0 320 200" width="100%" aria-hidden style={{ display: 'block' }}>
        {vistaCabine(e, parte, tt)}
        {ui(null)}
      </svg>
    );
  }

  const y = (s: number) => -(s - e.sC);
  const vao: [number, number] | null = e.PR !== null ? [e.PR + 1, e.PR + 15] : null;
  const pais = paisagem(e.sC, vao);
  const pat = e.PR !== null ? patio(e.PR, y) : null;
  const objs: Obj[] = [...pais.objs, ...(pat?.objs ?? [])];
  const vem: number[] = [];
  for (const s0 of [120, 260]) {
    const yo = y(s0 - 9 * e.W);
    if (yo > -60 && yo < 30) {
      vem.push(yo);
      objs.push(car({ x: -X, y: yo, heading: Math.PI, color: '#e0412f' }));
    }
  }
  objs.push(car({ x: e.x, y: 0, heading: e.rumo, color: VOCE, brake: e.freio }));
  const kx = clamp((e.x - X) / 10);
  const cam = camLook(lerp(1.0, 11, kx), lerp(-10.5, -4.5, kx), 0, 10, 38, 10, 160, 104);
  const postes: [number, number, number][] = e.PR !== null ? [[15, y(e.PR + 4.5), 4.3], [15, y(e.PR + 11.5), 4.3]] : [];

  return (
    <Scene3D
      id={id}
      cam={cam}
      ground={[...CHAO, ...pais.chao, ...(pat?.chao ?? [])]}
      objs={objs}
      overlay={(pr) => (
        <>
          {noite(id, pr, postes)}
          {e.PR !== null && postes.map((p, k) => {
            const [gx, gy] = pr([p[0] - 1.5, p[1], 0]);
            return <ellipse key={k} cx={gx} cy={gy} rx={50} ry={24} fill={`url(#${id}-poste)`} opacity={0.32} />;
          })}
          {vem.map((yo, k) => (
            <g key={k}>
              {fachoRumo(pr, -X, yo, Math.PI, 0.18)}
              {[-0.6, 0.6].map((b) => luz(pr, [-X + b, yo + 2.15, 0.75], 1.6, '#fff6c8', `v${k}${b}`))}
            </g>
          ))}
          {fachoRumo(pr, e.x, 0, e.rumo, 0.26 * e.farol)}
          {luzesCarro(pr, e, t)}
          {e.PR !== null && (() => {
            const [px, py] = pr([6.55, y(e.PR + 0.6), 2.5]);
            return (
              <g>
                <rect x={px - 7} y={py - 7} width={14} height={14} rx={2.5} fill="#2f6fd6" stroke="#ffffff" strokeWidth={1.2} />
                <text x={px} y={py + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffffff" fontFamily="Nunito, system-ui, sans-serif">P</text>
              </g>
            );
          })()}
          {e.PR !== null && tag(pr, [12, y(e.PR + 14.8), 0.6], 'Local seguro', ease((e.s - 0.4) / 0.4))}
          {riscos(e.veloz, tt)}
          {ui(pr)}
        </>
      )}
    />
  );
}

/** quadros parados (movimento reduzido): fim da introdução, a escolha e o jeito seguro */
export const QUADRO = {
  intro: T_DEC + 0.4,
  escolha: { a: CONGELA.a + 1.0, b: RITMO_B.descansa + 0.8, c: CONGELA.c + 1.0, d: CONGELA.d + 1.0 } as Record<string, number>,
  /** tempo dentro do final "b" que mostra o carro parado no pátio, fora da pista */
  seguro: RITMO_B.fim + 0.7,
};

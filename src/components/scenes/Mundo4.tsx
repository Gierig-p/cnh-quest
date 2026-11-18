/**
 * Cenas paradas do Mundo 4 ("Infrações e consequências") no estilo 3D (lote de 16/11/2026).
 * Mesmas regras dos outros mundos: a imagem mostra a situação do texto e nunca a resposta
 * (nada de multa, pontos, natureza da infração ou pena escritos na cena).
 * Câmera atrás de você, olhando para o norte. Os balões mostram o que não dá para ver de fora
 * (o interior do carro visto de cima, o bafômetro, a lata de cerveja).
 */
import type { ReactNode } from 'react';
import { Ry, Rz, Sc, T, box, camLook, chain, lathe, lines, rect, seg, subq, tfObj, type Obj, type Part, type V2, type V3 } from './engine';
import { asphalt, building, bush, car, grassPatches, house, lampPost, person, sidewalk, tree, type Look } from './models';
import { SignCallout, signPost, signTop } from './signs';
import { Tag } from './iso';
import { avenida, avenidaObjs, cena, voce, type CenaProps } from './Mundo1';
import { Balao, noite } from './Mundo2';
import { CAM as CAM_SEMAFORO, CY as CY_SEMAFORO, PARA, balaoLuz, chaoSemaforo, eu, objsSemaforo } from './cruzSemaforo';
import { MENINO, MOCA, RAPAZ, SENHORA } from './Mundo3';
import { AV, AV_OBJS, FX, facho, farolPar, moto, rastro } from './videoBase';

const VOCE = '#e9eef3';
export const AGENTE: Look = { skin: '#b07a55', hair: '#2b2420', top: '#2c4a7a', bottom: '#1f2c44', shoes: '#1d1d1d', cap: '#2c4a7a', vest: '#c8f03c', gloves: '#ffffff' };
const AGENTE2: Look = { ...AGENTE, skin: '#d7a77f', hair: '#5a3b25' };
const AMIGO: Look = { skin: '#8a5a3c', hair: '#1d1a18', top: '#2f80ed', bottom: '#33415a' };
const CRIANCA: Look = { skin: '#d7a77f', hair: '#7a4a25', top: '#f2c21b', bottom: '#2f4f7f', bag: '#e05a5a' };

/* ---------------- peças ---------------- */

/** cone de trânsito laranja, com faixa branca */
export function cone(x: number, y: number): Obj {
  const laranja = '#f26b1d';
  return {
    parts: [
      box(x - 0.24, y - 0.24, 0, x + 0.24, y + 0.24, 0.05, '#d4561a'),
      tfObj({ parts: [lathe([[0.19, 0.05], [0.14, 0.3], [0.115, 0.42], [0.05, 0.72], [0.03, 0.74]], 10, (i) => (i === 1 ? '#f4f1e6' : laranja))] }, T(x, y)).parts[0],
    ],
    shadow: true,
  };
}

/** agente de trânsito com o braço direito esticado para a frente, segurando o bafômetro */
export function agenteBafometro(x: number, y: number, face: number, s = 1.25): Obj[] {
  const a = person(0, 0, AGENTE, 0, 0, 1, { r: [0, 1.35], l: [0.08, 0] });
  // mão direita: ombro em (0,24; 0; 1,15), braço de 0,38 m girado 1,35 rad para a frente
  const hy = -0.38 * Math.sin(1.35), hz = 1.15 - 0.38 * Math.cos(1.35);
  const aparelho: Part[] = [
    box(0.17, hy - 0.2, hz - 0.03, 0.31, hy + 0.02, hz + 0.08, '#2b3340', (k, q) => (k === 'top' ? [{ p: subq(q, 0.15, 0.2, 0.85, 0.55), c: '#7fe0a0' }] : undefined)),
    seg([0.24, hy - 0.2, hz + 0.05], [0.24, hy - 0.32, hz + 0.1], 0.03, '#f4f1e6'),
  ];
  return [tfObj({ parts: [...a.parts, ...aparelho], shadow: true }, chain(T(x, y), Rz(face), Sc(s)))];
}

/** pessoa sentada no chão, com capacete, segurando a perna (motociclista depois da queda) */
export function motociclistaNoChao(x: number, y: number, face: number): Obj {
  const pele = '#c98a5e', jaqueta = '#3a3f47', calca = '#33415a';
  const parts: Part[] = [
    // pernas esticadas para a frente (−y); a direita um pouco dobrada
    box(-0.17, -0.75, 0, -0.04, 0.05, 0.14, calca),
    seg([0.1, 0.05, 0.08], [0.11, -0.32, 0.32], 0.14, calca),
    seg([0.11, -0.32, 0.32], [0.11, -0.7, 0.07], 0.13, calca),
    box(-0.18, -0.86, 0, -0.03, -0.72, 0.16, '#1d1d1d'),
    box(0.04, -0.82, 0, 0.18, -0.68, 0.14, '#1d1d1d'),
    // tronco um pouco inclinado para a frente
    seg([0, 0.08, 0.1], [0, -0.04, 0.62], 0.4, jaqueta, 0.24),
    // braços indo até o joelho direito
    seg([-0.2, -0.02, 0.56], [0.02, -0.3, 0.36], 0.09, jaqueta),
    seg([0.2, -0.02, 0.56], [0.15, -0.3, 0.38], 0.09, jaqueta),
    box(0.02, -0.38, 0.3, 0.16, -0.26, 0.4, pele),
    // capacete
    box(-0.19, -0.24, 0.64, 0.19, 0.14, 1.0, '#e05a5a', (k, q) => (k === 'n' ? [{ p: subq(q, 0.12, 0.3, 0.88, 0.75), c: '#2b3a48' }] : undefined)),
  ];
  return tfObj({ parts, shadow: true }, chain(T(x, y), Rz(face), Sc(1.25)));
}

/** moto caída de lado, sem piloto */
export function motoCaida(x: number, y: number, ang: number, cor: string): Obj {
  const m = moto(0, 0, 0, cor, { piloto: false });
  return tfObj(m, chain(T(x, y), Rz(ang), T(0, 0, 0.16), Ry(Math.PI / 2)));
}

/** rua de mão dupla com calçadas e prédios dos dois lados */
export function rua(seed = 0, ladoEsq = true): { ground: Part[]; objs: Obj[] } {
  const a = 3.4, c = 6.2;
  const ground: Part[] = [
    ...grassPatches(-40, -50, 40, 40, 8 + seed),
    ...asphalt(-a, -50, a, 40, 2 + seed),
    lines([{ p: [[0, -50, 0], [0, 40, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...sidewalk(a, -50, c, 40),
    ...sidewalk(-c, -50, -a, 40),
  ];
  const objs: Obj[] = [
    building({ x0: c + 1, y0: -26, x1: c + 9, y1: -15, h: 10, color: '#9fc3e6', shop: 'w', seed: 2 + seed }),
    building({ x0: c + 1, y0: -14, x1: c + 8, y1: -3, h: 7, color: '#f1dca6', shop: 'w', seed: 5 + seed }),
    building({ x0: c + 1, y0: -2, x1: c + 9, y1: 9, h: 9, color: '#e9a47c', shop: 'w', seed: 7 + seed }),
    ...(ladoEsq
      ? [
          building({ x0: -c - 9, y0: -26, x1: -c - 1, y1: -12, h: 11, color: '#cfe7c4', shop: 'e', seed: 3 + seed }),
          building({ x0: -c - 9, y0: -11, x1: -c - 1, y1: 2, h: 8, color: '#d9e3f0', shop: 'e', seed: 6 + seed }),
        ]
      : []),
    tree(-4.8, -4, 0.9, 1 + seed),
    tree(4.8, 4, 0.85, 2 + seed),
    lampPost(4.8, -12, -1),
    lampPost(-4.8, -20, 1),
  ];
  return { ground, objs };
}

/** letreiro (100 x 24) para pendurar na fachada */
function letreiro(texto: string, fundo: string, cor: string): ReactNode {
  return (
    <g>
      <rect x={0} y={0} width={100} height={24} rx={2} fill={fundo} />
      <text x={50} y={17} textAnchor="middle" fontSize={15} fontWeight={900} fill={cor} fontFamily="Arial, sans-serif" letterSpacing={1}>{texto}</text>
    </g>
  );
}

/** placa de letreiro numa fachada voltada para o oeste (x = x0), de ya a yb, com a base em z0 */
function placaFachada(x0: number, ya: number, yb: number, z0: number, node: ReactNode, fundo: string): Obj {
  const z1 = z0 + ((yb - ya) * 24) / 100;
  const placa = box(x0 - 0.12, ya, z0, x0, yb, z1, fundo);
  const frente = placa.faces.find((f) => f.n && f.n[0] < -0.9);
  if (frente) {
    frente.flat = true;
    frente.art = { o: [x0 - 0.121, ya, z1], u: [x0 - 0.121, yb, z1], v: [x0 - 0.121, ya, z1 - (yb - ya)], node };
  }
  return { parts: [placa] };
}

/** poste de radar: cano cinza e a caixa da câmera virada para quem vem do sul */
function radar(x: number, y: number): Obj {
  return {
    parts: [
      tfObj({ parts: [lathe([[0.09, 0], [0.09, 4.2], [0.06, 4.25]], 8, '#8b949c')] }, T(x, y)).parts[0],
      box(x - 1.5, y - 0.06, 4.0, x + 0.05, y + 0.06, 4.12, '#8b949c'),
      box(x - 1.75, y - 0.3, 3.55, x - 1.05, y + 0.25, 4.05, '#e9edf2', (k, q) => (k === 's' ? [{ p: subq(q, 0.2, 0.25, 0.8, 0.75), c: '#1d2430' }, { p: subq(q, 0.42, 0.4, 0.58, 0.6), c: '#5aa0ff' }] : undefined)),
    ],
    shadow: true,
  };
}

/* ---------------- desenhos dos balões (pixels) ---------------- */

type Celular = 'mao' | 'banco' | null;

/**
 * O carro visto de cima, por dentro (80 x 104, frente para cima). Motorista à esquerda.
 * `celular`: na mão do motorista ou vibrando no banco do lado. `fones`: fones ligados ao celular.
 * `passageiro`: alguém no banco da frente, com ou sem cinto.
 */
export function Cabine({ celular = null, fones = false, passageiro, cor = VOCE, umaMao = false, crianca = false }: { celular?: Celular; fones?: boolean; passageiro?: { cinto: boolean }; cor?: string; umaMao?: boolean; crianca?: boolean }) {
  const tronco = (cx: number, roupa: string, cabelo: string, cinto: boolean) => (
    <g>
      <ellipse cx={cx} cy={56} rx={10} ry={6} fill={roupa} />
      {cinto && <line x1={cx - 9} y1={52} x2={cx + 7} y2={62} stroke="#22262c" strokeWidth={2.6} strokeLinecap="round" />}
      <circle cx={cx} cy={53.5} r={6} fill={cabelo} />
    </g>
  );
  const fone = fones ? (
    <g>
      <path d="M21.5 50.5 Q27.5 44 33.5 50.5" fill="none" stroke="#22262c" strokeWidth={2} />
      <rect x={19.5} y={50.5} width={3.6} height={6} rx={1.4} fill="#e05a5a" />
      <rect x={31.9} y={50.5} width={3.6} height={6} rx={1.4} fill="#e05a5a" />
      <path d="M35 56 Q39 56 40 59" fill="none" stroke="#f4f1e6" strokeWidth={1.2} />
    </g>
  ) : null;
  return (
    <g>
      {/* carroceria */}
      <rect x={12} y={4} width={56} height={96} rx={16} fill={cor} stroke="#0003" />
      <path d="M17 26 Q40 16 63 26 L60 34 L20 34 Z" fill="#3b5470" />
      <rect x={17} y={34} width={46} height={50} rx={4} fill="#4a5260" />
      <path d="M20 84 L60 84 L62 92 Q40 98 18 92 Z" fill="#3b5470" />
      {/* bancos */}
      <rect x={18} y={48} width={20} height={16} rx={4} fill="#2b3038" />
      <rect x={42} y={48} width={20} height={16} rx={4} fill="#2b3038" />
      <rect x={19} y={70} width={42} height={12} rx={4} fill="#2b3038" />
      {/* console entre os bancos */}
      <rect x={38.5} y={46} width={3} height={20} rx={1.5} fill="#353b45" />
      {/* volante */}
      <ellipse cx={28} cy={39} rx={8} ry={2.8} fill="none" stroke="#1d2129" strokeWidth={2.4} />
      {/* motorista: braços, tronco, cabeça */}
      <line x1={20} y1={55} x2={21.5} y2={40} stroke="#2fa36b" strokeWidth={4} strokeLinecap="round" />
      {celular === 'mao' ? (
        <line x1={36} y1={55} x2={41} y2={44} stroke="#2fa36b" strokeWidth={4} strokeLinecap="round" />
      ) : umaMao ? (
        <line x1={36} y1={55} x2={41} y2={63} stroke="#2fa36b" strokeWidth={4} strokeLinecap="round" />
      ) : (
        <line x1={36} y1={55} x2={34.5} y2={40} stroke="#2fa36b" strokeWidth={4} strokeLinecap="round" />
      )}
      {tronco(28, '#2fa36b', '#2b2420', true)}
      {fone}
      <circle cx={21.5} cy={40} r={2.2} fill="#b07a55" />
      {celular === 'mao' ? <circle cx={41} cy={44} r={2.2} fill="#b07a55" /> : umaMao ? <circle cx={41} cy={63} r={2.2} fill="#b07a55" /> : <circle cx={34.5} cy={40} r={2.2} fill="#b07a55" />}
      {crianca && (
        <g>
          <ellipse cx={50} cy={77} rx={6.5} ry={4} fill="#f2c21b" />
          <circle cx={50} cy={75} r={4} fill="#7a4a25" />
        </g>
      )}
      {passageiro && tronco(52, '#e05a7a', '#5a3b25', passageiro.cinto)}
      {/* celular */}
      {celular === 'mao' && (
        <g>
          <circle cx={42} cy={39} r={8} fill="#bfe8ff" opacity={0.45} />
          <rect x={38.5} y={34} width={7} height={11} rx={1.4} fill="#1d2430" />
          <rect x={39.5} y={35.2} width={5} height={8.4} rx={0.6} fill="#7fd3ff" />
          <rect x={40.2} y={36.4} width={3.6} height={1} fill="#fff" />
          <rect x={40.2} y={38.2} width={2.6} height={1} fill="#fff" />
        </g>
      )}
      {celular === 'banco' && (
        <g>
          <rect x={48} y={51} width={7} height={11} rx={1.4} fill="#1d2430" />
          <rect x={49} y={52.2} width={5} height={8.4} rx={0.6} fill="#7fd3ff" />
          <g stroke="#ffd84a" strokeWidth={1.4} strokeLinecap="round" fill="none">
            <path d="M45.5 52 Q44 56.5 45.5 61" />
            <path d="M43 50.5 Q41 56.5 43 62.5" />
            <path d="M57.5 52 Q59 56.5 57.5 61" />
            <path d="M60 50.5 Q62 56.5 60 62.5" />
          </g>
        </g>
      )}
      {fones && (
        <g>
          <rect x={37.5} y={58} width={5} height={8} rx={1} fill="#1d2430" />
          <rect x={38.3} y={59} width={3.4} height={6} rx={0.5} fill="#7fd3ff" />
        </g>
      )}
    </g>
  );
}

/** a metade da frente da cabine, ampliada para caber num balão de 108 x 96 */
export function zoomCabine(id: string, dentro: ReactNode) {
  return (
    <g>
      <clipPath id={id}>
        <rect x={3} y={3} width={102} height={90} rx={6} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <g transform="translate(-14 -20) scale(1.95)">{dentro}</g>
      </g>
    </g>
  );
}

/** bafômetro de mão (40 x 60): corpo, visor e o bocal */
export function Bafometro() {
  return (
    <g>
      <rect x={14} y={6} width={6} height={14} rx={2} fill="#f4f1e6" stroke="#0003" />
      <rect x={6} y={18} width={22} height={38} rx={6} fill="#2b3340" />
      <rect x={9.5} y={23} width={15} height={10} rx={1.5} fill="#7fe0a0" />
      <rect x={11} y={26} width={12} height={1.4} fill="#2b3340" opacity={0.5} />
      <circle cx={13} cy={42} r={2.4} fill="#5aa0ff" />
      <circle cx={21} cy={42} r={2.4} fill="#ff5a5f" />
      <rect x={11} y={48} width={12} height={3} rx={1.5} fill="#3f4856" />
    </g>
  );
}

/** lata de cerveja (30 x 50) */
export function Lata() {
  return (
    <g>
      <rect x={6} y={6} width={18} height={38} rx={3} fill="#e9b33a" />
      <rect x={6} y={6} width={18} height={4} rx={2} fill="#c9ced4" />
      <rect x={6} y={40} width={18} height={4} rx={2} fill="#c9ced4" />
      <rect x={6} y={18} width={18} height={12} fill="#ffffff" />
      <rect x={9} y={22} width={12} height={4} rx={1} fill="#c0392b" />
      <rect x={9} y={12} width={3} height={24} fill="#fff" opacity={0.35} />
    </g>
  );
}

/* ---------------- 1. velocidade, semáforo, celular, capacete ---------------- */

/** avenida com placa de 60 km/h e um radar mais à frente; você na faixa da direita */
export function Radar60(p: CenaProps) {
  const placa = { x: 4.7, y: -3, code: 'R-19' as const, speed: 60, face: 0 };
  const objs = [...avenidaObjs(2), signPost(placa), radar(4.9, -13), car({ x: -1.8, y: -18, color: '#8f98a3' }), car({ x: 1.8, y: 1.5, color: VOCE })];
  const cam = camLook(1.4, -5, 0, 12, 38, 11);
  return cena(cam, avenida(), objs, (pr) => {
    const [rx, ry] = pr([3.5, -13, 4.1]);
    return (
      <>
        <SignCallout at={pr(signTop(placa))} code="R-19" speed={60} dx={52} dy={10} />
        <Tag x={rx} y={ry - 10} text="Radar" />
        {voce(pr, 1.8, 1.5)}
      </>
    );
  }, p);
}

/** semáforo vermelho: um carro passa direto pelo cruzamento; você parado antes da linha */
export function AvancaVermelho(p: CenaProps) {
  const objs = objsSemaforo('vermelho', [
    car({ x: 1.75, y: CY_SEMAFORO - 1.5, color: '#e0412f' }),
    car({ x: -9, y: CY_SEMAFORO - 1.75, heading: Math.PI / 2, color: '#4f7fc4', brake: true }),
    eu(PARA + 6.2, true),
  ]);
  return cena(CAM_SEMAFORO, chaoSemaforo(), objs, (pr) => {
    const [tx, ty] = pr([1.75, CY_SEMAFORO - 1.5, 1.9]);
    return (
      <>
        {rastro(pr, [[1.75, PARA + 1.2], [1.75, CY_SEMAFORO + 3.2]], '#ffffff', 0.8)}
        <Tag x={tx} y={ty - 8} text="Outro carro" />
        {balaoLuz(pr, 'vermelho')}
        {voce(pr, 1.75, PARA + 6.2)}
      </>
    );
  }, p);
}

/** avenida com você dirigindo; o balão mostra o carro por dentro (celular na mão, celular no banco, fones) */
function cabineAvenida(p: CenaProps, dentro: ReactNode) {
  const objs = [...avenidaObjs(1), car({ x: 1.8, y: -12, color: '#4f7fc4' }), car({ x: -1.8, y: -20, color: '#8f98a3' }), car({ x: 1.8, y: 1.5, color: VOCE })];
  const cam = camLook(-0.2, -5, 0, 12, 38, 10);
  return cena(cam, avenida(), objs, (pr) => (
    <>
      <Balao at={pr([1.8, 1.0, 1.4])} x={204} y={8} w={108} h={96}>
        {zoomCabine('cab' + (p.id ?? ''), dentro)}
      </Balao>
      {voce(pr, 1.8, 1.5)}
    </>
  ), p);
}

export const CelularMao = (p: CenaProps) => cabineAvenida(p, <Cabine celular="mao" />);
export const CelularBanco = (p: CenaProps) => cabineAvenida(p, <Cabine celular="banco" />);
export const FonesOuvido = (p: CenaProps) => cabineAvenida(p, <Cabine fones />);

/** um motociclista sem capacete na rua, à sua frente */
export function MotoSemCapacete(p: CenaProps) {
  const r = rua(1);
  const objs = [...r.objs, moto(1.7, -4.5, 0, '#e05a5a', { capacete: false }), car({ x: -1.7, y: -22, heading: Math.PI, color: '#4f7fc4' }), car({ x: 1.7, y: 3, color: VOCE })];
  const cam = camLook(1.2, -1.5, 0, 12, 38, 20);
  return cena(cam, r.ground, objs, (pr) => {
    const [tx, ty] = pr([1.7, -4.6, 2.1]);
    return (
      <>
        <Tag x={tx} y={ty - 8} text="Sem capacete" />
        {voce(pr, 1.7, 3)}
      </>
    );
  }, p);
}

/* ---------------- 2. fiscalização ---------------- */

/** blitz à noite: cones na pista e o agente na sua janela com o bafômetro */
export function BlitzNoite(p: CenaProps) {
  const r = rua(3);
  const yv = -3;
  const objs = [
    ...r.objs,
    ...[[-0.2, -14], [0.6, -11], [1.3, -8], [-0.2, 2.5], [-0.2, 6]].map(([x, y]) => cone(x, y)),
    ...agenteBafometro(-0.1, yv + 0.1, Math.PI / 2 + 0.25),
    person(4.4, -9, AGENTE2, 0, Math.PI * 0.85, 1.25, { r: [0.3, 0], l: [0.3, 0] }),
    car({ x: 1.9, y: -16, color: '#8f98a3', brake: true }),
    car({ x: 1.75, y: yv, color: VOCE, brake: true }),
  ];
  const cam = camLook(0.8, -4, 0, -20, 40, 19);
  return cena(cam, r.ground, objs, (pr) => (
    <>
      {noite('blitz', pr, [[4.8 - 1.1, -12, 4.3], [-4.8 + 1.1, -20, 4.3]])}
      {facho(pr, 1.75, yv, -1, 0.1, 0.22)}
      {farolPar(pr, 1.75, yv, -1, 1.3)}
      {[1.15, 2.35].map((x) => <g key={x}><circle {...xy(pr([x, yv + 2.15, 0.85]))} r={2} fill="#ff3b30" /></g>)}
      <Balao at={pr(maoAgente(-0.1, yv + 0.1, Math.PI / 2 + 0.25))} x={14} y={10} w={40} h={62}>
        <Bafometro />
      </Balao>
      {voce(pr, 1.75, yv)}
    </>
  ), p);
}

/** a ponta do bafômetro do agente (para ligar o balão) */
function maoAgente(x: number, y: number, face: number, s = 1.25): V3 {
  const hy = -0.38 * Math.sin(1.35) - 0.26, hz = 1.15 - 0.38 * Math.cos(1.35) + 0.08;
  const lx = 0.24 * s, ly = hy * s;
  return [x + lx * Math.cos(face) - ly * Math.sin(face), y + lx * Math.sin(face) + ly * Math.cos(face), hz * s];
}
const xy = ([cx, cy]: V2) => ({ cx, cy });

/** fiscalização de dia: o agente olha dentro de um carro parado; o balão mostra quem está lá dentro */
export function FiscalizacaoCinto(p: CenaProps) {
  const r = rua(4);
  const yc = -5;
  const objs = [
    ...r.objs,
    ...[[0.2, -16], [0.9, -13], [1.5, -10.5], [-0.2, 3]].map(([x, y]) => cone(x, y)),
    person(0, yc - 0.6, AGENTE, 0, Math.PI / 2, 1.25, { r: [0.15, 0], l: [0.15, 0] }),
    person(4.5, -12, AGENTE2, 0, Math.PI, 1.25),
    car({ x: 1.75, y: yc, color: '#4f7fc4', brake: true }),
  ];
  const cam = camLook(0.8, -6, 0, -18, 40, 14);
  return cena(cam, r.ground, objs, (pr) => (
    <>
      <Balao at={pr([1.75, yc - 0.3, 1.4])} x={204} y={8} w={108} h={96}>
        {zoomCabine('cab' + (p.id ?? ''), <Cabine passageiro={{ cinto: false }} cor="#4f7fc4" />)}
      </Balao>
    </>
  ), p);
}

/* ---------------- 3. crimes e situações graves ---------------- */

/** à noite, dois carros lado a lado em alta velocidade numa avenida; gente olhando da calçada */
export function Racha(p: CenaProps) {
  const ya = -9, yb = -8;
  const objs = [
    ...avenidaObjs(3),
    car({ x: -1.8, y: ya, color: '#f2c21b' }),
    car({ x: 1.8, y: yb, color: '#e0412f' }),
    person(4.6, -2, RAPAZ, 0, -Math.PI / 2, 1.2),
    person(5.4, -3.4, MOCA, 0, -Math.PI / 2, 1.2),
    person(4.9, -5.2, MENINO, 0, -Math.PI * 0.6, 1.0),
  ];
  const cam = camLook(0.6, -5, 0, 14, 40, 12.5);
  return cena(cam, avenida(), objs, (pr) => {
    const riscos = (x: number, y: number) =>
      [-0.7, 0, 0.7].map((dx, i) => {
        const [a, b] = [pr([x + dx, y + 2.5, 0.4 + i * 0.2]), pr([x + dx, y + 9 - i * 1.5, 0.4 + i * 0.2])];
        return <line key={dx} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />;
      });
    return (
      <>
        {noite('racha', pr, [[-5.1 + 1.1, 4, 4.3], [5.4 - 1.1, -6, 4.3]])}
        {facho(pr, -1.8, ya, -1, 0.9, 0.22)}
        {facho(pr, 1.8, yb, -1, 0.9, 0.22)}
        {riscos(-1.8, ya)}
        {riscos(1.8, yb)}
        {[-0.6, 0.6].map((dx) => <circle key={`a${dx}`} {...xy(pr([-1.8 + dx, ya + 2.15, 0.85]))} r={1.8} fill="#ff3b30" />)}
        {[-0.6, 0.6].map((dx) => <circle key={`b${dx}`} {...xy(pr([1.8 + dx, yb + 2.15, 0.85]))} r={1.8} fill="#ff3b30" />)}
      </>
    );
  }, p);
}

/** a moto caiu na sua frente; o motociclista está sentado no chão; você parou */
export function SinistroMoto(p: CenaProps) {
  const r = rua(5);
  const yv = -1;
  const objs = [
    ...r.objs,
    motoCaida(1.4, -5.6, 0.5, '#2f80ed'),
    motociclistaNoChao(0.1, -6.9, 0.9),
    car({ x: -1.7, y: -24, heading: Math.PI, color: '#e0412f' }),
    car({ x: 1.75, y: yv, color: VOCE, brake: true }),
  ];
  const cam = camLook(0.8, -4, 0, -16, 40, 20);
  return cena(cam, r.ground, objs, (pr) => {
    const [tx, ty] = pr([0.1, -6.9, 1.5]);
    return (
      <>
        <Tag x={tx} y={ty - 8} text="Motociclista" />
        {voce(pr, 1.75, yv)}
      </>
    );
  }, p);
}

/** rua em frente a uma escola, com crianças na calçada e na faixa; você vem chegando */
export function Escola(p: CenaProps) {
  const r = rua(2, true);
  const c = 6.2;
  const ground: Part[] = [...r.ground, ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => rect(-3.3 + i * 0.75, -13.5, -2.95 + i * 0.75, -10.5, '#f4f4ef', 0.012))];
  const escola = building({ x0: c + 1, y0: -18, x1: c + 11, y1: -2, h: 7, color: '#f6d2a0', shop: 'w', seed: 4 });
  const objs = [
    ...r.objs.filter((_, i) => i > 2),
    escola,
    placaFachada(c + 1, -13, -7, 3.4, letreiro('ESCOLA', '#2f6db5', '#ffffff'), '#24589a'),
    person(4.6, -4.2, MENINO, 0.5, Math.PI, 1.0),
    person(5.2, -5.6, CRIANCA, 0.2, -Math.PI / 2, 1.0),
    person(4.4, -8, SENHORA, 0, Math.PI, 1.2),
    person(1.2, -12, CRIANCA, 0.8, -Math.PI / 2, 1.0),
    person(4.1, -12.4, MENINO, 0.8, -Math.PI / 2, 1.0),
    car({ x: 1.75, y: 2.5, color: VOCE }),
  ];
  const cam = camLook(3.6, -8.5, 1.2, -40, 38, 12);
  return cena(cam, ground, objs, (pr) => voce(pr, 1.75, 2.5), p);
}

/** avenida movimentada: um carro troca de faixa o tempo todo, em zigue-zague */
export function ZigueZague(p: CenaProps) {
  const yz = -20;
  const objs = [
    ...AV_OBJS,
    car({ x: FX[0], y: -12, color: '#8f98a3' }),
    car({ x: FX[2], y: -28, color: '#4f7fc4' }),
    car({ x: FX[1], y: -36, color: '#2fa36b' }),
    car({ x: FX[2], y: -6, color: '#d9e3f0' }),
    tfObj(car({ x: 0, y: 0, color: '#f2a13a' }), chain(T(-1.3, yz), Rz(-0.35))),
    car({ x: FX[1], y: 2, color: VOCE }),
  ];
  const cam = camLook(0, -12, 0, 10, 38, 8);
  return cena(cam, AV, objs, (pr) => (
    <>
      {rastro(pr, [[2.6, 0.5], [2.4, -3], [-2.6, -7], [-2.9, -10], [2.2, -14.5], [2.4, -16], [-0.6, -18.6]], '#ffd84a', 0.95)}
      {voce(pr, FX[1], 2)}
    </>
  ), p);
}

/** festa na casa de um amigo: ele oferece uma lata de cerveja; seu carro está parado na frente */
export function Festa(p: CenaProps) {
  const r = rua(6, true);
  const c = 6.2;
  const objs = [
    ...r.objs.filter((_, i) => i > 2),
    house(c + 2, -12, c + 10, -3, '#cfe7c4', '#a8483a', 'w'),
    bush(c + 1.2, -13, 0.8, 2),
    car({ x: 2.4, y: -2.5, color: VOCE }),
    person(4.9, -8.6, AMIGO, 0, -Math.PI / 2 - 0.3, 1.2, { r: [0.1, 1.2] }),
    person(4.3, -7.2, RAPAZ, 0, Math.PI / 2 + 0.3, 1.2),
    person(5.6, -10.4, MOCA, 0, Math.PI, 1.2),
    person(7.2, -6.2, SENHORA, 0, Math.PI, 1.2),
  ];
  const cam = camLook(3.2, -6.5, 0, -30, 38, 13);
  return cena(cam, r.ground, objs, (pr) => {
    // bandeirinhas de festa, presas na fachada e no poste
    const fio: V3[] = [[c + 2, -11.5, 3.0], [4.9, -10, 3.3], [c + 2, -3.5, 3.0]];
    const P = fio.map((v) => pr(v));
    const band: ReactNode[] = [];
    const cores = ['#e05a5a', '#f2c21b', '#2f80ed', '#2fa36b', '#e05a7a'];
    for (let s = 0; s < 2; s++)
      for (let k = 1; k < 7; k++) {
        const u = k / 7;
        const x = P[s][0] + (P[s + 1][0] - P[s][0]) * u, y = P[s][1] + (P[s + 1][1] - P[s][1]) * u + Math.sin(u * Math.PI) * 3;
        band.push(<path key={`${s}${k}`} d={`M${x - 2.4} ${y}L${x + 2.4} ${y}L${x} ${y + 4.5}Z`} fill={cores[(k + s * 3) % 5]} />);
      }
    const [mx, my] = pr([4.9 - 0.4, -8.6 - 0.3, 1.2 * 1.06]);
    const [vx, vy] = pr([4.3, -7.2, 2.3]);
    const [cx, cy] = pr([2.4, -2.1, 2.0]);
    return (
      <>
        <path d={`M${P[0][0]} ${P[0][1]}Q${(P[0][0] + P[1][0]) / 2} ${(P[0][1] + P[1][1]) / 2 + 6} ${P[1][0]} ${P[1][1]}Q${(P[1][0] + P[2][0]) / 2} ${(P[1][1] + P[2][1]) / 2 + 6} ${P[2][0]} ${P[2][1]}`} fill="none" stroke="#f4f1e6" strokeWidth={0.8} />
        {band}
        <Balao at={[mx, my]} x={14} y={12} w={32} h={52}>
          <Lata />
        </Balao>
        <Tag x={vx} y={vy - 8} text="Você" />
        <Tag x={cx} y={cy - 8} text="Seu carro" />
      </>
    );
  }, p);
}

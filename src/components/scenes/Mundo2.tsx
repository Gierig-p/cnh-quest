/**
 * Cenas paradas do Mundo 2 no estilo 3D (lote de 15/11/2026). Mesmas regras do Mundo 1: a imagem mostra a situação
 * do texto sem entregar a resposta, e a câmera fica atrás de você, olhando para o norte.
 * Balões brancos ampliam o que é pequeno demais para ler na cena (semáforo, placa de destinos).
 */
import type { ReactNode } from 'react';
import { box, camLook, flat, lines, rect, subq, type Dec, type Obj, type Part, type V2, type V3 } from './engine';
import { asphalt, building, bush, car, grassPatches, house, lampPost, person, sidewalk, trafficLight, tree, zebra, type Look } from './models';
import { utilitario } from './veiculos';
import { LinhaRetencao } from './LinhaRetencao';
import { avenida, avenidaObjs, bairro, cena, cruzamento, voce, type CenaProps } from './Mundo1';

const VOCE = '#e9eef3';
const PEDESTRE: Look = { skin: '#c98a5e', hair: '#3a2a20', top: '#e05a7a', bottom: '#33415a', bag: '#2f80ed' };
type Pr = (p: V3) => V2;

/* ---------------- peças de desenho (overlay, em pixels) ---------------- */

/** balão branco ligado por uma linha fina a um ponto da cena; o conteúdo usa (0,0) no canto do balão */
export function Balao({ at, x, y, w, h, children }: { at: V2; x: number; y: number; w: number; h: number; children: ReactNode }) {
  const cx = x + w / 2, cy = y + h / 2;
  return (
    <g>
      <line x1={at[0]} y1={at[1]} x2={cx} y2={cy} stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={at[0]} cy={at[1]} r={1.8} fill="#fff" />
      <rect x={x} y={y} width={w} height={h} rx={8} fill="#fff" stroke="#0002" />
      <g transform={`translate(${x} ${y})`}>{children}</g>
    </g>
  );
}

/** raios curtos em volta de uma luz (para mostrar que ela pisca) */
export function raios(x: number, y: number, r: number, len: number, cor: string, n = 8): ReactNode {
  return (
    <g stroke={cor} strokeWidth={1.8} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + Math.PI / n;
        const c = Math.cos(a), s = Math.sin(a);
        return <line key={i} x1={x + c * r} y1={y + s * r} x2={x + c * (r + len)} y2={y + s * (r + len)} />;
      })}
    </g>
  );
}

/** semáforo de carros desenhado grande (24 x 60), com a luz pedida acesa */
export function SemaforoDesenho({ luz, pisca = false }: { luz: 'vermelho' | 'amarelo' | 'verde' | 'apagado'; pisca?: boolean }) {
  const on = { vermelho: '#ff3b30', amarelo: '#ffc83d', verde: '#22d36b' };
  const off = { vermelho: '#5a2a2a', amarelo: '#5a4a22', verde: '#22472f' };
  const ys = { vermelho: 11, amarelo: 30, verde: 49 };
  return (
    <g>
      <rect x={0} y={0} width={24} height={60} rx={5} fill="#2b323b" />
      {(['vermelho', 'amarelo', 'verde'] as const).map((k) => (
        <g key={k}>
          {k === luz && <circle cx={12} cy={ys[k]} r={11} fill={on[k]} opacity={0.3} />}
          <circle cx={12} cy={ys[k]} r={7} fill={k === luz ? on[k] : off[k]} />
        </g>
      ))}
      {pisca && luz !== 'apagado' && raios(12, ys[luz], 12, 5, '#e0a800')}
    </g>
  );
}

/** foco de pedestres desenhado grande (30 x 60): boneco vermelho parado em cima, verde andando embaixo */
export function FocoPedestreDesenho({ pisca = false, luz = 'vermelho' }: { pisca?: boolean; luz?: 'vermelho' | 'verde' | 'apagado' }) {
  const ver = luz === 'vermelho' ? '#ff4d4f' : '#5a2a2a', vd = luz === 'verde' ? '#22d36b' : '#2f5a3f';
  return (
    <g>
      <rect x={0} y={0} width={30} height={60} rx={5} fill="#1d242c" />
      {luz === 'vermelho' && <circle cx={15} cy={16} r={14} fill="#ff4d4f" opacity={0.22} />}
      {luz === 'verde' && <circle cx={15} cy={44} r={14} fill="#22d36b" opacity={0.22} />}
      <rect x={4} y={4} width={22} height={24} rx={3} fill="#3b1c1c" />
      <g fill={ver}>
        <circle cx={15} cy={9} r={2.6} />
        <rect x={11.6} y={12} width={6.8} height={8.5} rx={1.5} />
        <rect x={9.4} y={12.4} width={2.1} height={7} rx={1} />
        <rect x={18.5} y={12.4} width={2.1} height={7} rx={1} />
        <rect x={11.8} y={20.3} width={2.6} height={6.5} />
        <rect x={15.6} y={20.3} width={2.6} height={6.5} />
      </g>
      <rect x={4} y={32} width={22} height={24} rx={3} fill="#1a3024" />
      <g fill={vd} stroke={vd} strokeWidth={2.4} strokeLinecap="round">
        <circle cx={16} cy={36.5} r={2.4} />
        <line x1={15.5} y1={40.5} x2={14.8} y2={46.5} />
        <line x1={14.8} y1={46.5} x2={10.5} y2={53} />
        <line x1={14.8} y1={46.5} x2={19.5} y2={53} />
        <line x1={15.5} y1={41.5} x2={11.5} y2={45.5} />
        <line x1={15.5} y1={41.5} x2={19.5} y2={45} />
      </g>
      {pisca && luz === 'vermelho' && raios(15, 16, 15, 5, '#e0a800')}
    </g>
  );
}

/** placa verde de destinos (100 x 60) */
const placaVerde = (
  <g fontFamily="Arial, sans-serif" fontWeight={800} fill="#fff">
    <rect x={0} y={0} width={100} height={60} rx={4} fill="#0f7a3d" />
    <rect x={3} y={3} width={94} height={54} rx={3} fill="none" stroke="#fff" strokeWidth={1.6} />
    {[
      ['Vila Nova', '15 km', 20],
      ['Santa Rita', '40 km', 35],
      ['Porto Alto', '72 km', 50],
    ].map(([c, km, y]) => (
      <g key={c as string} fontSize={9}>
        <text x={8} y={y as number}>{c}</text>
        <text x={92} y={y as number} textAnchor="end">{km}</text>
      </g>
    ))}
  </g>
);

/** noite: escurece a cena e acende os postes */
export function noite(id: string, pr: Pr, postes: V3[]): ReactNode {
  return (
    <>
      <defs>
        <radialGradient id={`${id}-poste`}>
          <stop offset="0" stopColor="#ffe7a8" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffe7a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={320} height={200} fill="#0a1430" opacity={0.58} />
      {postes.map((p, i) => {
        const [x, y] = pr(p);
        const [gx, gy] = pr([p[0], p[1], 0]);
        return (
          <g key={i}>
            <ellipse cx={gx} cy={gy} rx={30} ry={14} fill={`url(#${id}-poste)`} opacity={0.5} />
            <circle cx={x} cy={y} r={9} fill={`url(#${id}-poste)`} />
          </g>
        );
      })}
    </>
  );
}

/* ---------------- estrada de mão dupla ---------------- */

export const PISTA = 3.5, ACOST = 6;

/** estrada de mão dupla com acostamento; a linha amarela do meio é contínua ou tracejada */
export function estrada(central: 'continua' | 'tracejada'): Part[] {
  return [
    ...grassPatches(-50, -70, 50, 40, 7),
    rect(-ACOST - 0.7, -70, ACOST + 0.7, 40, '#c9b48a'),
    ...asphalt(-ACOST, -70, ACOST, 40, 5),
    // acostamento: asfalto mais claro, separado da pista pela linha branca da borda
    rect(PISTA, -70, ACOST, 40, '#6d747d', 0, 0.55),
    rect(-ACOST, -70, -PISTA, 40, '#6d747d', 0, 0.55),
    rect(PISTA - 0.15, -70, PISTA, 40, '#eeeeea'),
    rect(-PISTA, -70, -PISTA + 0.15, 40, '#eeeeea'),
    central === 'continua'
      ? rect(-0.08, -70, 0.08, 40, '#f2c21b')
      : lines([{ p: [[0, -70, 0], [0, 40, 0]], c: '#f2c21b', w: 1.3, dash: '6 6' }]),
  ];
}

/** cercas, árvores e um sítio ao longe dos dois lados da estrada */
export function campo(seed = 0, vao?: [number, number]): Obj[] {
  const out: Obj[] = [];
  for (const x of [-9, 9]) {
    // `vao`: trecho da cerca da esquerda aberto (entrada de uma estrada)
    const trechos: [number, number][] = x < 0 && vao ? [[-70, vao[0]], [vao[1], 40]] : [[-70, 40]];
    for (const [a, b] of trechos) out.push({ parts: [lines([{ p: [[x, a, 0.95], [x, b, 0.95]], c: '#8a6a48', w: 0.8 }, { p: [[x, a, 0.55], [x, b, 0.55]], c: '#8a6a48', w: 0.7 }])] });
    for (let y = -46; y < 30; y += 4) if (!(x < 0 && vao && y > vao[0] && y < vao[1])) out.push({ parts: [box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, 1.05, '#8a6a48')], shadow: true });
  }
  out.push(
    tree(-12, 6 + seed, 1.1, 1),
    tree(-14, -10 + seed, 1.2, 2),
    tree(12.5, -2 + seed, 1.05, 3),
    tree(15, -22, 1.2, 4),
    tree(-13, -32, 1.1, 5),
    bush(-10.5, -4, 0.9, 1),
    bush(11, 10, 0.9, 2),
    house(16, -40, 23, -33, '#f3e3b8', '#c8553d', 'w'),
  );
  return out;
}

export const CAM_ESTRADA = camLook(1.2, -7, 0, 12, 36, 8.5);

/** atrás de um caminhão lento, numa estrada de mão dupla com linha amarela contínua */
export function LinhaAmarelaContinua(p: CenaProps) {
  const objs = [...campo(), utilitario({ x: 1.75, y: -8.5, tipo: 'caminhao' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('continua'), objs, (pr) => voce(pr, 1.75, 1.5), p);
}

/** a mesma estrada, mas atrás de um carro lento */
export function LinhaAmarelaContinuaCarro(p: CenaProps) {
  const objs = [...campo(1), car({ x: 1.75, y: -6, color: '#8f98a3' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('continua'), objs, (pr) => voce(pr, 1.75, 1.5), p);
}

/** estrada de mão dupla com linha amarela tracejada; um carro vem longe, na outra mão */
export function LinhaAmarelaTracejada(p: CenaProps) {
  const objs = [...campo(2), car({ x: -1.75, y: -34, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: 1.5, color: VOCE })];
  return cena(CAM_ESTRADA, estrada('tracejada'), objs, (pr) => voce(pr, 1.75, 1.5), p);
}

/** placa grande de destinos e distâncias, em dois postes, à direita da estrada */
export function PlacaDistancias(p: CenaProps) {
  const x0 = 6.6, x1 = 10.2, yp = -9, z0 = 2.2, z1 = z0 + ((x1 - x0) * 60) / 100;
  const painel = box(x0, yp - 0.08, z0, x1, yp, z1, (k) => (k === 's' ? '#0f7a3d' : '#7d868e'));
  const frente = painel.faces.find((f) => f.n && f.n[1] > 0.9);
  if (frente) {
    frente.flat = true;
    frente.art = { o: [x0, yp + 0.001, z1], u: [x1, yp + 0.001, z1], v: [x0, yp + 0.001, z1 - (x1 - x0)], node: placaVerde };
  }
  const postes = [x0 + 0.5, x1 - 0.5].map((x) => box(x - 0.07, yp - 0.2, 0, x + 0.07, yp - 0.08, z1 - 0.1, '#8b949c'));
  const objs = [...campo(3), { parts: [...postes, painel], shadow: true }, car({ x: 1.75, y: 1.5, color: VOCE })];
  const cam = camLook(2.6, -6, 1, 14, 30, 9);
  return cena(cam, estrada('tracejada'), objs, (pr) => (
    <>
      <Balao at={pr([(x0 + x1) / 2, yp, z1])} x={12} y={8} w={128} h={78}>
        <g transform="translate(6 6) scale(1.16)">{placaVerde}</g>
      </Balao>
      {voce(pr, 1.75, 1.5)}
    </>
  ), p);
}

/* ---------------- faixas brancas ---------------- */

/** avenida de mão única com duas faixas separadas por uma linha branca contínua */
export function LinhaBrancaContinua(p: CenaProps) {
  const cam = camLook(0.2, -5, 0, 14, 40, 10);
  const objs = [...avenidaObjs(), car({ x: -1.8, y: -9, color: '#4f7fc4' }), car({ x: 1.8, y: 1.5, color: VOCE })];
  return cena(cam, avenida('continua'), objs, (pr) => voce(pr, 1.8, 1.5), p);
}

export const LinhaRetencaoParada = (p: CenaProps) => <LinhaRetencao t={0} id={p.id} />;

/* ---------------- semáforos ---------------- */

function semaforo(pisca: boolean, p: CenaProps) {
  const cy = -12;
  const id = p.id ?? 'c';
  const luz: V3 = [4.3, cy + 4.0, 3.0];
  const cam = camLook(1.8, -4, 0.6, 16, 38, 13);
  const objs = [...bairro(cy, pisca ? 3 : 1), trafficLight(luz[0], luz[1], 'amarelo'), car({ x: 1.75, y: 1.8, color: VOCE })];
  return cena(cam, cruzamento(cy), objs, (pr) => {
    const [lx, ly] = pr(luz);
    return (
      <>
        {pisca && noite(id, pr, [[5.6, cy + 5.2, 4.3], [-5.6, cy - 6, 4.3]])}
        {pisca && (
          <>
            <circle cx={lx} cy={ly} r={9} fill="#ffc83d" opacity={0.35} />
            {raios(lx, ly, 6, 4, '#ffd76a')}
          </>
        )}
        <Balao at={[lx + 3, ly]} x={250} y={14} w={44} h={80}>
          <g transform="translate(10 10)">
            <SemaforoDesenho luz="amarelo" pisca={pisca} />
          </g>
        </Balao>
        {voce(pr, 1.75, 1.8)}
      </>
    );
  }, p);
}
/** avenida de dia: o cruzamento ainda está longe e o semáforo acabou de ficar amarelo */
export const SemaforoAmarelo = (p: CenaProps) => semaforo(false, p);
/** tarde da noite, ruas vazias: o semáforo pisca no amarelo */
export const SemaforoAmareloPiscando = (p: CenaProps) => semaforo(true, p);

/* ---------------- foco de pedestres ---------------- */

/** foco de pedestres num poste; a frente olha para o sul (`face` gira como no semáforo) */
function focoPedestre(x: number, y: number, luz: 'vermelho' | 'verde' | 'apagado' = 'vermelho'): Obj {
  const parts: Part[] = [
    box(-0.06, -0.06, 0.15, 0.06, 0.06, 2.9, '#3d4652'),
    box(-0.2, -0.1, 2.0, 0.2, 0.14, 2.85, '#2b323b', (k, q) => {
      if (k !== 's') return undefined;
      const D: Dec[] = [
        { p: subq(q, 0.14, 0.53, 0.86, 0.94), c: luz === 'vermelho' ? '#ff4d4f' : '#3b1c1c', flat: luz === 'vermelho' },
        { p: subq(q, 0.14, 0.06, 0.86, 0.47), c: luz === 'verde' ? '#22d36b' : '#1a3024', flat: luz === 'verde' },
      ];
      return D;
    }),
  ];
  return { parts: parts.map((pt) => ({ ...pt, faces: pt.faces.map((f) => ({ ...f, p: f.p.map(([a, b, c]): V3 => [a + x, b + y, c]), dec: f.dec?.map((d) => ({ ...d, p: d.p.map(([a, b, c]): V3 => [a + x, b + y, c]) })) })), center: [pt.center[0] + x, pt.center[1] + y, pt.center[2]] as V3 })), shadow: true, glows: luz === 'apagado' ? [] : [{ p: [x, y + 0.15, luz === 'vermelho' ? 2.62 : 2.22], n: [0, 1, 0], r: 9, c: luz === 'vermelho' ? '#ff4d4f' : '#22d36b' }] };
}

/** rua com faixa de pedestres e foco de pedestres do outro lado (chão, objetos e câmera) */
export const PED_R0 = -7.5, PED_R1 = -0.5;
export const PED_PESSOA = PEDESTRE;
export function ruaPedestre(foco: 'vermelho' | 'verde' | 'apagado' = 'vermelho', comPessoa = true) {
  const r0 = PED_R0, r1 = PED_R1; // rua leste-oeste
  const ground = [
    ...grassPatches(-40, -40, 40, 40, 3),
    ...asphalt(-40, r0, 40, r1, 8),
    lines([{ p: [[-40, (r0 + r1) / 2, 0], [-2.6, (r0 + r1) / 2, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }, { p: [[2.6, (r0 + r1) / 2, 0], [40, (r0 + r1) / 2, 0]], c: '#eeeeea', w: 0.9, dash: '5 5' }]),
    ...zebra(-1.8, r0, 1.8, r1, 'x'),
    // linha de retenção da mão de baixo (carros indo para o leste)
    rect(-3.0, (r0 + r1) / 2 + 0.2, -2.6, r1, '#ffffff'),
    ...sidewalk(-40, r1, 40, 3.5, 'x'),
    ...sidewalk(-40, r0 - 3.5, 40, r0, 'x'),
    flat([[-1.8, r1], [1.8, r1], [1.8, r1 + 0.4], [-1.8, r1 + 0.4]], '#cbbfa6', 0.16),
  ];
  const objs: Obj[] = [
    building({ x0: -16, y0: -22, x1: -6, y1: -12, h: 9, color: '#f1dca6', shop: 's', seed: 4 }),
    building({ x0: -5, y0: -22, x1: 5, y1: -12, h: 12, color: '#9fc3e6', shop: 's', seed: 2 }),
    building({ x0: 6, y0: -22, x1: 16, y1: -12, h: 8, color: '#e9a47c', shop: 's', seed: 7 }),
    tree(-6, r0 - 2.2, 0.9, 1),
    tree(7, r0 - 2.2, 0.95, 2),
    lampPost(-9, r0 - 2.6, 1),
    focoPedestre(2.3, r0 - 0.6, foco),
    car({ x: -5.2, y: (r0 + r1) / 2 + 1.75, heading: Math.PI / 2, color: '#e0412f' }),
    ...(comPessoa ? [person(-0.3, 1.2, PEDESTRE, 0, 0, 1.3)] : []),
  ];
  const cam = camLook(0, -4.5, 0.8, 12, 30, 12);
  return { cam, ground, objs };
}

/** você a pé, na calçada, esperando para atravessar; do outro lado o boneco vermelho pisca */
export function SemaforoPedestrePiscando(p: CenaProps) {
  const r0 = PED_R0;
  const { cam, ground, objs } = ruaPedestre();
  return cena(cam, ground, objs, (pr) => {
    const [fx, fy] = pr([2.3, r0 - 0.45, 2.62]);
    const [tx, ty] = pr([-0.3, 1.2, 2.25]);
    return (
      <>
        {raios(fx, fy, 4, 3, '#ffd76a', 6)}
        <Balao at={[fx + 2, fy]} x={258} y={10} w={48} h={80}>
          <g transform="translate(9 10)">
            <FocoPedestreDesenho pisca />
          </g>
        </Balao>
        <g>
          <rect x={tx - 16} y={ty - 22} width={32} height={13} rx={6.5} fill="#fff" stroke="#0003" />
          <text x={tx} y={ty - 12.6} textAnchor="middle" fontSize={8.5} fontWeight={800} fill="#22313f" fontFamily="system-ui, sans-serif">Você</text>
          <path d={`M${tx - 3} ${ty - 9.2}L${tx} ${ty - 5.5}L${tx + 3} ${ty - 9.2}Z`} fill="#fff" />
        </g>
      </>
    );
  }, p);
}

/* ---------------- vaga de idoso ---------------- */

/** marca da vaga pintada no chão: símbolo do idoso branco no fundo azul (100 x 140) */
const marcaIdoso = (
  <g>
    <rect x={0} y={0} width={100} height={140} fill="#1f5fbf" />
    <rect x={5} y={5} width={90} height={130} fill="none" stroke="#fff" strokeWidth={3} />
    <g fill="#fff" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
      <circle cx={46} cy={26} r={8} stroke="none" />
      {/* corpo curvado, bengala e pernas */}
      <path d="M44 36 Q52 44 50 66" fill="none" strokeWidth={9} />
      <path d="M50 64 L42 92 M50 64 L60 92" fill="none" strokeWidth={7} />
      <path d="M48 44 L64 58 L68 92" fill="none" strokeWidth={4} />
    </g>
    <text x={50} y={122} textAnchor="middle" fontSize={21} fontWeight={900} fill="#fff" fontFamily="Arial, sans-serif" letterSpacing={1}>IDOSO</text>
  </g>
);

/** estacionamento com vagas lado a lado; a do meio está livre e tem a marca do idoso */
export function vagaIdoso() {
  const fundo = -6, frente = -0.6, larg = 2.6;
  const vagas = [-2, -1, 0, 1, 2].map((i) => i * larg);
  const ground: Part[] = [
    ...grassPatches(-40, -40, 40, 40, 5),
    ...asphalt(-14, fundo, 14, 12, 3),
    ...sidewalk(-30, fundo - 3, 30, fundo, 'x'),
    lines(vagas.flatMap((x) => [x - larg / 2, x + larg / 2]).filter((v, i, a) => a.indexOf(v) === i).map((x): { p: V3[]; c: string; w: number } => ({ p: [[x, fundo, 0], [x, frente, 0]], c: '#eeeeea', w: 1.3 }))),
  ];
  const m = { ...rect(-0.95, fundo + 0.5, 0.95, fundo + 0.5 + 2.66, '#1f5fbf', 0.01) };
  m.faces = [{ ...m.faces[0], art: { o: [-0.95, fundo + 0.5, 0.01], u: [0.95, fundo + 0.5, 0.01], v: [-0.95, fundo + 0.5 + 1.9, 0.01], node: marcaIdoso } }];
  ground.push(m);
  const objs: Obj[] = [
    building({ x0: -16, y0: -20, x1: 0, y1: -10, h: 7, color: '#f1dca6', shop: 's', seed: 5 }),
    building({ x0: 1, y0: -20, x1: 15, y1: -10, h: 9, color: '#cfe7c4', shop: 's', seed: 3 }),
    tree(-9, fundo - 1.5, 0.9, 1),
    tree(9, fundo - 1.5, 0.9, 2),
    lampPost(4, fundo - 1.6, -1),
    car({ x: vagas[0], y: (fundo + frente) / 2, heading: 0, color: '#8f98a3' }),
    car({ x: vagas[1], y: (fundo + frente) / 2, heading: 0, color: '#e0412f' }),
    car({ x: vagas[3], y: (fundo + frente) / 2, heading: 0, color: '#4f7fc4' }),
    car({ x: vagas[4], y: (fundo + frente) / 2, heading: 0, color: '#f2c21b' }),
    car({ x: 0, y: 4.2, color: VOCE }),
  ];
  const cam = camLook(0, -1.5, 0, 0, 48, 13);
  return { cam, ground, objs };
}
export const MARCA_IDOSO = marcaIdoso;
export function VagaIdoso(p: CenaProps) {
  const { cam, ground, objs } = vagaIdoso();
  return cena(cam, ground, objs, (pr) => voce(pr, 0, 4.2), p);
}


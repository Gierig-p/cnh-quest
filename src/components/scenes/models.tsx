/**
 * Modelos low-poly para o motor 3D em SVG (engine.tsx). Medidas em metros.
 * Cada função devolve um `Obj` já posicionado no mundo.
 */
import {
  box, chain, circle, extrude, lathe, lines, mix, rect, rng, Rx, Ry, Rz, scale, seg, subq, T, tfObj, inset,
  type BoxKey, type Dec, type Glow, type Line, type Obj, type Part, type V2, type V3,
} from './engine';

/* ================= carro ================= */
export interface CarOpts {
  x: number;
  y: number;
  /** direção em radianos: 0 = indo para o norte (−y); π/2 = indo para o leste */
  heading?: number;
  color?: string;
  brake?: boolean;
  /** pisca: 'r' direita, 'l' esquerda (aceso neste quadro) */
  blink?: 'r' | 'l' | null;
  /** abertura da porta do motorista (0 fechada, 1 = ~65°) */
  door?: number;
}

const GLASS = '#3b5470';
const GLASS_HI = '#a9c8e3';
const TIRE = '#262b33';

export function car({ x, y, heading = 0, color = '#e8eef4', brake = false, blink = null, door = 0 }: CarOpts): Obj {
  const parts: Part[] = [];
  const glows: Glow[] = [];
  const dark = scale(color, 0.55);
  // carroceria de baixo (perfil lateral puxado na largura)
  const body: V2[] = [[-2.15, 0.3], [2.15, 0.3], [2.15, 0.76], [2.05, 0.9], [1.25, 0.95], [-1.0, 0.92], [-2.05, 0.82], [-2.15, 0.62]];
  parts.push(
    extrude(body, 'x', -0.92, 0.92, (k) => (k === 0 ? '#20252c' : color), (k, q) => {
      const D: Dec[] = [];
      // nas faces laterais da extrusão: u segue o perfil (altura), v segue a largura (0 = esquerda, 1 = direita)
      if (k === 1) {
        // traseira: para-choque, lanternas, placa (Mercosul) e pisca
        const lt = brake ? '#ff3b30' : '#b8322c';
        D.push({ p: subq(q, 0, 0, 0.22, 1), c: '#2d333c' });
        D.push({ p: subq(q, 0.55, 0.03, 0.96, 0.25), c: lt, flat: brake });
        D.push({ p: subq(q, 0.55, 0.75, 0.96, 0.97), c: lt, flat: brake });
        D.push({ p: subq(q, 0.27, 0.33, 0.65, 0.67), c: '#3a404a' });
        D.push({ p: subq(q, 0.3, 0.36, 0.62, 0.64), c: '#f4f4f0' });
        D.push({ p: subq(q, 0.53, 0.36, 0.62, 0.64), c: '#1e5bb8' });
        if (blink === 'r') D.push({ p: subq(q, 0.38, 0.8, 0.54, 0.97), c: '#ffb020', flat: true });
        if (blink === 'l') D.push({ p: subq(q, 0.38, 0.03, 0.54, 0.2), c: '#ffb020', flat: true });
      }
      if (k === 7) {
        // frente (u desce): faróis, grade e para-choque
        D.push({ p: subq(q, 0.05, 0.05, 0.42, 0.28), c: '#f7f3d6', flat: true });
        D.push({ p: subq(q, 0.05, 0.72, 0.42, 0.95), c: '#f7f3d6', flat: true });
        D.push({ p: subq(q, 0.1, 0.34, 0.45, 0.66), c: '#2d333c' });
        D.push({ p: subq(q, 0.75, 0, 1, 1), c: '#2d333c' });
      }
      if (k === 'cap0' || k === 'cap1') {
        const xd = q[0][0];
        const P = (yy: number, zz: number): V3 => [xd, yy, zz];
        // saia escura, frisos das portas, maçanetas e para-lamas
        D.push({ p: [P(-1.75, 0.3), P(1.75, 0.3), P(1.75, 0.42), P(-1.75, 0.42)], c: dark });
        D.push({ p: [P(-0.87, 0.36), P(-0.84, 0.36), P(-0.84, 0.92), P(-0.87, 0.92)], c: dark });
        D.push({ p: [P(0.22, 0.36), P(0.25, 0.36), P(0.25, 0.93), P(0.22, 0.93)], c: dark });
        D.push({ p: [P(1.1, 0.36), P(1.13, 0.36), P(1.13, 0.95), P(1.1, 0.95)], c: dark });
        D.push({ p: [P(-0.2, 0.78), P(0.02, 0.78), P(0.02, 0.82), P(-0.2, 0.82)], c: dark });
        D.push({ p: [P(0.85, 0.78), P(1.02, 0.78), P(1.02, 0.82), P(0.85, 0.82)], c: dark });
        if (xd < 0 && door > 0.02) D.push({ p: [P(-0.84, 0.34), P(0.22, 0.34), P(0.22, 0.92), P(-0.84, 0.92)], c: '#2a2f38' });
        // roda vista de lado: pneu escuro dentro do arco e miolo claro (a parte de baixo é o pneu de verdade)
        for (const wy of [-1.35, 1.35]) {
          D.push({ p: Array.from({ length: 9 }, (_, i): V3 => [xd, wy + Math.cos((i / 8) * Math.PI) * 0.44, 0.3 + Math.sin((i / 8) * Math.PI) * 0.47]), c: '#1a1e24' });
          D.push({ p: Array.from({ length: 9 }, (_, i): V3 => [xd, wy + Math.cos((i / 8) * Math.PI) * 0.33, 0.3 + Math.sin((i / 8) * Math.PI) * 0.37]), c: TIRE });
          D.push({ p: Array.from({ length: 7 }, (_, i): V3 => [xd, wy + Math.cos((i / 6) * Math.PI) * 0.19, 0.3 + Math.sin((i / 6) * Math.PI) * 0.22]), c: '#c9ced6' });
          D.push({ p: Array.from({ length: 5 }, (_, i): V3 => [xd, wy + Math.cos((i / 4) * Math.PI) * 0.07, 0.3 + Math.sin((i / 4) * Math.PI) * 0.09]), c: '#7c848f' });
        }
      }
      return D;
    }),
  );
  // cabine: para-brisa e vidro traseiro são vidro, teto na cor do carro, laterais com janela
  const cab: V2[] = [[-1.0, 0.92], [1.25, 0.95], [0.85, 1.45], [-0.3, 1.47]];
  parts.push(
    extrude(cab, 'x', -0.8, 0.8, (k) => (k === 1 || k === 3 ? GLASS : color), (k, q) => {
      if (k === 1 || k === 3) return [{ p: subq(q, 0.15, 0.25, 0.35, 0.85), c: GLASS_HI, o: 0.5 }];
      if (k === 2) return [{ p: subq(q, 0.1, 0.12, 0.9, 0.88), c: scale(color, 0.94) }];
      if (k === 'cap0' || k === 'cap1') {
        const xd = q[0][0];
        const w = inset(q, 0.86).map((p): V3 => [xd, p[1], p[2] + 0.02]);
        const P = (yy: number, zz: number): V3 => [xd, yy, zz];
        return [
          { p: w, c: GLASS },
          { p: [P(0.18, 0.9), P(0.3, 0.9), P(0.3, 1.5), P(0.18, 1.5)], c: color },
          { p: [P(-0.6, 1.05), P(-0.45, 1.05), P(-0.25, 1.35), P(-0.4, 1.35)], c: GLASS_HI, o: 0.45 },
        ];
      }
      return undefined;
    }),
  );
  // rodas (só as faces de fora aparecem; o lado de dentro some atrás da carroceria)
  for (const wx of [-1, 1])
    for (const wy of [-1.35, 1.35]) {
      const x0 = wx < 0 ? -0.9 : 0.66, x1 = wx < 0 ? -0.66 : 0.9;
      parts.push(
        extrude(circle(0.34, 12), 'x', x0, x1, TIRE, (k, q) => {
          if ((k === 'cap0' && wx < 0) || (k === 'cap1' && wx > 0)) return [{ p: inset(q, 0.55), c: '#c9ced6' }, { p: inset(q, 0.2), c: '#7c848f' }];
          return undefined;
        }),
      );
      const last = parts[parts.length - 1];
      parts[parts.length - 1] = { ...last, faces: last.faces.map((f) => ({ ...f, p: f.p.map(([a, b, c]): V3 => [a, b + wy, c + 0.34]) })), center: [last.center[0], last.center[1] + wy, last.center[2] + 0.34], bias: -50 };
    }
  // retrovisores
  for (const sx of [-1, 1]) parts.push(box(sx < 0 ? -1.1 : 0.92, -0.95, 0.93, sx < 0 ? -0.92 : 1.1, -0.8, 1.08, color, (k, q) => (k === 's' ? [{ p: inset(q, 0.7), c: GLASS }] : undefined)));
  // porta do motorista (lado esquerdo), com dobradiça na frente
  if (door > 0.02) {
    const a = door * 1.15;
    const hinge = chain(T(-0.92, -0.85, 0), Rz(a));
    const painel = box(-0.07, 0, 0.34, 0, 1.07, 0.92, color, (k, q) =>
      k === 'w' ? [{ p: subq(q, 0.65, 0.62, 0.85, 0.68), c: dark }] : k === 'e' ? [{ p: subq(q, 0.05, 0.1, 0.95, 0.9), c: '#4a505b' }] : undefined,
    );
    const janela = extrude([[0, 0.92], [1.07, 0.92], [1.07, 1.42], [0.45, 1.44]], 'x', -0.05, -0.02, GLASS);
    const d = tfObj({ parts: [painel, janela] }, hinge);
    parts.push(...d.parts);
  }
  // luzes que brilham
  if (brake) {
    glows.push({ p: [-0.72, 2.18, 0.67], n: [0, 1, 0], r: 6, c: '#ff3b30' }, { p: [0.72, 2.18, 0.67], n: [0, 1, 0], r: 6, c: '#ff3b30' });
  }
  if (blink === 'r') glows.push({ p: [0.82, 2.18, 0.58], n: [0, 1, 0], r: 7, c: '#ffb020' }, { p: [0.9, -2.15, 0.52], n: [0, -1, 0], r: 6, c: '#ffb020' }, { p: [1.1, -0.88, 1.0], r: 4, c: '#ffb020' });
  if (blink === 'l') glows.push({ p: [-0.82, 2.18, 0.58], n: [0, 1, 0], r: 7, c: '#ffb020' }, { p: [-1.1, -0.88, 1.0], r: 4, c: '#ffb020' });
  return tfObj({ parts, glows, shadow: true }, chain(T(x, y), Rz(heading)));
}

/* ================= pessoa (chibi) ================= */
export interface Look {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  shoes?: string;
  bun?: boolean;
  glasses?: boolean;
  bag?: string;
  /** saia (parte de baixo larga) */
  skirt?: boolean;
  /** uniforme de agente de trânsito: boné, colete refletivo, luvas e apito */
  cap?: string;
  vest?: string;
  gloves?: string;
  whistle?: boolean;
}

/** pose dos braços: [abrir para o lado, levantar para a frente], em radianos (0 = caído; π/2 = na horizontal; π = para cima) */
export interface Arms {
  l?: [number, number];
  r?: [number, number];
}

/** pessoa em pé ou andando. `step` = fase da passada (radianos); `face` = direção para onde olha (0 = norte, π = sul) */
export function person(x: number, y: number, look: Look, step = 0, face = 0, s = 1.12, arms?: Arms): Obj {
  const parts: Part[] = [];
  const sw = Math.sin(step) * 0.45;
  const lift = Math.max(0, Math.cos(step)) * 0.04;
  // pernas (giram no quadril)
  for (const side of [-1, 1]) {
    const a = side * sw;
    const hip = chain(T(0, 0, 0.68), Rx(a), T(0, 0, -0.68));
    const lx0 = side < 0 ? -0.15 : 0.03, lx1 = side < 0 ? -0.03 : 0.15;
    const z0 = side * a > 0 ? lift : 0;
    parts.push(tfObj({ parts: [box(lx0, -0.065, z0 + 0.09, lx1, 0.065, 0.68, look.bottom)] }, hip).parts[0]);
    parts.push(tfObj({ parts: [box(lx0 - 0.005, -0.13, z0, lx1 + 0.005, 0.075, z0 + 0.09, look.shoes ?? '#3a3330')] }, hip).parts[0]);
  }
  if (look.skirt) parts.push(lathe([[0.22, 0.44], [0.2, 0.7]], 6, look.bottom, Math.PI / 6));
  // tronco
  parts.push(
    box(-0.19, -0.115, 0.7, 0.19, 0.115, 1.2, look.top, (k, q) =>
      k === 'n' ? [{ p: subq(q, 0.38, 0.82, 0.62, 1), c: look.skin }] : undefined,
    ),
  );
  // braços (balançam ao contrário das pernas, ou ficam na pose pedida)
  for (const side of [-1, 1]) {
    const pose = side < 0 ? arms?.l : arms?.r;
    const a = pose ? -pose[1] : -side * sw * 0.8;
    const px = side * 0.24;
    const sh = chain(T(px, 0, 1.15), Ry(-side * (pose?.[0] ?? 0)), Rx(a), T(-px, 0, -1.15));
    const ax0 = side < 0 ? -0.29 : 0.19, ax1 = side < 0 ? -0.19 : 0.29;
    parts.push(tfObj({ parts: [box(ax0, -0.055, 0.82, ax1, 0.055, 1.18, look.top)] }, sh).parts[0]);
    parts.push(tfObj({ parts: [box(ax0 + 0.005, -0.05, 0.72, ax1 - 0.005, 0.05, 0.82, look.gloves ?? look.skin)] }, sh).parts[0]);
  }
  // colete refletivo por cima da camisa
  if (look.vest) {
    const v = look.vest;
    parts.push(box(-0.2, -0.125, 0.76, 0.2, 0.125, 1.17, v, (k, q) => (k === 'top' || k === 'bot' ? undefined : [{ p: subq(q, 0, 0.28, 1, 0.38), c: '#eef2f5' }, { p: subq(q, 0, 0.55, 1, 0.65), c: '#eef2f5' }])));
  }
  // bolsa no ombro direito
  if (look.bag) {
    parts.push(box(0.29, -0.1, 0.74, 0.38, 0.1, 0.98, look.bag, (k, q) => (k === 'top' ? [{ p: subq(q, 0, 0.4, 1, 0.6), c: scale(look.bag!, 0.75) }] : undefined)));
  }
  // cabeça grande (chibi), com rosto
  parts.push(
    box(-0.21, -0.2, 1.22, 0.21, 0.2, 1.6, look.skin, (k, q) => {
      if (k === 'n') {
        const D: Dec[] = [
          { p: subq(q, 0, 0.82, 1, 1), c: look.hair },
          { p: subq(q, 0.24, 0.42, 0.36, 0.6), c: '#1d2430', flat: true },
          { p: subq(q, 0.64, 0.42, 0.76, 0.6), c: '#1d2430', flat: true },
          { p: subq(q, 0.12, 0.28, 0.26, 0.36), c: '#f08a8a', o: 0.5 },
          { p: subq(q, 0.74, 0.28, 0.88, 0.36), c: '#f08a8a', o: 0.5 },
          { p: subq(q, 0.44, 0.2, 0.56, 0.25), c: '#7a3b33' },
        ];
        if (look.glasses) {
          D.push({ p: subq(q, 0.16, 0.38, 0.44, 0.42), c: '#2b3a48', flat: true });
          D.push({ p: subq(q, 0.56, 0.38, 0.84, 0.42), c: '#2b3a48', flat: true });
          D.push({ p: subq(q, 0.16, 0.62, 0.44, 0.66), c: '#2b3a48', flat: true });
          D.push({ p: subq(q, 0.56, 0.62, 0.84, 0.66), c: '#2b3a48', flat: true });
          D.push({ p: subq(q, 0.44, 0.56, 0.56, 0.6), c: '#2b3a48', flat: true });
        }
        return D;
      }
      if (k === 'e' || k === 'w') return [{ p: subq(q, 0, 0.55, 1, 1), c: look.hair }, { p: subq(q, k === 'e' ? 0 : 0.4, 0.55, k === 'e' ? 0.6 : 1, 1), c: look.hair }];
      if (k === 's') return [{ p: subq(q, 0, 0.15, 1, 1), c: look.hair }];
      return undefined;
    }),
  );
  if (look.cap) {
    parts.push(box(-0.225, -0.215, 1.55, 0.225, 0.215, 1.72, look.cap, (k, q) => (k === 'n' ? [{ p: subq(q, 0.38, 0.3, 0.62, 0.75), c: '#f2c21b' }] : undefined)));
    parts.push(box(-0.2, -0.37, 1.55, 0.2, -0.215, 1.58, scale(look.cap, 0.8)));
  } else parts.push(box(-0.225, -0.215, 1.6, 0.225, 0.215, 1.67, look.hair));
  if (look.whistle) parts.push(box(-0.04, -0.27, 1.27, 0.07, -0.2, 1.32, '#d9dee4'));
  if (look.bun) parts.push(box(-0.1, 0.2, 1.42, 0.1, 0.33, 1.62, look.hair));
  return tfObj({ parts, shadow: true }, chain(T(x, y), Rz(face), [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0]));
}

/* ================= ciclista ================= */
export function cyclist(x: number, y: number, pedal = 0, face = 0, cor = '#ff5a5f'): Obj {
  const parts: Part[] = [];
  const ln: Line[] = [];
  const wheel = (cy: number) => {
    const pts = circle(0.34, 14).map(([a, b]): V3 => [0, cy + a, 0.34 + b]);
    ln.push({ p: [...pts, pts[0]], c: '#1f2630', w: 1.7 });
    for (let k = 0; k < 3; k++) {
      const a = pedal * 0.6 + (k * Math.PI) / 3;
      ln.push({ p: [[0, cy + Math.cos(a) * 0.32, 0.34 + Math.sin(a) * 0.32], [0, cy - Math.cos(a) * 0.32, 0.34 - Math.sin(a) * 0.32]], c: '#9aa3ae', w: 0.4 });
    }
  };
  wheel(-0.56);
  wheel(0.56);
  const bb: V3 = [0, 0.05, 0.36], seat: V3 = [0, 0.22, 0.98], head: V3 = [0, -0.42, 0.98];
  ln.push({ p: [[0, 0.56, 0.34], bb, seat, [0, 0.56, 0.34]], c: '#2f8fd6', w: 1.5 });
  ln.push({ p: [bb, head, [0, -0.56, 0.34]], c: '#2f8fd6', w: 1.5 });
  ln.push({ p: [seat, head], c: '#2f8fd6', w: 1.3 });
  ln.push({ p: [[-0.24, -0.46, 1.06], [0.24, -0.46, 1.06]], c: '#1f2630', w: 1.4 });
  parts.push(lines(ln));
  parts[0] = { ...parts[0], center: [0, 0, 0.4] };
  // ciclista
  const hip: V3 = [0, 0.2, 1.04];
  for (const side of [-1, 1]) {
    const a = pedal + (side > 0 ? Math.PI : 0);
    const pd: V3 = [side * 0.12, bb[1] + Math.cos(a) * 0.17, bb[2] + Math.sin(a) * 0.17];
    const h: V3 = [side * 0.12, hip[1], hip[2]];
    const knee: V3 = [side * 0.13, (h[1] + pd[1]) / 2 - 0.2, (h[2] + pd[2]) / 2 + 0.12];
    parts.push(seg(h, knee, 0.13, '#33415a'));
    parts.push(seg(knee, pd, 0.11, '#33415a'));
    parts.push(box(side * 0.12 - 0.06, pd[1] - 0.12, pd[2] - 0.05, side * 0.12 + 0.06, pd[1] + 0.06, pd[2] + 0.03, '#2a2a2a'));
  }
  // tronco inclinado para a frente
  const sh: V3 = [0, -0.18, 1.5];
  parts.push(seg(hip, sh, 0.36, cor, 0.22));
  for (const side of [-1, 1]) parts.push(seg([side * 0.2, -0.14, 1.46], [side * 0.22, -0.44, 1.08], 0.09, cor));
  parts.push(box(-0.17, -0.48, 1.46, 0.17, -0.12, 1.8, '#c58c63'));
  parts.push(box(-0.19, -0.5, 1.72, 0.19, -0.1, 1.9, '#ffc83d', (k, q) => (k === 'top' ? [{ p: subq(q, 0.42, 0, 0.58, 1), c: '#2b3a48' }] : undefined)));
  return tfObj({ parts, shadow: true }, chain(T(x, y), Rz(face)));
}

/* ================= cenário ================= */
export function tree(x: number, y: number, s = 1, seed = 1): Obj {
  const r = rng(seed);
  const g = ['#4f9d4a', '#5aa953', '#47913f', '#62b35a'];
  const trunk = extrude(circle(0.14 * s, 6), 'z', 0, 1.3 * s, '#7a5235');
  const h = (2.6 + r() * 0.6) * s, w = (1.25 + r() * 0.25) * s;
  const crown = lathe(
    [[0, 1.0 * s], [w * 0.75, 1.25 * s], [w, 1.0 * s + h * 0.38], [w * 0.82, 1.0 * s + h * 0.7], [w * 0.4, 1.0 * s + h * 0.92], [0, 1.0 * s + h]],
    7,
    (k) => g[(k + seed) % g.length],
    r() * 2,
  );
  return { parts: [tf2(trunk, x, y), tf2(crown, x, y)], shadow: true };
}
const tf2 = (p: Part, x: number, y: number) => tfObj({ parts: [p] }, T(x, y)).parts[0];

export function bush(x: number, y: number, s = 1, seed = 2): Obj {
  const c = ['#5aa953', '#4f9d4a', '#69b860'];
  return { parts: [tf2(lathe([[0.5 * s, 0], [0.62 * s, 0.3 * s], [0.42 * s, 0.6 * s], [0, 0.7 * s]], 6, (k) => c[(k + seed) % 3], seed), x, y)], shadow: true };
}

export function lampPost(x: number, y: number, dir = -1): Obj {
  const c = '#5d6773';
  return {
    parts: [
      tf2(box(-0.08, -0.08, 0, 0.08, 0.08, 4.4, c), x, y),
      tf2(box(-0.2, -0.2, 0, 0.2, 0.2, 0.35, c), x, y),
      tf2(box(dir < 0 ? -1.1 : 0.06, -0.05, 4.3, dir < 0 ? -0.06 : 1.1, 0.05, 4.4, c), x, y),
      tf2(box(dir < 0 ? -1.3 : 0.9, -0.16, 4.15, dir < 0 ? -0.85 : 1.35, 0.16, 4.35, '#e9edf2'), x, y),
    ],
    shadow: true,
  };
}

/** semáforo virado para `face` (0 = as luzes olham para o sul) */
export function trafficLight(x: number, y: number, luz: 'vermelho' | 'amarelo' | 'verde', face = 0): Obj {
  const pole = '#3d4652';
  const on = { vermelho: '#ff3b30', amarelo: '#ffc83d', verde: '#22d36b' };
  const off = { vermelho: '#5a2a2a', amarelo: '#5a4a22', verde: '#22472f' };
  const lamp = (k: 'vermelho' | 'amarelo' | 'verde') => (k === luz ? on[k] : off[k]);
  const parts: Part[] = [
    box(-0.07, -0.07, 0, 0.07, 0.07, 3.3, pole),
    box(-0.18, -0.12, 2.25, 0.18, 0.18, 3.35, '#2b323b', (k, q) => {
      if (k !== 's') return undefined;
      const D: Dec[] = [];
      (['verde', 'amarelo', 'vermelho'] as const).forEach((c, i) => {
        const v0 = 0.08 + i * 0.31;
        D.push({ p: subqOval(q, 0.5, v0 + 0.12, 0.3, 0.12), c: lamp(c), flat: c === luz });
      });
      return D;
    }),
    // pala em cima de cada luz
    box(-0.2, 0.18, 3.28, 0.2, 0.32, 3.3, '#2b323b'),
  ];
  const glows: Glow[] = [{ p: [0, 0.19, 2.25 + (0.08 + { verde: 0, amarelo: 1, vermelho: 2 }[luz] * 0.31 + 0.12) * 1.1], n: [0, 1, 0], r: 11, c: on[luz] }];
  return tfObj({ parts, glows, shadow: true }, chain(T(x, y), Rz(face)));
}
/** oval (círculo achatado) dentro de um quadrilátero, em coordenadas (u, v) */
function subqOval(q: V3[], cu: number, cv: number, ru: number, rv: number): V3[] {
  return circle(1, 12).map(([a, b]) => {
    const u = cu + a * ru, v = cv + b * rv;
    const p0 = q[0], p1 = q[1], p3 = q[3];
    return [p0[0] + (p1[0] - p0[0]) * u + (p3[0] - p0[0]) * v, p0[1] + (p1[1] - p0[1]) * u + (p3[1] - p0[1]) * v, p0[2] + (p1[2] - p0[2]) * u + (p3[2] - p0[2]) * v] as V3;
  });
}

/** janelas em grade numa face de prédio */
function windows(q: V3[], cols: number, rows: number, opts: { glass?: string; frame?: string; ground?: boolean; door?: number } = {}): Dec[] {
  const glass = opts.glass ?? '#8fb8d8';
  const D: Dec[] = [];
  const z0 = opts.ground ? 0.28 : 0.08;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const u0 = (c + 0.22) / cols, u1 = (c + 0.78) / cols;
      const v0 = z0 + ((1 - z0 - 0.06) * (r + 0.2)) / rows, v1 = z0 + ((1 - z0 - 0.06) * (r + 0.78)) / rows;
      if (opts.frame) D.push({ p: subq(q, u0 - 0.02 / cols, v0 - 0.01, u1 + 0.02 / cols, v1 + 0.01), c: opts.frame });
      D.push({ p: subq(q, u0, v0, u1, v1), c: glass });
      D.push({ p: subq(q, u0, v0 + (v1 - v0) * 0.55, u0 + (u1 - u0) * 0.35, v1), c: '#d9ecf8', flat: true, o: 0.55 });
    }
  if (opts.ground) {
    // térreo: vitrine larga e porta
    D.push({ p: subq(q, 0.06, 0.02, 0.94, 0.22), c: scale(glass, 0.85) });
    D.push({ p: subq(q, 0.06, 0.2, 0.94, 0.24), c: '#e85d3a' });
    if (opts.door !== undefined) D.push({ p: subq(q, opts.door - 0.06, 0, opts.door + 0.06, 0.17), c: '#6b4a32' });
  }
  return D;
}

export interface BuildingOpts {
  x0: number; y0: number; x1: number; y1: number; h: number;
  color: string;
  floors?: number;
  /** térreo de loja na face indicada */
  shop?: BoxKey;
  tank?: boolean;
  seed?: number;
}
export function building({ x0, y0, x1, y1, h, color, floors, shop, tank = true, seed = 3 }: BuildingOpts): Obj {
  const fl = floors ?? Math.max(1, Math.round(h / 3));
  const r = rng(seed);
  const parts: Part[] = [
    box(x0, y0, 0, x1, y1, h, color, (k, q) => {
      if (k === 'top') return [{ p: inset(q, 0.9), c: scale(color, 0.82) }];
      if (k === 'bot') return undefined;
      const len = k === 'n' || k === 's' ? x1 - x0 : y1 - y0;
      const cols = Math.max(1, Math.round(len / 2.2));
      return [{ p: subq(q, 0, 0, 1, 0.03), c: scale(color, 0.7) }, ...windows(q, cols, fl, { ground: shop === k, door: 0.5, frame: scale(color, 1.12) })];
    }),
    // platibanda (mureta do terraço)
    box(x0, y0, h, x1, y0 + 0.2, h + 0.4, scale(color, 1.05)),
    box(x0, y1 - 0.2, h, x1, y1, h + 0.4, scale(color, 1.05)),
    box(x0, y0 + 0.2, h, x0 + 0.2, y1 - 0.2, h + 0.4, scale(color, 1.05)),
    box(x1 - 0.2, y0 + 0.2, h, x1, y1 - 0.2, h + 0.4, scale(color, 1.05)),
  ];
  if (tank) {
    const tx = x0 + (x1 - x0) * (0.3 + r() * 0.4), ty = y0 + (y1 - y0) * (0.3 + r() * 0.4);
    parts.push(tf2(lathe([[0.55, 0], [0.6, 0.5], [0.5, 0.75], [0, 0.85]], 8, '#3f8fd8'), tx, ty));
    parts[parts.length - 1] = tfObj({ parts: [parts[parts.length - 1]] }, T(0, 0, h)).parts[0];
    const ax = x0 + 0.6 + r() * (x1 - x0 - 2);
    parts.push(box(ax, y1 - 1.0, h, ax + 0.7, y1 - 0.4, h + 0.45, '#cfd6dd', (k, q) => (k === 's' ? [{ p: inset(q, 0.7), c: '#8a949f' }] : undefined)));
  }
  return { parts, shadow: true };
}

/** casa térrea com telhado de duas águas (cumeeira no sentido x) */
export function house(x0: number, y0: number, x1: number, y1: number, wall: string, roof = '#c8553d', front: BoxKey = 's'): Obj {
  const h = 2.8;
  const ym = (y0 + y1) / 2;
  const walls = box(x0, y0, 0, x1, y1, h, wall, (k, q) => {
    if (k !== front) return undefined;
    return [
      { p: subq(q, 0.1, 0.0, 0.26, 0.75), c: '#7a5235' },
      { p: subq(q, 0.22, 0.32, 0.24, 0.4), c: '#e8c35a', flat: true },
      { p: subq(q, 0.42, 0.35, 0.62, 0.75), c: '#f2f2ee' },
      { p: subq(q, 0.44, 0.38, 0.6, 0.72), c: '#8fb8d8' },
      { p: subq(q, 0.72, 0.35, 0.92, 0.75), c: '#f2f2ee' },
      { p: subq(q, 0.74, 0.38, 0.9, 0.72), c: '#8fb8d8' },
      { p: subq(q, 0, 0, 1, 0.05), c: scale(wall, 0.75) },
    ];
  });
  const roofPart = extrude([[y0 - 0.4, h - 0.1], [y1 + 0.4, h - 0.1], [ym, h + 1.5]], 'x', x0 - 0.3, x1 + 0.3, (k) => (typeof k === 'number' ? roof : mix(wall, '#ffffff', 0.08)), (k, q) =>
    typeof k === 'number' && k > 0 ? [0.2, 0.4, 0.6, 0.8].map((v) => ({ p: subq(q, 0, v, 1, v + 0.04), c: scale(roof, 0.82) })) : undefined,
  );
  return { parts: [walls, roofPart], shadow: true };
}

export function bench(x: number, y: number, rot = 0): Obj {
  const wood = '#b98a5a', iron = '#3d4652';
  return tfObj(
    {
      parts: [
        box(-0.8, -0.22, 0.42, 0.8, 0.22, 0.5, wood),
        box(-0.8, 0.18, 0.5, 0.8, 0.26, 0.9, wood),
        box(-0.72, -0.2, 0, -0.62, 0.2, 0.42, iron),
        box(0.62, -0.2, 0, 0.72, 0.2, 0.42, iron),
      ],
      shadow: true,
    },
    chain(T(x, y), Rz(rot)),
  );
}

export function bin(x: number, y: number): Obj {
  return { parts: [tf2(lathe([[0.22, 0], [0.26, 0.8], [0.27, 0.9]], 8, (k) => (k === 1 ? '#2e8b57' : '#22b357')), x, y)], shadow: true };
}

export function hydrant(x: number, y: number): Obj {
  return {
    parts: [
      tf2(lathe([[0.16, 0], [0.13, 0.12], [0.13, 0.55], [0.15, 0.6], [0, 0.75]], 8, '#e0412f'), x, y),
      tf2(box(-0.22, -0.05, 0.38, 0.22, 0.05, 0.46, '#c9372a'), x, y),
    ],
    shadow: true,
  };
}

export function bollard(x: number, y: number): Obj {
  return { parts: [tf2(lathe([[0.1, 0], [0.1, 0.75], [0, 0.82]], 6, (k) => (k === 0 ? '#e8e8e2' : '#ffc83d')), x, y)], shadow: true };
}

export function wall(x0: number, y0: number, x1: number, y1: number, h: number, c: string): Obj {
  return { parts: [box(x0, y0, 0, x1, y1, h, c, (k, q) => (k === 'top' ? [{ p: inset(q, 0.98), c: scale(c, 1.08) }] : undefined))], shadow: true };
}

/** grade (portão) com barras */
export function gate(x: number, y0: number, y1: number, h: number): Obj {
  const ln: Line[] = [];
  for (let yy = y0; yy <= y1 + 1e-6; yy += 0.18) ln.push({ p: [[x, yy, 0], [x, yy, h]], c: '#3d4652', w: 0.8 });
  ln.push({ p: [[x, y0, h], [x, y1, h]], c: '#3d4652', w: 1.2 });
  ln.push({ p: [[x, y0, 0.15], [x, y1, 0.15]], c: '#3d4652', w: 1 });
  return { parts: [{ ...lines(ln), center: [x, (y0 + y1) / 2, h / 2] }], shadow: false };
}

/* ================= chão ================= */
/** asfalto com manchas e remendos espalhados */
export function asphalt(x0: number, y0: number, x1: number, y1: number, seed = 7): Part[] {
  const r = rng(seed);
  const out: Part[] = [rect(x0, y0, x1, y1, '#5b636e')];
  const n = Math.round(((x1 - x0) * (y1 - y0)) / 5);
  for (let i = 0; i < n; i++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), w = 0.2 + r() * 0.8, h = 0.15 + r() * 0.5;
    const pts: V2[] = circle(1, 6, r() * 3).map(([a, b]) => [Math.min(x1, Math.max(x0, cx + a * w)), Math.min(y1, Math.max(y0, cy + b * h))]);
    out.push({ ...rect(0, 0, 0, 0, '#000'), faces: [{ p: pts.map(([a, b]): V3 => [a, b, 0]), c: r() < 0.5 ? '#565e68' : '#606872', flat: true, n: [0, 0, 1], o: 0.7 }] });
  }
  return out;
}

/** calçada: bloco de 15 cm com meio-fio e rejuntes */
export function sidewalk(x0: number, y0: number, x1: number, y1: number, seamAxis: 'x' | 'y' = 'y'): Part[] {
  const c = '#dcd5c6';
  const p = box(x0, y0, 0, x1, y1, 0.15, (k) => (k === 'top' ? c : '#b9b1a1'));
  const ln: Line[] = [];
  if (seamAxis === 'y') for (let yy = Math.ceil(y0 / 1.5) * 1.5; yy < y1; yy += 1.5) ln.push({ p: [[x0, yy, 0.16], [x1, yy, 0.16]], c: '#c4bcab', w: 0.5 });
  else for (let xx = Math.ceil(x0 / 1.5) * 1.5; xx < x1; xx += 1.5) ln.push({ p: [[xx, y0, 0.16], [xx, y1, 0.16]], c: '#c4bcab', w: 0.5 });
  return [p, lines(ln)];
}

/** faixa de pedestres: barras compridas no sentido `along` */
export function zebra(x0: number, y0: number, x1: number, y1: number, along: 'x' | 'y'): Part[] {
  const out: Part[] = [];
  if (along === 'x') for (let yy = y0 + 0.25; yy + 0.45 <= y1; yy += 0.9) out.push(rect(x0, yy, x1, yy + 0.5, '#eeeeea'));
  else for (let xx = x0 + 0.25; xx + 0.45 <= x1; xx += 0.9) out.push(rect(xx, y0, xx + 0.5, y1, '#eeeeea'));
  return out;
}

export function grassPatches(x0: number, y0: number, x1: number, y1: number, seed = 11): Part[] {
  const r = rng(seed);
  const out: Part[] = [rect(x0, y0, x1, y1, '#9fd08e')];
  for (let i = 0; i < Math.round(((x1 - x0) * (y1 - y0)) / 6); i++) {
    const cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0), w = 0.4 + r() * 1.2;
    out.push(rect(Math.max(x0, cx - w), Math.max(y0, cy - w * 0.4), Math.min(x1, cx + w), Math.min(y1, cy + w * 0.4), r() < 0.5 ? '#93c682' : '#abd99a'));
  }
  return out;
}

export function manhole(x: number, y: number): Part[] {
  return [
    { ...rect(0, 0, 0, 0, '#000'), faces: [{ p: circle(0.42, 12).map(([a, b]): V3 => [x + a, y + b, 0]), c: '#474e57', flat: true, n: [0, 0, 1] }] },
    { ...rect(0, 0, 0, 0, '#000'), faces: [{ p: circle(0.32, 12).map(([a, b]): V3 => [x + a, y + b, 0]), c: '#3c424a', flat: true, n: [0, 0, 1] }] },
  ];
}

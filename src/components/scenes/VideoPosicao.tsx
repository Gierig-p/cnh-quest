/**
 * Vídeo do cartão c5-posicao ("Posição certa ao dirigir"), Mundo 5, lote 2 de 17/11/2026.
 * Motorista visto de lado (pixels): braços e pernas dobrados, costas apoiadas, encosto de cabeça
 * na altura dos olhos, mãos às 9h15, calcanhar no assoalho, calçado preso e o exemplo do Léo.
 * Tempos em content/videos/posicao.json.
 */
import type { ReactNode } from 'react';
import { TINTA, chip, etiqueta, nao, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { escuro, fazerVideo, lerp, type Quadro } from './videoBase';
import tempos from '../../content/videos/posicao.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const PELE = '#d9a37a';
const CAMISA = '#3f7fd0';
const CALCA = '#3b5a8a';

function fundo(lt: number, o = 0.5, over?: () => ReactNode): Quadro {
  const q = ruaFundo(lt);
  return { ...q, over: () => (
    <>
      {escuro(o)}
      {over?.()}
    </>
  ) };
}

type P = [number, number];
/** joelho/cotovelo: junta de dois ossos de tamanho fixo (l1, l2) entre a e b; `lado` escolhe para onde dobra */
function ik(a: P, b: P, l1: number, l2: number, lado: number): P {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  const d = Math.min(n, l1 + l2 - 0.01);
  const ux = dx / n;
  const uy = dy / n;
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  return [a[0] + ux * x - uy * h * lado, a[1] + uy * x + ux * h * lado];
}

/** membro afinando de `a` (largura wa) até `b` (largura wb), com pontas arredondadas */
function membro(a: P, b: P, wa: number, wb: number, cor: string): ReactNode {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  const px = -dy / n;
  const py = dx / n;
  const pts = [
    [a[0] + (px * wa) / 2, a[1] + (py * wa) / 2],
    [b[0] + (px * wb) / 2, b[1] + (py * wb) / 2],
    [b[0] - (px * wb) / 2, b[1] - (py * wb) / 2],
    [a[0] - (px * wa) / 2, a[1] - (py * wa) / 2],
  ];
  return (
    <g fill={cor}>
      <circle cx={a[0]} cy={a[1]} r={wa / 2} />
      <circle cx={b[0]} cy={b[1]} r={wb / 2} />
      <polygon points={pts.map((q) => q.join(',')).join(' ')} />
    </g>
  );
}

/** ponto entre a e b (0 = a, 1 = b) */
const entre = (a: P, b: P, f: number): P => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];

interface Pose {
  /** 0 = banco longe, braços e pernas esticados; 1 = braços e pernas um pouco dobrados */
  dobra: number;
  /** altura do encosto de cabeça: 0 = no pescoço, 1 = na altura dos olhos */
  apoio: number;
  /** 1 = tênis, 0 = chinelo */
  tenis?: number;
  /** destaque (anel amarelo) em: braço, perna, costas, cabeça, pé */
  luz?: 'braco' | 'perna' | 'costas' | 'cabeca' | 'pe' | null;
  o?: number;
  /** tempo do trecho: a paisagem passa pela janela */
  lt?: number;
  /** cena de noite (céu escuro, cabine na penumbra, painel aceso); `parado` = a paisagem não anda */
  noite?: boolean;
  parado?: boolean;
  /** pálpebra: 0 = olho aberto, 1 = fechado */
  olho?: number;
  /** bocejo: 0 = boca fechada, 1 = bem aberta */
  boca?: number;
  /** vidro da janela: 0 = fechado, 1 = aberto (com vento entrando) */
  vidro?: number;
}

const JANELA = 'M54 52 Q56 47 64 47 L176 45 Q186 45 192 50 L236 90 L54 92 Z';

/** paisagem vista pela janela lateral, andando para trás (o carro vai para a direita) */
function paisagemJanela(lt: number, noite = false, vidro = 0): ReactNode {
  const des = (lt * 46) % 90;
  if (noite)
    return (
      <g clipPath="url(#vp-janela)">
        <rect x={40} y={40} width={210} height={56} fill="url(#vp-ceu-noite)" />
        {[[70, 52], [98, 58], [122, 50], [150, 56], [188, 53], [212, 60], [84, 63]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r={0.8} fill="#ffffff" opacity={0.75} />)}
        <circle cx={204} cy={56} r={5} fill="#f4efd2" />
        <circle cx={206.5} cy={54.5} r={4.2} fill="#1c2b4f" />
        <path d="M40 78 Q80 73 120 76 Q170 72 250 75 L250 96 L40 96 Z" fill="#14231f" />
        {[0, 1, 2, 3].map((k) => {
          const x = 40 + k * 90 - des;
          return (
            <g key={k} fill="#0f1b17">
              <rect x={x + 18} y={66} width={2.4} height={11} />
              <circle cx={x + 19} cy={63} r={8} />
              <circle cx={x + 24} cy={67} r={5.5} />
            </g>
          );
        })}
        <rect x={40} y={83} width={210} height={13} fill="#20252d" />
        {[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={40 + k * 40 - ((lt * 120) % 40)} y={87} width={18} height={1.4} fill="#c9c3a0" opacity={0.45} />)}
        {/* vidro: desce quando a janela abre; com ela aberta, riscos de vento */}
        <path d={`M64 ${47 + vidro * 45} L96 ${47 + vidro * 45} L${70 + vidro * 0} 92 L54 92 Z`} fill="#ffffff" opacity={0.07 * (1 - vidro)} />
        {vidro > 0.02 && <line x1={54} y1={47 + vidro * 45} x2={236} y2={47 + vidro * 45} stroke="#8ea3bd" strokeWidth={1.4} opacity={0.8} />}
        {vidro > 0.4 &&
          [0, 1, 2, 3].map((k) => {
            const x = 230 - ((lt * 160 + k * 47) % 190);
            const y = 56 + k * 8;
            return <path key={k} d={`M${x} ${y} q12 -3 24 0`} fill="none" stroke="#dfe8f3" strokeWidth={1.2} strokeLinecap="round" opacity={0.7 * vidro} />;
          })}
      </g>
    );
  return (
    <g clipPath="url(#vp-janela)">
      <rect x={40} y={40} width={210} height={56} fill="url(#vp-ceu)" />
      <path d="M40 76 Q80 70 120 74 Q170 69 250 73 L250 96 L40 96 Z" fill="#8cbf7f" />
      {[0, 1, 2, 3].map((k) => {
        const x = 40 + k * 90 - des;
        return (
          <g key={k}>
            <rect x={x + 18} y={64} width={2.4} height={12} fill="#7a5235" />
            <circle cx={x + 19} cy={61} r={8} fill="#4f9d4a" />
            <circle cx={x + 24} cy={65} r={5.5} fill="#5aa953" />
            <rect x={x + 58} y={70} width={1.6} height={8} fill="#c9cdd2" />
            <rect x={x + 55} y={66} width={8} height={5} rx={1} fill="#1f7a4d" />
          </g>
        );
      })}
      <rect x={40} y={82} width={210} height={14} fill="#6b737d" />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={40 + k * 40 - ((lt * 120) % 40)} y={86} width={18} height={1.6} fill="#ffffff" opacity={0.8} />)}
      {/* reflexo no vidro */}
      <path d="M64 47 L96 47 L70 92 L54 92 Z" fill="#ffffff" opacity={0.12} />
    </g>
  );
}

/** tênis (calçado preso) ou pé no chinelo, de lado; `u` vai do calcanhar para os dedos e `v` para cima */
function calcado(calc: P, pe: P, tenis: boolean): ReactNode {
  const dx = pe[0] - calc[0];
  const dy = pe[1] - calc[1];
  const n = Math.hypot(dx, dy) || 1;
  const u: P = [dx / n, dy / n];
  const v: P = [u[1], -u[0]];
  const w = (al: number, up: number) => `${calc[0] + u[0] * al + v[0] * up} ${calc[1] + u[1] * al + v[1] * up}`;
  if (tenis)
    return (
      <g>
        <path d={`M${w(-7, 2)} Q${w(-8, 9)} ${w(-3, 10)} L${w(6, 8)} Q${w(16, 6)} ${w(22, 2.5)} Q${w(25, 0)} ${w(23, -2)} L${w(-6, -2)} Z`} fill="#f2f4f7" stroke="#8d97a3" strokeWidth={0.8} />
        <path d={`M${w(-7, -1)} L${w(23.5, -1)} L${w(23, -4.5)} L${w(-6.5, -4.5)} Z`} fill="#5c6670" />
        <path d={`M${w(-7, 4)} Q${w(-6, 9)} ${w(-2, 9.5)} L${w(0, 3)} Z`} fill={AZ} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${w(5 + k * 3.4, 8.4)} L${w(7 + k * 3.4, 5.4)}`} stroke={AZ} strokeWidth={1.4} strokeLinecap="round" />)}
        <path d={`M${w(10, 1)} Q${w(16, 4)} ${w(21, 1.2)}`} fill="none" stroke="#c4cad2" strokeWidth={1} />
      </g>
    );
  return (
    <g>
      <path d={`M${w(-6, 2)} Q${w(-7, 8)} ${w(-2, 8)} L${w(10, 5)} Q${w(20, 3.5)} ${w(22, 0.5)} Q${w(21, -1)} ${w(17, -1)} L${w(-5, -1)} Z`} fill={PELE} stroke="#a8754f" strokeWidth={0.8} />
      <path d={`M${w(-9, -4)} L${w(25, -2)} L${w(25, -5)} L${w(-9, -7)} Z`} fill={LARANJA} />
      <path d={`M${w(9, -2.5)} Q${w(12, 6)} ${w(15, -2.5)}`} fill="none" stroke={AZ} strokeWidth={2} />
    </g>
  );
}

/** cabine vista de lado, motorista olhando para a direita. Quadro em (20..300, 20..190). */
export function cabine({ dobra, apoio, tenis = 1, luz = null, o = 1, lt = 0, noite = false, parado = false, olho = 0, boca = 0, vidro = 0 }: Pose): ReactNode {
  if (o < 0.01) return null;
  const bx = lerp(162.5, 174.5, dobra); // banco mais para trás quando esticado
  const quadril: P = [bx - 12, 140];
  const ombro: P = [bx - 22, 93];
  const H: P = [bx - 16, 70];
  const mao: P = [210, 98];
  const calc: P = [232, 176];
  const pe: P = [248, 162];
  // braço 34 + 36 e perna 46 + 46: medidas fixas, as juntas dobram de verdade
  const cotovelo = ik(ombro, mao, 34, 36, 1);
  const joelho = ik(quadril, calc, 46, 46, -1);
  const hApoio = lerp(86, 70, apoio);
  const ring = (p: P, r = 18) => <circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke="#ffd84a" strokeWidth={3} strokeDasharray="5 4" />;
  const [hx, hy] = H;
  return (
    <g opacity={o}>
      <defs>
        <linearGradient id="vp-porta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b6571" />
          <stop offset="1" stopColor="#353c46" />
        </linearGradient>
        <linearGradient id="vp-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb2e3" />
          <stop offset="1" stopColor="#d4e7f7" />
        </linearGradient>
        <linearGradient id="vp-camisa" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f68b3" />
          <stop offset="0.6" stopColor={CAMISA} />
          <stop offset="1" stopColor="#5a95dd" />
        </linearGradient>
        <linearGradient id="vp-banco" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a414a" />
          <stop offset="1" stopColor="#5a636e" />
        </linearGradient>
        <linearGradient id="vp-ceu-noite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1633" />
          <stop offset="1" stopColor="#24365f" />
        </linearGradient>
        <radialGradient id="vp-painel">
          <stop offset="0" stopColor="#8fd6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8fd6ff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="vp-janela">
          <path d={JANELA} />
        </clipPath>
      </defs>
      {/* lado de dentro da porta, com a janela */}
      <path d="M24 188 L24 62 Q26 42 48 40 L190 37 Q200 37 206 42 L274 78 L298 80 L298 188 Z" fill="url(#vp-porta)" />
      {paisagemJanela(parado ? 0 : lt, noite, vidro)}
      <path d={JANELA} fill="none" stroke="#1b1f25" strokeWidth={3.5} strokeLinejoin="round" />
      {/* coluna do meio, apoio de braço, maçaneta e alto-falante */}
      <rect x={128} y={44} width={7} height={50} fill="#262b32" />
      <path d="M40 120 L190 116 Q198 116 198 122 L198 126 L40 130 Z" fill="#5c6670" />
      <rect x={168} y={102} width={18} height={5} rx={2.5} fill="#8d97a3" />
      <rect x={150} y={146} width={40} height={18} rx={5} fill="#2f353d" />
      {[0, 1, 2, 3].map((k) => <line key={k} x1={155} y1={150 + k * 3.4} x2={185} y2={150 + k * 3.4} stroke="#4a525d" strokeWidth={1.2} strokeLinecap="round" />)}
      {/* para-brisa e coluna da frente */}
      <path d="M194 39 L206 40 L276 82 L264 84 Z" fill="#bcd6ee" opacity={0.85} />
      <path d="M190 38 L262 84" stroke="#1b1f25" strokeWidth={4} strokeLinecap="round" />
      {/* painel com o capô dos instrumentos */}
      <path d="M214 98 Q218 88 236 84 Q250 76 266 80 L298 82 L298 128 L238 128 Q224 122 214 98 Z" fill="#23282f" />
      <path d="M226 86 Q232 77 248 77 Q256 77 258 82" fill="none" stroke="#3a414a" strokeWidth={2} />
      <path d="M236 84 Q250 76 298 82" fill="none" stroke="#4a525d" strokeWidth={1.4} />
      {/* assoalho e tapete */}
      <rect x={24} y={178} width={274} height={10} fill="#1b1f25" />
      <rect x={150} y={176} width={110} height={4} rx={2} fill="#2f353d" />
      {/* pedal do acelerador */}
      <path d="M264 126 Q263 150 254 163" fill="none" stroke="#8d97a3" strokeWidth={3} strokeLinecap="round" />
      <rect x={237} y={168} width={20} height={6} rx={2} fill="#2a2f36" stroke="#5c6670" transform="rotate(-41 247 171)" />
      {/* banco de trás, mais escuro, atrás da coluna do meio */}
      <path d="M30 152 Q28 124 36 100 Q40 94 50 95 Q60 96 62 104 Q60 128 64 152 Z" fill="#3a414a" />
      <rect x={38} y={76} width={20} height={21} rx={7} fill="#3a414a" />
      <rect x={46} y={95} width={2.2} height={6} fill="#6b737d" />
      <path d="M28 150 Q28 140 38 139 L94 140 Q102 141 100 150 Q98 156 90 156 L36 157 Q28 156 28 150 Z" fill="#353c45" />
      {/* banco: base, encosto de cabeça com hastes, encosto e assento com costura */}
      <rect x={bx - 52} y={152} width={52} height={7} rx={2} fill="#262b32" />
      <rect x={bx - 44} y={159} width={8} height={19} fill="#262b32" />
      <rect x={bx - 22} y={159} width={8} height={19} fill="#262b32" />
      {[-1, 1].map((k) => <rect key={k} x={bx - 49 + k * 4} y={hApoio + 8} width={2.4} height={Math.max(0, 94 - hApoio - 8)} fill="#aab3bd" />)}
      <rect x={bx - 58} y={hApoio - 12} width={20} height={23} rx={8} fill="#5c6670" />
      <rect x={bx - 55} y={hApoio - 9} width={6} height={17} rx={3} fill="#6b7580" />
      <path d={`M${bx - 60} 150 Q${bx - 64} 120 ${bx - 56} 94 Q${bx - 52} 88 ${bx - 42} 90 Q${bx - 36} 92 ${bx - 34} 98 Q${bx - 36} 124 ${bx - 32} 150 Z`} fill="url(#vp-banco)" />
      <path d={`M${bx - 54} 104 Q${bx - 57} 124 ${bx - 54} 144`} fill="none" stroke="#2a3038" strokeWidth={1.2} strokeDasharray="2 2" />
      <path d={`M${bx - 62} 144 Q${bx - 62} 136 ${bx - 52} 135 L${bx + 2} 136 Q${bx + 12} 137 ${bx + 10} 146 Q${bx + 8} 153 ${bx} 153 L${bx - 56} 154 Q${bx - 62} 153 ${bx - 62} 144 Z`} fill="url(#vp-banco)" />
      <path d={`M${bx - 54} 139 L${bx + 2} 140`} fill="none" stroke="#2a3038" strokeWidth={1.2} strokeDasharray="2 2" />
      {/* pernas: coxa, joelho e canela, e o calçado */}
      {membro(quadril, joelho, 17, 12.5, CALCA)}
      {membro(joelho, entre(joelho, calc, 0.92), 12, 8.5, CALCA)}
      <path d={`M${joelho[0] - 3} ${joelho[1] - 2} Q${joelho[0] + 2} ${joelho[1] - 6} ${joelho[0] + 6} ${joelho[1] - 1}`} fill="none" stroke="#5677aa" strokeWidth={1.4} />
      {membro(entre(joelho, calc, 0.88), calc, 6.5, 6, tenis > 0.5 ? '#f2f4f7' : PELE)}
      {calcado(calc, pe, tenis > 0.5)}
      {/* pescoço, tronco com gola e cinto de segurança */}
      <rect x={hx - 7} y={hy + 6} width={10} height={16} rx={3} fill={PELE} />
      <path d={`M${bx - 30} 144 Q${bx - 36} 120 ${bx - 34} 100 Q${bx - 33} 88 ${bx - 24} 86 L${bx - 12} 86 Q${bx - 6} 92 ${bx - 6} 104 Q${bx - 4} 124 ${bx} 144 Z`} fill="url(#vp-camisa)" />
      <path d={`M${bx - 24} 86 Q${bx - 18} 92 ${bx - 12} 86`} fill="none" stroke="#24548f" strokeWidth={1.6} />
      <path d={`M${bx - 33} 84 L${bx - 2} 146`} stroke="#3a414a" strokeWidth={4.5} strokeLinecap="round" />
      <path d={`M${bx - 33} 84 L${bx - 2} 146`} stroke="#59626d" strokeWidth={1.2} />
      <path d={`M${bx - 30} 143 L${bx + 2} 145`} stroke="#3a414a" strokeWidth={4} strokeLinecap="round" />
      <rect x={bx - 6} y={142} width={8} height={6} rx={1.5} fill="#aab3bd" />
      {/* cabeça de perfil: rosto, cabelo, orelha, sobrancelha, olho e boca */}
      <circle cx={hx} cy={hy} r={12} fill={PELE} />
      <path d={`M${hx + 9} ${hy - 8} Q${hx + 12} ${hy - 4} ${hx + 11.5} ${hy - 2} L${hx + 15} ${hy + 3} Q${hx + 14.5} ${hy + 4.5} ${hx + 11.5} ${hy + 4.5} Q${hx + 12.5} ${hy + 7} ${hx + 11} ${hy + 8} Q${hx + 10} ${hy + 12} ${hx + 4} ${hy + 12.5} L${hx - 4} ${hy + 10} Z`} fill={PELE} />
      <path d={`M${hx + 10.5} ${hy - 7} Q${hx + 6} ${hy - 15} ${hx - 4} ${hy - 13.5} Q${hx - 14} ${hy - 11} ${hx - 13} ${hy + 1} Q${hx - 12} ${hy + 8} ${hx - 7} ${hy + 10} L${hx - 5} ${hy + 2} Q${hx - 1} ${hy - 4} ${hx + 3} ${hy - 4} Q${hx + 8} ${hy - 4} ${hx + 10.5} ${hy - 7} Z`} fill="#3a2a1f" />
      <path d={`M${hx - 9} ${hy - 9} Q${hx - 3} ${hy - 12} ${hx + 4} ${hy - 10}`} fill="none" stroke="#5a4130" strokeWidth={1} />
      <ellipse cx={hx - 2} cy={hy + 2} rx={2.6} ry={3.6} fill="#cf9670" stroke="#a8754f" strokeWidth={0.7} />
      <path d={`M${hx + 5} ${hy - 4} Q${hx + 8} ${hy - 5.5} ${hx + 10.5} ${hy - 4}`} fill="none" stroke="#3a2a1f" strokeWidth={1.3} strokeLinecap="round" />
      <ellipse cx={hx + 8} cy={hy - 1} rx={2} ry={1.4} fill="#ffffff" />
      <circle cx={hx + 8.8} cy={hy - 1} r={1.05} fill={TINTA} />
      {olho > 0.02 && (
        <>
          {/* pálpebra caindo sobre o olho, com a linha dos cílios na borda */}
          <rect x={hx + 5.6} y={hy - 2.8} width={5.2} height={0.4 + 2.9 * olho} fill={PELE} />
          <path d={`M${hx + 5.8} ${hy - 2.4 + 2.9 * olho} Q${hx + 8} ${hy - 1.6 + 2.9 * olho} ${hx + 10.4} ${hy - 2.4 + 2.9 * olho}`} fill="none" stroke="#3a2a1f" strokeWidth={0.9} strokeLinecap="round" />
          <path d={`M${hx + 6.2} ${hy + 1.6} Q${hx + 8} ${hy + 2.6} ${hx + 9.8} ${hy + 1.8}`} fill="none" stroke="#b7835f" strokeWidth={0.6} />
        </>
      )}
      {boca > 0.05 ? (
        <ellipse cx={hx + 9.6} cy={hy + 7.4 + boca * 0.6} rx={1.4 + boca * 0.5} ry={0.5 + boca * 2.2} fill="#6b2f2a" stroke="#9b5f45" strokeWidth={0.6} />
      ) : (
        <path d={`M${hx + 9} ${hy + 7.5} L${hx + 11.3} ${hy + 7.3}`} stroke="#9b5f45" strokeWidth={1} strokeLinecap="round" />
      )}
      {/* volante de lado e coluna da direção */}
      <path d={`M${mao[0]} ${mao[1]} L244 114`} stroke="#1b1f25" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={mao[0]} cy={mao[1]} rx={5} ry={22} transform={`rotate(-22 ${mao[0]} ${mao[1]})`} fill="none" stroke="#1b1f25" strokeWidth={5} />
      <ellipse cx={mao[0] + 3} cy={mao[1] + 1} rx={3} ry={6} transform={`rotate(-22 ${mao[0]} ${mao[1]})`} fill="#2a2f36" />
      {/* braço: manga, antebraço e mão fechada no volante */}
      {membro(ombro, entre(ombro, cotovelo, 0.55), 12, 10.5, CAMISA)}
      {membro(entre(ombro, cotovelo, 0.5), cotovelo, 8.5, 7.5, PELE)}
      {membro(cotovelo, mao, 7.5, 6, PELE)}
      <path d={`M${ombro[0] - 5} ${ombro[1] - 4} Q${ombro[0] + 2} ${ombro[1] - 7} ${ombro[0] + 6} ${ombro[1] - 2}`} fill="none" stroke="#5a95dd" strokeWidth={1.5} />
      <circle cx={mao[0] - 1} cy={mao[1]} r={4.8} fill={PELE} stroke="#a8754f" strokeWidth={0.8} />
      <path d={`M${mao[0] + 1} ${mao[1] - 4} Q${mao[0] + 5} ${mao[1] - 1} ${mao[0] + 2} ${mao[1] + 4}`} fill="none" stroke="#a8754f" strokeWidth={0.8} />
      {noite && (
        <>
          {/* penumbra da cabine e a luz fria do painel */}
          <path d="M24 188 L24 62 Q26 42 48 40 L190 37 Q200 37 206 42 L274 78 L298 80 L298 188 Z" fill="#0a1430" opacity={0.42} />
          <ellipse cx={250} cy={88} rx={30} ry={14} fill="url(#vp-painel)" />
          <path d="M238 86 Q250 80 262 84" fill="none" stroke="#8fd6ff" strokeWidth={1.6} opacity={0.8} />
        </>
      )}
      {luz === 'braco' && ring(cotovelo)}
      {luz === 'perna' && ring(joelho)}
      {luz === 'costas' && ring([bx - 40, 120], 22)}
      {luz === 'cabeca' && ring([bx - 48, hApoio], 16)}
      {luz === 'pe' && ring(calc, 14)}
    </g>
  );
}

/** volante de frente com as mãos às 9h15 e os ponteiros de relógio por cima */
function volante915(x: number, y: number, r: number, o = 1, rel = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#2a2f36" strokeWidth={r * 0.18} />
      <circle cx={x} cy={y} r={r * 0.24} fill="#2a2f36" />
      <line x1={x - r} y1={y} x2={x + r} y2={y} stroke="#2a2f36" strokeWidth={r * 0.12} />
      <g opacity={rel}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={x + Math.sin(a) * r * 0.72} cy={y - Math.cos(a) * r * 0.72} r={1.6} fill="#ffd84a" />;
        })}
        <line x1={x} y1={y} x2={x - r * 0.55} y2={y} stroke="#ffd84a" strokeWidth={4} strokeLinecap="round" />
        <line x1={x} y1={y} x2={x + r * 0.8} y2={y} stroke="#ffd84a" strokeWidth={2.5} strokeLinecap="round" />
      </g>
      {[-1, 1].map((s) => <ellipse key={s} cx={x + s * r} cy={y} rx={9} ry={12} fill={PELE} stroke="#a8754f" />)}
    </g>
  );
}

/** chinelo (sola + tira) e tênis vistos de lado */
function chinelo(x: number, y: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 30} y={y + 8} width={60} height={7} rx={3} fill="#ea7b2c" />
      <path d={`M${x - 6} ${y + 8} Q${x + 4} ${y - 8} ${x + 14} ${y + 8}`} fill="none" stroke="#2f6db5" strokeWidth={4} />
    </g>
  );
}
function tenis(x: number, y: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <path d={`M${x - 30} ${y + 14} L${x - 30} ${y - 6} Q${x - 18} ${y - 10} ${x - 6} ${y - 4} L${x + 22} ${y + 2} Q${x + 32} ${y + 6} ${x + 30} ${y + 14} Z`} fill="#f2f4f7" stroke="#8d97a3" />
      <rect x={x - 30} y={y + 10} width={60} height={5} rx={2} fill="#5c6670" />
      {[0, 1, 2].map((i) => <line key={i} x1={x - 14 + i * 8} y1={y - 5 + i} x2={x - 8 + i * 8} y2={y + 1 + i} stroke={AZ} strokeWidth={2} />)}
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. posição certa: cansa menos, reage rápido
    case 0:
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: 1, o: surge(lt, 0.1), lt })}
          {chip(120, 30, 'Cansa menos', VERDE, surge(lt, 1.6), 10)}
          {chip(92, 172, 'Pronto para reagir', AZ, surge(lt, 2.6), 10)}
        </>
      ));
    // 1. braços e pernas um pouco dobrados, sem esticar
    case 1: {
      const dob = surge(lt, 0.5, 1.0);
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: dob, apoio: 1, luz: lt > 0.3 ? (Math.floor(lt * 2) % 2 ? 'braco' : 'perna') : null, lt })}
          {nao(160, 30, 9, (1 - dob) * surge(lt, 0.1))}
          {chip(160, 30, 'Um pouco dobrados', VERDE, dob, 10)}
        </>
      ));
    }
    // 2. costas apoiadas, perto de 90 graus
    case 2:
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: 1, luz: 'costas', lt })}
          {quadro(16, 154, 80, 24, surge(lt, 1.6), <text x={40} y={16} textAnchor="middle" fontSize={11} fontWeight={800} fill={TINTA}>≈ 90°</text>)}
          {chip(170, 30, 'Costas bem apoiadas', VERDE, surge(lt, 0.3), 10)}
        </>
      ));
    // 3. encosto de cabeça sobe até a altura dos olhos e protege o pescoço
    case 3: {
      const ap = surge(lt, 0.6, 1.2);
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: ap, luz: 'cabeca', lt })}
          {chip(170, 30, 'Na altura dos olhos', VERDE, surge(lt, 1.6), 10)}
          {chip(92, 172, 'Protege o pescoço', AZ, surge(lt, 3.0), 10)}
        </>
      ));
    }
    // 4. mãos às 9h15
    case 4:
      return fundo(lt, 0.6, () => (
        <>
          {quadro(94, 42, 132, 124, surge(lt, 0.1))}
          {volante915(160, 104, 46, surge(lt, 0.1), surge(lt, 1.6))}
          {chip(80, 30, '9 horas', AZ, surge(lt, 2.2), 11)}
          {chip(240, 30, '15 minutos', AZ, surge(lt, 2.8), 11)}
          {chip(160, 178, 'Mãos às 9h15', VERDE, surge(lt, d - 1.4), 11)}
        </>
      ));
    // 5. calcanhar no assoalho, pé fora do pedal
    case 5:
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: 1, luz: 'pe', lt })}
          {chip(150, 30, 'Calcanhar no assoalho', VERDE, surge(lt, 0.3), 10)}
          {chip(150, 54, 'Não descanse o pé no pedal', LARANJA, surge(lt, 3.0), 10)}
        </>
      ));
    // 6. calçado preso ao pé
    case 6:
      return fundo(lt, 0.6, () => (
        <>
          {quadro(30, 60, 120, 90, surge(lt, 0.1), chinelo(60, 44))}
          {nao(140, 66, 10, surge(lt, 0.8))}
          {quadro(170, 60, 120, 90, surge(lt, 0.4), tenis(60, 44))}
          {visto(280, 66, surge(lt, 1.2), 10)}
          {chip(160, 176, 'Calçado bem preso ao pé', VERDE, surge(lt, 1.6), 10)}
        </>
      ));
    // 7. exemplo: Léo ajusta o banco até os braços ficarem um pouco dobrados
    case 7: {
      const dob = surge(lt, 1.4, 1.6);
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: dob, apoio: 0, tenis: 0, luz: dob > 0.05 && dob < 0.95 ? 'braco' : null, lt })}
          {chip(60, 30, 'Léo', AZ, surge(lt, 0.2), 11)}
          {chip(180, 30, 'Ajusta o banco', VERDE, surge(lt, 1.2), 10)}
          {visto(250, 30, surge(lt, 3.2), 9)}
        </>
      ));
    }
    // 8. sobe o encosto de cabeça e troca o chinelo pelo tênis
    case 8: {
      const ap = surge(lt, 0.4, 1.0);
      const tn = lt > 2.4 ? 1 : 0;
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: ap, tenis: tn, luz: lt < 2.2 ? 'cabeca' : 'pe', lt })}
          {chip(170, 30, 'Encosto na altura dos olhos', VERDE, surge(lt, 0.6), 9.5)}
          {chip(150, 54, 'Chinelo → tênis', VERDE, surge(lt, 2.4), 10)}
        </>
      ));
    }
    // 9. para guardar
    default:
      return fundo(lt, 0.55, () => (
        <>
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(14, 70, 92, 'Mãos', '9h15', AZ, surge(lt, 0.6))}
          {etiqueta(114, 70, 92, 'Braços', 'Dobrados', VERDE, surge(lt, 1.6))}
          {etiqueta(214, 70, 92, 'Costas', 'Apoiadas', VERDE, surge(lt, 2.4))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

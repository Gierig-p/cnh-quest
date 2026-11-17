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
const CALCA = '#2c3e5c';
const BANCO = '#4a525d';

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
/** joelho/cotovelo: ponto médio entre a e b, empurrado `k` px para o lado (sinal escolhe o lado) */
function junta(a: P, b: P, k: number): P {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const n = Math.hypot(dx, dy) || 1;
  return [mx + (-dy / n) * k, my + (dx / n) * k];
}

const seg = (a: P, b: P, cor: string, w: number) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={cor} strokeWidth={w} strokeLinecap="round" />;

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
}

/** cabine vista de lado, motorista olhando para a direita. Quadro em (20..300, 20..190). */
function cabine({ dobra, apoio, tenis = 1, luz = null, o = 1 }: Pose): ReactNode {
  if (o < 0.01) return null;
  const bx = lerp(82, 112, dobra); // banco mais para trás quando esticado
  const quadril: P = [bx - 12, 140];
  const ombro: P = [bx - 22, 92];
  const cabeca: P = [bx - 16, 72];
  const mao: P = [204, 100];
  const calc: P = [222, 176];
  const pe: P = [236, 164];
  const cotovelo = junta(ombro, mao, 26 * dobra);
  const joelho = junta(quadril, calc, -20 * dobra - 2);
  const hApoio = lerp(98, 72, apoio);
  const ring = (p: P, r = 18) => <circle cx={p[0]} cy={p[1]} r={r} fill="none" stroke="#ffd84a" strokeWidth={3} strokeDasharray="5 4" />;
  return (
    <g opacity={o}>
      {/* painel, para-brisa e assoalho */}
      <path d="M190 64 L262 50 L300 50 L300 120 L222 120 Z" fill="#2a2f36" />
      <line x1={262} y1={50} x2={196} y2={22} stroke="#7fa6c9" strokeWidth={4} />
      <rect x={30} y={178} width={270} height={10} fill="#1b1f25" />
      {/* pedal */}
      <line x1={250} y1={118} x2={248} y2={160} stroke="#8d97a3" strokeWidth={3} />
      <rect x={240} y={154} width={16} height={10} rx={2} fill="#1b1f25" transform="rotate(-20 248 159)" />
      {/* banco: assento e encosto (quase 90 graus) */}
      <rect x={bx - 52} y={140} width={56} height={14} rx={6} fill={BANCO} />
      <rect x={bx - 40} y={154} width={10} height={24} fill="#2a2f36" />
      <path d={`M${bx - 52} 146 L${bx - 50} 82 L${bx - 36} 80 L${bx - 38} 146 Z`} fill={BANCO} />
      {/* encosto de cabeça */}
      <rect x={bx - 54} y={hApoio - 10} width={16} height={22} rx={6} fill="#5c6670" />
      <line x1={bx - 46} y1={hApoio + 12} x2={bx - 46} y2={84} stroke="#8d97a3" strokeWidth={2} />
      {/* volante e coluna */}
      <line x1={204} y1={100} x2={226} y2={112} stroke="#5c6670" strokeWidth={5} />
      <line x1={196} y1={82} x2={210} y2={118} stroke="#1b1f25" strokeWidth={7} strokeLinecap="round" />
      {/* pernas */}
      {seg(quadril, joelho, CALCA, 12)}
      {seg(joelho, calc, CALCA, 10)}
      {tenis > 0.5 ? (
        <path d={`M${calc[0] - 6} ${calc[1] + 2} L${pe[0] + 4} ${pe[1]} L${pe[0] + 6} ${pe[1] + 6} L${calc[0] - 6} ${calc[1] + 8} Z`} fill="#f2f4f7" stroke="#8d97a3" />
      ) : (
        <>
          <path d={`M${calc[0] - 4} ${calc[1]} L${pe[0] + 2} ${pe[1] - 2} L${pe[0] + 4} ${pe[1] + 2} L${calc[0] - 4} ${calc[1] + 4} Z`} fill={PELE} />
          <path d={`M${calc[0] - 8} ${calc[1] + 6} L${pe[0] + 8} ${pe[1] + 6}`} stroke="#ea7b2c" strokeWidth={3} strokeLinecap="round" />
        </>
      )}
      {/* tronco, braço, cabeça */}
      {seg(quadril, ombro, CAMISA, 18)}
      {seg(ombro, cotovelo, CAMISA, 9)}
      {seg(cotovelo, mao, PELE, 7)}
      <circle cx={cabeca[0]} cy={cabeca[1]} r={12} fill={PELE} />
      <path d={`M${cabeca[0] - 12} ${cabeca[1] - 2} a12 12 0 0 1 24 -2 Z`} fill="#3a2a1f" />
      <circle cx={cabeca[0] + 6} cy={cabeca[1] - 1} r={1.6} fill={TINTA} />
      {luz === 'braco' && ring(cotovelo)}
      {luz === 'perna' && ring(joelho)}
      {luz === 'costas' && ring([bx - 40, 116], 22)}
      {luz === 'cabeca' && ring([bx - 46, hApoio], 16)}
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
          {cabine({ dobra: 1, apoio: 1, o: surge(lt, 0.1) })}
          {chip(120, 30, 'Cansa menos', VERDE, surge(lt, 1.6), 10)}
          {chip(230, 140, 'Pronto para reagir', AZ, surge(lt, 2.6), 10)}
        </>
      ));
    // 1. braços e pernas um pouco dobrados, sem esticar
    case 1: {
      const dob = surge(lt, 0.5, 1.0);
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: dob, apoio: 1, luz: lt > 0.3 ? (Math.floor(lt * 2) % 2 ? 'braco' : 'perna') : null })}
          {nao(160, 30, 9, (1 - dob) * surge(lt, 0.1))}
          {chip(160, 30, 'Um pouco dobrados', VERDE, dob, 10)}
        </>
      ));
    }
    // 2. costas apoiadas, perto de 90 graus
    case 2:
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: 1, luz: 'costas' })}
          {quadro(16, 154, 80, 24, surge(lt, 1.6), <text x={40} y={16} textAnchor="middle" fontSize={11} fontWeight={800} fill={TINTA}>≈ 90°</text>)}
          {chip(170, 30, 'Costas bem apoiadas', VERDE, surge(lt, 0.3), 10)}
        </>
      ));
    // 3. encosto de cabeça sobe até a altura dos olhos e protege o pescoço
    case 3: {
      const ap = surge(lt, 0.6, 1.2);
      return fundo(lt, 0.6, () => (
        <>
          {cabine({ dobra: 1, apoio: ap, luz: 'cabeca' })}
          {chip(170, 30, 'Na altura dos olhos', VERDE, surge(lt, 1.6), 10)}
          {chip(230, 140, 'Protege o pescoço', AZ, surge(lt, 3.0), 10)}
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
          {cabine({ dobra: 1, apoio: 1, luz: 'pe' })}
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
          {cabine({ dobra: dob, apoio: 0, tenis: 0, luz: dob > 0.05 && dob < 0.95 ? 'braco' : null })}
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
          {cabine({ dobra: 1, apoio: ap, tenis: tn, luz: lt < 2.2 ? 'cabeca' : 'pe' })}
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

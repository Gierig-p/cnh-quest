/**
 * Vídeo do cartão c5-freios-luzes ("Freios, amortecedores e luzes"), Mundo 5, lote 2 de 17/11/2026.
 * Freio gasto, fluido e manchas, freio a lona molhado, ABS, amortecedores, folga na direção,
 * luz de freio e seta queimadas e o exemplo do Caio. Tempos em content/videos/freios-luzes.json.
 */
import type { ReactNode } from 'react';
import { camLook, rect } from './engine';
import { car } from './models';
import { TINTA, chip, etiqueta, item, nao, quadro, ruaFundo, surge, visto } from './infracoesUI';
import { RA, VOCE, escuro, fazerVideo, ruaChao, ruaObjs, tag, type Quadro } from './videoBase';
import { carroCima, pneu } from './VideoManutencao';
import tempos from '../../content/videos/freios-luzes.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const VERM = '#d93a35';
const XV = RA - 1.65;

function fundo(lt: number, o = 0.45, over?: () => ReactNode): Quadro {
  const q = ruaFundo(lt);
  return { ...q, over: () => (
    <>
      {escuro(o)}
      {over?.()}
    </>
  ) };
}

/** barra de distância de frenagem: carrinho à esquerda, faixa até a marca de parada */
function frenagem(y: number, w: number, k: number, cor: string, rotulo: string, o = 1): ReactNode {
  if (o < 0.01) return null;
  const x0 = 70;
  const x = x0 + w * k;
  return (
    <g opacity={o}>
      <rect x={x0} y={y - 5} width={w * k} height={10} rx={5} fill={cor} opacity={0.85} />
      <g transform={`translate(${x} ${y}) rotate(90)`}>{carroCima(0, 0, 0)}</g>
      <text x={x0 - 8} y={y + 4} textAnchor="end" fontSize={10} fontWeight={800} fill="#fff">{rotulo}</text>
    </g>
  );
}

/** reservatório do fluido de freio com as marcas MÁX e MÍN */
function reservatorio(x: number, y: number, nivel: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 8} y={y - 10} width={16} height={8} rx={2} fill="#ffd84a" />
      <rect x={x - 22} y={y - 2} width={44} height={56} rx={6} fill="#eef2f6" stroke="#8d97a3" strokeWidth={1.5} />
      <rect x={x - 20} y={y + 52 - 50 * nivel} width={40} height={50 * nivel} rx={4} fill="#e8c35a" opacity={0.9} />
      <line x1={x + 22} y1={y + 10} x2={x + 30} y2={y + 10} stroke="#fff" strokeWidth={1.5} />
      <line x1={x + 22} y1={y + 40} x2={x + 30} y2={y + 40} stroke="#fff" strokeWidth={1.5} />
      <text x={x + 33} y={y + 13} fontSize={8} fontWeight={800} fill="#fff">MÁX</text>
      <text x={x + 33} y={y + 43} fontSize={8} fontWeight={800} fill="#fff">MÍN</text>
    </g>
  );
}

/** carro visto de lado, com uma mancha no chão embaixo dele */
function carroManchas(x: number, y: number, o = 1, mancha = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <ellipse cx={x + 6} cy={y + 30} rx={26 * mancha} ry={5 * mancha} fill="#20160c" opacity={0.85} />
      <path d={`M${x - 52} ${y + 20} L${x - 50} ${y + 4} L${x - 30} ${y} L${x - 16} ${y - 16} L${x + 26} ${y - 16} L${x + 40} ${y} L${x + 54} ${y + 4} L${x + 54} ${y + 20} Z`} fill={VOCE} stroke="#8d97a3" />
      <path d={`M${x - 12} ${y - 12} L${x + 2} ${y - 12} L${x + 2} ${y - 1} L${x - 24} ${y - 1} Z`} fill="#7fa6c9" />
      <path d={`M${x + 6} ${y - 12} L${x + 24} ${y - 12} L${x + 34} ${y - 1} L${x + 6} ${y - 1} Z`} fill="#7fa6c9" />
      <circle cx={x - 30} cy={y + 20} r={10} fill="#2a2f36" />
      <circle cx={x + 32} cy={y + 20} r={10} fill="#2a2f36" />
      <circle cx={x - 30} cy={y + 20} r={4} fill="#c9d0d8" />
      <circle cx={x + 32} cy={y + 20} r={4} fill="#c9d0d8" />
    </g>
  );
}

/** gotas de água espirrando (pixels) */
function respingo(x: number, y: number, lt: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} fill="#5aa0ff">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const f = (lt * 1.6 + i / 6) % 1;
        const a = -Math.PI / 2 + (i - 2.5) * 0.35;
        return <circle key={i} cx={x + Math.cos(a) * 34 * f} cy={y + Math.sin(a) * 26 * f + 30 * f * f} r={3.2 * (1 - f * 0.5)} opacity={1 - f} />;
      })}
    </g>
  );
}

/** pedal de freio sendo pisado `vezes` vezes ao longo de `dur` segundos */
function pedal(x: number, y: number, lt: number, a: number, dur: number, vezes: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  const k = Math.max(0, Math.min(1, (lt - a) / dur));
  const fase = (k * vezes) % 1;
  const desce = k > 0 && k < 1 ? Math.sin(fase * Math.PI) : 0;
  const n = Math.min(vezes, Math.floor(k * vezes + 0.5));
  return (
    <g opacity={o}>
      <line x1={x} y1={y - 50} x2={x} y2={y - 8 + desce * 6} stroke="#8d97a3" strokeWidth={4} />
      <rect x={x - 18} y={y - 10 + desce * 8} width={36} height={14} rx={4} fill="#2a2f36" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + 50 + i * 18} cy={y - 24} r={6} fill={i < n ? VERDE : '#c9d0d8'} />
      ))}
    </g>
  );
}

/** luz do ABS acesa no painel */
function luzAbs(x: number, y: number, o = 1, acesa = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 46} y={y - 26} width={92} height={52} rx={10} fill="#11151a" />
      <circle cx={x} cy={y} r={18} fill="#ffb800" opacity={0.25 * acesa} />
      <circle cx={x} cy={y} r={13} fill="none" stroke={acesa > 0.5 ? '#ffb800' : '#4a525d'} strokeWidth={2.4} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontWeight={900} fill={acesa > 0.5 ? '#ffb800' : '#4a525d'}>ABS</text>
    </g>
  );
}

/** mola do amortecedor: `gasto` deixa a mola torta e mais baixa */
function amortecedor(x: number, y: number, gasto: number, o = 1, lt = 0): ReactNode {
  if (o < 0.01) return null;
  const pulo = gasto * 6 * Math.abs(Math.sin(lt * 5));
  const h = 70 - 16 * gasto;
  const pts = Array.from({ length: 9 }, (_, i) => `${x + (i % 2 ? 14 : -14) + gasto * i * 0.6},${y - pulo - (h * i) / 8}`).join(' ');
  return (
    <g opacity={o}>
      <rect x={x - 5} y={y - pulo - h} width={10} height={h} fill="#8d97a3" />
      <polyline points={pts} fill="none" stroke={gasto > 0.5 ? LARANJA : '#5aa0ff'} strokeWidth={4} strokeLinejoin="round" />
      <rect x={x - 20} y={y - pulo - h - 6} width={40} height={6} rx={2} fill="#4a525d" />
      <rect x={x - 20} y={y} width={40} height={6} rx={2} fill="#4a525d" />
    </g>
  );
}

/** rua com o seu carro em `yv` e um carro atrás, a câmera vendo os dois */
function filaRua(yv: number, yAtras: number, brake: boolean, blink: 'l' | null, over: Quadro['over']): Quadro {
  return {
    cam: camLook(1.4, yv + 3, 0, 16, 40, 10.5),
    ground: ruaChao(),
    objs: [...ruaObjs(3), car({ x: XV, y: yv, color: VOCE, brake, blink }), car({ x: XV, y: yAtras, color: '#4f7fc4' })],
    over,
  };
}

const AGUA = ruaChao([rect(-RA + 0.2, -10, RA - 0.2, -2, '#5aa0ff', 0.01, 0.55)]);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. freios, direção, amortecedores e luzes ajudam a fugir do perigo
    case 0:
      return fundo(lt, 0.4 * surge(lt, 0.1), () => (
        <>
          {(['Freios', 'Direção', 'Amortecedores', 'Luzes'] as const).map((t, i) => chip([40, 102, 185, 268][i], 50, t, AZ, surge(lt, 0.3 + i * 0.6), 10))}
          {chip(160, 90, 'Ajudam você a fugir do perigo', VERDE, surge(lt, 3.0), 10)}
          {chip(160, 130, 'Se um falha, o risco aumenta', LARANJA, surge(lt, 4.6), 11)}
        </>
      ));
    // 1. freio gasto precisa de mais distância
    case 1: {
      const k1 = Math.min(1, lt / 1.6);
      return fundo(lt, 0.55, () => (
        <>
          {frenagem(70, 110, k1, VERDE, 'Freio bom', surge(lt, 0))}
          {frenagem(120, 200, k1, LARANJA, 'Freio gasto', surge(lt, 0))}
          {chip(160, 166, 'Precisa de mais distância para parar', LARANJA, surge(lt, 0.8), 10)}
        </>
      ));
    }
    // 2. nível do fluido e manchas embaixo
    case 2:
      return fundo(lt, 0.55, () => (
        <>
          {reservatorio(70, 52, 0.75, surge(lt, 0.1))}
          {chip(80, 168, 'Nível do fluido', AZ, surge(lt, 0.3), 10)}
          {carroManchas(222, 96, surge(lt, 1.2), surge(lt, 1.6, 0.8))}
          {chip(222, 168, 'Manchas embaixo do veículo', LARANJA, surge(lt, 1.8), 9)}
        </>
      ));
    // 3. freio a lona molhado perde força por um momento
    case 3:
      return fundo(lt, 0.55, () => (
        <>
          {pneu(90, 100, 40, surge(lt, 0.1), 0, lt * 4)}
          {respingo(90, 132, lt, surge(lt, 1.6))}
          {chip(90, 34, 'Freio a lona', AZ, surge(lt, 0.3), 11)}
          {chip(90, 170, 'Comum nas rodas de trás', TINTA, surge(lt, 0.9), 9)}
          {quadro(144, 66, 166, 64, surge(lt, 2.2), (
            <>
              {item(10, 26, 'Molhou na poça', AZ, surge(lt, 2.4), 10)}
              {item(10, 48, 'Perde força um momento', LARANJA, surge(lt, 3.2), 10)}
            </>
          ))}
        </>
      ));
    // 4. reduza e pise no freio algumas vezes
    case 4:
      return fundo(lt, 0.55, () => (
        <>
          {chip(100, 40, 'Reduza', AZ, surge(lt, 0.1), 12)}
          {quadro(36, 70, 170, 90, surge(lt, 0.3), pedal(50, 70, lt, 0.6, Math.max(1.2, d - 1.2), 3))}
          {chip(220, 40, 'Pise algumas vezes', VERDE, surge(lt, 0.8), 11)}
          {chip(220, 170, 'Até voltar ao normal', VERDE, surge(lt, d - 0.9), 10)}
        </>
      ));
    // 5. ABS e a luz no painel
    case 5:
      return fundo(lt, 0.55, () => (
        <>
          {chip(160, 26, 'ABS: as rodas não travam na freada forte', AZ, surge(lt, 0.2), 10)}
          {pneu(80, 98, 34, surge(lt, 0.4), 0, lt * 5 * Math.max(0, 1 - lt / 3))}
          {visto(112, 70, surge(lt, 2.4))}
          {luzAbs(232, 98, surge(lt, 3.4), surge(lt, 3.8) * (Math.floor(lt * 3) % 2 ? 1 : 0.6))}
          {chip(232, 150, 'Luz acesa: problema no sistema', LARANJA, surge(lt, 4.2), 9)}
        </>
      ));
    // 6. amortecedores gastos: perder o controle e capotar
    case 6:
      return fundo(lt, 0.55, () => (
        <>
          {amortecedor(70, 140, 1, surge(lt, 0.1), lt)}
          {chip(70, 166, 'Amortecedor gasto', LARANJA, surge(lt, 0.4), 10)}
          {quadro(140, 50, 166, 92, surge(lt, 1.0), (
            <>
              {item(10, 26, 'Perde o controle', VERM, surge(lt, 1.4), 10.5)}
              {item(10, 50, 'Pode capotar', VERM, surge(lt, 2.4), 10.5)}
              {item(10, 74, 'Em curvas e freadas', LARANJA, surge(lt, 3.6), 10.5)}
            </>
          ))}
        </>
      ));
    // 7. folga na direção: puxa para um lado
    case 7: {
      const a = 0.3 * Math.min(1, lt / 1.6);
      return fundo(lt, 0.55, () => (
        <>
          {quadro(40, 30, 110, 140, surge(lt, 0), (
            <>
              <rect x={45} y={0} width={20} height={140} fill="#5c6670" />
              <line x1={55} y1={6} x2={55} y2={134} stroke="#fff" strokeWidth={1.5} strokeDasharray="6 6" />
              {carroCima(55 + 26 * Math.sin(a) * Math.min(1, lt / 2), Math.max(40, 110 - 30 * lt), a)}
            </>
          ))}
          {chip(230, 84, 'Folga na direção', LARANJA, surge(lt, 0.2), 11)}
          {chip(230, 116, 'Puxa para um lado', LARANJA, surge(lt, 0.9), 10)}
        </>
      ));
    }
    // 8. luz de freio queimada: quem vem atrás não percebe
    case 8: {
      const yv = -2 - 1.2 * Math.min(lt, 1.2);
      const ya = 8 - 1.6 * Math.min(lt, 2.6);
      return filaRua(yv, ya, false, null, (pr) => (
        <>
          {chip(160, 24, 'Luz de freio queimada', VERM, surge(lt, 0.2), 11)}
          {nao(...pr([XV, yv + 2.3, 1.6]), 9, surge(lt, 0.8))}
          {tag(pr, [XV, ya, 1.8], 'Não percebe a freada', surge(lt, 1.4))}
        </>
      ));
    }
    // 9. seta queimada: ninguém entende a manobra
    case 9:
      return filaRua(-4 - 0.8 * lt, 6 - 0.8 * lt, false, null, (pr) => (
        <>
          {chip(160, 24, 'Seta queimada', VERM, surge(lt, 0.1), 11)}
          {chip(160, 50, 'Ninguém entende a sua manobra', LARANJA, surge(lt, 0.7), 10)}
          {tag(pr, [XV, 6 - 0.8 * lt, 1.8], '?', surge(lt, 1.2))}
        </>
      ));
    // 10. exemplo: Caio passa pela rua alagada, sente o freio fraco e pisa algumas vezes
    case 10: {
      const yv = 2 - 2.4 * Math.min(lt, 4) - 0.6 * Math.max(0, lt - 4);
      return {
        cam: camLook(1.4, yv - 5, 0, 16, 42, 9.5),
        ground: AGUA,
        objs: [...ruaObjs(5), car({ x: XV, y: yv, color: VOCE, brake: lt > 4 && Math.floor(lt * 2.5) % 2 === 0 })],
        over: (pr) => (
          <>
            {tag(pr, [XV, yv, 1.6], 'Caio', surge(lt, 0.2) * (1 - surge(lt, 2.6)))}
            {chip(160, 24, 'Rua alagada', AZ, surge(lt, 0.4) * (1 - surge(lt, 2.4)), 11)}
            {chip(160, 24, 'Freio fraco', LARANJA, surge(lt, 2.8) * (1 - surge(lt, 4.2)), 11)}
            {chip(90, 176, 'Reduz', AZ, surge(lt, 4.2), 11)}
            {chip(210, 176, 'Pisa algumas vezes', VERDE, surge(lt, 4.8), 11)}
            {visto(292, 176, surge(lt, d - 1.2), 10)}
          </>
        ),
      };
    }
    // 11. para guardar
    default:
      return fundo(lt, 0.5, () => (
        <>
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(30, 60, 124, 'Freio bom', 'Para parar', VERDE, surge(lt, 0.5))}
          {etiqueta(166, 60, 124, 'Luz boa', 'Para ser visto', AZ, surge(lt, 1.6))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

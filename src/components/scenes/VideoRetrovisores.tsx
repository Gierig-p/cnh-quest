/**
 * Vídeo do cartão c5-retrovisores ("Retrovisores e pontos cegos"), Mundo 5, lote 2 de 17/11/2026.
 * Ajuste dos espelhos, pontos cegos no chão, mexer a cabeça, barulho de motor, farol ofuscando
 * e o exemplo da Ana. Tempos em content/videos/retrovisores.json.
 */
import type { ReactNode } from 'react';
import { camLook, rect } from './engine';
import { car } from './models';
import { chip, etiqueta, nao, quadro, surge, visto } from './infracoesUI';
import { AV, AV_OBJS, FX, VOCE, escuro, fazerVideo, moto, pisca, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/retrovisores.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const VERM = '#d93a35';
const YV = 1.5;
const MX = FX[0] + 0.6;

const CAM = camLook(-0.4, -1, 0, 10, 40, 11.5);
const CAM_ALTA = camLook(0, 3, 0, 0, 64, 12.5);

/** avenida com o seu carro na faixa do meio e outros carros à frente */
function avenida(over: Quadro['over'], extra: Quadro['objs'] = [], cam = CAM, chao = AV, blink: 'l' | null = null): Quadro {
  return {
    cam,
    ground: chao,
    objs: [...AV_OBJS, car({ x: FX[1], y: -14, color: '#4f7fc4' }), car({ x: FX[2], y: -22, color: '#8f98a3' }), car({ x: FX[1], y: YV, color: VOCE, blink }), ...extra],
    over,
  };
}

/** áreas no chão: verde = o que os espelhos mostram; vermelho = pontos cegos */
function zonas(oV: number, oC: number) {
  return [
    ...AV,
    rect(FX[1] - 1.4, YV + 2.6, FX[1] + 1.4, YV + 14, '#2fa36b', 0.02, 0.5 * oV),
    rect(FX[0] - 1.5, YV + 6.5, FX[0] + 1.5, YV + 16, '#2fa36b', 0.02, 0.5 * oV),
    rect(FX[2] - 1.5, YV + 6.5, FX[2] + 1.5, YV + 16, '#2fa36b', 0.02, 0.5 * oV),
    rect(FX[0] - 1.5, YV - 0.5, FX[0] + 1.5, YV + 6.5, '#d93a35', 0.02, 0.55 * oC),
    rect(FX[2] - 1.5, YV - 0.5, FX[2] + 1.5, YV + 6.5, '#d93a35', 0.02, 0.55 * oC),
  ];
}

/** espelho interno grande: mostra o vidro de trás inteiro, um carro atrás e, se houver, um objeto pendurado */
function espelhoInterno(x: number, y: number, o = 1, { objeto = 0, farol = 0, tomba = 0 } = {}): ReactNode {
  if (o < 0.01) return null;
  const w = 180;
  const h = 64;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(${tomba * 7} ${w / 2} ${h / 2})`}>
      <line x1={w / 2} y1={-30} x2={w / 2} y2={0} stroke="#2a2f36" strokeWidth={6} />
      <rect x={0} y={0} width={w} height={h} rx={20} fill="#20262e" />
      <rect x={6} y={6} width={w - 12} height={h - 12} rx={15} fill={farol > 0 ? '#1b2a44' : '#9fc3e6'} />
      {/* vidro de trás do próprio carro, visto pelo espelho */}
      <path d={`M22 ${h - 8} L36 14 L${w - 36} 14 L${w - 22} ${h - 8} Z`} fill={farol > 0 ? '#22324f' : '#cfe3f5'} stroke="#5c6670" strokeWidth={3} />
      <rect x={w / 2 - 16} y={30} width={32} height={16} rx={4} fill="#4f7fc4" />
      {farol > 0 && [w / 2 - 10, w / 2 + 10].map((cx) => (
        <g key={cx} opacity={farol}>
          <circle cx={cx} cy={38} r={16} fill="#fff6c8" opacity={0.45} />
          <circle cx={cx} cy={38} r={5} fill="#fffbe6" />
        </g>
      ))}
      {objeto > 0 && (
        <g opacity={objeto}>
          <line x1={w / 2 + 40} y1={h} x2={w / 2 + 40} y2={h + 18} stroke="#ffd84a" strokeWidth={2} />
          <rect x={w / 2 + 28} y={h + 18} width={24} height={30} rx={8} fill="#e05a5a" />
        </g>
      )}
    </g>
  );
}

/** espelho externo esquerdo: carcaça na cor do carro, vidro com céu, pista em perspectiva e reflexo;
 *  a lateral do seu carro aparece na borda de dentro (`lateral`) */
export function espelhoExterno(x: number, y: number, o = 1, lateral = 1): ReactNode {
  if (o < 0.01) return null;
  // contorno do vidro (o mesmo recorta a cena refletida)
  const vidro = 'M9 15 Q11 8 30 8 L104 8 Q115 8 115 19 L115 64 Q115 76 103 76 L24 76 Q9 76 9 61 Z';
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id="rv-carcaca" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="0.55" stopColor="#262c35" />
          <stop offset="1" stopColor="#14181e" />
        </linearGradient>
        <linearGradient id="rv-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb2e3" />
          <stop offset="1" stopColor="#cfe3f5" />
        </linearGradient>
        <linearGradient id="rv-pista" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a929c" />
          <stop offset="1" stopColor="#5b636d" />
        </linearGradient>
        <linearGradient id="rv-brilho" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="rv-lataria" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.6" stopColor="#1d2430" stopOpacity={0.05} />
          <stop offset="0.8" stopColor="#1d2430" stopOpacity={0.3} />
          <stop offset="1" stopColor="#1d2430" stopOpacity={0.45} />
        </linearGradient>
        <clipPath id="rv-vidro">
          <path d={vidro} />
        </clipPath>
      </defs>
      {/* braço que prende o espelho na porta */}
      <path d="M112 50 L132 46 L134 66 L112 68 Z" fill="#1d2229" />
      {/* sombra e carcaça */}
      <path d="M2 13 Q6 2 30 2 L110 2 Q126 2 126 18 L126 72 Q126 88 109 88 L21 88 Q2 88 2 68 Z" fill="#0006" />
      <path d="M0 10 Q4 0 30 0 L110 0 Q124 0 124 16 L124 70 Q124 84 108 84 L20 84 Q0 84 0 64 Z" fill="url(#rv-carcaca)" />
      <path d="M6 9 Q9 3 30 3 L108 3 Q119 3 120 12" fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.5} />
      {/* moldura de borracha */}
      <path d={vidro} fill="#0b0e12" transform="translate(-1.5 -1.5) scale(1.026)" />
      {/* o que o espelho mostra */}
      <g clipPath="url(#rv-vidro)">
        <rect x={0} y={0} width={124} height={84} fill="url(#rv-ceu)" />
        <path d="M0 40 Q30 34 60 38 Q90 33 124 37 L124 46 L0 46 Z" fill="#7fae74" />
        <path d="M-6 44 L124 44 L124 84 L-6 84 Z" fill="#8bbb7d" />
        <path d="M18 44 L96 44 L150 84 L-40 84 Z" fill="url(#rv-pista)" />
        {/* faixas: tracejado do meio e borda */}
        <path d="M57 44 L52 84" stroke="#ffffff" strokeWidth={1.6} strokeDasharray="5 5" />
        <path d="M22 44 L-30 84" stroke="#ffffff" strokeWidth={1.4} />
        {/* carro bem lá atrás, na outra faixa */}
        <g transform="translate(36 41)">
          <rect x={0} y={0} width={13} height={8} rx={2} fill="#c76b4a" />
          <rect x={2} y={1} width={9} height={3} rx={1} fill="#2b3440" opacity={0.85} />
          <rect x={0.5} y={6} width={3} height={1.4} fill="#fff3c4" />
          <rect x={9.5} y={6} width={3} height={1.4} fill="#fff3c4" />
        </g>
        {/* lateral do seu carro, na borda de dentro */}
        <g opacity={lateral}>
          <path d={`M${116 - 28 * lateral} 8 Q${112 - 26 * lateral} 40 ${118 - 30 * lateral} 84 L124 84 L124 0 Z`} fill={VOCE} />
          <path d={`M${116 - 28 * lateral} 8 Q${112 - 26 * lateral} 40 ${118 - 30 * lateral} 84 L124 84 L124 0 Z`} fill="url(#rv-lataria)" />
          <path d={`M${116 - 24 * lateral} 30 Q${113 - 22 * lateral} 46 ${117 - 25 * lateral} 70`} fill="none" stroke="#8d97a3" strokeWidth={1.6} />
          <circle cx={120 - 18 * lateral} cy={52} r={2} fill="#8d97a3" />
        </g>
        {/* reflexo do vidro convexo */}
        <path d="M9 8 L60 8 L22 76 L9 76 Z" fill="url(#rv-brilho)" />
      </g>
    </g>
  );
}

/** cabeça vista de cima (motorista no banco), virando `a` radianos para a esquerda:
 *  os ombros ficam parados, a cabeça gira e o cone mostra para onde o olhar vai */
export function cabeca(x: number, y: number, a: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(0.8)`}>
      <defs>
        <radialGradient id="rv-cabelo" cx="0.45" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#5a4130" />
          <stop offset="1" stopColor="#2e2118" />
        </radialGradient>
        <radialGradient id="rv-pele" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#f0c39c" />
          <stop offset="1" stopColor="#cf9670" />
        </radialGradient>
        <linearGradient id="rv-olhar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd84a" stopOpacity={0.75} />
          <stop offset="1" stopColor="#ffd84a" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* ombros e encosto do banco */}
      <rect x={-30} y={2} width={60} height={20} rx={10} fill="#3b4656" />
      <path d="M-27 10 Q-27 2 -16 1 L16 1 Q27 2 27 10 Q27 17 16 18 L-16 18 Q-27 17 -27 10 Z" fill="#2f78c4" />
      <path d="M-8 1 L0 9 L8 1 Z" fill="#245f9c" />
      <path d="M-24 9 Q-24 4 -16 3" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={1.4} />
      <g transform={`rotate(${(-a * 180) / Math.PI})`}>
        {/* para onde o olhar vai */}
        <path d="M-5 -14 L-17 -42 Q0 -48 17 -42 L5 -14 Z" fill="url(#rv-olhar)" />
        {/* orelhas */}
        <ellipse cx={-14.5} cy={-1} rx={3} ry={5} fill="#d9a37a" stroke="#b9805a" strokeWidth={0.8} />
        <ellipse cx={14.5} cy={-1} rx={3} ry={5} fill="#d9a37a" stroke="#b9805a" strokeWidth={0.8} />
        {/* rosto (parte da frente) e cabelo (parte de trás) */}
        <ellipse cx={0} cy={-1} rx={14} ry={16} fill="url(#rv-pele)" />
        <path d="M-14.2 -2 Q-13 -10.5 0 -10.5 Q13 -10.5 14.2 -2 Q14 8 9 12.5 Q0 16.5 -9 12.5 Q-14 8 -14 -3 Z" fill="url(#rv-cabelo)" />
        <path d="M-9 -7 Q-1 -9.5 7 -7.5 M-11 -3 Q0 -9 10 -6 M-10 2 Q0 -1 10 1" fill="none" stroke="#7a5a42" strokeWidth={0.9} strokeLinecap="round" opacity={0.7} />
        <circle cx={2} cy={2} r={1.4} fill="#7a5a42" opacity={0.8} />
        {/* testa, sobrancelhas e nariz */}
        <path d="M-7 -13.5 Q-3.5 -15.5 -1 -14 M1 -14 Q3.5 -15.5 7 -13.5" fill="none" stroke="#2e2118" strokeWidth={1.6} strokeLinecap="round" />
        <path d="M-2.6 -16 Q0 -21.5 2.6 -16 Z" fill="#d9a37a" stroke="#b9805a" strokeWidth={0.8} />
      </g>
    </g>
  );
}

/** ondas de som saindo de um ponto */
export function ondas(x: number, y: number, lt: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} fill="none" stroke="#ffd84a" strokeWidth={2.4} strokeLinecap="round">
      {[0, 1, 2].map((i) => {
        const f = (lt * 1.2 + i / 3) % 1;
        const r = 8 + 22 * f;
        return <path key={i} d={`M${x + r * 0.6} ${y - r * 0.8} A${r} ${r} 0 0 1 ${x + r * 0.6} ${y + r * 0.8}`} opacity={1 - f} />;
      })}
    </g>
  );
}

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. enxergar em volta; espelhos ajudam mas não mostram tudo
    case 0:
      return avenida(() => (
        <>
          {chip(160, 24, 'Enxergar em volta', AZ, surge(lt, 0.3), 11)}
          {chip(100, 176, 'Espelhos ajudam', VERDE, surge(lt, 3.0), 10)}
          {chip(230, 176, 'Mas não mostram tudo', LARANJA, surge(lt, 4.0), 10)}
        </>
      ), [moto(MX, 4.6, 0, '#e05a5a')]);
    // 1. retrovisor interno: todo o vidro de trás, nada tampando
    case 1:
      return avenida(() => (
        <>
          {escuro(0.55)}
          {espelhoInterno(70, 46, surge(lt, 0.1), { objeto: surge(lt, 2.8) })}
          {chip(160, 24, 'Ver todo o vidro de trás', VERDE, surge(lt, 0.8), 10)}
          {nao(244, 140, 10, surge(lt, 3.4))}
          {chip(160, 178, 'Nada tampando a visão', LARANJA, surge(lt, 3.6), 10)}
        </>
      ));
    // 2. retrovisores externos: ver a lateral traseira do próprio carro
    case 2:
      return avenida(() => (
        <>
          {escuro(0.55)}
          {espelhoExterno(98, 50, surge(lt, 0.1), surge(lt, 1.6, 0.8))}
          {chip(160, 24, 'Retrovisor de fora', AZ, surge(lt, 0.3), 10)}
          {chip(160, 162, 'Aparece a lateral do seu carro', VERDE, surge(lt, 2.2), 10)}
        </>
      ));
    // 3. pontos cegos no chão
    case 3:
      return avenida((pr) => (
        <>
          {chip(80, 22, 'Espelho vê', VERDE, surge(lt, 0.4), 10)}
          {chip(230, 22, 'Ponto cego', VERM, surge(lt, 1.6), 10)}
          {tag(pr, [FX[1], YV, 1.6], 'Você', surge(lt, 0.1))}
        </>
      ), [], CAM_ALTA, zonas(surge(lt, 0.4), surge(lt, 1.6)));
    // 4. mexa a cabeça e olhe pela lateral
    case 4: {
      const a = surge(lt, 0.6, 0.8) * 0.9;
      return avenida((pr) => (
        <>
          {quadro(14, 112, 72, 76, 1, cabeca(36, 46, a))}
          {chip(160, 24, 'Mexa a cabeça', AZ, surge(lt, 0.4), 11)}
          {chip(160, 48, 'Olhe pela lateral', AZ, surge(lt, 1.6), 10)}
          {tag(pr, [MX, 4.6, 1.8], 'Moto', surge(lt, 2.4))}
        </>
      ), [moto(MX, 4.6, 0, '#e05a5a')]);
    }
    // 5. barulho do motor dos outros
    case 5:
      return avenida((pr) => {
        const [mx, my] = pr([MX, 4.6, 1.2]);
        return (
          <>
            {ondas(mx, my, lt, surge(lt, 0.3))}
            {chip(160, 24, '[barulho de motor perto]', LARANJA, surge(lt, 0.4), 10)}
            {chip(160, 48, 'Preste atenção ao som', AZ, surge(lt, 1.4), 10)}
          </>
        );
      }, [moto(MX, 4.6, 0, '#e05a5a')]);
    // 6. só manobre com certeza
    case 6:
      return avenida(() => (
        <>
          {chip(160, 24, 'Só manobre com certeza', VERDE, surge(lt, 0.3), 11)}
          {chip(160, 50, 'De que não vai causar um sinistro', AZ, surge(lt, 1.2), 9.5)}
          {visto(160, 90, surge(lt, 2.2), 10)}
        </>
      ));
    // 7. farol de trás ofuscando: ajuste o espelho interno
    case 7: {
      const tomba = surge(lt, 3.4, 1.0);
      return avenida(() => (
        <>
          {escuro(0.75)}
          {espelhoInterno(70, 56, surge(lt, 0.1), { farol: 1 - 0.75 * tomba, tomba })}
          {chip(160, 24, 'Farol de trás ofusca', LARANJA, surge(lt, 0.5), 10)}
          {chip(160, 168, 'Ajuste o espelho', VERDE, surge(lt, 3.6), 11)}
        </>
      ));
    }
    // 8. exemplo: Ana olha o espelho, vira a cabeça e vê a moto no ponto cego
    case 8: {
      const a = surge(lt, 2.4, 0.8) * 0.9;
      return avenida((pr) => (
        <>
          {tag(pr, [FX[1], YV, 1.6], 'Ana', surge(lt, 0.2) * (1 - surge(lt, 3.2)))}
          {chip(160, 24, 'Quer ir para a esquerda', AZ, surge(lt, 0.6), 10)}
          {quadro(14, 112, 72, 76, surge(lt, 2.0) * (1 - surge(lt, 3.4)), cabeca(36, 46, a))}
          {tag(pr, [MX, 4.6, 1.8], 'Moto no ponto cego', surge(lt, 3.6))}
        </>
      ), [moto(MX, 4.6, 0, '#e05a5a')], CAM, AV, pisca(lt, 'l') as 'l' | null);
    }
    // 9. ela espera a moto passar
    case 9: {
      const my = 4.6 - 9 * Math.min(1, lt / Math.max(1, d));
      return avenida((pr) => (
        <>
          {chip(160, 24, 'Ana espera a moto passar', VERDE, surge(lt, 0.1), 10)}
          {tag(pr, [MX, my, 1.8], 'Moto', 1)}
        </>
      ), [moto(MX, my, 0, '#e05a5a')]);
    }
    // 10. para guardar
    default:
      return avenida(() => (
        <>
          {escuro(0.5)}
          {chip(160, 30, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(14, 70, 92, '1. Espelho', 'Olhe', AZ, surge(lt, 0.5))}
          {etiqueta(114, 70, 92, '2. Cabeça', 'Vire um pouco', AZ, surge(lt, 1.0))}
          {etiqueta(214, 70, 92, '3. Manobra', 'Só depois', VERDE, surge(lt, 1.6))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

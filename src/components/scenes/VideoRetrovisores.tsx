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

/** espelho externo esquerdo: a lateral do seu carro aparece na borda de dentro */
export function espelhoExterno(x: number, y: number, o = 1, lateral = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y})`}>
      <path d="M0 10 Q4 0 30 0 L110 0 Q124 0 124 16 L124 70 Q124 84 108 84 L20 84 Q0 84 0 64 Z" fill="#20262e" />
      <path d="M8 14 Q10 7 30 7 L106 7 Q116 7 116 18 L116 66 Q116 77 104 77 L22 77 Q8 77 8 62 Z" fill="#9fc3e6" />
      <path d="M8 60 L116 40 L116 77 L8 77 Z" fill="#6b747f" opacity={0.9} />
      <rect x={30} y={34} width={22} height={14} rx={3} fill="#e9a47c" />
      <path d={`M${116 - 26 * lateral} 7 L116 7 L116 77 L${116 - 26 * lateral} 77 Z`} fill={VOCE} opacity={lateral} stroke="#8d97a3" />
    </g>
  );
}

/** cabeça vista de cima, virando `a` radianos para a esquerda */
export function cabeca(x: number, y: number, a: number, o = 1): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(${(-a * 180) / Math.PI})`}>
      <circle cx={0} cy={0} r={18} fill="#d9a37a" />
      <path d="M-18 4 A18 18 0 0 0 18 4 L14 12 L-14 12 Z" fill="#3a2a1f" />
      <path d="M-6 -17 L0 -26 L6 -17 Z" fill="#d9a37a" />
      <path d="M-14 -40 L0 -20 L14 -40" fill="none" stroke="#ffd84a" strokeWidth={2} strokeDasharray="4 3" />
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

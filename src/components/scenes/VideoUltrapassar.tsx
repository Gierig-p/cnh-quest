/**
 * Vídeo do cartão c3-ultrapassar-como ("Como ultrapassar"), lote de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/ultrapassar.json).
 */
import { camLook, rect } from './engine';
import { car } from './models';
import { utilitario } from './veiculos';
import { campo, estrada } from './Mundo2';
import { AMARELO, AV, AV_OBJS, AZUL, FX, VERDE, VOCE, certo, clamp, ease, fazerVideo, janela, lerp, pisca, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/ultrapassar.json';

const ESTRADA = estrada('tracejada');
const CAMPO = campo(2);
const DIR = 1.75, ESQ = -1.75; // pistas da estrada de mão dupla

/**
 * Ultrapassagem completa em `u` (0..1): espera com a seta, sai para a outra faixa, passa e volta.
 * `rel` é a posição em relação ao veículo da frente (positivo = atrás dele).
 */
function passar(u: number, x0: number, x1: number, atras = 10.5, frente = -11) {
  let rel: number, x: number, head = 0;
  let seta: 'l' | 'r' | null = null;
  const lado: 'l' | 'r' = x1 < x0 ? 'l' : 'r', volta: 'l' | 'r' = lado === 'l' ? 'r' : 'l';
  const sinal = x1 < x0 ? -1 : 1;
  if (u < 0.16) {
    rel = atras;
    x = x0;
    seta = u > 0.04 ? lado : null;
  } else if (u < 0.36) {
    const k = ease((u - 0.16) / 0.2);
    rel = lerp(atras, atras - 3.5, k);
    x = lerp(x0, x1, k);
    head = 0.2 * sinal * Math.sin(Math.PI * k);
    seta = lado;
  } else if (u < 0.7) {
    rel = lerp(atras - 3.5, frente + 1.5, ease((u - 0.36) / 0.34));
    x = x1;
    seta = u > 0.62 ? volta : null;
  } else if (u < 0.9) {
    const k = ease((u - 0.7) / 0.2);
    rel = lerp(frente + 1.5, frente - 0.5, k);
    x = lerp(x1, x0, k);
    head = -0.2 * sinal * Math.sin(Math.PI * k);
    seta = volta;
  } else {
    rel = lerp(frente - 0.5, frente - 1.5, (u - 0.9) / 0.1);
    x = x0;
  }
  return { rel, x, head, seta };
}

function trecho(k: number, lt: number, d: number): Quadro {
  const u = clamp(lt / d);
  switch (k) {
    // 0. o que é ultrapassar: sair da faixa, passar o mais lento e voltar
    case 0: {
      const yt = 2 - 3 * lt;
      const p = passar(clamp((lt - 0.4) / (d - 0.6)), DIR, ESQ);
      const yv = yt + p.rel;
      return {
        cam: camLook(0.8, (yt + yv) / 2 - 2, 0, 14, 40, 8.6),
        ground: ESTRADA,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [DIR, yt - 3.8, 3.6], 'Mais lento', janela(lt, 0.3, 2.4))}
          </>
        ),
      };
    }
    // 1. manobra perigosa: quem vem de frente usa a mesma faixa
    case 1: {
      const yt = -2 * lt, yv = 9 - 2 * lt, yo = -60 + 13 * lt;
      return {
        cam: camLook(0, -10 - 2 * lt, 0, 12, 36, 7.6),
        ground: [...ESTRADA, rect(-3.5, -70, 0, 40, '#ff5a5f', 0.01, 0.22 * ease((lt - 0.5) / 0.5))],
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE }), car({ x: ESQ, y: yo, heading: Math.PI, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [DIR, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [ESQ, yo, 2.2], 'Vem de frente', ease((lt - 0.8) / 0.4))}
            {tag(pr, [0, -22 - 2 * lt, 0.2], 'Manobra perigosa', ease((lt - 2.0) / 0.4))}
          </>
        ),
      };
    }
    // 2. em regra, pela esquerda
    case 2: {
      const yl = -4 - 3 * lt;
      const p = passar(clamp(0.1 + u * 0.75), FX[1], FX[0], 9, -9);
      const yv = yl + p.rel;
      return {
        cam: camLook(-0.6, (yl + yv) / 2 - 2, 0, 18, 44, 8.6),
        ground: [...AV, rect(FX[0] - 1.7, -130, FX[0] + 1.7, 60, AZUL, 0.01, 0.3 * ease(lt / 0.5))],
        objs: [...AV_OBJS, car({ x: FX[1], y: yl, color: '#8f98a3' }), car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [FX[0], yl - 9, 0.2], 'Pela esquerda', ease((lt - 0.3) / 0.4) * (1 - ease((lt - 1.3) / 0.3)))}
          </>
        ),
      };
    }
    // 3. se o da frente sinalizou que vai entrar à esquerda, passe pela direita dele
    case 3: {
      const yl = -4 - 1.2 * lt;
      const xl = lerp(FX[1], FX[1] - 1.1, ease((lt - 1.2) / 2));
      const p = passar(clamp((lt - 1.2) / (d - 1.4)), FX[1], FX[2], 9, -9);
      const yv = yl + p.rel;
      return {
        cam: camLook(1.0, (yl + yv) / 2 - 2, 0, 18, 44, 8.6),
        ground: [...AV, rect(FX[2] - 1.7, -130, FX[2] + 1.7, 60, VERDE, 0.01, 0.3 * ease((lt - 1.8) / 0.5))],
        objs: [
          ...AV_OBJS,
          car({ x: xl, y: yl, heading: -0.12 * ease((lt - 1.2) / 2), color: '#4f7fc4', blink: pisca(lt, 'l'), brake: true }),
          car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [xl, yl - 0.2, 2.2], 'Vai à esquerda', janela(lt, 0.3, 2.8))}
            {tag(pr, [p.x, yv + 0.4, 2.2], 'Você', janela(lt, 0, 2.6))}
            {tag(pr, [FX[2], yl - 10, 0.2], 'Passe pela direita', ease((lt - 2.2) / 0.4))}
          </>
        ),
      };
    }
    // 4. retrovisor: ninguém atrás pode já estar ultrapassando você
    case 4: {
      const yt = -2 * lt, yv = 9 - 2 * lt;
      const yo = yv + 9 - 9 * lt; // o carro de trás já está passando
      return {
        cam: camLook(0.2, yv - 2, 0, 14, 40, 8.8),
        ground: ESTRADA,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE }), car({ x: ESQ, y: yo, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [DIR, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [ESQ, yo, 2.2], 'Já está passando', ease((lt - 0.9) / 0.4))}
            {tag(pr, [DIR, yv + 6, 0.2], 'Espere', ease((lt - 2.6) / 0.4))}
          </>
        ),
      };
    }
    // 5. o da frente não vai ultrapassar outro?
    case 5: {
      const yt = -2 * lt, ya = 9 - 2 * lt, yv = 18.5 - 2 * lt;
      const xa = lerp(DIR, DIR - 0.5, ease((lt - 0.8) / 1));
      return {
        cam: camLook(0.8, ya - 3, 0, 14, 40, 8.2),
        ground: ESTRADA,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: xa, y: ya, heading: -0.08 * ease((lt - 0.8) / 1), color: '#4f7fc4', blink: pisca(lt, 'l') }), car({ x: DIR, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [DIR, yv + 0.4, 2.2], 'Você')}
            {tag(pr, [xa, ya, 2.2], 'Vai ultrapassar?', ease((lt - 0.6) / 0.4))}
          </>
        ),
      };
    }
    // 6. a faixa ao lado livre por um bom trecho
    case 6: {
      const yv = 6 - 2 * lt;
      const comp = lerp(4, 46, ease((lt - 0.3) / 1.4));
      return {
        cam: camLook(0, -12 - 2 * lt, 0, 10, 46, 6.2),
        ground: [...ESTRADA, rect(-3.4, yv - 2.5 - comp, -0.1, yv - 2.5, VERDE, 0.01, 0.35)],
        objs: [...CAMPO, utilitario({ x: DIR, y: yv - 10, tipo: 'caminhao' }), car({ x: DIR, y: yv, color: VOCE }), car({ x: ESQ, y: -66, heading: Math.PI, color: '#e0412f' })],
        over: (pr) => (
          <>
            {tag(pr, [ESQ, yv - 26, 0.2], 'Livre por um bom trecho', ease((lt - 1.0) / 0.4))}
            {certo(pr, [ESQ, yv - 34, 0.2], ease((lt - 1.6) / 0.3))}
          </>
        ),
      };
    }
    // 7. seta, distância para o lado e volta com a seta
    case 7: {
      const yt = 2 - 3 * lt;
      const p = passar(u, DIR, ESQ);
      const yv = yt + p.rel;
      const lado = p.rel < 4.5 && p.rel > -9 ? 1 : 0;
      const oLado = 0.4 * ease((u - 0.38) / 0.06) * (1 - ease((u - 0.62) / 0.06));
      return {
        cam: camLook(0.4, (yt + yv) / 2 - 2, 0, 14, 42, 8.8),
        ground: [...ESTRADA, ...(lado && oLado > 0.01 ? [rect(-0.85, Math.max(yv, yt) - 2, 0.7, Math.min(yv, yt) + 2, AMARELO, 0.01, oLado)] : [])],
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, yv + 0.4, 2.2], 'Seta', janela(u * d, 0.2, d * 0.34))}
            {tag(pr, [0, (yt + yv) / 2, 0.2], 'Distância', janela(u * d, d * 0.4, d * 0.6))}
            {tag(pr, [p.x, yv + 0.4, 2.2], 'Seta de novo', janela(u * d, d * 0.66, d * 0.95))}
          </>
        ),
      };
    }
    // 8. quem é ultrapassado não acelera e vai para a direita
    case 8: {
      const yl = -2 - 2.6 * lt;
      const xl = lerp(FX[0], FX[1], ease((lt - 2.2) / 1.2));
      // o de trás espera você sair da faixa (até lt 3.4) e só então passa ao lado
      const yr = yl + (lt < 3.4 ? 14 - 2 * lt : 7.2 - 6 * (lt - 3.4));
      return {
        cam: camLook(-0.6, yl + 2, 0, 18, 44, 8.4),
        ground: AV,
        objs: [
          ...AV_OBJS,
          car({ x: xl, y: yl, heading: 0.15 * Math.sin(Math.PI * ease((lt - 2.2) / 1.2)), color: VOCE, blink: lt > 2.0 && lt < 3.6 ? pisca(lt, 'r') : null }),
          car({ x: FX[0], y: yr, color: '#e0412f' }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [xl, yl + 0.4, 2.2], 'Não acelere', janela(lt, 0.3, 2.2))}
            {tag(pr, [xl, yl + 0.4, 2.2], 'Vá para a direita', ease((lt - 2.4) / 0.4))}
          </>
        ),
      };
    }
    // 9. para guardar: olhe, sinalize, passe com espaço e volte sinalizando
    default: {
      const yt = 2 - 3 * lt;
      const p = passar(clamp(u * 1.05), DIR, ESQ);
      const yv = yt + p.rel;
      const passo = (n: number) => ease((lt - 0.2 - n * 0.9) / 0.3);
      return {
        cam: camLook(0.4, (yt + yv) / 2 - 2, 0, 14, 42, 8.4),
        ground: ESTRADA,
        objs: [...CAMPO, utilitario({ x: DIR, y: yt, tipo: 'caminhao' }), car({ x: p.x, y: yv, heading: p.head, color: VOCE, blink: pisca(lt, p.seta) })],
        over: () => (
          <g>
            {['1. Olhe', '2. Sinalize', '3. Passe com espaço', '4. Volte sinalizando'].map((s, i) => (
              <g key={s} opacity={passo(i)}>
                <rect x={8} y={8 + i * 17} width={s.length * 5.6 + 12} height={14} rx={7} fill="#ffffff" opacity={0.94} />
                <text x={14} y={18.5 + i * 17} fontSize={9} fontWeight={700} fill="#1d2430" fontFamily="system-ui, sans-serif">
                  {s}
                </text>
              </g>
            ))}
          </g>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

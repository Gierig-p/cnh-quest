/**
 * Vídeo do cartão c3-pisca-buzina ("Piscar, alertar e buzinar"), lote 4 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/pisca-buzina.json).
 */
import { camLook } from './engine';
import { car, person } from './models';
import { utilitario } from './veiculos';
import { campo, estrada } from './Mundo2';
import { bairro, cruzamento, ondas } from './Mundo1';
import { MOCA, fumaca } from './Mundo3';
import { AV, AV_OBJS, FX, VOCE, certo, ease, escuro, facho, farolPar, fazerVideo, janela, lerp, pisca, proibido, tag, triangulo, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/pisca-buzina.json';

const ESTRADA = estrada('tracejada');
const CAMPO = campo(3);
const CY = -9;
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 2);
const TARDE = '#2a1d3a';
const camEstrada = (y: number) => camLook(1.2, y - 8.5, 0, 12, 36, 8.5);

/** toque de buzina: ondas saindo da frente do carro em (x, y), indo para o norte */
function buzina(pr: Pr, x: number, y: number, o: number) {
  if (o <= 0.01) return null;
  const [px, py] = pr([x, y - 2.3, 1.0]);
  return <g opacity={o}>{ondas(px, py, -90, '#ffffff')}</g>;
}

/** piscar o farol: alterna baixa e alta 3 vezes por segundo enquanto `on` */
const altaPiscando = (lt: number, on: boolean) => (on && Math.floor(lt * 6) % 2 === 0 ? 1 : 0);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. piscar o farol, pisca-alerta e buzina são avisos
    case 0: {
      const yv = 3 - 1.6 * lt;
      const f = janela(lt, 0.4, 1.8, 0.2), a = janela(lt, 1.9, 3.2, 0.2), b = ease((lt - 3.3) / 0.2);
      const alta = f > 0.5 ? altaPiscando(lt, true) : 0;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE, blink: a > 0.5 ? pisca(lt, 'lr') : null })],
        over: (pr) => (
          <>
            {escuro(0.38, TARDE)}
            {facho(pr, 1.75, yv, -1, alta, 0.28)}
            {farolPar(pr, 1.75, yv, -1, alta ? 2.2 : 1.5)}
            {buzina(pr, 1.75, yv, b * (Math.floor(lt * 4) % 2 === 0 ? 1 : 0.4))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Piscar o farol', f)}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Pisca-alerta', a)}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Buzina', b)}
          </>
        ),
      };
    }
    // 1. cada um só vale nas situações certas
    case 1: {
      const yv = -4.5 - 1.6 * lt;
      return {
        cam: camEstrada(yv),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.38, TARDE)}
            {farolPar(pr, 1.75, yv, -1)}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'São avisos', janela(lt, 0.1, 1.4, 0.2))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Só na hora certa', ease((lt - 1.5) / 0.3))}
            {certo(pr, [1.75, yv + 2.6, 0.6], ease((lt - 1.9) / 0.3))}
          </>
        ),
      };
    }
    // 2. piscar o farol: trocar baixa e alta bem rápido
    case 2: {
      const yv = 2 - 1.2 * lt;
      const alta = altaPiscando(lt, lt > 1.5 && lt < 3.4);
      return {
        cam: camLook(1.2, yv - 7, 0, 14, 40, 9.5),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.55)}
            {facho(pr, 1.75, yv, -1, alta, 0.32)}
            {farolPar(pr, 1.75, yv, -1, alta ? 2.2 : 1.5)}
            {tag(pr, [1.75, yv - 9, 0.4], 'Luz baixa', janela(lt, 0.2, 1.4, 0.2))}
            {tag(pr, [1.75, yv - 9, 0.4], 'Baixa, alta, baixa...', ease((lt - 1.5) / 0.2))}
          </>
        ),
      };
    }
    // 3. avisar o carro da frente que você vai ultrapassar
    case 3: {
      const yv = 4 - 3 * lt, yf = yv - 9;
      const alta = altaPiscando(lt, lt > 1.0 && lt < 2.6);
      return {
        cam: camEstrada(yv - 2),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yf, color: '#8f98a3' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {escuro(0.38, TARDE)}
            {facho(pr, 1.75, yv, -1, alta * 0.45, 0.3)}
            {farolPar(pr, 1.75, yv, -1, alta ? 2.2 : 1.5)}
            {tag(pr, [1.75, yf + 0.4, 2.2], 'Carro da frente', janela(lt, 0.2, d))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Vou ultrapassar', ease((lt - 1.2) / 0.3))}
          </>
        ),
      };
    }
    // 4. ou avisar um perigo a quem vem de frente
    case 4: {
      const yv = -1 - 2.4 * lt, yo = -26 + 4 * lt;
      const alta = altaPiscando(lt, lt > 0.6 && lt < 2.2);
      return {
        cam: camLook(0.3, -1.5, 0, 12, 40, 12),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: -1.75, y: 9, heading: Math.PI, color: '#4f7fc4', blink: pisca(lt, 'lr') }), car({ x: -1.75, y: yo, heading: Math.PI, color: '#e0412f' }), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => {
          const [fx, fy] = pr([-1.75, 11, 1.1]);
          return (
            <>
              {escuro(0.38, TARDE)}
              {fumaca(fx, fy, 1.2)}
              {facho(pr, 1.75, yv, -1, alta, 0.3)}
              {farolPar(pr, 1.75, yv, -1, alta ? 2.2 : 1.5)}
              {farolPar(pr, -1.75, yo, 1)}
              {tag(pr, [-1.75, 9.4, 2.2], 'Perigo', ease((lt - 0.1) / 0.3))}
              {tag(pr, [-1.75, yo + 0.4, 2.2], 'Vem de frente', janela(lt, 0.5, d))}
              {tag(pr, [1.75, yv + 0.4, 2.2], 'Você avisa', ease((lt - 1.0) / 0.3))}
            </>
          );
        },
      };
    }
    // 5. pisca-alerta: parado na via, emergência, ou quando a regra mandar
    case 5: {
      const yv = -6;
      const kt = ease((lt - 2.6) / 0.6);
      return {
        cam: camLook(1.4, lerp(-1, -3, lt / d), 0, 12, 38, 11),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x: 1.75, y: yv, color: VOCE, blink: pisca(lt, 'lr') }), ...(kt > 0.01 ? [triangulo(1.75, lerp(yv + 3, yv + 12, kt))] : [])],
        over: (pr) => {
          const [fx, fy] = pr([1.75, yv - 1.6, 1.1]);
          return (
            <>
              {fumaca(fx, fy, 1.5)}
              {tag(pr, [1.75, yv + 0.4, 2.2], 'Parado na via', janela(lt, 0.3, 2.1, 0.2))}
              {tag(pr, [1.75, yv + 0.4, 2.2], 'Emergência', janela(lt, 2.2, 4.0, 0.2))}
              {tag(pr, [1.75, yv + 0.4, 2.2], 'Ou se a regra mandar', ease((lt - 4.1) / 0.2))}
            </>
          );
        },
      };
    }
    // 6. a buzina: toque breve para evitar um acidente
    case 6: {
      const v = Math.max(0, 1 - lt / 2.4);
      const yv = 7 - 3.5 * (lt - (lt * lt) / 4.8) * (lt < 2.4 ? 1 : 0) - (lt >= 2.4 ? 4.2 : 0);
      const xp = lt < 1.4 ? 5.0 - 0.9 * lt : lerp(3.74, 4.6, ease((lt - 1.6) / 0.6));
      const anda = lt < 1.4;
      return {
        cam: camLook(1.8, -1, 0, 14, 42, 10.5),
        ground: CRUZ,
        objs: [...BAIRRO, person(xp, -2.5, MOCA, anda ? lt * 6 : 0, anda ? -Math.PI / 2 : Math.PI / 2, 1.25), car({ x: 1.75, y: yv, color: VOCE, brake: v < 0.9 })],
        over: (pr) => (
          <>
            {buzina(pr, 1.75, yv, janela(lt, 1.0, 1.6, 0.1))}
            {tag(pr, [xp, -2.5, 2.4], 'Distraída', janela(lt, 0.1, 1.0, 0.2))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Toque breve', janela(lt, 1.0, 2.6, 0.2))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Evita o acidente', ease((lt - 2.7) / 0.3))}
            {certo(pr, [xp, -2.5, 3.3], ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 7. fora da cidade, o toque breve também avisa a ultrapassagem
    case 7: {
      const yv = 3 - 3 * lt, yc = yv - 10;
      return {
        cam: camEstrada(yv - 3),
        ground: ESTRADA,
        objs: [...CAMPO, utilitario({ x: 1.75, y: yc, tipo: 'caminhao' }), car({ x: 1.75, y: yv, color: VOCE, blink: lt > 2.4 ? pisca(lt, 'l') : null })],
        over: (pr) => (
          <>
            {buzina(pr, 1.75, yv, janela(lt, 1.2, 1.8, 0.1))}
            {tag(pr, [1.75, yv - 18, 0.4], 'Fora da cidade', janela(lt, 0.1, 1.1, 0.2))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Toque breve', janela(lt, 1.2, 2.4, 0.2))}
            {tag(pr, [1.75, yv + 0.4, 2.2], 'Vou ultrapassar', ease((lt - 2.5) / 0.3))}
          </>
        ),
      };
    }
    // 8. não freie de repente, a não ser por segurança
    case 8: {
      const para = lt > 0.8;
      const yv = para ? 3 - 3 * 0.8 - 0.6 : 3 - 3 * lt;
      const ya = para ? yv + lerp(9, 5.2, ease((lt - 0.8) / 0.8)) : yv + 9;
      return {
        cam: camLook(0, yv - 1, 0, 16, 44, 9.5),
        ground: AV,
        objs: [...AV_OBJS, car({ x: FX[1], y: yv, color: VOCE, brake: para }), car({ x: FX[1], y: ya, color: '#8f98a3', brake: para })],
        over: (pr) => (
          <>
            {tag(pr, [FX[1], yv + 0.4, 2.2], 'Freada de repente', janela(lt, 0.9, 2.2, 0.2))}
            {proibido(pr, [FX[1] + 1.8, yv - 0.8, 2.4], janela(lt, 1.1, 2.2, 0.2))}
            {tag(pr, [FX[1], yv + 0.4, 2.2], 'Só por segurança', ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 9. para guardar: buzina é aviso de perigo, não de pressa
    default: {
      const yv = 6;
      return {
        cam: camLook(0, 1, 0, 16, 44, 10),
        ground: AV,
        objs: [...AV_OBJS, car({ x: FX[1], y: -1, color: '#4f7fc4', brake: true }), car({ x: FX[0], y: 0.5, color: '#e0412f', brake: true }), car({ x: FX[2], y: -0.5, color: '#8f98a3', brake: true }), car({ x: FX[1], y: yv, color: VOCE, brake: true })],
        over: (pr) => (
          <>
            {buzina(pr, FX[1], yv, lt < 2.2 ? (Math.floor(lt * 4) % 2 === 0 ? 1 : 0.3) * janela(lt, 0.2, 2.2, 0.1) : 0)}
            {tag(pr, [FX[1], yv + 0.4, 2.2], 'Pressa?', janela(lt, 0.3, 2.3, 0.2))}
            {proibido(pr, [FX[1] + 2.6, yv + 1.2, 1.0], janela(lt, 0.8, 2.3, 0.2))}
            {tag(pr, [FX[1], yv + 0.4, 2.2], 'Buzina: só perigo', ease((lt - 2.4) / 0.3))}
            {certo(pr, [FX[1] + 2.6, yv + 1.2, 1.0], ease((lt - 2.8) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

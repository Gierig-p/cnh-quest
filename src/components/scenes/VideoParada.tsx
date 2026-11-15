/**
 * Vídeo do cartão c3-parada-estacionamento ("Parada ou estacionamento?"), lote 4 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/parada.json).
 */
import { box, camLook, type Obj } from './engine';
import { car, person } from './models';
import { utilitario } from './veiculos';
import { signPost } from './signs';
import { MOCA, RAPAZ, SENHORA, fumaca } from './Mundo3';
import { RA, VOCE, XM, certo, ease, fazerVideo, janela, lerp, pisca, relogio, ruaChao, ruaObjs, tag, triangulo, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/parada.json';

const CHAO = ruaChao();
const OBJS = ruaObjs(1, true);
const PLACA = signPost({ x: RA + 0.5, y: -9, code: 'R-6a', face: Math.PI / 2 });
const cam = (y: number) => camLook(2.4, y, 0, -30, 54, 11);

/** relógio preso a um ponto da cena */
const relogioEm = (pr: Pr, x: number, y: number, z: number, voltas: number, o: number) => {
  const [px, py] = pr([x, y, z]);
  return relogio(px, py - 12, voltas, o);
};

/**
 * Seu carro chega e encosta no meio-fio em `yp`, alguém desce pelo lado da calçada e o carro vai embora.
 * `t` em segundos: chega até 1,4; a pessoa desce de 1,6 a 2,8; o carro sai a partir de `sai`.
 */
function paradaRapida(t: number, yp: number, sai = 3.0, look = RAPAZ) {
  const kc = ease(t / 1.4);
  const yc = t < sai ? lerp(yp + 14, yp, kc) : yp - 3.2 * (t - sai) ** 1.5;
  const xc = t < sai ? lerp(1.75, XM, ease((t - 0.6) / 0.8)) : lerp(XM, 1.75, ease((t - sai) / 0.9));
  const kp = clamp01((t - 1.6) / 1.2);
  const objs: Obj[] = [car({ x: xc, y: yc, color: VOCE, brake: t > 0.8 && t < sai, blink: t > sai - 0.3 && t < sai + 0.9 ? pisca(t, 'l') : null })];
  if (t > 1.55) objs.push(person(lerp(XM + 1.1, RA + 1.8, kp), yp + 0.3 - kp * 1.2, look, kp < 1 ? t * 6 : 0, Math.PI / 2 - 0.4, 1.2));
  return { objs, xc, yc, pessoa: [lerp(XM + 1.1, RA + 1.8, kp), yp + 0.3 - kp * 1.2] as const };
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** caixa de mercadoria nas mãos de quem carrega */
const caixa = (x: number, y: number): Obj => ({ parts: [box(x - 0.3, y - 0.55, 0.95, x + 0.3, y - 0.05, 1.4, '#c9955a')], shadow: true });

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. parar e estacionar parecem a mesma coisa
    case 0: {
      const p = paradaRapida(lt + 0.6, -2, 99, MOCA);
      return {
        cam: cam(-3),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -9.5, color: '#4f7fc4' }), ...p.objs],
        over: (pr) => (
          <>
            {tag(pr, [p.xc, p.yc + 0.4, 2.2], 'Parar?', ease((lt - 0.8) / 0.3))}
            {tag(pr, [XM, -9.1, 2.2], 'Estacionar?', ease((lt - 2.0) / 0.3))}
          </>
        ),
      };
    }
    // 1. a diferença é o tempo e o motivo
    case 1: {
      return {
        cam: cam(-6),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -2, color: VOCE }), car({ x: XM, y: -9.5, color: '#4f7fc4' })],
        over: (pr) => (
          <>
            {relogioEm(pr, XM, -5.8, 2.2, lt * 0.8, ease((lt - 0.2) / 0.3))}
            {tag(pr, [XM - 1.4, -5.8, 0.2], 'O tempo', ease((lt - 0.4) / 0.3))}
            {tag(pr, [RA + 1.6, -1.2, 2.4], 'O motivo', ease((lt - 1.4) / 0.3))}
          </>
        ),
      };
    }
    // 2. parada: só o tempo de alguém subir ou descer
    case 2: {
      const p = paradaRapida(lt, -3, 3.0);
      return {
        cam: cam(-5),
        ground: CHAO,
        objs: [...OBJS, ...p.objs],
        over: (pr) => (
          <>
            {tag(pr, [p.pessoa[0], p.pessoa[1], 2.4], 'Desce', janela(lt, 1.7, 3.0, 0.2))}
            {tag(pr, [XM, -6, 2.4], 'Parada', ease((lt - 3.0) / 0.3))}
            {relogioEm(pr, XM - 2.4, -3, 1.0, clamp01((lt - 1.4) / 1.6) * 0.15, janela(lt, 1.3, d))}
          </>
        ),
      };
    }
    // 3. estacionamento: mais tempo que isso
    case 3: {
      const door = janela(lt, 0.3, 1.3, 0.3);
      const kp = clamp01((lt - 0.8) / 2.0);
      // você desce do lado da rua, contorna pela frente e sobe na calçada
      const px = kp < 0.5 ? lerp(XM - 1.2, XM - 1.0, kp * 2) : lerp(XM - 1.0, RA + 2.2, (kp - 0.5) * 2);
      const py = kp < 0.5 ? lerp(-3.2, -6.0, kp * 2) : -6.0;
      return {
        cam: cam(-5),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -3, color: VOCE, door }), ...(lt > 0.6 && kp < 1 ? [person(px, py, RAPAZ, lt * 6, kp < 0.5 ? 0 : Math.PI / 2, 1.2)] : [])],
        over: (pr) => (
          <>
            {tag(pr, [XM, -2.6, 2.2], 'Ficou', ease((lt - 2.2) / 0.3))}
            {relogioEm(pr, XM - 2.4, -3, 1.0, lt * 1.6, ease((lt - 2.0) / 0.3))}
            {tag(pr, [XM, -9.5, 0.2], 'Estacionamento', ease((lt - 2.6) / 0.3))}
          </>
        ),
      };
    }
    // 4. carga e descarga também é estacionamento
    case 4: {
      const ida = (lt * 0.55) % 1; // vai e volta entre o caminhão e a loja
      const kx = ida < 0.5 ? ida * 2 : 2 - ida * 2;
      const x = lerp(RA + 0.6, RA + 2.4, kx);
      const leva = ida < 0.5;
      return {
        cam: cam(-4),
        ground: CHAO,
        objs: [...OBJS, utilitario({ x: XM, y: -3, tipo: 'caminhao' }), person(x, -1.2, SENHORA, lt * 6, leva ? Math.PI / 2 : -Math.PI / 2, 1.2, leva ? { l: [0.2, 1.3], r: [0.2, 1.3] } : undefined), ...(leva ? [caixa(x + 0.35, -1.2 + 0.3)] : [])],
        over: (pr) => (
          <>
            {tag(pr, [XM, -3, 3.8], 'Carga e descarga', janela(lt, 0.2, 2.2, 0.2))}
            {tag(pr, [XM, -3, 3.8], '= Estacionamento', ease((lt - 2.3) / 0.3))}
          </>
        ),
      };
    }
    // 5. onde é proibido estacionar, a parada é só o tempo de subir ou descer
    case 5: {
      const p = paradaRapida(lt, -5, 3.2, MOCA);
      return {
        cam: cam(-6),
        ground: CHAO,
        objs: [...OBJS, PLACA, ...p.objs],
        over: (pr) => (
          <>
            {tag(pr, [RA + 0.5, -9, 3.6], 'Proibido estacionar', janela(lt, 0.2, 1.8, 0.2))}
            {tag(pr, [p.pessoa[0], p.pessoa[1], 2.4], 'Só descer', janela(lt, 1.8, 3.4, 0.2))}
            {tag(pr, [RA + 0.5, -9, 3.6], 'Parada rápida', ease((lt - 3.5) / 0.3))}
            {certo(pr, [RA + 0.5, -9, 4.6], ease((lt - 3.9) / 0.3))}
          </>
        ),
      };
    }
    // 6. e sem atrapalhar os carros e os pedestres
    case 6: {
      const yo = 8 - 6 * lt;
      const xp = RA + 1.8, yp = -10 + 1.5 * lt;
      return {
        cam: cam(-4),
        ground: CHAO,
        objs: [...OBJS, PLACA, car({ x: XM, y: -3, color: VOCE, brake: true }), car({ x: 0.2, y: yo, color: '#e0412f' }), person(xp, yp, SENHORA, lt * 6, Math.PI, 1.2), person(RA + 0.5, -2.4, MOCA, 0, Math.PI / 2 + 0.3, 1.2)],
        over: (pr) => (
          <>
            {tag(pr, [0.2, yo + 0.4, 2.2], 'Carros passam', janela(lt, 0.2, 1.7, 0.2))}
            {tag(pr, [xp, yp, 2.4], 'Pedestres passam', ease((lt - 1.6) / 0.3))}
            {certo(pr, [XM, -3, 2.6], ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 7. parado por emergência: sinalize o local na hora
    case 7: {
      const kt = ease((lt - 1.4) / 0.9);
      return {
        cam: cam(-1),
        ground: CHAO,
        objs: [...OBJS, car({ x: 1.75, y: -4, color: VOCE, blink: pisca(lt, 'lr') }), ...(kt > 0.01 ? [triangulo(1.75, lerp(-1, 6.5, kt))] : []), ...(lt > 0.6 && kt < 0.98 ? [person(1.0, lerp(-2.5, 5.8, kt), RAPAZ, lt * 6, Math.PI, 1.2)] : [])],
        over: (pr) => {
          const [fx, fy] = pr([1.75, -5.6, 1.1]);
          return (
            <>
              {fumaca(fx, fy, 1.4)}
              {tag(pr, [1.75, -3.6, 2.2], 'Emergência', janela(lt, 0.2, 1.6, 0.2))}
              {tag(pr, [1.75, 6.5, 1.2], 'Sinalize na hora', ease((lt - 2.3) / 0.3))}
            </>
          );
        },
      };
    }
    // 8. para guardar: subiu ou desceu e foi embora, é parada; ficou, é estacionamento
    default: {
      const p = paradaRapida(lt, -3, 2.6, MOCA);
      return {
        cam: cam(-6),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -11, color: '#4f7fc4' }), ...p.objs],
        over: (pr) => (
          <>
            {tag(pr, [XM, -6, 2.2], 'Desceu e foi: parada', janela(lt, 1.8, d))}
            {tag(pr, [XM, -10.6, 2.2], 'Ficou: estacionamento', ease((lt - 3.4) / 0.3))}
            {relogioEm(pr, XM, -14.2, 2.4, lt * 1.6, ease((lt - 3.4) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

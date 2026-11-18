/**
 * Vídeo do cartão c3-posicao-portas ("Do jeito certo e com a porta segura"), lote 4 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/portas.json).
 */
import { camLook, lines, type Obj, type Part, type V2 } from './engine';
import { car, cyclist, person } from './models';
import { campo, estrada } from './Mundo2';
import { MOCA, RAPAZ, SENHORA } from './Mundo3';
import { AMARELO, RA, VOCE, VERDE, XM, arco, caminho, certo, desvio, ease, freia, fazerVideo, janela, lerp, moto, pisca, rastro, ruaChao, ruaObjs, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/portas.json';

const CHAO = ruaChao();
const OBJS = ruaObjs(2, true);
const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);
const cam = (y: number, s = 11) => camLook(2.4, y, 0, -30, 54, s);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* vagas pintadas a 45° junto à calçada (a sinalização manda outra coisa) */
const VY = [-14, -9.4, -4.8, -0.2];
const VAGAS: Part[] = ruaChao([
  lines(VY.map((y) => ({ p: [[RA - 3.2, y + 3.2, 0], [RA, y, 0]] as [number, number, number][], c: '#eeeeea', w: 1 }))),
]);
const XV = RA - 2.0;

/** o carro chega pela faixa da direita e encosta paralelo ao meio-fio em `yp`, numa curva suave (aponta para onde anda) */
function encosta(t: number, yp: number) {
  const c = caminho([[1.75, yp + 13], ...desvio(1.75, yp + 6, XM, yp + 0.8), [XM, yp]]);
  const p = c.em(c.total * freia(t / 2.2));
  return { x: p.x, y: p.y, h: p.heading, para: t > 1.9 };
}

/** a moto chega e vira de frente para o meio-fio (em "L") em `yp`, fazendo a curva */
const XL = RA - 1.25;
function motoL(t: number, yp: number) {
  const c = caminho([[XL - 1.5, yp + 10], ...arco(XL, yp + 1.5, 1.5, Math.PI, Math.PI * 1.5)]);
  const p = c.em(c.total * freia(t / 2.2));
  return { x: p.x, y: p.y, face: p.heading };
}

/** entrada na vaga a 45°: segue reto, faz a curva para a direita e entra de frente */
const R45 = 3.5, X45 = XV - (1 - Math.SQRT1_2) * R45 - 0.8 * Math.SQRT1_2, Y45 = VY[2] + 4.3 + 0.8 * Math.SQRT1_2 + Math.SQRT1_2 * R45;
const VAGA = caminho([[X45, 9], ...arco(X45 + R45, Y45, R45, Math.PI, Math.PI * 1.25), [XV, VY[2] + 4.3]]);

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. não basta saber onde parar: a posição também tem regra
    case 0: {
      const c = encosta(lt + 0.4, -4);
      return {
        cam: cam(-5),
        ground: CHAO,
        objs: [...OBJS, car({ x: c.x, y: c.y, heading: c.h, color: VOCE, brake: c.para, blink: lt < 2 ? pisca(lt, 'r') : null })],
        over: (pr) => (
          <>
            {tag(pr, [c.x, c.y + 0.4, 2.2], 'Onde parar', janela(lt, 0.3, 2.0, 0.2))}
            {tag(pr, [c.x, c.y + 0.4, 2.2], 'E como parar', ease((lt - 2.1) / 0.3))}
          </>
        ),
      };
    }
    // 1. carro: no sentido do trânsito, paralelo e junto ao meio-fio
    case 1: {
      const c = encosta(lt, -4);
      return {
        cam: cam(-5),
        ground: CHAO,
        objs: [...OBJS, car({ x: c.x, y: c.y, heading: c.h, color: VOCE, brake: c.para })],
        over: (pr) => (
          <>
            {rastro(pr, [[1.75, 10], [1.75, -7]], AMARELO, 0.8 * janela(lt, 0.2, 1.9, 0.2))}
            {tag(pr, [1.75, -7.5, 0.2], 'Sentido do trânsito', janela(lt, 0.2, 1.9, 0.2))}
            {rastro(pr, [[RA - 0.05, 0], [RA - 0.05, -8]], VERDE, 0.9 * ease((lt - 2.2) / 0.3), false)}
            {tag(pr, [c.x, c.y + 0.4, 2.2], 'Paralelo', janela(lt, 2.2, 3.5, 0.2))}
            {tag(pr, [c.x, c.y + 0.4, 2.2], 'Junto ao meio-fio', ease((lt - 3.6) / 0.3))}
            {certo(pr, [c.x, c.y - 3, 1.6], ease((lt - 4.0) / 0.3))}
          </>
        ),
      };
    }
    // 2. moto: de frente ou de traseira para o meio-fio, em "L"
    case 2: {
      const m = motoL(lt, -4);
      return {
        cam: cam(-4.5, 9.5),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -9, color: '#4f7fc4' }), car({ x: XM, y: 1.6, color: '#8f98a3' }), moto(m.x, m.y, m.face, '#e0412f')],
        over: (pr) => (
          <>
            {tag(pr, [m.x, m.y, 2.4], 'Moto', janela(lt, 0.2, 2.0, 0.2))}
            {rastro(pr, [[RA - 0.05, -2.6], [RA - 0.05, -5.4]], VERDE, 0.9 * ease((lt - 2.4) / 0.3), false)}
            {rastro(pr, [[RA - 2.6, -4], [RA - 0.05, -4]], AMARELO, 0.9 * ease((lt - 2.4) / 0.3), false)}
            {tag(pr, [m.x, m.y, 2.4], 'Em "L"', janela(lt, 2.2, 3.7, 0.2))}
            {tag(pr, [m.x, m.y + 2.5, 0.2], 'Junto ao meio-fio', ease((lt - 3.8) / 0.3))}
          </>
        ),
      };
    }
    // 3. isso vale quando a sinalização não mandar outra coisa
    case 3: {
      const pv = VAGA.em(VAGA.total * freia((lt - 0.2) / 2.0));
      const ent: V2 = [pv.x, pv.y];
      const objs: Obj[] = [
        ...OBJS,
        car({ x: XV, y: VY[0] + 4.3, heading: Math.PI / 4, color: '#4f7fc4' }),
        car({ x: XV, y: VY[1] + 4.3, heading: Math.PI / 4, color: '#e0412f' }),
        car({ x: ent[0], y: ent[1], heading: pv.heading, color: VOCE, brake: lt > 1.6 }),
      ];
      return {
        cam: cam(-6),
        ground: VAGAS,
        objs,
        over: (pr) => (
          <>
            {tag(pr, [RA - 1.6, -16, 0.2], 'Vagas pintadas', janela(lt, 0.2, 1.8, 0.2))}
            {tag(pr, [ent[0], ent[1], 2.2], 'Vale a sinalização', ease((lt - 2.0) / 0.3))}
            {certo(pr, [ent[0] - 2.6, ent[1], 0.6], ease((lt - 2.4) / 0.3))}
          </>
        ),
      };
    }
    // 4. na estrada com acostamento, pare fora da pista
    case 4: {
      const ac = caminho([[1.75, 10], ...desvio(1.75, 6.5, 4.75, -0.6), [4.75, -2]]);
      const pa = ac.em(ac.total * freia(lt / 2.0));
      const { x, y } = pa;
      return {
        cam: camLook(2.6, -3, 0, 12, 38, 10),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x, y, heading: pa.heading, color: VOCE, brake: lt > 1.2, blink: pisca(lt, lt < 1.8 ? 'r' : 'lr') }), car({ x: 1.75, y: 24 - 6 * lt, color: '#8f98a3' })],
        over: (pr) => (
          <>
            {tag(pr, [4.75, -6.5, 0.2], 'Acostamento', janela(lt, 0.2, 1.8, 0.2))}
            {tag(pr, [x, y + 0.4, 2.2], 'Fora da pista', ease((lt - 1.9) / 0.3))}
            {certo(pr, [x + 2.2, y, 0.6], ease((lt - 2.2) / 0.3))}
          </>
        ),
      };
    }
    // 5. antes de abrir a porta, olhe se não vem ninguém
    case 5: {
      const yb = 9 - 5 * lt;
      const door = ease((lt - 3.6) / 0.6);
      return {
        cam: camLook(1.4, -2, 0, -30, 54, 10),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -2, color: VOCE, door }), cyclist(0.7, yb, lt * 5, 0, '#ff8a3d')],
        over: (pr) => (
          <>
            {tag(pr, [XM, -1.6, 2.2], 'Olhe antes', janela(lt, 0.2, 1.6, 0.2))}
            {tag(pr, [0.7, yb, 2.2], 'Bicicleta', janela(lt, 1.0, 3.2, 0.2))}
            {tag(pr, [XM, -1.6, 2.2], 'Espere passar', janela(lt, 1.7, 3.4, 0.2))}
            {tag(pr, [XM, -1.6, 2.2], 'Agora abra', ease((lt - 3.6) / 0.3))}
            {certo(pr, [XM, 2.6, 0.4], ease((lt - 4.0) / 0.3))}
          </>
        ),
      };
    }
    // 6. passageiros pelo lado da calçada; só o motorista usa o outro lado
    case 6: {
      const kp = clamp01((lt - 0.4) / 1.6);
      // a porta abre, o motorista desce, a porta fecha e só então ele anda (não passa pela porta)
      const door = ease((lt - 2.6) / 0.5) * (1 - ease((lt - 3.5) / 0.4));
      const km = clamp01((lt - 3.9) / 1.3);
      return {
        cam: cam(-3, 10),
        ground: CHAO,
        objs: [
          ...OBJS,
          car({ x: XM, y: -2, color: VOCE, door }),
          ...(lt > 0.35 ? [person(lerp(XM + 1.0, RA + 1.8, kp), -2.6, MOCA, kp < 1 ? lt * 6 : 0, Math.PI / 2, 1.2), person(lerp(XM + 1.0, RA + 1.6, clamp01(kp - 0.15)), -1.2, SENHORA, kp < 1 ? lt * 6 : 0, Math.PI / 2, 1.2)] : []),
          ...(lt > 3.1 ? [person(lerp(XM - 1.5, XM - 1.3, km), lerp(-1.8, -5.8, km), RAPAZ, km > 0 && km < 1 ? lt * 6 : 0, 0, 1.2)] : []),
        ],
        over: (pr) => (
          <>
            {tag(pr, [RA + 1.7, -1.9, 2.4], 'Lado da calçada', janela(lt, 1.0, d))}
            {tag(pr, [XM - 2.4, 1.8, 0.2], 'Só o motorista', ease((lt - 3.0) / 0.3))}
          </>
        ),
      };
    }
    // 7. para guardar: carro paralelo, moto em L, porta só depois de olhar
    default: {
      return {
        cam: cam(-4, 10),
        ground: CHAO,
        objs: [...OBJS, car({ x: XM, y: -1, color: VOCE, door: ease((lt - 4.8) / 0.5) }), moto(RA - 1.25, -6, Math.PI / 2, '#e0412f'), ...(lt > 2.0 ? [cyclist(0.4, 12 - 6 * (lt - 2.0), lt * 5, 0, '#ff8a3d')] : [])],
        over: (pr) => (
          <>
            {tag(pr, [XM, -0.6, 2.2], 'Carro paralelo', janela(lt, 0.2, d))}
            {tag(pr, [RA - 1.25, -6, 2.4], 'Moto em "L"', janela(lt, 1.5, d))}
            {tag(pr, [XM - 2.6, 3.0, 0.2], 'Porta: olhe antes', ease((lt - 3.0) / 0.3))}
            {certo(pr, [XM + 1.8, -1, 0.6], ease((lt - 5.2) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

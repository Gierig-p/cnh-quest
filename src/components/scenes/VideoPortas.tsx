/**
 * Vídeo do cartão c3-posicao-portas ("Do jeito certo e com a porta segura"), lote 4 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/portas.json).
 */
import { camLook, lines, type Obj, type Part, type V2 } from './engine';
import { car, cyclist, person } from './models';
import { campo, estrada } from './Mundo2';
import { MOCA, RAPAZ, SENHORA } from './Mundo3';
import { AMARELO, RA, VOCE, VERDE, XM, certo, ease, fazerVideo, janela, lerp, moto, pisca, rastro, ruaChao, ruaObjs, tag, type Quadro } from './videoBase';
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

/** o carro chega pela faixa da direita e encosta paralelo ao meio-fio em `yp` */
function encosta(t: number, yp: number) {
  const k = ease(t / 2.2);
  const y = lerp(yp + 13, yp, k);
  const x = lerp(1.75, XM, ease((t - 1.0) / 1.0));
  const h = -0.18 * Math.sin(Math.PI * clamp01((t - 1.0) / 1.0)) * -1;
  return { x, y, h, para: t > 1.8 };
}

/** a moto chega e vira de frente para o meio-fio (em "L") em `yp` */
function motoL(t: number, yp: number) {
  const k = ease(t / 2.0);
  const y = lerp(yp + 10, yp, k);
  const kv = ease((t - 1.2) / 1.0);
  return { x: lerp(1.2, RA - 1.25, kv), y, face: lerp(0, Math.PI / 2, kv) };
}

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
      const kc = ease((lt - 0.4) / 1.8);
      const ent: V2 = [lerp(1.75, XV, kc), lerp(8, VY[2] + 4.3, kc)];
      const objs: Obj[] = [
        ...OBJS,
        car({ x: XV, y: VY[0] + 4.3, heading: Math.PI / 4, color: '#4f7fc4' }),
        car({ x: XV, y: VY[1] + 4.3, heading: Math.PI / 4, color: '#e0412f' }),
        car({ x: ent[0], y: ent[1], heading: lerp(0, Math.PI / 4, kc), color: VOCE, brake: lt > 2.0 }),
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
      const k = ease(lt / 2.0);
      const y = lerp(10, -2, k);
      const x = lerp(1.75, 4.75, ease((lt - 0.5) / 1.3));
      return {
        cam: camLook(2.6, -3, 0, 12, 38, 10),
        ground: ESTRADA,
        objs: [...CAMPO, car({ x, y, heading: 0.15 * Math.sin(Math.PI * clamp01((lt - 0.5) / 1.3)), color: VOCE, brake: lt > 1.2, blink: pisca(lt, lt < 1.8 ? 'r' : 'lr') }), car({ x: 1.75, y: 24 - 6 * lt, color: '#8f98a3' })],
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
      const door = ease((lt - 2.6) / 0.5);
      const km = clamp01((lt - 3.1) / 1.4);
      return {
        cam: cam(-3, 10),
        ground: CHAO,
        objs: [
          ...OBJS,
          car({ x: XM, y: -2, color: VOCE, door }),
          ...(lt > 0.35 ? [person(lerp(XM + 1.0, RA + 1.8, kp), -2.6, MOCA, kp < 1 ? lt * 6 : 0, Math.PI / 2, 1.2), person(lerp(XM + 1.0, RA + 1.6, clamp01(kp - 0.15)), -1.2, SENHORA, kp < 1 ? lt * 6 : 0, Math.PI / 2, 1.2)] : []),
          ...(km > 0 ? [person(lerp(XM - 1.4, XM - 1.2, km), lerp(-2.3, -5.8, km), RAPAZ, km < 1 ? lt * 6 : 0, 0, 1.2)] : []),
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
        objs: [...OBJS, car({ x: XM, y: -1, color: VOCE, door: ease((lt - 4.0) / 0.5) }), moto(RA - 1.25, -6, Math.PI / 2, '#e0412f'), ...(lt > 3 && lt < 4.2 ? [cyclist(0.4, 7 - 6 * (lt - 3), lt * 5, 0, '#ff8a3d')] : [])],
        over: (pr) => (
          <>
            {tag(pr, [XM, -0.6, 2.2], 'Carro paralelo', janela(lt, 0.2, d))}
            {tag(pr, [RA - 1.25, -6, 2.4], 'Moto em "L"', janela(lt, 1.5, d))}
            {tag(pr, [XM - 2.6, 3.0, 0.2], 'Porta: olhe antes', ease((lt - 3.0) / 0.3))}
            {certo(pr, [XM + 1.8, -1, 0.6], ease((lt - 4.4) / 0.3))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

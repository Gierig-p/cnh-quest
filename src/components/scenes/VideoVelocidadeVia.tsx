/**
 * Vídeo do cartão c5-velocidade-via ("Velocidade certa para a via"), Mundo 5, lote 4 de 17/11/2026.
 * O número da placa é o máximo; trânsito, chuva, obstáculos e gente pedem menos; curva (freie antes, volante suave);
 * descida forte (teste os freios, marcha reduzida); nunca banguela nem motor desligado; buraco e lombada;
 * óleo, areia e barro; correr compensa pouco (50 km em 37 ou 30 min) e o exemplo do Marcos na serra.
 * Tempos em content/videos/velocidade-via.json.
 */
import { box, camLook, flat, rect, type Obj, type Part } from './engine';
import { car, grassPatches, person } from './models';
import { SENHORA } from './Mundo3';
import { TINTA, chave, chip, nao, surge, visto } from './infracoesUI';
import { arco, caminho, chuva, clamp, ease, escuro, fazerVideo, pisca, placa, relogio, tag, triangulo, type Quadro } from './videoBase';
import {
  AZ, LARANJA, VERDE, VERM, XV, PE, anel, buraco, cambio, carroZ, deLado, lanternas, lombada, mancha, naCabine, postePlaca,
  rodovia, serra, velocimetro, voce, volanteCartao,
} from './defensivaUI';
import tempos from '../../content/videos/velocidade-via.json';

/** anda com velocidade v0 e reduz para v1 entre a e b (posição em metros andados) */
function anda(t: number, v0: number, v1: number, a: number, b: number): number {
  if (t <= a) return v0 * t;
  const u = Math.min(t, b) - a;
  const dur = b - a;
  const s = v0 * a + v0 * u + ((v1 - v0) * u * u) / (2 * dur);
  return t <= b ? s : s + v1 * (t - b);
}

/* ---------------- curva ---------------- */

const CX = 20, R = 20;
const A0 = Math.PI, A1 = Math.PI * 1.5;
/** setor de anel entre os raios r0 e r1 */
const anelChao = (r0: number, r1: number, c: string, z = 0): Part => flat([...arco(CX, 0, r1, A0, A1, 24), ...arco(CX, 0, r0, A1, A0, 24)], c, z);
const CURVA_CHAO: Part[] = [
  ...grassPatches(-50, -70, 60, 40, 7),
  rect(-3.5, 0, 3.5, 40, '#5b6169'),
  anelChao(R - 3.5, R + 3.5, '#5b6169'),
  rect(CX, -R - 3.5, 60, -R + 3.5, '#5b6169'),
  // bordas brancas e faixa dupla amarela
  rect(-3.5, 0, -3.35, 40, '#eeeeea', 0.01),
  rect(3.35, 0, 3.5, 40, '#eeeeea', 0.01),
  anelChao(R - 3.5, R - 3.35, '#eeeeea', 0.01),
  anelChao(R + 3.35, R + 3.5, '#eeeeea', 0.01),
  rect(CX, -R - 3.5, 60, -R - 3.35, '#eeeeea', 0.01),
  rect(CX, -R + 3.35, 60, -R + 3.5, '#eeeeea', 0.01),
  rect(-0.1, 0, 0.1, 40, '#f2c21b', 0.01),
  anelChao(R - 0.1, R + 0.1, '#f2c21b', 0.01),
  rect(CX, -R - 0.1, 60, -R + 0.1, '#f2c21b', 0.01),
];
/** balizas amarelas com seta preta do lado de fora da curva */
const BALIZAS: Obj[] = [1.12, 1.24, 1.36].map((f) => {
  const a = Math.PI * f;
  const x = CX + (R + 4.6) * Math.cos(a), y = (R + 4.6) * Math.sin(a);
  return {
    parts: [
      box(x - 0.06, y - 0.06, 0, x + 0.06, y + 0.06, 1.0, '#7d858e'),
      box(x - 0.45, y - 0.45, 1.0, x + 0.45, y + 0.45, 1.6, (k) => (k === 'top' ? '#d9b21a' : '#f2c21b')),
    ],
    shadow: true,
  };
});
const ROTA = caminho([[XV, 18], [XV, 0], ...arco(CX, 0, R - XV, A0, A1, 30).slice(1), [60, -(R - XV)]]);

function curva(lt: number, over: Quadro['over']): Quadro {
  const s = anda(Math.max(0, lt - 0.3), 7, 3.6, 1.9, 3.3);
  const p = ROTA.em(s);
  const freia = lt > 2.2 && lt < 3.6;
  return {
    cam: camLook(9, -7, 0, 0, 50, 6.6, 160, 104),
    ground: CURVA_CHAO,
    objs: [...BALIZAS, car({ x: p.x, y: p.y, heading: p.heading, color: '#e9eef3', brake: freia })],
    over: (pr) => (
      <>
        {setasBalizas(pr)}
        {over?.(pr)}
      </>
    ),
  };
}

/* ---------------- outras cenas ---------------- */

/** placa de 80 na beira da estrada (poste 3D + placa em pixels) */
const YPL = -10;

/** setas pretas das balizas (pixels), apontando para onde a curva vira */
const setasBalizas = (pr: Parameters<NonNullable<Quadro['over']>>[0]) =>
  [1.12, 1.24, 1.36].map((f) => {
    const a = Math.PI * f;
    const [x, y] = pr([CX + (R + 4.6) * Math.cos(a), (R + 4.6) * Math.sin(a), 1.3]);
    return <path key={f} d={`M${x - 2} ${y - 3} l3 3 l-3 3`} fill="none" stroke="#1d2430" strokeWidth={1.6} />;
  });

/** o câmbio passando de uma marcha para outra entre os tempos a e a + 0.9 */
const troca = (lt: number, a: number) => ease((lt - a) / 0.9);

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. o número da placa é o máximo; a velocidade certa depende da via, do tempo e do trânsito
    case 0: {
      const yv = 6 - 2.4 * lt;
      return rodovia(yv, [voce(XV, yv), postePlaca(4.6, YPL), car({ x: -XV, y: -36 + 4 * lt, heading: Math.PI, color: '#c0563f' })], (pr) => {
        const [px, py] = pr([4.6, YPL, 2.5]);
        return (
          <>
            {placa('R-19', px, py - 6, 30, 1, 80)}
            {chip(px - 4, py - 34, 'O máximo', VERM, surge(lt, 1.2), 10)}
            {chip(160, 150, 'A velocidade certa depende:', TINTA, surge(lt, 2.4), 10)}
            {chip(70, 178, 'Da via', AZ, surge(lt, 3.3), 11)}
            {chip(160, 178, 'Do tempo', AZ, surge(lt, 3.9), 11)}
            {chip(250, 178, 'Do trânsito', AZ, surge(lt, 4.5), 11)}
          </>
        );
      });
    }
    // 1. trânsito pesado, chuva, obstáculos ou muita gente: velocidade menor e mais atenção
    case 1: {
      const yv = 8 - 3.2 * lt + 0.12 * lt * lt;
      const fila = [9, 17, 25].map((d, i) => car({ x: XV, y: yv - d - 0.4 * lt, color: ['#4f7fc4', '#d9a43a', '#6b8e5a'][i], brake: i === 0 }));
      const kmh = 80 - 30 * ease((lt - 3.4) / 1.2);
      return rodovia(
        yv,
        [voce(XV, yv), ...fila, car({ x: 4.9, y: -30, color: '#8a8f96', blink: pisca(lt, 'lr') }), { ...triangulo(4.9, -24) }, person(-5.2, -12 - 0.5 * lt, SENHORA, lt * 2, 0)],
        () => (
          <>
            {chuva(lt, 0.7 * surge(lt, 1.3))}
            {chip(82, 22, 'Trânsito pesado', TINTA, surge(lt, 0.6), 10)}
            {chip(238, 22, 'Chuva', AZ, surge(lt, 1.3), 10)}
            {chip(82, 44, 'Obstáculos', LARANJA, surge(lt, 2.0), 10)}
            {chip(238, 44, 'Muita gente', '#8e5cc2', surge(lt, 2.7), 10)}
            {velocimetro(282, 150, kmh, surge(lt, 3.2))}
            {chip(110, 166, 'Velocidade menor', VERDE, surge(lt, 3.6), 11)}
            {chip(110, 188, 'Mais atenção', VERDE, surge(lt, 4.4), 11)}
          </>
        ),
      );
    }
    // 2. curva: freie e, se precisar, reduza a marcha antes; dentro dela, volante suave
    case 2:
      return curva(lt, (pr) => {
        const [bx, by] = pr([XV, 6, 0]);
        const gira = ease((lt - 4.6) / 1.6) * 0.9;
        return (
          <>
            {chip(bx - 20, by + 18, 'Freie antes de entrar', VERDE, surge(lt, 1.6), 10)}
            {cambio(46, 70, '4', '3', troca(lt, 3.4), surge(lt, 3.0), 'Se precisar')}
            {chip(108, 22, 'Reduza a marcha antes', AZ, surge(lt, 3.0), 10)}
            {volanteCartao(270, 150, gira, surge(lt, 4.6), 'Volante suave')}
          </>
        );
      });
    // 3. descida forte: teste os freios antes e desça com uma marcha reduzida engatada
    case 3: {
      const pulsa = lt > 1.2 && lt < 2.6 && Math.floor((lt - 1.2) * 2.5) % 2 === 0;
      return serra(4 * lt, [voce(XV, 0, pulsa)], (pr) => (
        <>
          {chip(160, 22, 'Descida forte', LARANJA, surge(lt, 0.4), 11)}
          {lanternas(pr, XV, 0, pulsa)}
          {chip(90, 180, 'Teste os freios antes', VERDE, surge(lt, 1.1), 10)}
          {cambio(268, 84, '4', '2', troca(lt, 2.6), surge(lt, 2.4), 'Marcha reduzida')}
          {visto(298, 44, surge(lt, 3.6), 10)}
        </>
      ), { nev: 0.15 });
    }
    // 4. nunca desengrenado nem com o motor desligado: os freios podem não segurar; infração média
    case 4:
      return serra(4 * lt, [voce(XV, 0)], () => (
        <>
          {escuro(0.45)}
          {cambio(84, 76, '3', 'N', troca(lt, 0.6), surge(lt, 0.4), 'Desengrenado')}
          {nao(118, 46, 11, surge(lt, 1.3))}
          {chave(232, 72, surge(lt, 1.8), 1.3)}
          {chip(232, 116, 'Motor desligado', TINTA, surge(lt, 1.8), 10)}
          {nao(262, 46, 11, surge(lt, 2.0))}
          {chip(160, 152, 'Os freios podem não segurar', VERM, surge(lt, 2.8), 10)}
          {chip(160, 178, 'Infração média', LARANJA, surge(lt, 4.0), 11)}
        </>
      ));
    // 5. buraco ou lombada: freie antes; em cima deles, não freie
    case 5: {
      const YL = -6;
      const yv = 12 - anda(lt, 6, 2.2, 0.8, 2.3);
      const freia = lt > 0.8 && lt < 2.3;
      const d = Math.abs(yv - YL);
      const z = d < 2.4 ? 0.09 * Math.sin((1 - d / 2.4) * Math.PI) ** 2 + 0.05 * Math.max(0, 1 - Math.abs(d - 1.3) / 0.6) : 0;
      return rodovia(
        yv,
        [lombada(YL), carroZ({ x: XV, y: yv, color: '#e9eef3', brake: freia }, z)],
        (pr) => (
          <>
            {tag(pr, [XV, YL, 0.4], 'Lombada', surge(lt, 0.4))}
            {tag(pr, [-XV, -16, 0.2], 'Buraco', surge(lt, 0.9))}
            {chip(84, 30, 'Freie antes', VERDE, surge(lt, 0.9), 11)}
            {visto(130, 30, surge(lt, 1.2), 9)}
            {chip(226, 30, 'Em cima: não freie', VERM, surge(lt, 2.6), 11)}
          </>
        ),
        [...buraco(-XV, -16)],
      );
    }
    // 6. óleo, areia ou barro: evite freadas bruscas e mudanças rápidas de velocidade
    case 6: {
      const yv = 6 - 3 * lt;
      return rodovia(yv, [voce(XV, yv)], (pr) => (
        <>
          {tag(pr, [XV, -4, 0.2], 'Óleo', surge(lt, 0.9))}
          {tag(pr, [XV, -13, 0.2], 'Areia', surge(lt, 1.5))}
          {tag(pr, [XV, -22, 0.2], 'Barro', surge(lt, 2.1))}
          {chip(160, 162, 'Evite freadas bruscas', LARANJA, surge(lt, 2.8), 11)}
          {chip(160, 184, 'e mudanças rápidas de velocidade', LARANJA, surge(lt, 3.8), 10)}
        </>
      ), [...mancha('oleo', XV, -4), ...mancha('areia', XV, -13), ...mancha('barro', XV, -22)]);
    }
    // 7. correr compensa pouco: 50 km levam 37 min a 80 km/h e 30 min a 100 km/h
    case 7: {
      const Y0 = 13, Y1 = -13;
      const pos = (dur: number) => Y0 + (Y1 - Y0) * clamp((lt - 1.0) / dur);
      const y80 = pos(3.7), y100 = pos(3.0);
      const chega80 = surge(lt, 4.7, 0.25), chega100 = surge(lt, 4.0, 0.25);
      return deLado(0, 5.6, [car({ x: XV, y: y80, color: '#4f7fc4' }), car({ x: -XV, y: y100, color: '#d93a35' })], (pr) => {
        const [sx, sy] = pr([-XV, Y0, 0]);
        const [tx, ty] = pr([XV, Y0, 0]);
        const [fx, fy] = pr([-XV, Y1, 0]);
        const [gx, gy] = pr([XV, Y1, 0]);
        return (
          <>
            {chip(sx + 6, sy - 30, '100 km/h', VERM, surge(lt, 0.6), 10)}
            {chip(tx + 6, ty + 30, '80 km/h', '#4f7fc4', surge(lt, 0.6), 10)}
            {chip(160, 22, 'Os mesmos 50 km', TINTA, surge(lt, 0.4), 11)}
            {relogio(56, 24, 0.3 * clamp((lt - 1) / 3.7), surge(lt, 1.0), 10)}
            {chip(fx - 4, fy - 30, '30 min', VERM, chega100, 11)}
            {chip(gx - 4, gy + 30, '37 min', '#4f7fc4', chega80, 11)}
            {chip(160, 186, 'Correr compensa pouco', TINTA, surge(lt, 5.6), 11)}
          </>
        );
      }, [rect(-3.5, Y1 - 0.2, 3.5, Y1 + 0.2, '#ffffff', 0.02), rect(-3.5, Y0 - 0.15, 3.5, Y0 + 0.15, '#ffffff', 0.02, 0.6)]);
    }
    // 8. Marcos engata uma marcha reduzida antes da descida
    case 8:
      return serra(3.5 * lt, [voce(XV, 0)], (pr) => (
        <>
          {tag(pr, [XV, 0, 1.6], 'Marcos', surge(lt, 0.4))}
          {chip(160, 22, 'Antes da descida', AZ, surge(lt, 1.0), 11)}
          {cambio(268, 96, '3', '2', troca(lt, 2.0), surge(lt, 1.6), 'Marcha reduzida')}
          {visto(298, 56, surge(lt, 3.1), 10)}
        </>
      ), { nev: 0.1 });
    // 9. freio do motor junto com o pedal
    case 9:
      return naCabine(lt, () => (
        <>
          {cambio(64, 70, '2', '2', 1, surge(lt, 0.2), 'Freio do motor', 0.9)}
          {chip(160, 22, 'Freio do motor + pedal', TINTA, surge(lt, 1.2), 10)}
          {anel(PE[0], PE[1], 14, surge(lt, 1.2))}
          {chip(196, 186, 'Pedal', VERDE, surge(lt, 1.2), 10)}
        </>
      ));
    // 10. para guardar
    default:
      return curva(lt, () => (
        <>
          {escuro(0.5)}
          {chip(160, 46, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {chip(160, 84, 'Freie antes da curva e do buraco', VERDE, surge(lt, 0.6), 11)}
          {chip(150, 120, 'Não dentro deles', VERM, surge(lt, 2.0), 11)}
          {nao(214, 120, 10, surge(lt, 2.0))}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

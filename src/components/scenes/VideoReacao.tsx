/**
 * Vídeo do cartão c5-reacao ("Tempo de reação"), Mundo 5, lote 3 de 17/11/2026.
 * Entre ver o perigo e parar o veículo anda: perceber e agir, décimos de segundo para o cérebro registrar,
 * 22 m por segundo a 80 km/h, pelo menos 44 m para parar, o poste a 80 km/h e o exemplo da Bia.
 * Tempos em content/videos/reacao.json.
 */
import type { ReactNode } from 'react';
import { building, car, lampPost } from './models';
import { camLook, rect, type Obj, type Part } from './engine';
import { campo, estrada } from './Mundo2';
import { cabine } from './VideoPosicao';
import { TINTA, chip, quadro, ruaFundo, seta, surge } from './infracoesUI';
import { VOCE, clamp, ease, escuro, fazerVideo, lerp, pisca, relogio, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/reacao.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const VERM = '#d93a35';
const AMAR = '#ffd84a';

const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);
const XV = 1.75;
/** 80 km/h ≈ 22 m por segundo */
const V80 = 22;

/** estrada de mão dupla com a câmera atrás de quem está em `y` */
function rodovia(y: number, objs: Obj[], over?: Quadro['over'], chao: Part[] = []): Quadro {
  return { cam: camLook(1.2, y - 8, 0, 12, 36, 8.5), ground: [...ESTRADA, ...chao], objs: [...CAMPO, ...objs], over };
}

/** estrada vista de lado (a pista corre pela tela), para medir em metros */
function deLado(yc: number, s: number, objs: Obj[], over?: Quadro['over'], chao: Part[] = []): Quadro {
  return { cam: camLook(1.2, yc, 0, 78, 30, s, 160, 118), ground: [...ESTRADA, ...chao], objs: [...CAMPO, ...objs], over };
}

/** marca amarela atravessando a sua faixa */
const marca = (y: number, o = 1): Part[] => (o > 0.01 ? [rect(0.1, y - 0.18, 3.4, y + 0.18, AMAR, 0.02, o)] : []);

/** régua no chão, ao lado da pista, de y0 a y1, com o rótulo no meio */
function regua(pr: Pr, y0: number, y1: number, texto: string, o: number, cor = TINTA, x = 4.6): ReactNode {
  if (o < 0.01) return null;
  const [ax, ay] = pr([x, y0, 0]);
  const [bx, by] = pr([x, y1, 0]);
  return (
    <g opacity={o}>
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="#ffffff" strokeWidth={2.4} />
      <line x1={ax} y1={ay - 6} x2={ax} y2={ay + 6} stroke="#ffffff" strokeWidth={2.4} />
      <line x1={bx} y1={by - 6} x2={bx} y2={by + 6} stroke="#ffffff" strokeWidth={2.4} />
      {chip((ax + bx) / 2, (ay + by) / 2 + 14, texto, cor, 1, 11)}
    </g>
  );
}

/** o motorista visto de lado, com a rua passando atrás */
function naCabine(lt: number, over: () => ReactNode, extra: Partial<Parameters<typeof cabine>[0]> = {}): Quadro {
  const q = ruaFundo(lt);
  return { ...q, over: () => (
    <>
      {escuro(0.5)}
      {cabine({ dobra: 1, apoio: 1, lt, ...extra })}
      {over()}
    </>
  ) };
}

/** olho e pé do motorista na cabine (dobra = 1) */
const OLHO: [number, number] = [166.5, 69];
const PE: [number, number] = [240, 170];
const anel = (x: number, y: number, r: number, o: number) => (o > 0.01 ? <circle cx={x} cy={y} r={r} fill="none" stroke={AMAR} strokeWidth={3} strokeDasharray="5 4" opacity={o} /> : null);

/** posição de quem anda a 80 km/h e freia: 1 s de reação e 2 s de freada até parar em mais 22 m */
function andaEPara(s: number): { y: number; freia: boolean } {
  if (s <= 0) return { y: 0, freia: false };
  if (s <= 1) return { y: -V80 * s, freia: false };
  const u = Math.min(s - 1, 2);
  return { y: -V80 - V80 * u + (V80 / 4) * u * u, freia: s - 1 < 2.6 };
}

/** carro parado com o pisca-alerta */
const parado = (y: number, lt: number) => car({ x: XV, y, color: '#c0563f', blink: pisca(lt, 'lr') });

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. entre ver o perigo e parar, o veículo continua andando
    case 0: {
      const yv = 2 - 3 * lt;
      return rodovia(yv, [car({ x: XV, y: yv, color: VOCE }), parado(-30, lt)], (pr) => {
        const [ax, ay] = pr([XV, yv, 1.4]);
        const [bx, by] = pr([XV, -30, 1.4]);
        return (
          <>
            {chip(90, 28, 'Ver o perigo', AZ, surge(lt, 0.4), 11)}
            {seta(150, 28, 182, 28, surge(lt, 1.0))}
            {chip(225, 28, 'O veículo parar', VERDE, surge(lt, 1.2), 11)}
            {seta(ax, ay - 8, bx, by + 8, surge(lt, 2.4), AMAR)}
            {chip(160, 182, 'Nesse tempo, o veículo continua andando', TINTA, surge(lt, 3.2), 10)}
          </>
        );
      });
    }
    // 1. tempo de reação: perceber e começar a agir
    case 1:
      return naCabine(lt, () => (
        <>
          {chip(160, 24, 'Tempo de reação', TINTA, surge(lt, 0.2), 11)}
          {anel(OLHO[0], OLHO[1], 13, surge(lt, 1.2))}
          {chip(80, 50, 'Perceber o perigo', AZ, surge(lt, 1.2), 10)}
          {anel(PE[0], PE[1], 14, surge(lt, 2.8))}
          {chip(140, 176, 'Agir: pisar no freio', VERDE, surge(lt, 2.8), 10)}
          {relogio(286, 40, lt * 0.3, surge(lt, 1.6), 11)}
        </>
      ));
    // 2. o cérebro leva alguns décimos de segundo para registrar o que os olhos veem
    case 2: {
      const o = surge(lt, 1.0);
      return naCabine(lt, () => (
        <>
          {anel(OLHO[0], OLHO[1], 13, surge(lt, 0.4))}
          {o > 0.01 && (
            <g opacity={o}>
              {[0, 1, 2].map((i) => {
                const f = ((lt * 0.9 + i / 3) % 1);
                const x = lerp(232, OLHO[0] + 10, f);
                const y = lerp(66, OLHO[1], f);
                return <circle key={i} cx={x} cy={y} r={2.4} fill={AMAR} opacity={1 - f * 0.6} />;
              })}
              <path d={`M232 66 L${OLHO[0] + 10} ${OLHO[1]}`} stroke={AMAR} strokeWidth={1.2} strokeDasharray="3 3" />
            </g>
          )}
          {chip(160, 24, 'O cérebro registra o que os olhos veem', AZ, surge(lt, 0.4), 10)}
          {relogio(282, 158, lt * 0.08, surge(lt, 2.0), 14)}
          {chip(160, 182, 'Leva alguns décimos de segundo', TINTA, surge(lt, 2.0), 10)}
        </>
      ));
    }
    // 3. a 80 km/h, cerca de 22 m em um segundo
    case 3: {
      // o carro passa várias vezes: entra pela esquerda, cruza a marca e some à direita
      const y0 = 11;
      const ENT = 15 / V80;
      const u = lt < 1.2 - ENT ? 0 : (lt - 1.2 + ENT) % 2.4;
      const y = lt < 1.2 - ENT ? 99 : y0 + 15 - V80 * u;
      const s = clamp(u - ENT);
      const fim = surge(lt, 2.2);
      return deLado(0, 10, [car({ x: XV, y, color: VOCE })], (pr) => (
        <>
          {chip(160, 24, '80 km/h', AZ, surge(lt, 0.3), 12)}
          {relogio(250, 48, s, surge(lt, 0.9), 13)}
          {chip(250, 74, '1 segundo', TINTA, surge(lt, 0.9), 10)}
          {regua(pr, y0, y0 - V80, 'Cerca de 22 metros', fim)}
        </>
      ), [...marca(y0, surge(lt, 0.8)), ...marca(y0 - V80, fim)]);
    }
    // 4. perceber, decidir, pisar e parar: pelo menos 44 m
    case 4: {
      const s = lt - 1.0;
      const { y, freia } = andaEPara(s);
      const y0 = 22;
      const passo = (a: number) => surge(lt, 1.0 + a);
      return deLado(0, 6, [car({ x: XV, y: y0 + y, color: VOCE, brake: freia })], (pr) => {
        const at = (yy: number): [number, number] => pr([XV, yy, 2.2]);
        const [p1x, p1y] = at(y0);
        const [p2x, p2y] = at(y0 - 11);
        const [p3x, p3y] = at(y0 - 22);
        const [p4x, p4y] = at(y0 - 44);
        return (
          <>
            {chip(160, 24, 'A 80 km/h', AZ, surge(lt, 0.2), 11)}
            {chip(p1x, p1y - 22, 'Percebe', AZ, passo(0), 9)}
            {chip(p2x, p2y - 40, 'Decide frear', LARANJA, passo(0.5), 9)}
            {chip(p3x, p3y - 22, 'Pisa no pedal', LARANJA, passo(1.0), 9)}
            {chip(p4x, p4y - 22, 'Para', VERDE, passo(3.0), 9)}
            {regua(pr, y0, y0 - 44, 'Pelo menos 44 metros', surge(lt, 4.6), VERM)}
          </>
        );
      }, [...marca(y0, surge(lt, 0.6)), ...marca(y0 - 44, surge(lt, 4.0))]);
    }
    // 5. sem concentração total, o tempo de reação aumenta: o risco vira perigo
    case 5: {
      const cresce = ease(clamp((lt - 1.4) / 1.6));
      const w = lerp(70, 190, cresce);
      const vira = surge(lt, 3.2);
      return naCabine(lt, () => (
        <>
          {escuro(0.35)}
          {chip(160, 24, 'Sem concentração total', LARANJA, surge(lt, 0.2), 11)}
          {quadro(50, 120, 220, 54, surge(lt, 0.8), (
            <>
              <text x={12} y={18} fontSize={10} fontWeight={800} fill={TINTA}>Tempo de reação</text>
              <rect x={12} y={28} width={196} height={14} rx={7} fill="#e6eaef" />
              <rect x={12} y={28} width={w} height={14} rx={7} fill={cresce > 0.5 ? LARANJA : VERDE} />
            </>
          ))}
          {chip(80, 60, 'Risco', '#d9a21b', surge(lt, 0.8) * (1 - vira), 12)}
          {chip(80, 60, 'Perigo', VERM, vira, 12)}
        </>
      ), { olho: 0.45 * surge(lt, 0.5) });
    }
    // 6. poste a 80 km/h = cair de um prédio de nove andares
    case 6: {
      const H = 27;
      const y = lerp(16, 1.6, ease(clamp((lt - 0.4) / 1.4)));
      const objs: Obj[] = [
        building({ x0: 6.5, y0: -9, x1: 13, y1: -2, h: H, floors: 9, color: '#d9e3f0', tank: false }),
        lampPost(3.9, -1.2, -1),
        car({ x: XV, y, color: VOCE }),
      ];
      return {
        cam: camLook(-1, -3, 10, 32, 22, 4.2, 160, 108),
        ground: ESTRADA,
        objs: [...CAMPO, ...objs],
        over: (pr) => {
          const [px, py] = pr([3.9, -1.2, 1.6]);
          return (
            <>
              {chip(230, 30, 'Poste a 80 km/h', AZ, surge(lt, 0.3), 11)}
              {surge(lt, 1.8) > 0.01 && (
                <g opacity={surge(lt, 1.8)}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return <line key={i} x1={px + Math.cos(a) * 7} y1={py + Math.sin(a) * 7} x2={px + Math.cos(a) * 14} y2={py + Math.sin(a) * 14} stroke={AMAR} strokeWidth={2.4} strokeLinecap="round" />;
                  })}
                </g>
              )}
              {Array.from({ length: 9 }, (_, i) => {
                const [fx, fy] = pr([6.5, -2, (H / 9) * (i + 0.5)]);
                return <g key={i}>{chip(fx + 14, fy, String(i + 1), TINTA, surge(lt, 2.2 + i * 0.18), 8)}</g>;
              })}
              {chip(160, 182, '= cair de um prédio de 9 andares', VERM, surge(lt, 2.4), 10)}
            </>
          );
        },
      };
    }
    // 7. Bia, a 80 km/h, vê um carro parado à frente
    case 7: {
      const yv = 2 - 6 * lt;
      return rodovia(yv, [car({ x: XV, y: yv, color: VOCE }), parado(-36, lt)], (pr) => (
        <>
          {chip(160, 182, 'Bia, a 80 km/h', AZ, surge(lt, 0.4), 11)}
          {tag(pr, [XV, yv, 1.6], 'Bia', surge(lt, 0.8))}
          {tag(pr, [XV, -36, 1.6], 'Carro parado', surge(lt, 2.0))}
        </>
      ));
    }
    // 8. só no segundo em que percebe, já andou uns 22 m
    case 8: {
      const s = clamp((lt - 1.0) / 1);
      const y0 = 14;
      const y = y0 - V80 * s;
      const fim = surge(lt, 2.0);
      return deLado(-6, 6.4, [car({ x: XV, y, color: VOCE }), parado(-26, lt)], (pr) => (
        <>
          {chip(110, 24, 'Bia percebe o problema', AZ, surge(lt, 0.3), 10)}
          {relogio(250, 48, s, surge(lt, 0.8), 13)}
          {chip(250, 74, s >= 1 ? '1 segundo' : 'percebendo...', TINTA, surge(lt, 0.8), 10)}
          {regua(pr, y0, y0 - V80, 'Já andou uns 22 metros', fim)}
          {tag(pr, [XV, -26, 1.6], 'Carro parado', surge(lt, 0.3))}
        </>
      ), [...marca(y0, surge(lt, 0.6)), ...marca(y0 - V80, fim)]);
    }
  }
  // 9. para guardar
  const yv = 2 - 6 * lt;
  return rodovia(yv, [car({ x: XV, y: yv, color: VOCE })], () => (
    <>
      {escuro(0.45)}
      {chip(160, 60, 'Para guardar', AZ, surge(lt, 0.1), 11)}
      {chip(160, 96, 'A 80 km/h', TINTA, surge(lt, 0.6), 12)}
      {chip(160, 128, '22 metros a cada segundo', VERM, surge(lt, 1.6), 12)}
    </>
  ));
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

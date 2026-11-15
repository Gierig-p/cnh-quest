/**
 * Vídeo do cartão c3-conversao ("Para virar"), lote 3 de 15/11/2026.
 * Um trecho por fala (tempos em content/videos/conversao.json).
 */
import { box, camLook, rect, type Obj, type Part, type V2 } from './engine';
import { car, cyclist, person, trafficLight, zebra } from './models';
import { ACOST, campo, estrada } from './Mundo2';
import { bairro, cruzamento } from './Mundo1';
import { MOCA } from './Mundo3';
import { VERDE, VERMELHO, VOCE, arco, caminho, certo, clamp, ease, fazerVideo, janela, lerp, pisca, proibido, rastro, tag, type Pr, type Quadro } from './videoBase';
import tempos from '../../content/videos/conversao.json';

const CY = -9; // rua que cruza
const CRUZ = cruzamento(CY);
const BAIRRO = bairro(CY, 3);
const PARADA = CY + 6.3; // carro parado antes do cruzamento
const FAIXA_PARADA = rect(0.1, CY + 3.9, 3.4, CY + 4.25, '#ffffff', 0.01);
const SINAL_X = 4.3, SINAL_Y = CY + 4.0;

/* 1. à direita, encostado e com a curva fechada */
const DIR_FECHADA: V2[] = [[1.75, 9], [1.75, 4.5], [1.85, 3.5], [2.1, 2.5], [2.35, 1.5], [2.45, 0.5], [2.45, CY + 2.4 + 2.3], ...arco(2.45 + 2.3, CY + 2.4 + 2.3, 2.3, Math.PI, 1.5 * Math.PI), [30, CY + 2.4]];
const DIR_ABERTA: V2[] = [[1.75, CY + 4], ...arco(1.75 + 5.5, CY + 4, 5.5, Math.PI, 1.37 * Math.PI), [12, CY - 1.4]];
const VIRA_DIR = caminho(DIR_FECHADA);

/* 2. à esquerda na mão dupla, saindo de perto do meio */
const esquerda = (x0: number, yIni: number, yFim: number, r: number, xIni = 1.75): V2[] => [
  [xIni, yIni], [xIni, yIni - 3], [lerp(xIni, x0, 0.5), yIni - 4], [x0, yIni - 5], [x0, yFim + r], ...arco(x0 - r, yFim + r, r, 0, -Math.PI / 2), [-30, yFim],
];
const ESQ_DUPLA = esquerda(1.0, 8, CY - 1.75, 2.75);
const VIRA_ESQ = caminho(ESQ_DUPLA);

/* 3. à esquerda na mão única, encostado no lado esquerdo */
const CRUZ_UNICA = cruzamento(CY, { linhaMeio: false });
const ESQ_UNICA: V2[] = [[-2.45, 6], [-2.45, CY + 1.75 + 2.2], ...arco(-2.45 - 2.2, CY + 1.75 + 2.2, 2.2, 0, -Math.PI / 2), [-30, CY + 1.75]];
const VIRA_UNICA = caminho(ESQ_UNICA);

/* 4. esperando a vez para virar à esquerda */
const ZEBRA_O = zebra(-7.6, CY - 3.5, -5.0, CY + 3.5, 'x');
const ESPERA = caminho([[1.0, PARADA - 1.7], [1.0, CY + 1], ...arco(1.0 - 2.75, CY + 1, 2.75, 0, -Math.PI / 2), [-30, CY - 1.75]]);

/* 5. rodovia sem lugar para virar: espere no acostamento da direita */
const YS = -18; // estrada de terra à esquerda
const RODOVIA: Part[] = [
  ...estrada('tracejada'),
  rect(-50, YS - 2.2, -ACOST - 0.7, YS + 2.2, '#b99b6b', 0.01),
  rect(-50, YS - 1.2, -ACOST - 0.7, YS - 0.8, '#a4875a', 0.012),
  rect(-50, YS + 0.8, -ACOST - 0.7, YS + 1.2, '#a4875a', 0.012),
];
const CAMPO = campo(4, [YS - 2.4, YS + 2.4]);
const ACOST_X = 4.75;
const CRUZA = caminho([[ACOST_X, YS + 2], ...arco(ACOST_X - 2, YS + 2, 2, 0, -Math.PI / 2), [-40, YS]]);

/* 6–8. semáforo e fila do outro lado */
const fila = (y0: number, dy = 0): Obj[] =>
  ['#4f7fc4', '#e0a43a', '#8f98a3'].map((c, i) => car({ x: 1.75, y: y0 - 4.8 * i - dy, color: c, brake: dy === 0 }));
const zona = (cor: string, o: number): Part[] => (o > 0.01 ? [rect(0.1, CY - 3.5, 3.4, CY + 3.5, cor, 0.015, 0.35 * o)] : []);

/** placa branca "à direita livre", desenhada por cima (texto legível) */
function placaLivre(pr: Pr, o: number) {
  if (o <= 0.01) return null;
  const [x, y] = pr([5.2, CY + 9.5, 2.5]);
  return (
    <g opacity={o}>
      <rect x={x - 26} y={y - 15} width={52} height={22} rx={2} fill="#ffffff" stroke="#1f2630" strokeWidth={1.4} />
      <text x={x} y={y - 6.5} textAnchor="middle" fontSize={7} fontWeight={800} fill="#1f2630" fontFamily="system-ui, sans-serif">À DIREITA</text>
      <text x={x} y={y + 2.5} textAnchor="middle" fontSize={7} fontWeight={800} fill="#1f2630" fontFamily="system-ui, sans-serif">LIVRE ➜</text>
    </g>
  );
}
const POSTE_PLACA: Obj = { parts: [box(5.15, CY + 9.45, 0, 5.25, CY + 9.55, 2.1, '#3d4652')], shadow: true };

function trecho(k: number, lt: number, d: number): Quadro {
  switch (k) {
    // 0. na hora de virar, a posição do carro conta
    case 0: {
      const yv = 6 - 1.2 * lt;
      return {
        cam: camLook(1.2, -3, 0, 14, 42, 10),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => tag(pr, [1.75, yv + 0.4, 2.2], 'A posição conta', janela(lt, 0.2, d)),
      };
    }
    // 1. à direita: encoste no lado direito, curva fechada
    case 1: {
      const p = VIRA_DIR.em(lerp(0, 24, clamp(lt / 4.9)));
      return {
        cam: camLook(3.4, -3.5, 0, 14, 42, 10),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(lt, 'r') })],
        over: (pr) => (
          <>
            {tag(pr, [p.x, p.y + 0.4, 2.2], 'Encoste à direita', janela(lt, 0.3, 2.0))}
            {rastro(pr, DIR_ABERTA, VERMELHO, 0.75 * janela(lt, 1.0, 2.5))}
            {proibido(pr, [6.2, CY + 0.2, 0.6], janela(lt, 1.2, 2.5))}
            {rastro(pr, DIR_FECHADA.slice(6), VERDE, 0.75 * ease((lt - 2.3) / 0.4))}
            {tag(pr, [5.4, CY + 3.6, 2.0], 'Curva fechada', ease((lt - 2.5) / 0.4))}
          </>
        ),
      };
    }
    // 2. à esquerda na mão dupla: perto do meio da pista
    case 2: {
      const p = VIRA_ESQ.em(lerp(0, 23, clamp(lt / 3.6)));
      const yo = CY + 8 + 5 * lt;
      return {
        cam: camLook(-0.4, -3.5, 0, 14, 42, 10.5),
        ground: CRUZ,
        objs: [...BAIRRO, car({ x: -1.75, y: yo, heading: Math.PI, color: '#4f7fc4' }), car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(lt, 'l') })],
        over: (pr) => (
          <>
            {tag(pr, [-1.75, yo + 0.4, 2.2], 'Mão dupla', janela(lt, 0.1, 1.4))}
            {tag(pr, [p.x, p.y + 0.4, 2.2], 'Perto do meio', janela(lt, 0.9, 2.6))}
            {rastro(pr, ESQ_DUPLA.slice(3), VERDE, 0.7 * ease((lt - 0.6) / 0.4))}
          </>
        ),
      };
    }
    // 3. à esquerda na mão única: encoste no lado esquerdo
    case 3: {
      const p = VIRA_UNICA.em(lerp(0, 16, clamp(lt / 2.3)));
      const yo = 3 - 5 * lt;
      return {
        cam: camLook(-1.6, -4, 0, 14, 42, 10.5),
        ground: CRUZ_UNICA,
        objs: [...BAIRRO, car({ x: 1.75, y: yo, color: '#e0a43a' }), car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, blink: pisca(lt, 'l') })],
        over: (pr) => (
          <>
            {rastro(pr, [[-1.2, CY - 5], [-1.2, CY - 9]], '#ffffff', 0.85)}
            {rastro(pr, [[1.2, CY - 5], [1.2, CY - 9]], '#ffffff', 0.85)}
            {tag(pr, [0, CY - 6, 1.2], 'Mão única', janela(lt, 0.1, 1.2))}
            {tag(pr, [p.x, p.y + 0.4, 2.2], 'Encoste à esquerda', ease((lt - 0.9) / 0.4))}
          </>
        ),
      };
    }
    // 4. dê passagem: pedestre, ciclista e quem vem em sentido contrário
    case 4: {
      const p = ESPERA.em(Math.max(0, lt - 3.4) * 6);
      const yc = CY - 16 + 9 * lt;
      const yb = CY - 12 + 4.5 * lt;
      const yp = Math.min(CY + 4.2, CY - 3.5 + 1.9 * lt);
      return {
        cam: camLook(-1.5, -6.5, 0, 14, 42, 10.5),
        ground: [...CRUZ, ...ZEBRA_O],
        objs: [
          ...BAIRRO,
          person(-6.3, yp, MOCA, lt * 6, Math.PI, 1.25),
          car({ x: -1.75, y: yc, heading: Math.PI, color: '#4f7fc4' }),
          cyclist(-2.6, yb, lt * 5, Math.PI),
          car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, brake: lt < 3.4, blink: pisca(lt, 'l') }),
        ],
        over: (pr) => (
          <>
            {tag(pr, [-1.75, yc + 0.4, 2.2], 'Sentido contrário', janela(lt, 0.2, 1.4))}
            {tag(pr, [-2.6, yb, 2.4], 'Ciclista', janela(lt, 1.5, 2.6))}
            {tag(pr, [-6.3, yp, 2.6], 'Pedestre', janela(lt, 2.7, 4.0))}
            {certo(pr, [p.x, p.y - 0.5, 2.6], ease((lt - 3.5) / 0.4))}
          </>
        ),
      };
    }
    // 5. rodovia sem lugar para virar à esquerda: espere no acostamento da direita
    case 5: {
      const k1 = ease(lt / 1.8);
      const fora = lt > 4.1;
      const q = CRUZA.em(Math.max(0, lt - 4.1) * 5.5);
      const x = fora ? q.x : lerp(1.75, ACOST_X, ease((lt - 0.3) / 1.2));
      const y = fora ? q.y : lerp(-6, YS + 2, k1);
      const head = fora ? q.heading : 0.25 * Math.sin(Math.PI * ease((lt - 0.3) / 1.2));
      const yn = 22 - 16 * lt, ysul = -60 + 16 * lt;
      return {
        cam: camLook(0, -15.5, 0, 14, 38, 7.6),
        ground: RODOVIA,
        objs: [...CAMPO, car({ x: 1.75, y: yn, color: '#e0412f' }), car({ x: -1.75, y: ysul, heading: Math.PI, color: '#4f7fc4' }), car({ x, y, heading: head, color: VOCE, brake: lt > 1.8 && lt < 4.1, blink: lt > 0.1 && lt < 1.4 ? pisca(lt, 'r') : lt > 2.0 ? pisca(lt, 'l') : null })],
        over: (pr) => (
          <>
            {tag(pr, [-12, YS, 0.8], 'Você quer ir para lá', janela(lt, 0.1, 1.8))}
            {tag(pr, [x, y + 0.4, 2.2], 'Acostamento da direita', janela(lt, 1.2, 2.6))}
            {tag(pr, [x, y + 0.4, 2.2], 'Espere', janela(lt, 2.7, 4.0))}
            {tag(pr, [x, y + 0.4, 2.2], 'Cruze quando der', ease((lt - 4.2) / 0.4))}
          </>
        ),
      };
    }
    // 6. sinal verde não basta: sem espaço para sair, não entre
    case 6: {
      const yv = lerp(PARADA + 7, PARADA, ease(lt / 1.6));
      return {
        cam: camLook(2.2, CY - 1, 0, 14, 42, 11),
        ground: [...CRUZ, FAIXA_PARADA, ...zona(VERMELHO, ease((lt - 1.6) / 0.4))],
        objs: [...BAIRRO, trafficLight(SINAL_X, SINAL_Y, 'verde'), ...fila(CY - 5.4), car({ x: 1.75, y: yv, color: VOCE, brake: lt > 1.2 })],
        over: (pr) => (
          <>
            {tag(pr, [SINAL_X, SINAL_Y, 3.8], 'Sinal verde', janela(lt, 0.2, 1.6))}
            {tag(pr, [1.75, CY - 7, 2.2], 'Sem espaço para sair', ease((lt - 1.7) / 0.4))}
            {proibido(pr, [1.75, CY, 0.6], ease((lt - 2.2) / 0.4))}
          </>
        ),
      };
    }
    // 7. à direita no vermelho, só onde a placa permitir
    case 7: {
      const placa = ease((lt - 1.6) / 0.4);
      const sDir = caminho([[1.75, PARADA], [1.75, CY + 1.75 + 3], ...arco(1.75 + 3, CY + 1.75 + 3, 3, Math.PI, 1.5 * Math.PI), [30, CY + 1.75]]);
      const p = sDir.em(Math.max(0, lt - 2.4) * 6);
      return {
        cam: camLook(3, CY + 1, 0, 14, 42, 10.5),
        ground: [...CRUZ, FAIXA_PARADA],
        objs: [...BAIRRO, trafficLight(SINAL_X, SINAL_Y, 'vermelho'), ...(placa > 0.01 ? [POSTE_PLACA] : []), car({ x: p.x, y: p.y, heading: p.heading, color: VOCE, brake: lt < 2.4, blink: pisca(lt, 'r') })],
        over: (pr) => (
          <>
            {tag(pr, [SINAL_X, SINAL_Y, 3.8], 'Sinal vermelho', janela(lt, 0.2, 1.5))}
            {proibido(pr, [5, CY + 2.4, 0.6], janela(lt, 0.4, 1.5))}
            {placaLivre(pr, placa)}
            {tag(pr, [5.2, CY + 9.5, 3.6], 'Só com a placa', janela(lt, 2.0, 3.2))}
            {rastro(pr, [[1.75, CY + 4.75], ...arco(4.75, CY + 4.75, 3, Math.PI, 1.5 * Math.PI), [10, CY + 1.75]], VERDE, 0.7 * janela(lt, 2.0, d))}
          </>
        ),
      };
    }
    // 8. para guardar: só entre se tiver espaço para sair
    default: {
      const dy = 9 * ease(lt / 1.6);
      const yv = lerp(PARADA, CY - 5, ease((lt - 1.6) / 1.8));
      const zo = ease((lt - 1.0) / 0.4);
      return {
        cam: camLook(2.2, CY - 2, 0, 14, 42, 11),
        ground: [...CRUZ, FAIXA_PARADA, ...(zo > 0.01 ? [rect(0.1, CY - 9.5, 3.4, CY - 3.6, VERDE, 0.015, 0.35 * zo)] : [])],
        objs: [...BAIRRO, trafficLight(SINAL_X, SINAL_Y, 'verde'), ...fila(CY - 5.4, dy), car({ x: 1.75, y: yv, color: VOCE })],
        over: (pr) => (
          <>
            {tag(pr, [SINAL_X, SINAL_Y, 3.8], 'Verde não é ordem', janela(lt, 0.2, 1.4))}
            {tag(pr, [1.75, CY - 6.5, 1.6], 'Espaço para sair', janela(lt, 1.2, 3.0))}
            {certo(pr, [1.75, yv - 0.5, 2.6], ease((lt - 3.4) / 0.4))}
          </>
        ),
      };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

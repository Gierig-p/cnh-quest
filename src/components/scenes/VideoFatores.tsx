/**
 * Vídeo do cartão c5-fatores ("De onde vem o perigo"), Mundo 5, lote 1 de 16/11/2026.
 * Os cinco lugares de onde vem o risco (veículo, condutor, via, ambiente, pessoas), a aderência,
 * quem responde por quem (CTB art. 29, § 2º) e o exemplo do caminhão passando pelo ciclista.
 * Tempos em content/videos/fatores.json.
 */
import type { ReactNode } from 'react';
import { camLook, type Obj } from './engine';
import { car, cyclist, person } from './models';
import { utilitario } from './veiculos';
import { campo, estrada } from './Mundo2';
import { SENHORA } from './Mundo3';
import { TINTA, chip, etiqueta, item, quadro, seta, surge } from './infracoesUI';
import { VOCE, chuva, clamp, ease, escuro, fazerVideo, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/fatores.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const ROXO = '#8e5cc2';
const CINZA = '#5b6b7d';

/** os cinco lugares, com a cor de cada um */
const CINCO = [
  ['Veículo', AZ],
  ['Condutor', LARANJA],
  ['Via', CINZA],
  ['Ambiente', VERDE],
  ['Pessoas', ROXO],
] as const;

const ESTRADA = estrada('tracejada');
const CAMPO = campo(5);
const XV = 1.75;

/** estrada de mão dupla com a câmera atrás de quem está em `y` */
function rodovia(y: number, objs: Obj[], over?: Quadro['over']): Quadro {
  return { cam: camLook(1.2, y - 8, 0, 12, 36, 8.5), ground: ESTRADA, objs: [...CAMPO, ...objs], over };
}

/** o seu carro andando pela estrada */
const voceAnda = (lt: number, y0 = 2, v = 2.4, heading = 0): Quadro['objs'] => [car({ x: XV, y: y0 - v * lt, heading, color: VOCE })];

/** a fileira dos cinco, com o `dest` em destaque (os outros apagados) */
function fileira(lt: number, dest: number | null, y = 22, passo = 1.0): ReactNode {
  return CINCO.map(([t, c], i) => {
    const o = dest === null ? surge(lt, 0.6 + i * passo) : i === dest ? 1 : 0.35;
    return <g key={t}>{chip(36 + i * 62, y, t, c, o, 10)}</g>;
  });
}

/** lista branca à direita com os itens de um dos cinco */
function lista(lt: number, titulo: string, cor: string, itens: string[], a = 1.0, passo = 0.9): ReactNode {
  const h = 30 + itens.length * 20;
  return quadro(172, 46, 138, h, surge(lt, 0.3), (
    <>
      <text x={69} y={18} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={cor}>{titulo}</text>
      {itens.map((t, i) => <g key={t}>{item(10, 40 + i * 20, t, cor, surge(lt, a + i * passo), 10)}</g>)}
    </>
  ));
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. os riscos vêm de cinco lugares
    case 0: {
      const yv = 2 - 2.4 * lt;
      return rodovia(yv, voceAnda(lt), () => (
        <>
          {chip(160, 50, 'De onde vem o perigo', TINTA, surge(lt, 0.2), 11)}
          {fileira(lt, null)}
        </>
      ));
    }
    // 1. o veículo
    case 1: {
      const yv = 2 - 2.4 * lt;
      return rodovia(yv, voceAnda(lt), (pr) => (
        <>
          {fileira(lt, 0)}
          {lista(lt, 'Precisam estar bons', AZ, ['Freios', 'Pneus', 'Luzes', 'Equipamentos'], 1.2, 0.7)}
          {tag(pr, [XV, yv, 1.6], 'Veículo', surge(lt, 0.4))}
        </>
      ));
    }
    // 2. o condutor
    case 2: {
      const yv = 2 - 2.4 * lt;
      return rodovia(yv, voceAnda(lt), (pr) => (
        <>
          {fileira(lt, 1)}
          {lista(lt, 'Mudam o jeito de dirigir', LARANJA, ['Atenção', 'Sono', 'Álcool', 'Emoções'], 1.2, 0.8)}
          {tag(pr, [XV, yv, 1.6], 'Condutor', surge(lt, 0.4))}
        </>
      ));
    }
    // 3. a via
    case 3: {
      const yv = 2 - 2.4 * lt;
      return rodovia(yv, voceAnda(lt), () => (
        <>
          {fileira(lt, 2)}
          {lista(lt, 'Pedem mais cuidado', CINZA, ['Curvas', 'Buracos', 'Obras', 'Cruzamentos'], 1.0, 0.7)}
        </>
      ));
    }
    // 4. o ambiente
    case 4: {
      const yv = 2 - 2.0 * lt;
      return rodovia(yv, voceAnda(lt, 2, 2.0), () => (
        <>
          {chuva(lt, 0.9 * surge(lt, 0.3))}
          {fileira(lt, 3)}
          {lista(lt, 'Mudam visão e aderência', VERDE, ['Chuva', 'Neblina', 'Vento', 'Luz do sol'], 1.0, 0.8)}
        </>
      ));
    }
    // 5. aderência: com pouca, o veículo escorrega
    case 5: {
      const yv = 2 - 2.0 * lt;
      const gira = 0.18 * Math.sin(lt * 2.6) * surge(lt, 3.2, 0.6);
      return rodovia(yv, voceAnda(lt, 2, 2.0, gira), () => (
        <>
          {chuva(lt, 0.9)}
          {etiqueta(20, 40, 150, 'Aderência', 'O agarre do pneu no chão', VERDE, surge(lt, 0.3))}
          {chip(240, 160, 'Pouca aderência: escorrega', LARANJA, surge(lt, 3.2), 10)}
        </>
      ));
    }
    // 6. o comportamento das pessoas
    case 6: {
      const yv = 2 - 2.0 * lt;
      const yo = -26 + 3 * lt;
      return rodovia(yv, [...voceAnda(lt, 2, 2.0), car({ x: -XV, y: yo, heading: Math.PI, color: '#4f7fc4' })], (pr) => (
        <>
          {fileira(lt, 4)}
          {tag(pr, [XV, yv, 1.6], 'Você', surge(lt, 1.6))}
          {tag(pr, [-XV, yo, 1.6], 'Os outros', surge(lt, 3.0))}
        </>
      ));
    }
    // 7. o maior pelo menor; o motorizado pelo não motorizado
    case 7: {
      const yv = 2 - 1.2 * lt;
      const yb = -4 - 0.6 * lt;
      return rodovia(yv, [...voceAnda(lt, 2, 1.2), cyclist(2.85, yb, lt * 4, 0), utilitario({ x: -XV, y: -22 + 2.5 * lt, tipo: 'caminhao', heading: Math.PI })], (pr) => {
        const [cx, cy] = pr([XV, yv, 1.4]);
        const [bx, by] = pr([2.85, yb, 1.6]);
        return (
          <>
            {chip(160, 22, 'Pela lei', TINTA, surge(lt, 0.2), 11)}
            {chip(160, 46, 'O maior cuida do menor', AZ, surge(lt, 0.9), 10)}
            {chip(160, 70, 'O motorizado cuida do não motorizado', VERDE, surge(lt, 3.0), 10)}
            {seta(cx, cy - 8, bx, by + 6, surge(lt, 3.6), '#ffffff')}
            {tag(pr, [2.85, yb, 2.2], 'Bicicleta', surge(lt, 3.6))}
          </>
        );
      });
    }
    // 8. todos juntos pelo pedestre
    case 8: {
      const yv = 2 - 1.2 * lt;
      return rodovia(yv, [...voceAnda(lt, 2, 1.2), cyclist(2.85, -8, lt * 4, 0), person(4.4, -13, SENHORA, lt * 2.5, Math.PI, 1.12)], (pr) => (
        <>
          {chip(160, 30, 'Todos cuidam do pedestre', ROXO, surge(lt, 0.4), 11)}
          {tag(pr, [4.4, -13, 2.2], 'Pedestre', surge(lt, 0.8))}
        </>
      ));
    }
    // 9. Jorge, de caminhão, reduz e deixa espaço para o ciclista
    case 9: {
      const yt = 6 - 1.9 * lt;
      const yb = -5 - 0.9 * lt;
      const perto = Math.abs(yt - yb);
      const desvio = ease(clamp((12 - perto) / 4));
      const xt = 1.6 - 2.0 * desvio;
      return {
        cam: camLook(0.6, yt - 9, 0, 12, 36, 8.5),
        ground: ESTRADA,
        objs: [...CAMPO, cyclist(2.85, yb, lt * 4, 0), utilitario({ x: xt, y: yt, tipo: 'caminhao' })],
        over: (pr) => (
          <>
            {chip(160, 24, 'Jorge, de caminhão', AZ, surge(lt, 0.4), 11)}
            {tag(pr, [2.85, yb, 2.2], 'Ciclista', surge(lt, 1.0))}
            {chip(90, 176, 'Reduz', AZ, surge(lt, 2.2), 11)}
            {chip(220, 176, 'Deixa bastante espaço', VERDE, surge(lt, 4.0), 11)}
          </>
        ),
      };
    }
    // 10. para guardar
    default: {
      const yv = 2 - 2.0 * lt;
      return rodovia(yv, voceAnda(lt, 2, 2.0), () => (
        <>
          {escuro(0.45)}
          {chip(160, 60, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {fileira(lt, null, 100, 0.4)}
        </>
      ));
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

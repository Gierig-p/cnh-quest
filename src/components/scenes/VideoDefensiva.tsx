/**
 * Vídeo do cartão c5-defensiva ("O que é direção defensiva"), Mundo 5, lote 1 de 16/11/2026.
 * Prever o perigo; não é acaso; o fator humano; o exemplo da bola entre os carros estacionados.
 * Tempos em content/videos/defensiva.json.
 */
import type { ReactNode } from 'react';
import { camLook, type Obj } from './engine';
import { car, person, type Look } from './models';
import { MOCA } from './Mundo3';
import { BAIRRO_CHAO, BAIRRO_OBJS, bola } from './Mundo5';
import { TINTA, chip, etiqueta, nao, surge, visto } from './infracoesUI';
import { VOCE, clamp, ease, escuro, fazerVideo, lerp, tag, type Quadro } from './videoBase';
import tempos from '../../content/videos/defensiva.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const CRIANCA: Look = { skin: '#d7a77f', hair: '#7a4a25', top: '#f2c21b', bottom: '#2f4f7f' };

/** a rua do bairro com o seu carro em `yv` e a câmera atrás dele */
function bairro(yv: number, extra: Obj[] = [], over?: Quadro['over']): Quadro {
  return {
    cam: camLook(0.4, yv - 9, 0, 12, 38, 12.5),
    ground: BAIRRO_CHAO,
    objs: [...BAIRRO_OBJS, car({ x: 0, y: yv, color: VOCE }), ...extra],
    over,
  };
}

/** posição do seu carro andando devagar pela rua (começa em y0) */
const anda = (y0: number, lt: number, v = 1.6) => y0 - v * lt;

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. dirigir prevendo o perigo
    case 0:
      return bairro(anda(12, lt), [], () => (
        <>
          {chip(160, 30, 'Direção defensiva', AZ, surge(lt, 0.3), 12)}
          {chip(160, 56, 'Prever o perigo antes', VERDE, surge(lt, 2.0), 10)}
        </>
      ));
    // 1. ver o risco cedo e ter tempo para decidir
    case 1:
      return bairro(anda(8, lt), [], () => (
        <>
          {chip(110, 30, 'Ver o risco cedo', AZ, surge(lt, 0.4), 10)}
          {chip(220, 30, 'Tempo para decidir', VERDE, surge(lt, 2.0), 10)}
        </>
      ));
    // 2. você, quem está no veículo e os outros na via
    case 2: {
      const yv = anda(4, lt, 1.2);
      return bairro(yv, [person(4.6, yv - 10, MOCA, lt * 3, Math.PI, 1.12)], (pr) => (
        <>
          {chip(160, 24, 'Prever o que pode acontecer com:', TINTA, surge(lt, 0.3), 10)}
          {tag(pr, [0, yv, 1.6], 'Você', surge(lt, 2.0))}
          {chip(80, 176, 'Quem está no veículo', AZ, surge(lt, 3.4), 10)}
          {tag(pr, [4.6, yv - 10, 2.2], 'Os outros na via', surge(lt, 5.0))}
        </>
      ));
    }
    // 3. não é acaso, azar ou destino
    case 3:
      return bairro(0, [], () => (
        <>
          {escuro(0.45 * surge(lt, 0.1))}
          {chip(160, 46, 'Sinistro de trânsito não é…', TINTA, surge(lt, 0.3), 11)}
          {(['Acaso', 'Azar', 'Destino'] as const).map((t, i) => (
            <g key={t}>
              {chip(80 + i * 80, 104, t, LARANJA, surge(lt, 1.0 + i * 0.7), 12)}
              {nao(80 + i * 80, 138, 10, surge(lt, 1.3 + i * 0.7))}
            </g>
          ))}
        </>
      ));
    // 4. o fator humano: quem dirige e quem anda a pé
    case 4: {
      const yv = anda(2, lt, 0.8);
      return bairro(yv, [person(4.6, yv - 9, MOCA, lt * 3, Math.PI, 1.12)], (pr) => (
        <>
          {chip(160, 24, 'Fator humano', LARANJA, surge(lt, 0.3), 12)}
          {tag(pr, [0, yv, 1.6], 'Quem dirige', surge(lt, 2.4))}
          {tag(pr, [4.6, yv - 9, 2.2], 'Quem anda a pé', surge(lt, 3.6))}
        </>
      ));
    }
    // 5. previsto, evitável
    case 5:
      return bairro(0, [], () => (
        <>
          {escuro(0.45 * surge(lt, 0.1))}
          {etiqueta(40, 60, 110, 'Perigo', 'Podia ser previsto', AZ, surge(lt, 0.3))}
          {etiqueta(170, 60, 110, 'Sinistro', 'Podia ser evitado', VERDE, surge(lt, 1.8))}
          {visto(272, 66, surge(lt, 2.3))}
        </>
      ));
    // 6. uma bola rola para a rua entre dois carros estacionados
    case 6: {
      const yv = anda(10, lt, 1.5);
      const bx = lerp(4.4, 1.6, ease(clamp((lt - 1.0) / 2.6)));
      return bairro(yv, [bola(bx, -9.2)], (pr) => tag(pr, [bx, -9.2, 0.7], 'Bola', surge(lt, 1.6)));
    }
    // 7. tira o pé e se prepara para parar
    case 7: {
      // o carro vem de y = 4 e para suave perto de y = 1
      const yv = 4 - 3 * ease(clamp(lt / 3.2));
      return bairro(yv, [bola(1.4, -9.2)], (pr) => (
        <>
          {tag(pr, [1.4, -9.2, 0.7], 'Bola', 1)}
          {chip(90, 176, 'Tira o pé', AZ, surge(lt, 0.5), 11)}
          {chip(220, 176, 'Pronto para parar', VERDE, surge(lt, 1.6), 11)}
        </>
      ));
    }
    // 8. pode vir uma criança atrás da bola
    case 8: {
      const cx = lerp(5.4, 3.9, ease(clamp((lt - 0.6) / 1.4)));
      return bairro(1, [bola(1.2, -9.2), person(cx, -9.1, CRIANCA, lt * 6, -Math.PI / 2, 0.82)], (pr) => (
        <>
          {tag(pr, [cx, -9.1, 1.8], 'Criança', surge(lt, 1.0))}
          {chip(160, 24, 'Você já estava pronto para parar', VERDE, surge(lt, 2.2), 10)}
        </>
      ));
    }
    // 9. para guardar
    default:
      return bairro(0, [], () => para(lt));
  }
}

function para(lt: number): ReactNode {
  return (
    <>
      {escuro(0.45)}
      {chip(160, 40, 'Para guardar', AZ, surge(lt, 0.1), 11)}
      {etiqueta(60, 72, 200, 'Prever o perigo', 'É o primeiro passo para evitá-lo', VERDE, surge(lt, 0.6))}
    </>
  );
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

/**
 * Vídeo do cartão c4-crimes-perigo ("Crime mesmo sem vítima"), Mundo 4, lote 4 de 16/11/2026.
 * Álcool acima do limite do crime (0,3 mg/L de ar ou 6 dg/L de sangue, ou capacidade alterada); racha; dirigir sem
 * habilitação e entregar a direção; dirigir com o direito suspenso; velocidade incompatível perto de escolas.
 * Tempos em content/videos/crimes-perigo.json.
 */
import { car, person } from './models';
import { Bafometro } from './Mundo4';
import { NAT, TINTA, chave, chip, cnh, etiqueta, item, nao, quadro, ruaFundo, seta, surge } from './infracoesUI';
import { RA, escuro, fazerVideo, type Quadro } from './videoBase';
import tempos from '../../content/videos/crimes-perigo.json';

const VM = NAT[3].cor;
const AZ = '#2f6db5';
const XV = RA - 1.65;
const YP = 4;
const SUSP = (k: number) => ({ text: 'SUSPENSA', cor: '#ea7b2c', k });
const PEDESTRES = [
  { skin: '#d7a77f', hair: '#7a4a25', top: '#f2c21b', bottom: '#2f4f7f' },
  { skin: '#8a5a3c', hair: '#1d1a18', top: '#2f80ed', bottom: '#33415a' },
  { skin: '#e8c4a0', hair: '#c9c9c9', top: '#b0569a', bottom: '#4a4a4a' },
];

/** dois carros arrancando lado a lado na sua frente; você fica parado atrás */
function racha(lt: number, a0 = 0.6): Quadro {
  const d = (t: number) => Math.min(5, 1.6 * Math.max(0, t) ** 2);
  return ruaFundo(0, [
    car({ x: -XV, y: -2 - d(lt - a0), color: '#f2c21b' }),
    car({ x: XV, y: -2.4 - d(lt - a0 - 0.15), color: '#e0412f' }),
  ], YP);
}

/** gente na calçada dos dois lados, na frente do seu carro */
function calcadaCheia(lt: number): Quadro {
  const yv = YP - 2.2 * lt;
  const gente = [-1, 1].flatMap((lado, j) => [0, 1, 2].map((i) => person(lado * (RA + 0.9 + 0.4 * (i % 2)), yv - 6 - i * 2.4 - j * 1.1, PEDESTRES[(i + j) % 3], 0.4 * i, lado > 0 ? Math.PI / 2 : -Math.PI / 2, 1.05)));
  return ruaFundo(lt, gente, YP);
}

const bafo = (x: number, y: number, o: number, s = 1.6) => quadro(x, y, 34 * s + 18, 58 * s + 8, o, <g transform={`translate(9 0) scale(${s})`}><Bafometro /></g>);

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. crime mesmo sem ninguém se machucar
    case 0: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.4 * surge(lt, 0.2))}
          {chip(160, 60, 'Ninguém se machucou', TINTA, surge(lt, 0.4), 11)}
          {chip(160, 100, 'Basta colocar as pessoas em perigo', NAT[2].cor, surge(lt, 2.0), 10)}
          {chip(160, 140, 'Crime', VM, surge(lt, 3.2), 14)}
        </>
      ) };
    }
    // 1. 0,3 mg por litro de ar ou mais
    case 1: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {bafo(40, 40, surge(lt, 0.3))}
          {quadro(150, 56, 140, 50, surge(lt, 1.2), (
            <>
              <text x={70} y={22} textAnchor="middle" fontSize={15} fontWeight={900} fill={TINTA}>0,3 mg</text>
              <text x={70} y={39} textAnchor="middle" fontSize={9.4} fontWeight={800} fill="#55606e">por litro de ar, ou mais</text>
            </>
          ))}
          {chip(220, 132, 'Crime', VM, surge(lt, 3.6), 14)}
        </>
      ) };
    }
    // 2. 6 dg por litro de sangue, ou capacidade alterada
    case 2: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(36, 52, 248, 84, surge(lt, 0.2), (
            <>
              <text x={124} y={22} textAnchor="middle" fontSize={11} fontWeight={800} fill={VM}>Também é crime</text>
              {item(16, 48, '6 dg por litro de sangue', VM, surge(lt, 0.8), 10.5)}
              {item(16, 70, 'Sinais de capacidade alterada', VM, surge(lt, 3.0), 10.5)}
            </>
          ))}
        </>
      ) };
    }
    // 3. a pena
    case 3: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {etiqueta(70, 30, 180, 'Detenção', '6 meses a 3 anos', TINTA, surge(lt, 0.3))}
          {chip(160, 108, '+ multa', VM, surge(lt, 2.2), 12)}
          {chip(160, 140, '+ suspensão ou proibição de dirigir', AZ, surge(lt, 3.0), 10)}
        </>
      ) };
    }
    // 4. racha na via pública, gerando risco
    case 4: {
      const q = racha(lt);
      return { ...q, over: () => (
        <>
          {chip(160, 120, 'Racha na via pública, gerando risco', TINTA, surge(lt, 0.8), 10)}
          {chip(160, 146, 'Crime', VM, surge(lt, 2.6), 12)}
          {chip(160, 172, 'Detenção de 6 meses a 3 anos', TINTA, surge(lt, 3.6), 10)}
        </>
      ) };
    }
    // 5. alguém ferido gravemente ou morto: pena maior
    case 5: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 70, 'Alguém se feriu gravemente ou morreu', TINTA, surge(lt, 0.2), 10)}
          {seta(160, 86, 160, 112, surge(lt, 0.8))}
          {chip(160, 130, 'A pena é maior', VM, surge(lt, 1.0), 13)}
        </>
      ) };
    }
    // 6. sem habilitação, ou entregar a direção a quem não pode
    case 6: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {cnh(30, 48, 1.0, null, surge(lt, 0.2))}
          {nao(68, 73, 30, surge(lt, 0.8))}
          {chip(68, 120, 'Sem habilitação', TINTA, surge(lt, 0.8), 10)}
          {quadro(130, 40, 172, 82, surge(lt, 3.2), (
            <>
              <text x={86} y={20} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={VM}>Entregar a direção a quem</text>
              {item(12, 44, 'Não é habilitado', VM, surge(lt, 4.2), 10.5)}
              {item(12, 66, 'Não tem condições de dirigir', VM, surge(lt, 5.4), 10)}
            </>
          ))}
          {chip(160, 160, 'Gerando perigo: crime', VM, surge(lt, 6.4), 11)}
        </>
      ) };
    }
    // 7. 6 meses a 1 ano, ou multa
    case 7: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 40, 'Nos dois casos', TINTA, surge(lt, 0.1), 11)}
          {etiqueta(70, 64, 180, 'Detenção', '6 meses a 1 ano', TINTA, surge(lt, 0.5))}
          {chip(160, 140, 'ou multa', VM, surge(lt, 2.4), 12)}
        </>
      ) };
    }
    // 8. dirigir com o direito suspenso
    case 8: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {cnh(110, 40, 1.3, null, surge(lt, 0.1), SUSP(surge(lt, 0.5)))}
          {chip(160, 128, 'Dirigir assim', TINTA, surge(lt, 0.9), 11)}
          {chip(160, 154, 'Também é crime', VM, surge(lt, 2.0), 12)}
        </>
      ) };
    }
    // 9. velocidade incompatível perto de escolas, hospitais ou muita gente
    case 9: {
      const q = calcadaCheia(lt);
      const a = [1.8, 2.6, 3.6];
      return { ...q, over: () => (
        <>
          {quadro(60, 14, 200, 92, surge(lt, 0.4), (
            <>
              <text x={100} y={20} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={VM}>Velocidade incompatível perto de</text>
              {['Escolas', 'Hospitais', 'Lugares com muita gente'].map((t, i) => <g key={t}>{item(16, 42 + i * 20, t, VM, surge(lt, a[i]), 10.5)}</g>)}
            </>
          ))}
          {chip(160, 168, 'Detenção de 6 meses a 1 ano, ou multa', VM, surge(lt, 5.2), 9.6)}
        </>
      ) };
    }
    // 10. exemplo: emprestar o carro a quem não tem CNH
    case 10: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {quadro(30, 40, 80, 70, surge(lt, 0.4), chave(40, 35, 1, 1.2))}
          {chip(70, 126, 'Você empresta', TINTA, surge(lt, 0.6), 10)}
          {seta(120, 75, 168, 75, surge(lt, 1.4))}
          {cnh(178, 50, 1.0, null, surge(lt, 1.8))}
          {nao(216, 75, 30, surge(lt, 2.2))}
          {chip(216, 126, 'Amigo sem CNH', TINTA, surge(lt, 2.2), 10)}
          {chip(160, 164, 'Você pode responder por crime', VM, surge(lt, 3.8), 11)}
        </>
      ) };
    }
    // 11. para guardar
    default: {
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 34, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {etiqueta(60, 66, 200, 'Crime sem vítima', 'Não precisa ter vítima', VM, surge(lt, 0.5))}
        </>
      ) };
    }
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

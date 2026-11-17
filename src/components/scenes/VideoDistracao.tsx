/**
 * Vídeo do cartão c5-distracao ("O que tira a atenção"), Mundo 5, lote 3 de 17/11/2026.
 * O que diminui a concentração (álcool e drogas, remédio, sono, discussão e comida pesada, celular e som alto,
 * animal e objetos soltos), o olhar em sequência, a infração (CTB art. 252, III) e o exemplo do Pedro.
 * O motorista é o mesmo da cabine do vídeo da posição. Tempos em content/videos/distracao.json.
 */
import type { ReactNode } from 'react';
import { person } from './models';
import { SENHORA } from './Mundo3';
import { cabine } from './VideoPosicao';
import { TINTA, chip, item, nao, pilula, quadro, ruaFundo, surge, taca, visto } from './infracoesUI';
import { clamp, ease, escuro, fazerVideo, lerp, relogio, type Quadro } from './videoBase';
import tempos from '../../content/videos/distracao.json';

const AZ = '#2f6db5';
const VERDE = '#2fa36b';
const LARANJA = '#ea7b2c';
const ROXO = '#8e5cc2';
const VERM = '#d93a35';
const AMAR = '#ffd84a';

type Pose = Partial<Parameters<typeof cabine>[0]>;

/** o motorista visto de lado, com a rua passando atrás */
function naCabine(lt: number, over: () => ReactNode, pose: Pose = {}, fundo = 0.5): Quadro {
  const q = ruaFundo(lt);
  return { ...q, over: () => (
    <>
      {escuro(fundo)}
      {cabine({ dobra: 1, apoio: 1, lt, ...pose })}
      {over()}
    </>
  ) };
}

/** lista branca sobre o banco de trás */
function lista(lt: number, titulo: string, cor: string, itens: string[], a = 1.0, passo = 0.9, w = 150): ReactNode {
  const h = 28 + itens.length * 19;
  return quadro(26, 194 - h - 8, w, h, surge(lt, 0.3), (
    <>
      <text x={w / 2} y={17} textAnchor="middle" fontSize={10} fontWeight={800} fill={cor}>{titulo}</text>
      {itens.map((t, i) => <g key={t}>{item(10, 37 + i * 19, t, cor, surge(lt, a + i * passo), 9.5)}</g>)}
    </>
  ));
}

/** celular preso no painel; `onda` = está falando (viva-voz) */
function celular(x: number, y: number, o: number, lt: number, onda = 0): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={x - 2} y={y + 13} width={4} height={8} fill="#2a2f36" />
      <rect x={x - 8} y={y - 14} width={16} height={28} rx={3} fill="#1b1f25" stroke="#5c6670" strokeWidth={1} />
      <rect x={x - 6.5} y={y - 11} width={13} height={21} rx={1.5} fill="#5fb7ff" />
      <circle cx={x} cy={y - 4} r={3} fill="#ffffff" />
      <rect x={x - 4} y={y + 2} width={8} height={2} rx={1} fill="#ffffff" />
      {onda > 0.01 &&
        [0, 1, 2].map((i) => {
          const r = 10 + ((lt * 14 + i * 6) % 18);
          return <path key={i} d={`M${x - r * 0.7} ${y - r * 0.7} A${r} ${r} 0 0 0 ${x - r * 0.7} ${y + r * 0.7}`} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={onda * (1 - (r - 10) / 18)} />;
        })}
    </g>
  );
}

/** notas musicais saindo do alto-falante da porta */
function notas(lt: number, o: number): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      {[0, 1, 2, 3].map((i) => {
        const f = (lt * 0.5 + i / 4) % 1;
        const x = 170 + Math.sin((f + i) * 5) * 14 - f * 30;
        const y = 150 - f * 70;
        return (
          <g key={i} opacity={1 - f} transform={`translate(${x} ${y}) scale(${1 + f * 0.6})`}>
            <ellipse cx={0} cy={6} rx={3.4} ry={2.6} fill={AMAR} transform="rotate(-20 0 6)" />
            <rect x={2.6} y={-8} width={1.6} height={14} fill={AMAR} />
            <path d="M4.2 -8 Q10 -6 9 0" fill="none" stroke={AMAR} strokeWidth={1.6} />
          </g>
        );
      })}
    </g>
  );
}

/** cachorro solto no banco de trás */
function cachorro(x: number, y: number, o: number, lt: number): ReactNode {
  if (o < 0.01) return null;
  const rabo = Math.sin(lt * 10) * 10;
  return (
    <g opacity={o}>
      <path d={`M${x - 20} ${y - 2} q-8 ${-6 + rabo * 0.3} -10 ${-14 + rabo * 0.2}`} fill="none" stroke="#a8693a" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={x - 6} cy={y + 2} rx={18} ry={10} fill="#c98a4f" />
      <ellipse cx={x - 4} cy={y + 5} rx={11} ry={5} fill="#e2b483" />
      <rect x={x - 18} y={y + 6} width={5} height={12} rx={2} fill="#b47941" />
      <rect x={x + 4} y={y + 6} width={5} height={12} rx={2} fill="#b47941" />
      <circle cx={x + 12} cy={y - 9} r={9} fill="#c98a4f" />
      <ellipse cx={x + 20} cy={y - 6} rx={6} ry={4.4} fill="#e2b483" />
      <circle cx={x + 25} cy={y - 7} r={1.8} fill="#2a1f19" />
      <path d={`M${x + 7} ${y - 16} q-6 2 -5 13 q4 -1 7 -8 Z`} fill="#8a5730" />
      <circle cx={x + 15} cy={y - 11} r={1.4} fill="#2a1f19" />
      <rect x={x + 3} y={y - 2} width={10} height={3} rx={1.5} fill={VERM} />
    </g>
  );
}

/** garrafa rolando perto dos pedais */
function garrafa(x: number, y: number, a: number, o: number): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x} ${y}) rotate(${a})`}>
      <rect x={-11} y={-4.5} width={16} height={9} rx={3} fill="#58b8d9" stroke="#2c7d99" strokeWidth={0.8} />
      <rect x={5} y={-2.5} width={5} height={5} fill="#58b8d9" stroke="#2c7d99" strokeWidth={0.8} />
      <rect x={10} y={-3} width={3} height={6} rx={1} fill="#2f6db5" />
      <rect x={-6} y={-4.5} width={7} height={9} fill="#ffffff" opacity={0.6} />
    </g>
  );
}

/** dois balões de discussão, com rabiscos */
function discussao(x: number, y: number, o: number, lt: number): ReactNode {
  if (o < 0.01) return null;
  const tr = Math.sin(lt * 18) * 1.2;
  return (
    <g opacity={o}>
      <g transform={`translate(${tr} 0)`}>
        <path d={`M${x - 46} ${y - 18} h40 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-26 l-8 8 l1 -8 h-7 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8 Z`} fill="#ffffff" stroke="#0003" />
        <text x={x - 26} y={y - 1} textAnchor="middle" fontSize={13} fontWeight={900} fill={VERM}>#@!</text>
      </g>
      <g transform={`translate(${-tr} 0)`}>
        <path d={`M${x + 6} ${y - 26} h40 a8 8 0 0 1 8 8 v12 a8 8 0 0 1 -8 8 h-7 l1 8 l-8 -8 h-26 a8 8 0 0 1 -8 -8 v-12 a8 8 0 0 1 8 -8 Z`} fill="#ffffff" stroke="#0003" />
        <text x={x + 26} y={y - 9} textAnchor="middle" fontSize={13} fontWeight={900} fill={LARANJA}>!!</text>
      </g>
    </g>
  );
}

/** prato bem cheio */
function prato(x: number, y: number, o: number): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <ellipse cx={x} cy={y + 6} rx={28} ry={8} fill="#e9edf2" stroke="#9aa5b1" />
      <ellipse cx={x} cy={y + 4} rx={20} ry={5} fill="#d4dae1" />
      <path d={`M${x - 20} ${y + 3} Q${x - 14} ${y - 14} ${x - 2} ${y - 10} Q${x + 2} ${y - 18} ${x + 12} ${y - 12} Q${x + 22} ${y - 10} ${x + 20} ${y + 3} Z`} fill="#6b3a24" />
      <path d={`M${x - 16} ${y + 1} Q${x - 10} ${y - 8} ${x - 2} ${y - 4} Q${x - 4} ${y + 2} ${x - 16} ${y + 2} Z`} fill="#f4f1e6" />
      <path d={`M${x + 4} ${y - 4} Q${x + 12} ${y - 9} ${x + 18} ${y - 2} L${x + 6} ${y} Z`} fill="#e6a23c" />
      <circle cx={x + 2} cy={y - 8} r={2.2} fill="#3d8b3d" />
      <circle cx={x - 8} cy={y - 7} r={1.8} fill="#3d8b3d" />
    </g>
  );
}

/** quarto de noite: Pedro dormindo na cama */
function quarto(lt: number, o: number): ReactNode {
  if (o < 0.01) return null;
  return (
    <g opacity={o}>
      <rect x={20} y={20} width={280} height={170} rx={8} fill="#26345a" />
      <rect x={20} y={150} width={280} height={40} fill="#3b2f2a" />
      {/* janela com a lua */}
      <rect x={210} y={38} width={64} height={52} rx={3} fill="#0f1a38" stroke="#c9ced4" strokeWidth={3} />
      <line x1={242} y1={38} x2={242} y2={90} stroke="#c9ced4" strokeWidth={2} />
      <circle cx={258} cy={56} r={8} fill="#f4efd2" />
      <circle cx={261} cy={54} r={6.8} fill="#0f1a38" />
      {/* cama: cabeceira, colchão, travesseiro e coberta */}
      <rect x={40} y={92} width={12} height={78} rx={3} fill="#8a5a3b" />
      <rect x={52} y={132} width={176} height={18} rx={4} fill="#f4f1e6" />
      <rect x={52} y={150} width={176} height={12} fill="#8a5a3b" />
      <rect x={220} y={130} width={10} height={40} rx={3} fill="#8a5a3b" />
      <ellipse cx={80} cy={126} rx={24} ry={10} fill="#ffffff" stroke="#c9ced4" />
      {/* cabeça de perfil de olhos fechados */}
      <circle cx={84} cy={116} r={11} fill="#d9a37a" />
      <path d="M73 112 Q76 102 88 104 Q95 106 94 112 Q88 108 80 110 Q76 116 73 118 Z" fill="#3a2a1f" />
      <path d="M86 117 Q89 119 92 117" fill="none" stroke="#3a2a1f" strokeWidth={1.2} strokeLinecap="round" />
      <path d={`M96 ${124 + Math.sin(lt * 2) * 0.6} Q140 ${112 + Math.sin(lt * 2)} 222 122 L224 140 L96 140 Z`} fill="#3f7fd0" />
      <path d="M110 128 Q160 120 214 128" fill="none" stroke="#5a95dd" strokeWidth={2} />
      {[0, 1, 2].map((i) => {
        const f = (lt * 0.6 + i / 3) % 1;
        return <text key={i} x={100 + f * 26 + i * 4} y={100 - f * 40} fontSize={10 + f * 8} fontWeight={900} fill="#dfe8f3" opacity={1 - f}>z</text>;
      })}
    </g>
  );
}

/** a rua com pedestres perto do cruzamento (para o olhar em sequência) */
const RUA_PESSOAS = [person(4.6, -14, SENHORA, 0, Math.PI / 2, 1.12)];

/** as quatro paradas do olhar, em volta do olho */
const OLHAR: [string, string, number, number][] = [
  ['Painel', AZ, 160, 48],
  ['Espelhos', ROXO, 262, 104],
  ['Veículos em volta', VERDE, 160, 160],
  ['Pedestres', LARANJA, 58, 104],
];

function olhoGrande(x: number, y: number, a: number, o: number): ReactNode {
  if (o < 0.01) return null;
  const px = x + Math.cos(a) * 9;
  const py = y + Math.sin(a) * 6;
  return (
    <g opacity={o}>
      <path d={`M${x - 30} ${y} Q${x} ${y - 24} ${x + 30} ${y} Q${x} ${y + 24} ${x - 30} ${y} Z`} fill="#ffffff" stroke={TINTA} strokeWidth={2.4} />
      <circle cx={px} cy={py} r={10} fill="#4f7d4a" />
      <circle cx={px} cy={py} r={5} fill={TINTA} />
      <circle cx={px + 3} cy={py - 3} r={2} fill="#ffffff" />
    </g>
  );
}

function trecho(k: number, lt: number): Quadro {
  switch (k) {
    // 0. muita coisa diminui a concentração e deixa os reflexos lentos
    case 0:
      return naCabine(lt, () => (
        <>
          {chip(160, 24, 'Menos concentração', LARANJA, surge(lt, 0.6), 11)}
          {chip(160, 182, 'Reflexos mais lentos', VERM, surge(lt, 2.0), 11)}
          {chip(160, 50, 'Às vezes sem você perceber', TINTA, surge(lt, 3.6), 9)}
        </>
      ), { olho: 0.35 * surge(lt, 2.0) });
    // 1. álcool e drogas
    case 1:
      return naCabine(lt, () => (
        <>
          {escuro(0.25)}
          {taca(212, 66, surge(lt, 0.2), 1.1)}
          {pilula(258, 60, surge(lt, 0.5), 0.9)}
          {chip(240, 88, 'Álcool e drogas', VERM, surge(lt, 0.3), 10)}
          {lista(lt, 'O que fazem', VERM, ['Tiram a atenção', 'Pioram a coordenação', 'Mudam o comportamento'], 1.0, 0.9, 168)}
        </>
      ), { olho: 0.4 });
    // 2. remédio que altera o comportamento, segundo o médico
    case 2:
      return naCabine(lt, () => (
        <>
          {escuro(0.25)}
          {quadro(196, 34, 100, 66, surge(lt, 0.2), (
            <>
              <rect x={30} y={10} width={40} height={36} rx={5} fill="#f4f1e6" stroke="#9aa5b1" />
              <rect x={28} y={6} width={44} height={9} rx={3} fill={ROXO} />
              <rect x={36} y={22} width={28} height={14} rx={2} fill="#ffffff" stroke="#c9ced4" />
              <text x={50} y={32} textAnchor="middle" fontSize={8} fontWeight={800} fill={ROXO}>Rx</text>
              <text x={50} y={60} textAnchor="middle" fontSize={9} fontWeight={800} fill={TINTA}>Remédio</text>
            </>
          ))}
          {chip(160, 24, 'Altera o comportamento?', ROXO, surge(lt, 0.8), 11)}
          {chip(160, 182, 'Quem diz é o médico', TINTA, surge(lt, 2.0), 10)}
        </>
      ));
    // 3. sono
    case 3: {
      const pisca = 0.55 + 0.45 * Math.max(0, Math.sin(lt * 2.4));
      return naCabine(lt, () => (
        <>
          {chip(160, 24, 'Sono', AZ, surge(lt, 0.2), 12)}
          {lista(lt, 'Quando dá sono', AZ, ['Muito tempo acordado', 'Dormiu pouco', 'Dormiu mal'], 0.7, 0.8, 160)}
        </>
      ), { noite: true, olho: pisca * surge(lt, 0.5), boca: Math.max(0, Math.sin((lt - 1.5) * 1.6)) * surge(lt, 1.5) });
    }
    // 4. discussão forte antes de dirigir; comida muito pesada, que dá sono
    case 4:
      return naCabine(lt, () => (
        <>
          {escuro(0.2)}
          {discussao(110, 64, surge(lt, 0.2) * (1 - surge(lt, 2.4)), lt)}
          {chip(110, 30, 'Discussão forte', VERM, surge(lt, 0.3) * (1 - surge(lt, 2.4)), 10)}
          {prato(110, 64, surge(lt, 2.4))}
          {chip(110, 30, 'Comida muito pesada', LARANJA, surge(lt, 2.4), 10)}
          {chip(160, 182, 'Pouco antes de dirigir', TINTA, surge(lt, 1.0), 10)}
        </>
      ), { olho: 0.55 * surge(lt, 3.2) });
    // 5. celular, mesmo no viva-voz; som alto
    case 5: {
      const som = surge(lt, 2.4);
      return naCabine(lt, () => (
        <>
          {celular(270, 64, surge(lt, 0.2), lt, surge(lt, 0.8))}
          {nao(270, 64, 22, surge(lt, 1.6))}
          {chip(232, 108, 'Mesmo no viva-voz', VERM, surge(lt, 1.0), 9)}
          {notas(lt, som)}
          {chip(120, 24, 'Som alto', LARANJA, som, 11)}
          {chip(140, 182, 'Você não ouve o veículo nem os outros', TINTA, surge(lt, 3.0), 9)}
        </>
      ));
    }
    // 6. animal e objetos soltos
    case 6: {
      const rola = ease(clamp(lt / 2.4));
      return naCabine(lt, () => (
        <>
          {cachorro(66, 128, surge(lt, 0.1), lt)}
          {chip(70, 90, 'Animal solto', LARANJA, surge(lt, 0.4), 10)}
          {garrafa(lerp(200, 226, rola), 172, rola * 540, surge(lt, 1.0))}
          {chip(230, 150, 'Objeto solto', VERM, surge(lt, 1.4), 10)}
        </>
      ));
    }
    // 7. olhe em sequência: painel, espelhos, veículos e pedestres; perto dos cruzamentos
    case 7: {
      const marcas = [1.6, 2.3, 3.2, 4.6];
      let ativo = -1;
      for (let i = 0; i < 4; i++) if (lt >= marcas[i]) ativo = i;
      const gira = lt >= 5.6 ? ((lt - 5.6) * 1.2) % 4 : ativo;
      const a = (Math.floor(gira < 0 ? 0 : gira) * Math.PI) / 2 - Math.PI / 2;
      const q = ruaFundo(lt, RUA_PESSOAS);
      return { ...q, over: () => (
        <>
          {escuro(0.45)}
          {chip(160, 18, 'Olhe em sequência', TINTA, surge(lt, 0.2), 10)}
          {olhoGrande(160, 104, a, surge(lt, 0.4))}
          {OLHAR.map(([t, c, x, y], i) => <g key={t}>{chip(x, y, t, c, surge(lt, marcas[i]) * (i === Math.floor(gira) || lt < 5.6 ? 1 : 0.55), i === Math.floor(gira) ? 11 : 9.5)}</g>)}
          {chip(160, 188, 'Principalmente perto dos cruzamentos', AZ, surge(lt, 5.6), 9)}
        </>
      ) };
    }
    // 8. dirigir com incapacidade física ou mental temporária é infração
    case 8:
      return naCabine(lt, () => (
        <>
          {escuro(0.5)}
          {quadro(30, 40, 260, 86, surge(lt, 0.3), (
            <>
              <rect x={0} y={0} width={260} height={26} rx={9} fill={VERM} />
              <rect x={0} y={16} width={260} height={10} fill={VERM} />
              <text x={130} y={18} textAnchor="middle" fontSize={12} fontWeight={900} fill="#ffffff">Infração</text>
              <text x={130} y={48} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={TINTA}>Dirigir com incapacidade física</text>
              <text x={130} y={66} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={TINTA}>ou mental temporária</text>
            </>
          ))}
          {chip(160, 150, 'Que comprometa a segurança', LARANJA, surge(lt, 2.6), 10)}
        </>
      ), { olho: 0.6, noite: true });
    // 9. Pedro dormiu só três horas: descansa antes e sai mais tarde
    case 9: {
      const dorme = surge(lt, 2.0, 0.4) * (1 - surge(lt, 4.4, 0.4));
      const sai = surge(lt, 4.4, 0.4);
      const q = ruaFundo(lt);
      return { ...q, over: () => (
        <>
          {escuro(0.5)}
          {cabine({ dobra: 1, apoio: 1, lt, parado: true, olho: 0.6, boca: Math.max(0, Math.sin(lt * 1.8)) * 0.8, o: 1 - surge(lt, 2.0, 0.4) })}
          {chip(160, 24, 'Pedro dormiu só 3 horas', LARANJA, surge(lt, 0.2) * (1 - dorme) * (1 - sai), 11)}
          {quarto(lt, dorme)}
          {relogio(250, 130, lt * 1.6, dorme, 14)}
          {chip(160, 182, 'Descansa antes', VERDE, dorme, 11)}
          {cabine({ dobra: 1, apoio: 1, lt: Math.max(0, lt - 4.4), o: sai })}
          {chip(160, 24, 'Sai mais tarde, descansado', VERDE, sai, 11)}
          {visto(286, 30, surge(lt, 5.0), 10)}
        </>
      ) };
    }
    // 10. para guardar
    default:
      return naCabine(lt, () => (
        <>
          {escuro(0.55)}
          {chip(160, 50, 'Para guardar', AZ, surge(lt, 0.1), 11)}
          {chip(160, 84, 'Cabeça no trânsito', VERDE, surge(lt, 0.8), 12)}
          {chip(160, 114, 'Olhos girando', AZ, surge(lt, 1.6), 12)}
          {chip(160, 144, 'Celular guardado', LARANJA, surge(lt, 2.4), 12)}
        </>
      ));
  }
}

export const { Video, DUR, falaEm } = fazerVideo(tempos, trecho);

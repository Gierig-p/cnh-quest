// Gera o áudio das situações "Na rua": public/audio/situacoes/<id>.mp3.
// Uso: npx tsx scripts/audio/situacoes.ts [id ...]   (com cache: só gasta créditos no que mudou)
//
// Montagem de cada situação:
// - o 1º som, se for de "fundo", toca baixo por baixo de tudo (ambiência);
// - os sons de "evento" (apito, sirene...) entram na ordem do texto, antes da fala seguinte;
// - cada fala é narrada pela voz do Davi, com pausas; no fim, a pergunta da questão.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
// @ts-ignore: módulo .mjs sem tipos
import { efeito, falaPausada, RAIZ } from './eleven.mjs';
import { WORLD1_SITUATIONS, WORLD2_SITUATIONS, WORLD3_SITUATIONS, WORLD4_SITUATIONS, WORLD5_SITUATIONS } from '../../src/content/situations';

/** Voz escolhida pelo dono em 14/11/2026: Davi Andrei (pt-BR), a mesma dos cartões. */
const VOZ = '2CECaLAGTS5NRGxgbcxr';

type Som = { prompt: string; segundos: number; tipo: 'fundo' | 'evento' };
/** Pedidos ao gerador de efeitos (em inglês, que ele entende melhor). */
const SONS: Record<string, Som> = {
  cidade: { tipo: 'fundo', segundos: 20, prompt: 'city street traffic ambience, cars idling and passing at an intersection, distant horns, daytime' },
  avenida: { tipo: 'fundo', segundos: 20, prompt: 'busy avenue heard from inside a moving car, steady traffic passing, road noise' },
  bairro: { tipo: 'fundo', segundos: 20, prompt: 'quiet residential street ambience, light breeze, a distant dog barking once, calm' },
  noite: { tipo: 'fundo', segundos: 20, prompt: 'night ambience on an empty city street, crickets chirping, very quiet, distant hum' },
  passaros: { tipo: 'fundo', segundos: 20, prompt: 'quiet suburban street in the morning, birds singing, soft breeze, calm' },
  caminhao: { tipo: 'fundo', segundos: 20, prompt: 'heavy truck engine rumbling slowly ahead on a two-lane country road, heard from a car behind it' },
  estrada: { tipo: 'fundo', segundos: 20, prompt: 'car driving on a rural highway, interior road noise and soft wind, steady' },
  chuva: { tipo: 'fundo', segundos: 20, prompt: 'heavy rain drumming on the roof and windshield of a car, wipers moving, muffled city traffic, daytime' },
  seta: { tipo: 'fundo', segundos: 12, prompt: 'car turn signal indicator ticking steadily inside a quiet car' },
  apito: { tipo: 'evento', segundos: 1.6, prompt: 'traffic police officer blowing a whistle, one short sharp blast, outdoors on a street' },
  sirene: { tipo: 'evento', segundos: 6, prompt: 'ambulance siren approaching from far behind and getting louder, wailing siren' },
  passos: { tipo: 'evento', segundos: 3, prompt: 'slow footsteps of an elderly person walking on asphalt, close' },
  carro: { tipo: 'evento', segundos: 4, prompt: 'a single car approaching slowly and braking softly at an intersection' },
  trem: { tipo: 'evento', segundos: 4, prompt: 'distant train horn blowing twice in the countryside' },
  festa: { tipo: 'fundo', segundos: 20, prompt: 'indoor birthday party ambience, people talking and laughing, soft pop music in the background' },
  celular: { tipo: 'evento', segundos: 2, prompt: 'smartphone vibrating twice on a car seat, short buzz' },
  freada: { tipo: 'evento', segundos: 2.5, prompt: 'car braking hard with tires screeching, then a light thud' },
};

const TMP = join(RAIZ, '_tmp_situacoes');
const OUT = join(RAIZ, 'public', 'audio', 'situacoes');

const ff = (args: string[]) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', '-loglevel', 'error', '-y', ...args]);
const dur = (f: string) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim());

async function som(chave: string) {
  const s = SONS[chave];
  if (!s) throw new Error(`som desconhecido: ${chave}`);
  return efeito(s.prompt, s.segundos, join(TMP, `som_${chave}.mp3`)) as Promise<string>;
}

const todas = [...WORLD1_SITUATIONS, ...WORLD2_SITUATIONS, ...WORLD3_SITUATIONS, ...WORLD4_SITUATIONS, ...WORLD5_SITUATIONS];
const pedidas = process.argv.slice(2);
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

for (const q of todas) {
  if (!q.situation || (pedidas.length && !pedidas.includes(q.id))) continue;
  const linhas = [...q.situation];
  let fundo: string | null = null;
  if (linhas[0]?.kind === 'som' && SONS[linhas[0].som]?.tipo === 'fundo') {
    fundo = await som(linhas[0].som);
    linhas.shift();
  }

  // primeiro plano: [arquivo, início em segundos, volume (0 = efeito, nivelado a -22 LUFS)]
  const faixas: [string, number, number][] = [];
  let t = fundo ? 1.5 : 0.3;
  let n = 0;
  for (const l of linhas) {
    if (l.kind === 'som') {
      const arq = await som(l.som);
      faixas.push([arq, t, 0]); // 0 = efeito: volume medido em LUFS abaixo
      t += Math.min(dur(arq), 4) * 0.8; // a fala entra no fim do som
    } else {
      const arq = await falaPausada([l.text], VOZ, join(TMP, `${q.id}_${n++}.mp3`));
      faixas.push([arq, t, 1]);
      t += dur(arq) + 0.7;
    }
  }
  const pergunta = await falaPausada([q.prompt], VOZ, join(TMP, `${q.id}_p.mp3`));
  faixas.push([pergunta, t + 0.3, 1]);
  const total = t + 0.3 + dur(pergunta) + 0.8;

  const args: string[] = [];
  const fil: string[] = [];
  const rotulos: string[] = [];
  faixas.forEach(([arq, ini, vol], k) => {
    args.push('-i', arq);
    const ms = Math.round(ini * 1000);
    fil.push(`[${k}:a]aformat=sample_rates=44100:channel_layouts=mono,${vol ? `volume=${vol}` : 'loudnorm=I=-22:TP=-3'},adelay=${ms}|${ms}[f${k}]`);
    rotulos.push(`[f${k}]`);
  });
  if (fundo) {
    const k = faixas.length;
    args.push('-stream_loop', '-1', '-i', fundo);
    // ambiência baixa (cerca de -33 LUFS, uns 17 dB sob a voz), entrando e saindo suave
    fil.push(
      `[${k}:a]aformat=sample_rates=44100:channel_layouts=mono,atrim=0:${total.toFixed(2)},` +
        `loudnorm=I=-24:TP=-2,volume=-9dB,afade=t=in:d=0.8,afade=t=out:st=${(total - 1.5).toFixed(2)}:d=1.5[bg]`,
    );
    rotulos.push('[bg]');
  }
  fil.push(
    `${rotulos.join('')}amix=inputs=${rotulos.length}:normalize=0:duration=longest,` +
      `atrim=0:${total.toFixed(2)},alimiter=limit=0.89[out]`,
  );
  const destino = join(OUT, `${q.id}.mp3`);
  ff([...args, '-filter_complex', fil.join(';'), '-map', '[out]', '-ar', '44100', '-ac', '1', '-b:a', '64k', destino]);
  console.log('ok', q.id, `${total.toFixed(1)} s`);
}

rmSync(TMP, { recursive: true, force: true });

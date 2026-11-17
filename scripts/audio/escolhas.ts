// Gera o áudio das situações em vídeo de escolha (Mundo 5): public/audio/escolhas/<questão>/<parte>.mp3
// e os tempos em src/content/escolhas/<questão>.json ({ intro, a, b, ... } com { dur, falas }).
// Uso: npx tsx scripts/audio/escolhas.ts [questão ...]   (com cache: só gasta créditos no que mudou)
// A voz é a do Davi; o som de fundo (ex.: chuva) toca baixo por baixo de toda a parte.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-ignore: módulo .mjs sem tipos
import { efeito, falaComTempos, RAIZ } from './eleven.mjs';
import { ESCOLHAS } from '../../src/content/escolhas';

const VOZ = '2CECaLAGTS5NRGxgbcxr';

/** o mesmo pedido de situacoes.ts (mesmo texto: sai do cache, sem gastar créditos) */
const FUNDO: Record<string, string> = {
  'motor de veículo bem perto': 'busy avenue heard from inside a moving car, steady traffic passing, road noise, a motorcycle engine humming close by on the left side',
  'barulho da estrada': 'driving on a highway on a sunny day heard from inside a car, steady tire and road noise, a truck engine rumbling ahead',
  'noite na estrada': 'driving on an empty country highway at night heard from inside a car, low steady engine and tire hum, very quiet, faint crickets outside',
  'neblina na serra': 'driving slowly down a mountain road in the early morning heard from inside a car, soft engine and tire noise, quiet damp air, distant birds, no rain',
  'chuva forte': 'heavy rain drumming on the roof and windshield of a car, wipers moving, muffled city traffic, daytime',
};

/** som extra no começo de um final (somRamo) */
const EXTRA: Record<string, [string, number]> = {
  'buzina curta': ['a single short car horn beep, close, dry, no music', 1],
};

/** falas que precisam durar o tempo real (a contagem dos dois segundos: "conte devagar") */
const DURACAO: Record<string, number> = { 'Cinquenta e um, cinquenta e dois.': 2.0 };

const TMP = join(RAIZ, '_tmp_escolhas');
const ff = (args: string[]) => execFileSync('ffmpeg', ['-hide_banner', '-nostdin', '-loglevel', 'error', '-y', ...args]);

const pedidas = process.argv.slice(2);
mkdirSync(TMP, { recursive: true });

for (const [qid, e] of Object.entries(ESCOLHAS)) {
  if (pedidas.length && !pedidas.includes(qid)) continue;
  const fundo = FUNDO[e.som] ? ((await efeito(FUNDO[e.som], 20, join(TMP, 'fundo.mp3'))) as string) : null;
  const out = join(RAIZ, 'public', 'audio', 'escolhas', qid);
  mkdirSync(out, { recursive: true });
  const tempos: Record<string, { dur: number; falas: { ini: number; fim: number }[] }> = {};
  const partes: [string, string[]][] = [['intro', e.intro], ...Object.entries(e.ramos)];
  for (const [parte, falas] of partes) {
    const voz = join(TMP, `${parte}.mp3`);
    const extra = e.somRamo?.[parte];
    // com som extra, a fala começa depois dele
    const r = await falaComTempos(falas, VOZ, voz, {
      pausa: 0.7,
      inicio: extra ? 1.5 : 0.6,
      alvo: Object.fromEntries(falas.flatMap((f, i) => (DURACAO[f] ? [[i, DURACAO[f]]] : []))),
    });
    tempos[parte] = r;
    const destino = join(out, `${parte}.mp3`);
    if (extra) {
      const [prompt, s] = EXTRA[extra];
      const fx = (await efeito(prompt, s, join(TMP, 'extra.mp3'))) as string;
      const comExtra = join(TMP, `${parte}_x.mp3`);
      ff(['-i', voz, '-i', fx, '-filter_complex',
        `[1:a]aformat=sample_rates=44100:channel_layouts=mono,atrim=0:1.2,adelay=200,volume=0.8[x];[0:a]aformat=sample_rates=44100:channel_layouts=mono[v];[v][x]amix=inputs=2:normalize=0:duration=first[o]`,
        '-map', '[o]', '-ar', '44100', '-ac', '1', comExtra]);
      copyFileSync(comExtra, voz);
    }
    if (fundo) {
      ff(['-i', voz, '-stream_loop', '-1', '-i', fundo, '-filter_complex',
        `[1:a]aformat=sample_rates=44100:channel_layouts=mono,volume=0.22,atrim=0:${r.dur},afade=t=in:d=0.4,afade=t=out:st=${Math.max(0, r.dur - 0.5)}:d=0.5[b];` +
        `[0:a][b]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[o]`,
        '-map', '[o]', '-ar', '44100', '-ac', '1', '-b:a', '64k', destino]);
    } else ff(['-i', voz, '-ar', '44100', '-ac', '1', '-b:a', '64k', destino]);
    console.log('ok', qid, parte, r.dur, 's');
  }
  mkdirSync(join(RAIZ, 'src', 'content', 'escolhas'), { recursive: true });
  writeFileSync(join(RAIZ, 'src', 'content', 'escolhas', `${qid}.json`), JSON.stringify(tempos, null, 2) + '\n');
}
rmSync(TMP, { recursive: true, force: true });

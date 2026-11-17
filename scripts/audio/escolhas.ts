// Gera o áudio das situações em vídeo de escolha (Mundo 5): public/audio/escolhas/<questão>/<parte>.mp3
// e os tempos em src/content/escolhas/<questão>.json ({ intro, a, b, ... } com { dur, falas }).
// Uso: npx tsx scripts/audio/escolhas.ts [questão ...]   (com cache: só gasta créditos no que mudou)
// A voz é a do Davi; o som de fundo (ex.: chuva) toca baixo por baixo de toda a parte.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-ignore: módulo .mjs sem tipos
import { efeito, falaComTempos, RAIZ } from './eleven.mjs';
import { ESCOLHAS } from '../../src/content/escolhas';

const VOZ = '2CECaLAGTS5NRGxgbcxr';

/** o mesmo pedido de situacoes.ts (mesmo texto: sai do cache, sem gastar créditos) */
const FUNDO: Record<string, string> = {
  'chuva forte': 'heavy rain drumming on the roof and windshield of a car, wipers moving, muffled city traffic, daytime',
};

const TMP = join(RAIZ, '_tmp_escolhas');
const ff = (args: string[]) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

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
    const r = await falaComTempos(falas, VOZ, voz, { pausa: 0.7, inicio: 0.6 });
    tempos[parte] = r;
    const destino = join(out, `${parte}.mp3`);
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

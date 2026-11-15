// Gera a narração dos vídeos dos cartões: public/audio/videos/<id>.mp3 e os tempos em src/content/videos/<id>.json.
// Uso: npx tsx scripts/audio/videos.ts   (com cache: só gasta créditos no que mudou)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-ignore: módulo .mjs sem tipos
import { falaComTempos, RAIZ } from './eleven.mjs';
import { VIDEOS } from '../../src/content/videos';

/** a mesma voz do "Ouvir explicação" (Davi Andrei, pt-BR) */
const VOZ = '2CECaLAGTS5NRGxgbcxr';

for (const [id, v] of Object.entries(VIDEOS)) {
  const r = await falaComTempos(v.falas, VOZ, join(RAIZ, 'public', 'audio', 'videos', `${id}.mp3`));
  writeFileSync(join(RAIZ, 'src', 'content', 'videos', `${id}.json`), JSON.stringify(r, null, 2) + '\n');
  console.log('ok', id, r.dur, 's');
}

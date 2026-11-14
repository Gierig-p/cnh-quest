// Gera o áudio "Ouvir explicação" de cada cartão: public/audio/cartoes/<id>.mp3.
// Uso: npx tsx scripts/audio/cartoes.ts   (com cache: só gasta créditos no que mudou)
import { join } from 'node:path';
// @ts-ignore: módulo .mjs sem tipos
import { falaPausada, RAIZ } from './eleven.mjs';
import { NARRATION } from '../../src/content/narration';

/** Voz escolhida pelo dono em 14/11/2026: Davi Andrei (pt-BR). */
const VOZ = '2CECaLAGTS5NRGxgbcxr';

for (const [id, texto] of Object.entries(NARRATION)) {
  await falaPausada(texto, VOZ, join(RAIZ, 'public', 'audio', 'cartoes', `${id}.mp3`));
  console.log('ok', id);
}

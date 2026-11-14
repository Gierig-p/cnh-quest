// Gera os efeitos sonoros do app pelo ElevenLabs (sound-generation), com cache.
// Uso:
//   node scripts/audio/sons_app.mjs amostras        -> _tmp_sons/<som>_<n>.mp3 (todas as opções, para ouvir)
//   node scripts/audio/sons_app.mjs <som>=<n> ...   -> public/audio/sons/<som>.mp3 (as opções escolhidas)
// Cada som: corta o silêncio, suaviza o fim e nivela em -22 LUFS, pico até -6 dBFS (todos com a mesma força).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { efeito, RAIZ } from './eleven.mjs';

/** Pedidos em inglês (o gerador entende melhor). Tom: jogo de estudo, amigável, nada estridente. */
export const SONS = {
  acerto: {
    segundos: 1,
    opcoes: [
      'cheerful short correct answer chime for a learning game, two bright rising bell notes, clean, friendly, no reverb tail',
      'soft happy success ding for a mobile quiz app, marimba, two quick ascending notes, warm and clean',
      'soft warm correct answer chime for a learning game, two gentle rising notes on a mellow wooden marimba, mid-low register, round and pleasant, not shrill, no high bells',
    ],
  },
  erro: {
    segundos: 1,
    opcoes: [
      'gentle short wrong answer sound for a learning game, two soft descending low notes, muted marimba, kind, not harsh, no buzzer',
      'soft low "oops" tone for a mobile quiz app, short descending wooden notes, calm and friendly, not alarming',
    ],
  },
  combo: {
    segundos: 1.5,
    opcoes: [
      'quick sparkling ascending arpeggio for a streak bonus in a learning game, bright bells and a light shimmer, joyful',
      'mobile game combo sound, fast rising xylophone run ending in a sparkle, short and exciting',
    ],
  },
  desbloqueio: {
    segundos: 1.5,
    opcoes: [
      'new level unlocked sound for a learning game, a soft click followed by a bright magical chime, short and rewarding',
      'mobile game unlock reward sound, short whoosh up into a shiny bell chord, friendly',
    ],
  },
  conclusao: {
    segundos: 3,
    opcoes: [
      'lesson complete fanfare for a friendly learning game, short cheerful brass and bells melody ending on a bright major chord, about three seconds',
      'mobile app level complete jingle, happy marimba and glockenspiel melody rising to a sparkling final chord, short',
    ],
  },
};

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

/** Mede um arquivo com o ffmpeg (o resultado sai no stderr). */
function medir(arq, filtro, re) {
  const p = spawnSync('ffmpeg', ['-hide_banner', '-i', arq, '-af', filtro, '-f', 'null', '-'], { encoding: 'utf8' });
  const m = [...(p.stderr ?? '').matchAll(re)].pop();
  return m ? Number(m[1]) : NaN;
}

/** Alvo de sonoridade dos efeitos: todos com a mesma força, bem abaixo das narrações (-16), com folga para não estourar. */
const ALVO_LUFS = -22;

/** Tira o silêncio do começo e do fim, suaviza o final e nivela a sonoridade em ALVO_LUFS (pico até -6 dBFS).
 *  `filtro` (opcional, ffmpeg -af) entra antes de nivelar: p. ex. tirar agudo ou baixar o tom. */
function acabar(origem, destino, filtro) {
  const corte = join(TMP, '_corte.wav');
  ff([
    '-i', origem,
    '-af', `${filtro ? filtro + ',' : ''}silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-55dB,afade=t=in:d=0.15,areverse`,
    '-ar', '44100', '-ac', '1', corte,
  ]);
  const lufs = medir(corte, 'ebur128', /I:\s+(-?[\d.]+) LUFS/g);
  const ganho = Number.isFinite(lufs) ? ALVO_LUFS - lufs : 0;
  ff(['-i', corte, '-af', `volume=${ganho.toFixed(1)}dB,alimiter=limit=0.5:attack=1:release=30:level=0`, '-ar', '44100', '-ac', '1', '-b:a', '96k', destino]);
  rmSync(corte, { force: true });
}

const args = process.argv.slice(2);
const TMP = join(RAIZ, '_tmp_sons');
const OUT = join(RAIZ, 'public', 'audio', 'sons');

if (args[0] === 'variantes') {
  // node sons_app.mjs variantes <som>=<n> "<filtro>" ... -> _tmp_sons/var_<i>.mp3 (para comparar ajustes)
  mkdirSync(TMP, { recursive: true });
  const [nome, n] = args[1].split('=');
  const cru = await efeito(SONS[nome].opcoes[Number(n) - 1], SONS[nome].segundos, join(TMP, `cru_${nome}_${n}.mp3`));
  for (const [i, f] of args.slice(2).entries()) {
    acabar(cru, join(TMP, `var_${nome}${n}_${i + 1}.mp3`), f || undefined);
    console.log('variante', nome, n, i + 1, f);
  }
} else if (args[0] === 'amostras') {
  mkdirSync(TMP, { recursive: true });
  for (const [nome, s] of Object.entries(SONS)) {
    for (const [i, prompt] of s.opcoes.entries()) {
      const cru = await efeito(prompt, s.segundos, join(TMP, `cru_${nome}_${i + 1}.mp3`));
      acabar(cru, join(TMP, `${nome}_${i + 1}.mp3`));
      console.log('amostra', nome, i + 1);
    }
  }
} else {
  mkdirSync(OUT, { recursive: true });
  for (const a of args) {
    const [nome, n] = a.split('=');
    const s = SONS[nome];
    if (!s || !s.opcoes[Number(n) - 1]) throw new Error(`opção desconhecida: ${a}`);
    const cru = await efeito(s.opcoes[Number(n) - 1], s.segundos, join(TMP, `cru_${nome}_${n}.mp3`));
    acabar(cru, join(OUT, `${nome}.mp3`), s.filtro);
    console.log('ok', nome, n);
  }
}

// Gera áudio pelo ElevenLabs ANTES do deploy (o repositório é público: a chave nunca entra no app).
// A chave fica fora deste projeto (variável ELEVENLABS_API_KEY ou psx-contos/.env) e nunca é impressa.
// Cada pedido fica em cache pelo hash do corpo (scripts/audio/cache/, fora do git): rodar de novo não gasta créditos.
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE = join(RAIZ, 'scripts', 'audio', 'cache');
const API = 'https://api.elevenlabs.io';

function chave() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY.trim();
  const env = join(RAIZ, '..', 'psx-contos', '.env');
  const m = readFileSync(env, 'utf8').match(/^\s*ELEVENLABS_API_KEY\s*=\s*"?([^"\r\n]+)"?/m);
  if (!m) throw new Error('Falta ELEVENLABS_API_KEY');
  return m[1].trim();
}

async function pedir(caminho, corpo) {
  mkdirSync(CACHE, { recursive: true });
  const ass = createHash('sha1').update(caminho + JSON.stringify(corpo)).digest('hex').slice(0, 16);
  const mp3 = join(CACHE, `${ass}.mp3`);
  if (existsSync(mp3)) return mp3;
  for (let tent = 1; ; tent++) {
    const r = await fetch(API + caminho, {
      method: 'POST',
      headers: { 'xi-api-key': chave(), 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    if (r.ok) {
      writeFileSync(mp3, Buffer.from(await r.arrayBuffer()));
      return mp3;
    }
    const msg = (await r.text()).slice(0, 300);
    if (tent >= 3 || (r.status !== 429 && r.status < 500)) throw new Error(`ElevenLabs ${r.status}: ${msg}`);
    await new Promise((ok) => setTimeout(ok, 4000 * tent));
  }
}

export const MODELO = 'eleven_multilingual_v2';

/** Fala calma e clara. Grava em `destino` (mp3) e devolve o caminho. */
export async function fala(texto, voz, destino) {
  const mp3 = await pedir(`/v1/text-to-speech/${voz}?output_format=mp3_44100_128`, {
    text: texto,
    model_id: MODELO,
    voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 0.95 },
  });
  mkdirSync(dirname(destino), { recursive: true });
  // mono 64 kbps (metade do tamanho, a voz não perde nada) e volume de celular (-16 LUFS)
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', mp3,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', '-b:a', '64k', destino]);
  return destino;
}

/** Divide um bloco em frases (ponto, interrogação ou exclamação seguidos de espaço). */
export const frases = (bloco) => bloco.split(/(?<=[.!?])\s+/).filter(Boolean);

/**
 * Fala com pausas: gera cada frase separada (com a frase de antes e a de depois como contexto,
 * para a entonação continuar natural) e junta com silêncio entre elas.
 * `blocos` é uma lista de blocos; cada bloco tem uma ou mais frases.
 */
export async function falaPausada(blocos, voz, destino, { entreFrases = 0.6, entreBlocos = 1.0, velocidade = 0.9 } = {}) {
  const todas = blocos.flatMap((b, i) => frases(b).map((f, j) => ({ f, novoBloco: i > 0 && j === 0 })));
  const partes = [];
  for (let k = 0; k < todas.length; k++) {
    partes.push(await pedir(`/v1/text-to-speech/${voz}?output_format=mp3_44100_128`, {
      text: todas[k].f,
      model_id: MODELO,
      previous_text: todas[k - 1]?.f,
      next_text: todas[k + 1]?.f,
      voice_settings: { stability: 0.6, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: velocidade },
    }));
  }
  // cada frase: corta o silêncio das pontas e põe a pausa certa antes dela
  const args = ['-hide_banner', '-loglevel', 'error', '-y'];
  partes.forEach((p) => args.push('-i', p));
  const filtros = partes.map((_, k) => {
    const pausa = k === 0 ? 0 : todas[k].novoBloco ? entreBlocos : entreFrases;
    const ms = Math.round(pausa * 1000);
    return `[${k}:a]aformat=sample_rates=44100:channel_layouts=mono,` +
      `silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,` +
      `adelay=${ms}|${ms},apad=pad_dur=0.05[p${k}]`;
  });
  const fil = filtros.join(';') + ';' + partes.map((_, k) => `[p${k}]`).join('') +
    `concat=n=${partes.length}:v=0:a=1,apad=pad_dur=0.4,loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
  mkdirSync(dirname(destino), { recursive: true });
  execFileSync('ffmpeg', [...args, '-filter_complex', fil, '-map', '[out]', '-ar', '44100', '-ac', '1', '-b:a', '64k', destino]);
  return destino;
}

/** Efeito sonoro curto (pedido em inglês). */
export async function efeito(texto, segundos, destino) {
  const mp3 = await pedir('/v1/sound-generation?output_format=mp3_44100_128', {
    text: texto,
    duration_seconds: Math.min(22, Math.max(0.5, segundos)),
    prompt_influence: 0.5,
  });
  mkdirSync(dirname(destino), { recursive: true });
  copyFileSync(mp3, destino);
  return destino;
}

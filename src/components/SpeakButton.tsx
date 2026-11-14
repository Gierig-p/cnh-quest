import { useEffect, useState } from 'react';
import type { Question } from '../content/types';
import { seededShuffle } from '../engine/grading';
import { IconPause, IconSound } from './Icons';

/** Texto falado de uma questão, na mesma ordem em que as respostas aparecem na tela. */
export function speechText(q: Question, seed: string): string {
  // a situação "Na rua" já tem o próprio áudio narrado; aqui entra só a questão
  const parts: string[] = [q.prompt];
  switch (q.type) {
    case 'choice':
      seededShuffle(q.options, seed).forEach((o, i) => parts.push(`Resposta ${i + 1}: ${o.text}.`));
      break;
    case 'truefalse':
      parts.push(`A frase é: ${q.statement}`, 'Responda: verdadeiro ou falso.');
      break;
    case 'fill':
      parts.push(`Complete: ${q.sentence.replace('___', ', espaço em branco, ')}`);
      parts.push(`Palavras para escolher: ${seededShuffle(q.bank, seed).join(', ')}.`);
      break;
    case 'order':
      parts.push(`Itens para pôr em ordem: ${q.items.map((i) => i.text).join('; ')}.`);
      break;
    case 'match':
      parts.push(`Ligue cada um ao seu par. De um lado: ${q.pairs.map((p) => p.left).join('; ')}.`);
      parts.push(`Do outro lado: ${seededShuffle(q.pairs.map((p) => p.right), seed).join('; ')}.`);
      break;
  }
  return parts.map((p) => p.trim()).join(' ');
}

const synth = (): SpeechSynthesis | null => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

/** Voz em português do Brasil, se o aparelho tiver; senão, qualquer voz em português. */
function ptVoice(s: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const vs = s.getVoices();
  return vs.find((v) => v.lang === 'pt-BR') ?? vs.find((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br') ?? vs.find((v) => v.lang.toLowerCase().startsWith('pt'));
}

/**
 * Protótipo "Ouvir texto" (Entrega 4 do PLANO-v2): lê a questão com a voz do navegador.
 * Só aparece quando o aluno liga em Ajustes e o navegador tem leitura de voz.
 * Para de falar ao trocar de questão ou sair da tela.
 */
export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSpeaking(false);
    return () => synth()?.cancel();
  }, [text]);

  const s = synth();
  if (!s) return null;

  function toggle() {
    const sy = synth();
    if (!sy) return;
    if (speaking) {
      sy.cancel();
      setSpeaking(false);
      return;
    }
    sy.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    const v = ptVoice(sy);
    if (v) u.voice = v;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    sy.speak(u);
  }

  return (
    <button type="button" className={`btn ghost sm listen-btn ${speaking ? 'on' : ''}`} onClick={toggle} aria-pressed={speaking}>
      {speaking ? <IconPause size={20} /> : <IconSound size={20} />}
      {speaking ? 'Parar leitura' : 'Ouvir a pergunta'}
    </button>
  );
}

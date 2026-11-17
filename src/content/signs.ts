import type { ConceptCard, SignCode } from './types';

/**
 * Nome oficial de cada placa que o app desenha (MBST, Res. CONTRAN 973/2022, Vols. I e II).
 * Aparece no balão quando o aluno toca no código da placa numa questão.
 */
export const SIGN_NAMES: Partial<Record<SignCode, string>> = {
  'R-1': 'Parada obrigatória (PARE)',
  'R-2': 'Dê a preferência',
  'R-3': 'Sentido proibido',
  'R-4a': 'Proibido virar à esquerda',
  'R-5a': 'Proibido retornar à esquerda',
  'R-6a': 'Proibido estacionar',
  'R-6c': 'Proibido parar e estacionar',
  'R-7': 'Proibido ultrapassar',
  'R-15': 'Altura máxima permitida',
  'R-19': 'Velocidade máxima permitida',
  'R-26': 'Siga em frente',
  'R-33': 'Sentido de circulação na rotatória',
  'A-12': 'Interseção em círculo',
  'A-14': 'Semáforo à frente',
  'A-15': 'Parada obrigatória à frente',
  'A-18': 'Saliência ou lombada',
  'A-24': 'Obras',
  'A-32b': 'Passagem sinalizada de pedestres',
  'A-37': 'Altura limitada',
  'A-41': 'Cruz de Santo André',
};

/** códigos de placa escritos no texto, ex.: "R-4a", "A-15" */
export const SIGN_CODE_RE = /(?<![\p{L}\p{N}-])[RA]-\d+[a-z]?(?![\p{L}\p{N}])/gu;

export const isSignCode = (s: string): s is SignCode => s in SIGN_NAMES;

/** códigos de placa conhecidos que aparecem num texto */
export function signCodesIn(text: string): SignCode[] {
  return [...new Set(text.match(SIGN_CODE_RE) ?? [])].filter(isSignCode);
}

/**
 * Placas que o cartão apresenta com imagem: a do próprio cartão e as citadas no texto que o aluno vê
 * (no cartão com vídeo, o resumo, que mostra a miniatura de cada placa; sem vídeo, o texto do cartão).
 */
export function cardSigns(card: ConceptCard): SignCode[] {
  const texts = card.video ? [...card.video.resumo, card.remember ?? ''] : [card.body, ...(card.points ?? []), card.example ?? '', card.remember ?? ''];
  const codes = new Set(texts.flatMap(signCodesIn));
  if (card.visual?.sign && isSignCode(card.visual.sign)) codes.add(card.visual.sign);
  return [...codes];
}


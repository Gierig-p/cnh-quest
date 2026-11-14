/**
 * Instrução da primeira vez de cada tipo de exercício (Entrega 2 do PLANO-v2).
 * Fica no localStorage numa chave própria (como o volume), sem mexer no modelo de progresso.
 * Vale como "vista" depois que o aluno verifica a primeira questão daquele tipo.
 */
import type { Question } from '../content/types';

const KEY = 'cnhquest:howto:v1';

export const HOWTO: Record<Question['type'], string> = {
  choice: 'Toque em uma resposta e depois em Verificar.',
  truefalse: 'Leia a frase. Toque em Verdadeiro ou Falso e depois em Verificar.',
  fill: 'Toque na palavra que completa a frase e depois em Verificar. Para trocar, toque na lacuna.',
  order: 'Use as setas (ou arraste pela alça) para pôr os passos na ordem certa. Depois, toque em Verificar.',
  match: 'Toque em um item da esquerda e depois no par dele na direita. Ao formar todos os pares, a resposta é conferida.',
};

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function howtoSeen(type: Question['type']): boolean {
  return read().includes(type);
}

export function markHowtoSeen(type: Question['type']) {
  const seen = read();
  if (seen.includes(type)) return;
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen, type]));
  } catch {
    /* armazenamento indisponível: a instrução volta na próxima vez, sem prejuízo */
  }
}

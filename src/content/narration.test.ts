import { describe, expect, it } from 'vitest';
import { WORLDS } from './index';
import { NARRATION } from './narration';

const cardIds = [
  ...new Set(WORLDS.flatMap((w) => w.lessons.flatMap((l) => l.steps.flatMap((s) => (s.kind === 'concept' ? [s.card.id] : []))))),
];

describe('narração dos cartões ("Ouvir explicação")', () => {
  it('todo cartão tem texto falado, e todo texto é de um cartão que existe', () => {
    expect(cardIds.filter((id) => !NARRATION[id])).toEqual([]);
    expect(Object.keys(NARRATION).filter((id) => !cardIds.includes(id))).toEqual([]);
  });

  it('todo cartão tem o áudio gerado em public/audio/cartoes', () => {
    // só lista os arquivos (não carrega): a chave é o caminho a partir da raiz do projeto
    const files = Object.keys(import.meta.glob('/public/audio/cartoes/*.mp3', { query: '?url' }));
    const missing = cardIds.filter((id) => !files.includes(`/public/audio/cartoes/${id}.mp3`));
    expect(missing).toEqual([]);
  });
});

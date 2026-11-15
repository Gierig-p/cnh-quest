import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QUESTION_BY_ID } from '../content';
import { AppStateProvider } from '../state/AppState';
import { createLocalStore } from '../storage/progressStore';
import { Exercise } from './Exercises';

function memoryStorage(init?: object): Storage {
  const m = new Map<string, string>();
  if (init) m.set('cnhquest:progress:v1', JSON.stringify(init));
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
}

/** com movimento reduzido, a cena vai direto ao quadro final: dá para testar sem esperar a animação */
function cena(id: string, checked: null | { correct: boolean }) {
  const q = QUESTION_BY_ID[id];
  return (
    <AppStateProvider store={createLocalStore(memoryStorage({ version: 1, onboarded: true, prefs: { sound: false, hearts: false, motion: 'reduce', examConfig: 'federal' } }))}>
      <Exercise q={q} seed="s" answer={null} onAnswer={() => {}} checked={checked} />
    </AppStateProvider>
  );
}

describe('cenas que reagem à resposta', () => {
  it('as três questões do piloto usam a cena 3D', () => {
    expect(QUESTION_BY_ID['w1-rua-3'].visual?.anim).toBe('pedestre-faixa');
    expect(QUESTION_BY_ID['w2-rua-4'].visual?.anim).toBe('linha-retencao');
    expect(QUESTION_BY_ID['w3-rua-5'].visual?.anim).toBe('porta-bicicleta');
    expect(QUESTION_BY_ID['w1-rua-5'].visual?.anim).toBe('pare-esquina');
  });

  it('a imagem segue o texto: verde na w1-l1-q17, vermelho nas outras do agente', () => {
    expect(QUESTION_BY_ID['w1-l1-q17'].visual?.scene).toBe('agente-semaforo-verde');
    expect(QUESTION_BY_ID['w1-l1-q3'].visual?.scene).toBe('agente-semaforo');
  });

  it('cena parada do Mundo 1 abre no estilo 3D, com a descrição no leitor de tela', async () => {
    render(cena('w1-l1-q17', null));
    const fig = await screen.findByRole('img', { name: /Semáforo verde e agente/ });
    expect(await within(fig).findByText((_, el) => el?.tagName.toLowerCase() === 'svg')).toBeInTheDocument();
  });

  it('Mundo 2: a questão do carro lento usa a cena com o carro, e a cena abre no estilo 3D', async () => {
    expect(QUESTION_BY_ID['w2-l4-q2'].visual?.scene).toBe('linha-amarela-continua-carro');
    render(cena('w2-l4-q2', null));
    const fig = await screen.findByRole('img', { name: /carro lento à frente/ });
    expect(await within(fig).findByText((_, el) => el?.tagName.toLowerCase() === 'svg')).toBeInTheDocument();
  });

  it('Mundo 3: a questão do ônibus no ponto usa a cena 3D, com a descrição no leitor de tela', async () => {
    expect(QUESTION_BY_ID['w3-l2-q7'].visual?.scene).toBe('onibus-ponto');
    render(cena('w3-l2-q7', null));
    const fig = await screen.findByRole('img', { name: /Ônibus parado no ponto/ });
    expect(await within(fig).findByText((_, el) => el?.tagName.toLowerCase() === 'svg')).toBeInTheDocument();
  });

  it('antes de verificar: cena parada, sem aviso; no erro: "Veja a ação correta"; no acerto: sem aviso', async () => {
    const { rerender } = render(cena('w3-rua-5', null));
    expect(await screen.findByRole('img', { name: /bicicleta vindo por trás/ })).toBeInTheDocument();
    expect(screen.queryByText('Veja a ação correta')).toBeNull();
    rerender(cena('w3-rua-5', { correct: false }));
    expect(screen.getByText('Veja a ação correta')).toBeInTheDocument();
    rerender(cena('w3-rua-5', { correct: true }));
    expect(screen.queryByText('Veja a ação correta')).toBeNull();
  });
});

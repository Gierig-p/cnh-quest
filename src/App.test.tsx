import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { AppStateProvider } from './state/AppState';
import { createLocalStore } from './storage/progressStore';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

/** Passa o cartão de conceito inteiro, mesmo quando ele vem em partes ("Parte 1 de 2"). */
async function passCard(user: { click: (el: Element) => Promise<void> }) {
  for (;;) {
    const m = screen.queryByText(/^Parte \d+ de \d+$/)?.textContent?.match(/(\d+) de (\d+)/);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    if (!m || m[1] === m[2]) return;
  }
}

function setup(storage = memoryStorage(), fakeTimers = false) {
  const store = createLocalStore(storage);
  const user = userEvent.setup(fakeTimers ? { advanceTimers: vi.advanceTimersByTime } : {});
  const utils = render(
    <AppStateProvider store={store}>
      <App />
    </AppStateProvider>,
  );
  return { user, storage, ...utils };
}

describe('fluxo principal', () => {
  it('faz o onboarding, abre a 1ª lição, erra, vê a explicação e salva o progresso', async () => {
    const { user, storage, unmount } = setup();
    await user.click(screen.getByRole('button', { name: 'Vamos lá' }));
    await user.click(screen.getByRole('radio', { name: /15 min por dia/ }));
    await user.click(screen.getByRole('button', { name: 'Começar a trilha' }));

    // trilha: módulos de referência e aviso de independência
    expect(screen.getAllByText('Módulo 1 · Sinalização de trânsito').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Quem passa primeiro\?.*módulo 3/ })).toBeInTheDocument();
    expect(screen.getByText(/app de estudo independente/)).toBeInTheDocument();
    expect(screen.getByText(/organização própria do app/)).toBeInTheDocument();

    // trilha: só a 1ª lição disponível
    expect(screen.getByRole('button', { name: /Quem passa primeiro\?, bloqueada/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?, disponível/ }));

    // cartão de conceito
    expect(screen.getByRole('heading', { name: 'O que é um sinal de trânsito?' })).toBeInTheDocument();
    await passCard(user);

    // 1ª questão: "Verificar" desabilitado até escolher
    const check = screen.getByRole('button', { name: 'Verificar' });
    expect(check).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Gestos do agente de trânsito' }));
    expect(check).toBeEnabled();
    await user.click(check);

    const status = screen.getByRole('status');
    expect(within(status).getByText('Resposta correta:')).toBeInTheDocument();
    expect(within(status).getByText('Anúncios publicitários à beira da via')).toBeInTheDocument();
    expect(within(status).getByText(/Por que a sua não: Gestos do agente/)).toBeInTheDocument();
    // correção em camadas: macete e fonte só depois de "Ver explicação completa"
    expect(within(status).queryByRole('link', { name: 'Código de Trânsito Brasileiro' })).not.toBeInTheDocument();
    await user.click(within(status).getByRole('button', { name: 'Ver explicação completa' }));
    expect(within(status).getByRole('link', { name: 'Código de Trânsito Brasileiro' })).toHaveAttribute('href', expect.stringContaining('planalto.gov.br'));
    expect(status).toHaveTextContent('arts. 80 e 87');
    // lição comum: dá para rever o cartão que ensinou a questão
    await user.click(within(status).getByRole('button', { name: /Ver a explicação de novo/ }));
    expect(screen.getByRole('dialog')).toHaveTextContent('O que é um sinal de trânsito?');
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // o erro já foi gravado
    const saved = JSON.parse(storage.getItem('cnhquest:progress:v1')!);
    expect(saved.questions['w1-l1-q1'].wrong).toBe(1);
    expect(saved.dailyGoal).toBe(30);

    // sair pede confirmação
    await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('dialog', { name: 'Quer mesmo sair?' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('heading', { name: 'Começando no trânsito' })).toBeInTheDocument();

    // "recarregar": nova montagem com o mesmo armazenamento
    unmount();
    setup(storage);
    expect(screen.queryByRole('button', { name: 'Vamos lá' })).not.toBeInTheDocument();
    // a questão errada já aparece como revisão pendente
    expect(screen.getByLabelText('1 pendentes')).toBeInTheDocument();
  });

  it('cartão Hoje: uma ação só (continuar a lição ou revisar até 12)', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user, unmount } = setup(storage);
    const hoje = screen.getByRole('region', { name: 'Hoje' });
    expect(within(hoje).getAllByRole('button')).toHaveLength(1);
    await user.click(within(hoje).getByRole('button', { name: 'Continuar: Quem manda no trânsito?' }));
    expect(screen.getByRole('heading', { name: 'O que é um sinal de trânsito?' })).toBeInTheDocument();
    unmount();

    // 15 questões vencidas: a revisão do cartão leva só 12
    const day = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
    const ids = ['w1-l1-q1', 'w1-l1-q2', 'w1-l1-q3', 'w1-l1-q4', 'w1-l1-q5', 'w1-l1-q6', 'w1-l1-q7', 'w1-l1-q8', 'w1-l1-q9', 'w1-l1-q10', 'w1-l1-q11', 'w1-l1-q12', 'w1-l2-q1', 'w1-l2-q2', 'w1-l2-q3'];
    const questions = Object.fromEntries(ids.map((id) => [id, { box: 1, due: day, seen: 1, correct: 0, wrong: 1 }]));
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true, questions }));
    setup(storage);
    const hoje2 = screen.getByRole('region', { name: 'Hoje' });
    expect(within(hoje2).getAllByRole('button')).toHaveLength(1);
    expect(within(hoje2).getByRole('button', { name: /^Revisar 12 questões$/ })).toBeInTheDocument();
  });

  it('instrução da primeira vez aparece só na 1ª questão de cada tipo', async () => {
    localStorage.removeItem('cnhquest:howto:v1');
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?, disponível/ }));
    await passCard(user);
    expect(screen.getByText(/Toque em uma resposta e depois em Verificar/)).toBeInTheDocument();
    await user.keyboard('1');
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    expect(screen.queryByText(/Toque em uma resposta e depois em Verificar/)).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('cnhquest:howto:v1')!)).toContain('choice');
  });

  it('teclado: número escolhe a alternativa e Enter verifica', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?/ }));
    await user.keyboard('{Enter}'); // cartão em 2 partes: Enter vai para a 2ª
    expect(screen.getByText('Parte 2 de 2')).toBeInTheDocument();
    await user.keyboard('{Enter}'); // e depois sai do cartão
    await user.keyboard('1');
    expect(screen.getAllByRole('radio').some((r) => r.getAttribute('aria-checked') === 'true')).toBe(true);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('verificar duas vezes seguidas grava a resposta uma vez só', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?/ }));
    await passCard(user);
    await user.click(screen.getByRole('radio', { name: 'Gestos do agente de trânsito' }));
    const check = screen.getByRole('button', { name: 'Verificar' });
    // dois cliques no mesmo instante, antes da tela se atualizar
    act(() => {
      check.click();
      check.click();
    });
    const saved = JSON.parse(storage.getItem('cnhquest:progress:v1')!);
    expect(saved.questions['w1-l1-q1'].seen).toBe(1);
    expect(saved.questions['w1-l1-q1'].wrong).toBe(1);
  });

  it('com um diálogo aberto, as teclas 1–9 não escolhem alternativa', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?/ }));
    await passCard(user);
    await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
    await user.keyboard('1');
    expect(screen.getAllByRole('radio', { hidden: true }).some((r) => r.getAttribute('aria-checked') === 'true')).toBe(false);
  });

  it('com a rodada 1 feita, a lição abre direto na rodada de prática, sem cartões', async () => {
    const storage = memoryStorage();
    storage.setItem(
      'cnhquest:progress:v1',
      JSON.stringify({ version: 1, onboarded: true, lessons: { 'w1-l1': { completed: false, mastered: true, bestAccuracy: 1, attempts: 1, roundsDone: 1 } } }),
    );
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?, disponível, 1 de 2 rodadas feitas/ }));
    expect(screen.queryByRole('heading', { name: 'O que é um sinal de trânsito?' })).not.toBeInTheDocument();
    expect(screen.getByText(/^Prática · /)).toBeInTheDocument();
  });

  it('simulado entregue em branco mostra o desempenho por módulo de referência', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getAllByRole('button', { name: /Simulado/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Começar simulado' }));
    expect(screen.queryByRole('button', { name: /Dica/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Entregar prova' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Entregar' }));

    const section = screen.getByRole('region', { name: 'Desempenho por módulo' });
    expect(within(section).getByText('Módulo 1')).toBeInTheDocument();
    expect(within(section).getByRole('progressbar', { name: /Módulo 1: 0% de acertos/ })).toBeInTheDocument();
    expect(within(section).getByText(/decisão do CNH Quest/)).toBeInTheDocument();
  });

  it('som pode ser desligado pelo atalho do topo e a escolha fica salva', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    const toggle = screen.getAllByRole('button', { name: 'Efeitos sonoros' })[0];
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(JSON.parse(storage.getItem('cnhquest:progress:v1')!).prefs.sound).toBe(false);
    expect(screen.getAllByRole('button', { name: 'Efeitos sonoros' })[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('tema escuro: escolhido em Progresso, aplicado na página e salvo', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    await user.click(screen.getAllByRole('button', { name: /Progresso/ })[0]);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(JSON.parse(storage.getItem('cnhquest:progress:v1')!).prefs.theme).toBe('dark');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tema' }), 'system');
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('botão de modo escuro no topo liga e desliga o tema', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    const btn = () => screen.getAllByRole('button', { name: 'Modo escuro' })[0];
    expect(btn()).toHaveAttribute('aria-pressed', 'false');
    await user.click(btn());
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(btn()).toHaveAttribute('aria-pressed', 'true');
    await user.click(btn());
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(JSON.parse(storage.getItem('cnhquest:progress:v1')!).prefs.theme).toBe('light');
    document.documentElement.removeAttribute('data-theme');
  });

  it('as questões sorteadas ficam salvas: sair e entrar de novo repete o mesmo sorteio', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    const saved = () => JSON.parse(storage.getItem('cnhquest:progress:v1')!).draws?.['w1-l1:r1'];
    const lesson = /^Quem manda no trânsito\?/;
    await user.click(screen.getByRole('button', { name: lesson }));
    await waitFor(() => expect(saved()?.length).toBeGreaterThan(0));
    const first = saved();
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
      await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair da lição' }));
      await user.click(screen.getByRole('button', { name: lesson }));
    }
    expect(saved()).toEqual(first);
  });

  it('Esc fecha o diálogo de saída sem sair da lição', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?/ }));
    await user.click(screen.getByRole('button', { name: 'Sair da lição' }));
    expect(screen.getByRole('dialog', { name: 'Quer mesmo sair?' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'O que é um sinal de trânsito?' })).toBeInTheDocument();
  });

  it('dica: só libera após 60 s, pede confirmação e não conta como acerto de primeira', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage, true);
    await user.click(screen.getByRole('button', { name: /^Quem manda no trânsito\?/ }));
    await passCard(user);

    expect(screen.getByRole('button', { name: /Dica em 60s/ })).toBeDisabled();
    for (let i = 0; i < 60; i++) await act(async () => void vi.advanceTimersByTime(1000));
    await user.click(screen.getByRole('button', { name: /^💡 Dica$/ }));

    // confirmação avisando que a pontuação cai
    const dialog = screen.getByRole('dialog', { name: 'Usar a dica?' });
    expect(dialog).toHaveTextContent(/não vai contar como acerto de primeira/);
    expect(dialog).toHaveTextContent(/diminui a sua pontuação/);
    await user.click(within(dialog).getByRole('button', { name: 'Usar a dica' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // 1º degrau: "Para guardar" do cartão; 2º: risca uma errada com a explicação
    expect(screen.getByRole('note', { name: 'Dica' })).toHaveTextContent('Lembre do cartão');
    await user.click(screen.getByRole('button', { name: /Mais uma dica/ }));
    expect(screen.getByRole('radio', { name: /eliminada pela dica/ })).toBeDisabled();
    expect(screen.getByRole('note', { name: 'Dica' })).toHaveTextContent('Pode riscar');
    expect(screen.queryByRole('button', { name: /Dica/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Anúncios publicitários à beira da via' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Acerto com dica');
    expect(JSON.parse(storage.getItem('cnhquest:progress:v1')!).questions['w1-l1-q1'].box).toBe(1);
  });
});

afterEach(() => {
  vi.useRealTimers();
});

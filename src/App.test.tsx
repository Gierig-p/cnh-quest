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
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

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
    expect(within(status).getByRole('link', { name: 'Código de Trânsito Brasileiro' })).toHaveAttribute('href', expect.stringContaining('planalto.gov.br'));
    expect(status).toHaveTextContent('arts. 80 e 87');

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

  it('teclado: número escolhe a alternativa e Enter verifica', async () => {
    const storage = memoryStorage();
    storage.setItem('cnhquest:progress:v1', JSON.stringify({ version: 1, onboarded: true }));
    const { user } = setup(storage);
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?/ }));
    await user.keyboard('{Enter}'); // continua o conceito
    await user.keyboard('1');
    expect(screen.getAllByRole('radio').some((r) => r.getAttribute('aria-checked') === 'true')).toBe(true);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toBeInTheDocument();
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
    const lesson = /Quem manda no trânsito\?/;
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
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?/ }));
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
    await user.click(screen.getByRole('button', { name: /Quem manda no trânsito\?/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

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

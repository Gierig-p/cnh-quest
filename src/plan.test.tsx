import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { WORLDS } from './content';
import { daysBetween, finalDaysFor, ROUND_MIN, REVIEW_MIN, studyPlan } from './engine/plan';
import { initialProgress, lessonRounds, type ProgressState } from './engine/progress';
import { planText, ExamPlan } from './components/ExamPlan';
import { AppStateProvider } from './state/AppState';
import { createLocalStore } from './storage/progressStore';

const NOW = new Date(2026, 10, 14, 10); // 14/11/2026
const totalRounds = WORLDS.reduce((n, w) => n + w.lessons.reduce((m, l) => m + lessonRounds(l), 0), 0);

function allDone(): ProgressState {
  const s = initialProgress();
  for (const w of WORLDS) for (const l of w.lessons) s.lessons[l.id] = { completed: true, mastered: true, bestAccuracy: 1, attempts: 1, roundsDone: lessonRounds(l) };
  return s;
}

describe('plano até a prova', () => {
  it('conta os dias entre datas, mesmo virando o mês', () => {
    expect(daysBetween('2026-11-14', '2026-11-24')).toBe(10);
    expect(daysBetween('2026-11-30', '2026-12-01')).toBe(1);
    expect(daysBetween('2026-11-14', '2026-11-13')).toBe(-1);
  });
  it('guarda dias finais para simulados conforme o tempo', () => {
    expect([1, 2, 3, 6, 7, 30].map(finalDaysFor)).toEqual([0, 0, 1, 1, 2, 2]);
  });
  it('divide as lições que faltam pelos dias de estudo', () => {
    const p = studyPlan(initialProgress(), WORLDS, '2026-11-24', NOW); // 10 dias, 2 para simulados
    expect(p.phase).toBe('study');
    expect(p.roundsLeft).toBe(totalRounds);
    expect(p.roundsPerDay).toBe(Math.ceil(totalRounds / 8));
    expect(p.minutesPerDay).toBe(p.roundsPerDay * ROUND_MIN + REVIEW_MIN);
    expect(p.tight).toBe(false);
  });
  it('com pouco tempo, avisa que está apertado', () => {
    const p = studyPlan(initialProgress(), WORLDS, '2026-11-15', NOW); // 1 dia
    expect(p.roundsPerDay).toBe(totalRounds);
    expect(p.tight).toBe(true);
    expect(planText(p).join(' ')).toMatch(/tempo está curto/);
  });
  it('lições terminadas: simulado por dia; prova hoje; data passada', () => {
    expect(studyPlan(allDone(), WORLDS, '2026-11-20', NOW).phase).toBe('done');
    expect(studyPlan(initialProgress(), WORLDS, '2026-11-14', NOW).phase).toBe('today');
    expect(studyPlan(initialProgress(), WORLDS, '2026-11-01', NOW).phase).toBe('past');
  });
});

describe('bloco da prova no cartão Hoje', () => {
  function setup(state: Partial<ProgressState> = {}) {
    const m = new Map<string, string>();
    m.set('cnhquest:progress:v1', JSON.stringify({ ...initialProgress(), onboarded: true, ...state }));
    const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) } as Storage;
    render(<AppStateProvider store={createLocalStore(storage)}><ExamPlan /></AppStateProvider>);
    return { m, user: userEvent.setup() };
  }
  it('marca a data e mostra o plano', async () => {
    const { m, user } = setup();
    await user.click(screen.getByRole('button', { name: /Marcar a data da prova/ }));
    const salvar = screen.getByRole('button', { name: 'Salvar' });
    expect(salvar).toBeDisabled();
    const d = new Date();
    d.setDate(d.getDate() + 10);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    await user.type(screen.getByLabelText('Data da prova'), key);
    await user.click(salvar);
    expect(await screen.findByText('Prova em 10 dias')).toBeInTheDocument();
    expect(screen.getByText(/lições por dia, cerca de/)).toBeInTheDocument();
    expect(JSON.parse(m.get('cnhquest:progress:v1')!).examDate).toBe(key);
  });
  it('"Usar a meta" troca a meta diária pela sugerida; "Tirar a data" apaga', async () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const { m, user } = setup({ examDate: key, dailyGoal: 10 });
    await user.click(screen.getByRole('button', { name: /Usar a meta/ }));
    expect(JSON.parse(m.get('cnhquest:progress:v1')!).dailyGoal).toBe(50);
    await user.click(screen.getByRole('button', { name: 'Mudar a data' }));
    await user.click(screen.getByRole('button', { name: 'Tirar a data' }));
    expect(await screen.findByRole('button', { name: /Marcar a data da prova/ })).toBeInTheDocument();
    expect(JSON.parse(m.get('cnhquest:progress:v1')!).examDate).toBeUndefined();
  });
});

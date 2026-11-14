import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  MISSION_XP,
  addXp,
  completePractice,
  initialProgress,
  pauseBackOn,
  streakOnPause,
  todayMission,
  type ProgressState,
} from './engine/progress';
import type { SessionResult } from './engine/session';
import { DailyMission, PauseNote, pauseStatus } from './components/DailyMission';
import { AppStateProvider } from './state/AppState';

const day = (d: number) => new Date(2026, 10, d, 12);
const res = (total: number, correct: number): SessionResult => ({ lessonId: 'x', total, correctFirstTry: correct, accuracy: total ? correct / total : 0, missed: [], completed: true });

describe('pausa da ofensiva (pedido do dono, 14/11)', () => {
  it('um dia sem estudo não quebra a ofensiva, e a pausa fica registrada', () => {
    const s: ProgressState = { ...initialProgress(), streak: { count: 4, best: 4, lastDay: '2026-11-12' } };
    expect(streakOnPause(s.streak, day(14))).toBe('2026-11-13');
    const x = addXp(s, 10, day(14));
    expect(x.pauseUsed).toBe(true);
    expect(x.state.streak).toMatchObject({ count: 5, lastDay: '2026-11-14', pauses: ['2026-11-13'] });
    expect(pauseBackOn(x.state.streak, day(14))).toBe('2026-11-20');
  });

  it('a pausa vale uma vez a cada 7 dias', () => {
    const s: ProgressState = { ...initialProgress(), streak: { count: 9, best: 9, lastDay: '2026-11-18', pauses: ['2026-11-13'] } };
    // perdeu o dia 19, menos de 7 dias depois da última pausa: quebra
    const x = addXp(s, 10, day(20));
    expect(x.pauseUsed).toBe(false);
    expect(x.state.streak.count).toBe(1);
    // perdeu o dia 20: 7 dias depois, a pausa volta a valer
    const s2: ProgressState = { ...s, streak: { ...s.streak, lastDay: '2026-11-19' } };
    expect(addXp(s2, 10, day(21)).state.streak.count).toBe(10);
  });

  it('dois dias seguidos sem estudo quebram a ofensiva', () => {
    const s: ProgressState = { ...initialProgress(), streak: { count: 4, best: 4, lastDay: '2026-11-11' } };
    expect(streakOnPause(s.streak, day(14))).toBeNull();
    expect(addXp(s, 10, day(14)).state.streak.count).toBe(1);
  });

  it('estudar no dia seguinte não gasta a pausa', () => {
    const s: ProgressState = { ...initialProgress(), streak: { count: 4, best: 4, lastDay: '2026-11-13' } };
    const x = addXp(s, 10, day(14));
    expect(x.pauseUsed).toBe(false);
    expect(x.state.streak.pauses).toBeUndefined();
  });

  it('texto da tela de Progresso', () => {
    expect(pauseStatus(null)).toMatch(/disponível/);
    expect(pauseStatus('2026-11-15', day(14))).toMatch(/Volta amanhã/);
  });
});

describe('missão do dia (pedido do dono, 14/11)', () => {
  it('é a mesma o dia todo e muda no dia seguinte', () => {
    const s = initialProgress();
    expect(todayMission(s, day(14)).id).toBe(todayMission(s, new Date(2026, 10, 14, 23)).id);
    const ids = new Set([13, 14, 15].map((d) => todayMission(s, day(d)).id));
    expect(ids.size).toBe(3);
  });

  it('"acertos" soma os acertos de primeira e dá o XP extra uma vez só', () => {
    const s: ProgressState = { ...initialProgress(), mission: { date: '2026-11-14', id: 'acertos', count: 0, done: false } };
    const a = completePractice(s, res(6, 6), day(14));
    expect(a.missionXp).toBe(0);
    expect(a.state.mission).toMatchObject({ count: 6, done: false });
    const b = completePractice(a.state, res(6, 5), day(14));
    expect(b.missionXp).toBe(MISSION_XP);
    expect(b.state.xp).toBe(a.state.xp + 10 + MISSION_XP);
    const c = completePractice(b.state, res(6, 6), day(14));
    expect(c.missionXp).toBe(0);
  });

  it('"perfeita" só conta sessão sem erro', () => {
    const s: ProgressState = { ...initialProgress(), mission: { date: '2026-11-14', id: 'perfeita', count: 0, done: false } };
    expect(completePractice(s, res(6, 5), day(14)).missionXp).toBe(0);
    expect(completePractice(s, res(6, 6), day(14)).missionXp).toBe(MISSION_XP);
  });

  it('missão de ontem não vale hoje', () => {
    const s: ProgressState = { ...initialProgress(), mission: { date: '2026-11-13', id: 'sessoes', count: 2, done: true } };
    expect(todayMission(s, day(14))).toMatchObject({ count: 0, done: false });
  });
});

describe('cartão Hoje: missão e pausa', () => {
  const seed = (p: Partial<ProgressState>) => {
    localStorage.clear();
    localStorage.setItem('cnhquest:progress:v1', JSON.stringify({ ...initialProgress(), onboarded: true, ...p }));
  };

  it('mostra a missão com o andamento', () => {
    const now = new Date();
    seed({});
    render(
      <AppStateProvider>
        <DailyMission />
      </AppStateProvider>,
    );
    const m = todayMission(initialProgress(), now);
    expect(screen.getByText(m.text, { exact: false })).toBeTruthy();
    expect(screen.getByText(`0/${m.target}`)).toBeTruthy();
  });

  it('avisa quando a pausa segura a ofensiva', () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    const p = (n: number) => String(n).padStart(2, '0');
    seed({ streak: { count: 6, best: 6, lastDay: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` } });
    render(
      <AppStateProvider>
        <PauseNote />
      </AppStateProvider>,
    );
    expect(screen.getByText(/Ontem você não estudou/)).toBeTruthy();
  });
});

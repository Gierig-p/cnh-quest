import { MISSION_XP, PAUSE_EVERY, dayLabel, streakOnPause, todayMission } from '../engine/progress';
import { useApp } from '../state/AppState';

/** Missão do dia, dentro do cartão Hoje (pedido do dono, 14/11/2026). */
export function DailyMission() {
  const { progress } = useApp();
  const m = todayMission(progress);
  const pct = Math.round((m.count / m.target) * 100);
  return (
    <div className={`mission ${m.done ? 'done' : ''}`}>
      <span className="mission-icon" aria-hidden="true">{m.done ? '✅' : '🎯'}</span>
      <div className="grow">
        <p className="mission-text">
          {m.done ? (
            <>
              <strong>Missão do dia cumprida!</strong> +{MISSION_XP} XP
            </>
          ) : (
            <>
              <strong>Missão do dia:</strong> {m.text}. Vale +{MISSION_XP} XP.
            </>
          )}
        </p>
        {!m.done && (
          <div className="meter" role="progressbar" aria-label="Andamento da missão do dia" aria-valuemin={0} aria-valuemax={m.target} aria-valuenow={m.count}>
            <span style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      {!m.done && <span className="mission-count">{m.count}/{m.target}</span>}
    </div>
  );
}

/** Aviso da pausa da ofensiva: ontem não teve estudo, mas a sequência ainda vale se estudar hoje. */
export function PauseNote() {
  const { progress } = useApp();
  if (!streakOnPause(progress.streak)) return null;
  return (
    <p className="pause-note">
      <span aria-hidden="true">🛟</span> Ontem você não estudou. A <strong>pausa da semana</strong> segura a sua ofensiva de {progress.streak.count}{' '}
      {progress.streak.count === 1 ? 'dia' : 'dias'}: estude hoje para continuar.
    </p>
  );
}

/** Texto da pausa para a tela de Progresso. */
export function pauseStatus(back: string | null, now: Date = new Date()): string {
  return back
    ? `Pausa da ofensiva já usada nesta semana. Volta ${dayLabel(back, now)}.`
    : `Pausa da ofensiva disponível: se ficar um dia sem estudar, a ofensiva não quebra (uma vez a cada ${PAUSE_EVERY} dias).`;
}

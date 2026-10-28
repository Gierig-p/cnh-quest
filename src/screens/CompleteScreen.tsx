import { useEffect } from 'react';
import { QUESTION_BY_ID } from '../content';
import { Confetti } from '../components/Fx';
import { IconBolt, IconFire, IconMedal, IconTarget } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { ACHIEVEMENTS, type CompletionOutcome } from '../engine/progress';
import type { SessionResult } from '../engine/session';
import { useApp } from '../state/AppState';
import { useCountUp, useSound } from '../ui/hooks';

function StatTile({ label, value, suffix = '', color, icon, delay }: { label: string; value: number; suffix?: string; color: string; icon: JSX.Element; delay: number }) {
  const play = useSound();
  const shown = useCountUp(value, { delay: delay + 250, duration: 800, onTick: label === 'XP ganho' ? () => play('xp') : undefined });
  return (
    <div className="tile" style={{ ['--c' as string]: color, animationDelay: `${delay}ms` }}>
      <div className="h">{label}</div>
      <div className="v">
        {icon}
        <span>
          {label === 'XP ganho' ? '+' : ''}
          {shown}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function CompleteScreen({
  title,
  result,
  outcome,
  nextLabel,
  onContinue,
  onRetry,
}: {
  title: string;
  result: SessionResult;
  outcome: CompletionOutcome | null;
  nextLabel: string;
  onContinue: () => void;
  onRetry?: () => void;
}) {
  const { progress } = useApp();
  const play = useSound();
  const pct = Math.round(result.accuracy * 100);
  const good = result.completed && (outcome ? outcome.mastered : pct >= 80);
  const newAch = outcome?.newAchievements ?? [];

  // sequência sonora: conclusão → celebração (domínio) → conquista
  useEffect(() => {
    if (!result.completed) return;
    play('complete');
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (good) timers.push(setTimeout(() => play('celebrate'), 1300));
    if (newAch.length) timers.push(setTimeout(() => play('achievement'), good ? 2300 : 1400));
    return () => timers.forEach(clearTimeout);
    // toca uma vez por tela
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const topics = [...new Set(result.missed.map((id) => QUESTION_BY_ID[id]?.topic).filter(Boolean))];
  // lição com várias rodadas: mostra em qual rodada o aluno está
  const roundsLeft = Boolean(outcome && result.completed && outcome.roundsDone < outcome.rounds);
  const showRound = outcome && outcome.rounds > 1 && (outcome.round > 1 || outcome.roundsDone < outcome.rounds);
  const roundName = showRound ? `Rodada ${outcome.round} de ${outcome.rounds}` : 'Lição';
  const heading = !result.completed
    ? 'As vidas acabaram'
    : good
      ? `${roundName} concluída!`
      : `${roundName} concluída — dá para melhorar`;

  return (
    <div className={`complete ${good ? 'is-good' : result.completed ? '' : 'is-out'}`}>
      {good && <Confetti />}
      <div className="complete-inner">
        <div className="hero">
          <span className="rays" aria-hidden="true" />
          <Lumi mood={good ? 'cheer' : result.completed ? 'happy' : 'sad'} size={140} />
        </div>
        <div>
          <h1 className="complete-title">{heading}</h1>
          <p className="muted complete-sub">{title}</p>
        </div>

        <div className="tiles">
          <StatTile label="XP ganho" value={outcome?.xpGained ?? 0} color="var(--purple)" icon={<IconBolt size={22} />} delay={150} />
          <StatTile label="Acertos" value={pct} suffix="%" color={pct >= 80 ? 'var(--green)' : 'var(--orange)'} icon={<IconTarget size={22} />} delay={280} />
          <div className="tile" style={{ ['--c' as string]: 'var(--blue)', animationDelay: '410ms' }}>
            <div className="h">Questões</div>
            <div className="v">
              <span>{result.correctFirstTry}/{result.total}</span>
            </div>
          </div>
        </div>

        {(outcome?.streakIncreased || outcome?.goalReachedNow || newAch.length > 0) && (
          <ul className="rewards" aria-label="Recompensas">
            {outcome?.streakIncreased && (
              <li className="reward streak">
                <span className="reward-icon"><IconFire size={26} /></span>
                <span>{progress.streak.count === 1 ? 'Ofensiva iniciada: 1 dia de estudo!' : `Ofensiva: ${progress.streak.count} dias seguidos!`}</span>
              </li>
            )}
            {outcome?.goalReachedNow && (
              <li className="reward goal">
                <span className="reward-icon"><IconTarget size={26} /></span>
                <span>Meta diária atingida!</span>
              </li>
            )}
            {newAch.map((a) => (
              <li key={a} className="reward achievement">
                <span className="reward-icon"><IconMedal size={28} /></span>
                <span>
                  Conquista: <strong>{ACHIEVEMENTS[a].title}</strong> — {ACHIEVEMENTS[a].description}
                </span>
              </li>
            ))}
          </ul>
        )}

        {result.missed.length > 0 ? (
          <div className="card review-list">
            <h2>Para revisar ({result.missed.length} {result.missed.length === 1 ? 'erro' : 'erros'})</h2>
            <ul className="topic-chips">
              {topics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="muted">Essas questões voltam na aba “Revisar” nos próximos dias.</p>
          </div>
        ) : (
          result.completed && <p className="perfect">Nenhum erro. Excelente!</p>
        )}
        {roundsLeft && outcome && (
          <p className="notice">
            Falta a rodada {outcome.roundsDone + 1} de {outcome.rounds}: só prática, mais curta, sem explicação nova. Ela fixa o assunto antes da próxima lição.
          </p>
        )}
        {outcome && !outcome.mastered && result.completed && (
          <p className="notice">Para dominar esta lição, acerte pelo menos 80% na primeira tentativa. Você pode refazê-la quando quiser.</p>
        )}

        <div className="stack complete-actions">
          <button className="btn wide" autoFocus onClick={() => { play('tap'); onContinue(); }}>{nextLabel}</button>
          {onRetry && <button className="btn ghost wide" onClick={onRetry}>Refazer lição</button>}
        </div>
      </div>
    </div>
  );
}

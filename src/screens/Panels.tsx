import { QUESTIONS } from '../content';
import { IconBolt, IconClipboard, IconFire, IconMedal, IconReview, IconSound, IconSoundOff, IconTarget } from '../components/Icons';
import { playSound } from '../ui/sound';
import { ACHIEVEMENTS, dayKey, dueQuestions, levelFromXp, topicReport } from '../engine/progress';
import { useApp } from '../state/AppState';

export function TopStats() {
  const { progress, update } = useApp();
  const lvl = levelFromXp(progress.xp);
  const studiedToday = progress.streak.lastDay === dayKey(new Date());
  const sound = progress.prefs.sound;
  const toggleSound = () => {
    update((p) => ({ ...p, prefs: { ...p.prefs, sound: !sound } }));
    if (!sound) playSound('tap', true);
  };
  return (
    <div className="topstats">
      <button type="button" className={`stat sound-toggle ${sound ? 'on' : ''}`} aria-pressed={sound} aria-label="Efeitos sonoros" title={sound ? 'Desativar efeitos sonoros' : 'Ativar efeitos sonoros'} onClick={toggleSound}>
        {sound ? <IconSound /> : <IconSoundOff />}
      </button>
      <span className={`stat streak ${studiedToday ? 'on' : ''}`} title="Ofensiva: dias seguidos de estudo" aria-label={`Ofensiva de ${progress.streak.count} dias${studiedToday ? '' : ', ainda não estudou hoje'}`}>
        <IconFire /> {progress.streak.count}
      </span>
      <span className="stat xp" title="XP total" aria-label={`${progress.xp} pontos de experiência`}>
        <IconBolt /> {progress.xp}
      </span>
      <span className="stat lvl" title="Nível" aria-label={`Nível ${lvl.level}`}>Nv {lvl.level}</span>
    </div>
  );
}

export function DailyGoalCard() {
  const { progress } = useApp();
  const today = dayKey(new Date());
  const xp = progress.daily.date === today ? progress.daily.xp : 0;
  const pct = Math.min(100, Math.round((xp / progress.dailyGoal) * 100));
  return (
    <section className="card" aria-labelledby="goal-h">
      <h2 id="goal-h">Meta do dia</h2>
      <div className="row">
        <span className={`card-icon ${pct >= 100 ? 'green' : 'yellow'}`} aria-hidden="true">{pct >= 100 ? <IconTarget size={26} /> : <IconBolt size={26} />}</span>
        <div className="grow">
          <div className="meter-label"><span>{pct >= 100 ? 'Meta cumprida!' : 'Ganhe XP hoje'}</span><span className="muted">{xp} / {progress.dailyGoal} XP</span></div>
          <div className={`meter ${pct >= 100 ? 'green' : ''}`} role="progressbar" aria-label="Meta diária" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReviewCard({ onReview }: { onReview: () => void }) {
  const { progress } = useApp();
  const due = dueQuestions(progress, new Date());
  return (
    <section className={`card ${due.length ? 'card-alert' : ''}`} aria-labelledby="rev-h">
      <h2 id="rev-h" className="card-title"><span className="card-icon blue" aria-hidden="true"><IconReview size={22} /></span>Revisões pendentes</h2>
      {due.length ? (
        <>
          <p className="muted" style={{ marginBottom: 12 }}>{due.length} {due.length === 1 ? 'questão está' : 'questões estão'} no ponto de revisar.</p>
          <button className="btn blue wide" onClick={onReview}>Revisar agora</button>
        </>
      ) : (
        <p className="muted">Nada pendente. Questões erradas e já estudadas voltam aqui no dia certo.</p>
      )}
    </section>
  );
}

export function WeakTopicsCard() {
  const { progress } = useApp();
  const weak = topicReport(progress).filter((t) => t.status === 'fraco');
  if (!weak.length) return null;
  return (
    <section className="card" aria-labelledby="weak-h">
      <h2 id="weak-h">Precisa de atenção</h2>
      <ul className="list">
        {weak.slice(0, 4).map((t) => (
          <li key={t.topic} className="row">
            <span className="grow">{t.topic}</span>
            <span className="pill fraco">{Math.round(t.accuracy * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ExamCard({ onExam }: { onExam: () => void }) {
  const { progress } = useApp();
  const last = progress.exams[progress.exams.length - 1];
  return (
    <section className="card" aria-labelledby="exam-h">
      <h2 id="exam-h" className="card-title"><span className="card-icon yellow" aria-hidden="true"><IconClipboard size={22} /></span>Simulado</h2>
      <p className="muted" style={{ marginBottom: 12 }}>
        {last ? `Último: ${last.correct}/${last.total} — ${last.passed ? 'aprovado' : 'reprovado'}.` : 'Treine no formato da prova, com cronômetro.'}
      </p>
      <button className="btn yellow wide" onClick={onExam}>Abrir simulado</button>
    </section>
  );
}

export function AchievementsCard() {
  const { progress } = useApp();
  const got = progress.achievements.length;
  const total = Object.keys(ACHIEVEMENTS).length;
  return (
    <section className="card" aria-labelledby="ach-h">
      <h2 id="ach-h" className="card-title"><span className="card-icon gold" aria-hidden="true"><IconMedal size={22} /></span>Conquistas</h2>
      <p className="muted">{got} de {total} desbloqueadas</p>
      <div className="meter green" style={{ marginTop: 8 }} role="progressbar" aria-label="Conquistas" aria-valuenow={got} aria-valuemin={0} aria-valuemax={total}>
        <span style={{ width: `${(got / total) * 100}%` }} />
      </div>
      <p className="muted" style={{ marginTop: 10, fontSize: 13 }}>{QUESTIONS.length} questões verificadas no banco atual.</p>
    </section>
  );
}

import { useState } from 'react';
import { EXAM_CONFIGS } from '../content';
import { IconBolt, IconChart, IconClipboard, IconFire, IconMedal } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { getVolume, playSound, setVolume } from '../ui/sound';
import { ACHIEVEMENTS, DAILY_GOALS, levelFromXp, topicReport, type Prefs } from '../engine/progress';
import { useApp } from '../state/AppState';

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="switch" onClick={() => onChange(!on)} />;
}

/** Estado vazio com a Lumi, usado nas seções sem dados. */
export function Empty({ children, mood = 'think' }: { children: React.ReactNode; mood?: 'think' | 'idle' | 'wave' }) {
  return (
    <div className="empty">
      <Lumi mood={mood} size={48} />
      <p>{children}</p>
    </div>
  );
}

function VolumeSlider({ enabled }: { enabled: boolean }) {
  const [v, setV] = useState(() => Math.round(getVolume() * 100));
  return (
    <input
      type="range"
      className="range"
      min={0}
      max={100}
      step={5}
      value={v}
      disabled={!enabled}
      aria-label="Volume dos efeitos"
      style={{ ['--v' as string]: `${v}%` }}
      onChange={(e) => {
        const n = Number(e.target.value);
        setV(n);
        setVolume(n / 100);
      }}
      onPointerUp={() => playSound('correct', enabled)}
      onKeyUp={() => playSound('tap', enabled)}
    />
  );
}

export function ProgressScreen() {
  const { progress, update, reset, volatile } = useApp();
  const [confirm, setConfirm] = useState(false);
  const lvl = levelFromXp(progress.xp);
  const setPref = <K extends keyof Prefs>(k: K, v: Prefs[K]) => update((p) => ({ ...p, prefs: { ...p.prefs, [k]: v } }));
  const report = topicReport(progress);

  return (
    <div className="stack">
      <h1 className="page-title">Progresso</h1>
      {volatile && <p className="notice">O armazenamento do navegador está bloqueado: o progresso será perdido ao recarregar.</p>}

      <section className="card level-card">
        <div className="level-badge" aria-hidden="true"><span>{lvl.level}</span></div>
        <div className="grow">
          <h2>Nível {lvl.level}</h2>
          <p className="muted">{progress.xp} XP no total · faltam {lvl.need - lvl.into} XP para o nível {lvl.level + 1}</p>
          <div className="meter purple" style={{ marginTop: 8 }} role="progressbar" aria-label="Progresso do nível" aria-valuenow={lvl.into} aria-valuemin={0} aria-valuemax={lvl.need}>
            <span style={{ width: `${(lvl.into / lvl.need) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-box orange"><IconFire size={28} /><strong>{progress.streak.count}</strong><span>Ofensiva atual</span></div>
        <div className="stat-box gold"><IconFire size={28} /><strong>{progress.streak.best}</strong><span>Recorde de ofensiva</span></div>
        <div className="stat-box purple"><IconBolt size={28} /><strong>{progress.xp}</strong><span>XP total</span></div>
        <div className="stat-box blue"><IconClipboard size={28} /><strong>{progress.exams.length}</strong><span>Simulados</span></div>
      </div>

      <section className="card">
        <h2 className="card-title"><span className="card-icon green" aria-hidden="true"><IconChart size={22} /></span>Desempenho por assunto</h2>
        {report.length ? (
          <ul className="list">
            {report.map((t) => (
              <li key={t.topic}>
                <div className="row"><span className="grow">{t.topic}</span><span className="muted">{Math.round(t.accuracy * 100)}% · {t.seen}</span></div>
                <div className={`meter ${t.accuracy >= 0.7 ? 'green' : ''}`} style={{ height: 10 }}><span style={{ width: `${t.accuracy * 100}%`, background: t.accuracy < 0.7 ? 'var(--red)' : undefined }} /></div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Ainda sem dados. Faça uma lição para ver seu desempenho por assunto.</Empty>
        )}
      </section>

      <section className="card">
        <h2>Simulados</h2>
        {progress.exams.length ? (
          <ul className="list">
            {[...progress.exams].reverse().slice(0, 8).map((e, i) => (
              <li key={i} className="row">
                <span className="grow">{new Date(e.at).toLocaleDateString('pt-BR')} — {e.correct}/{e.total}</span>
                <span className={`pill ${e.passed ? 'dominado' : 'fraco'}`}>{e.passed ? 'aprovado' : 'reprovado'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>Nenhum simulado feito ainda.</Empty>
        )}
      </section>

      <section className="card">
        <h2>Conquistas</h2>
        <ul className="list">
          {Object.entries(ACHIEVEMENTS).map(([id, a]) => {
            const got = progress.achievements.includes(id);
            return (
              <li key={id} className={`achv ${got ? '' : 'locked'}`}>
                <span className="medal" aria-hidden="true"><IconMedal size={28} /></span>
                <span><strong>{a.title}</strong><br /><span className="muted">{a.description}{got ? '' : ' (bloqueada)'}</span></span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2>Ajustes</h2>
        <div className="setting">
          <span id="lbl-goal">Meta diária</span>
          <select aria-labelledby="lbl-goal" value={progress.dailyGoal} onChange={(e) => update((p) => ({ ...p, dailyGoal: Number(e.target.value) }))}>
            {DAILY_GOALS.map((g) => (
              <option key={g.xp} value={g.xp}>{g.label} — {g.xp} XP (~{g.minutes} min)</option>
            ))}
          </select>
        </div>
        <div className="setting"><span>Efeitos sonoros</span><Switch on={progress.prefs.sound} onChange={(v) => { setPref('sound', v); if (v) playSound('tap', true); }} label="Efeitos sonoros" /></div>
        <div className="setting">
          <span>Volume<br /><span className="muted">Vale só para este aparelho.</span></span>
          <VolumeSlider enabled={progress.prefs.sound} />
        </div>
        <div className="setting">
          <span>Modo desafio (vidas nas lições)<br /><span className="muted">Cada erro tira 1 de 5 vidas.</span></span>
          <Switch on={progress.prefs.hearts} onChange={(v) => setPref('hearts', v)} label="Modo desafio com vidas" />
        </div>
        <div className="setting">
          <span id="lbl-motion">Animações</span>
          <select aria-labelledby="lbl-motion" value={progress.prefs.motion} onChange={(e) => setPref('motion', e.target.value as Prefs['motion'])}>
            <option value="system">Seguir o sistema</option>
            <option value="reduce">Reduzidas</option>
            <option value="full">Completas</option>
          </select>
        </div>
        <div className="setting">
          <span id="lbl-exam">Regra do simulado</span>
          <select aria-labelledby="lbl-exam" value={progress.prefs.examConfig} onChange={(e) => setPref('examConfig', e.target.value)}>
            {EXAM_CONFIGS.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 16 }}>
          {confirm ? (
            <div className="row">
              <button className="btn red grow" onClick={() => { reset(); setConfirm(false); }}>Apagar tudo</button>
              <button className="btn ghost" onClick={() => setConfirm(false)}>Cancelar</button>
            </div>
          ) : (
            <button className="btn ghost wide" onClick={() => setConfirm(true)}>Apagar meu progresso</button>
          )}
        </div>
        <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>O progresso fica salvo apenas neste navegador. Não há contas nesta versão.</p>
      </section>
    </div>
  );
}

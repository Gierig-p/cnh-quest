import { useState } from 'react';
import { WORLDS } from '../content';
import { PLANNED_WORLDS } from '../content/referenceModules';
import { DAILY_GOALS, dayKey } from '../engine/progress';
import { shortDate, studyPlan, type StudyPlan } from '../engine/plan';
import { useApp } from '../state/AppState';
import { Dialog, useDialogClose } from './Fx';
import { Lumi } from './Lumi';

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

/** Texto do plano, em frases curtas. */
export function planText(p: StudyPlan): string[] {
  switch (p.phase) {
    case 'past':
      return ['A data da prova já passou. Se você tem uma nova data, marque aqui.'];
    case 'today':
      return ['A prova é hoje! Revise com calma as questões que você errou e confie no que estudou. Boa prova!'];
    case 'done':
      return [
        'Você terminou as lições do app.',
        `Até a prova: um simulado por dia e a revisão das questões que errou (cerca de ${p.minutesPerDay} min).`,
      ];
    case 'study': {
      const out = [`Para terminar as lições a tempo: ${plural(p.roundsPerDay, 'lição', 'lições')} por dia, cerca de ${p.minutesPerDay} min.`];
      out.push(p.finalDays ? `Deixe ${p.finalDays === 1 ? 'o último dia' : `os últimos ${p.finalDays} dias`} antes da prova para simulados.` : 'Na véspera, faça um simulado.');
      if (p.tight) out.push('O tempo está curto. Se puder, estude um pouco mais por dia ou remarque a prova.');
      return out;
    }
  }
}

/** Bloco "Prova" dentro do cartão Hoje. */
export function ExamPlan() {
  const { progress, update } = useApp();
  const [editing, setEditing] = useState(false);
  const now = new Date();
  const date = progress.examDate;
  const plan = date ? studyPlan(progress, WORLDS, date, now) : null;
  const goal = plan && plan.phase === 'study' && plan.suggestedGoal !== progress.dailyGoal ? DAILY_GOALS.find((g) => g.xp === plan.suggestedGoal) : undefined;
  const total = WORLDS.length + PLANNED_WORLDS.length;

  return (
    <div className="exam-plan">
      {plan && date ? (
        <>
          <p className="exam-plan-head">
            <span aria-hidden="true">📅</span>{' '}
            <strong>
              {plan.phase === 'today' ? 'Prova hoje' : plan.phase === 'past' ? 'Prova marcada' : `Prova em ${plural(plan.daysLeft, 'dia', 'dias')}`}
            </strong>{' '}
            · {shortDate(date)}
          </p>
          {planText(plan).map((t) => (
            <p key={t} className="exam-plan-text">{t}</p>
          ))}
          {plan.phase === 'study' && WORLDS.length < total && (
            <p className="exam-plan-note">O app ainda tem {WORLDS.length} de {total} mundos. Estude também o curso oficial.</p>
          )}
          <div className="exam-plan-actions">
            {goal && (
              <button type="button" className="btn ghost sm" onClick={() => update((p) => ({ ...p, dailyGoal: goal.xp }))}>
                Usar a meta {goal.label} ({goal.xp} XP por dia)
              </button>
            )}
            <button type="button" className="link-btn" onClick={() => setEditing(true)}>Mudar a data</button>
          </div>
        </>
      ) : (
        <button type="button" className="link-btn" onClick={() => setEditing(true)}>
          📅 Marcar a data da prova
        </button>
      )}
      {editing && (
        <Dialog labelledBy="exam-date-title" onClose={() => setEditing(false)}>
          <ExamDateForm current={date} />
        </Dialog>
      )}
    </div>
  );
}

function ExamDateForm({ current }: { current?: string }) {
  const { update } = useApp();
  const close = useDialogClose();
  const today = dayKey(new Date());
  const [value, setValue] = useState(current && current >= today ? current : '');
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= today;
  return (
    <>
      <Lumi mood="think" size={84} />
      <h2 id="exam-date-title">Quando é a sua prova?</h2>
      <p>Com a data, o app calcula quanto estudar por dia para terminar a tempo.</p>
      <label className="exam-date-field">
        <span>Data da prova</span>
        <input type="date" value={value} min={today} onChange={(e) => setValue(e.target.value)} />
      </label>
      <div className="stack">
        <button
          className="btn"
          disabled={!ok}
          onClick={() => {
            update((p) => ({ ...p, examDate: value }));
            close();
          }}
        >
          Salvar
        </button>
        {current && (
          <button
            className="btn ghost"
            onClick={() => {
              update((p) => {
                const { examDate: _, ...rest } = p;
                return rest;
              });
              close();
            }}
          >
            Tirar a data
          </button>
        )}
      </div>
    </>
  );
}

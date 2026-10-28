import { QUESTIONS } from '../content';
import { IconReview } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { Empty } from './ProgressScreen';
import { dueQuestions, topicReport } from '../engine/progress';
import { useApp } from '../state/AppState';

export function ReviewScreen({ onPractice }: { onPractice: (title: string, ids: string[]) => void }) {
  const { progress } = useApp();
  const due = dueQuestions(progress, new Date());
  const report = topicReport(progress);
  const missedEver = Object.entries(progress.questions).filter(([, s]) => s.wrong > 0).map(([id]) => id);

  const topicIds = (topic: string) => QUESTIONS.filter((q) => q.topic === topic).map((q) => q.id);

  return (
    <div className="stack">
      <h1 className="page-title">Revisar</h1>
      <section className={`card hero-card blue ${due.length ? 'has-due' : ''}`}>
        <div className="row">
          <Lumi mood={due.length ? 'wave' : 'think'} size={64} />
          <div className="grow">
            <h2>Revisão espaçada</h2>
            <p className="muted">Questões que você errou voltam no mesmo dia; as que acertou voltam em 1, 2, 4, 8 e 16 dias.</p>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <button className="btn blue wide" disabled={!due.length} onClick={() => onPractice('Revisão do dia', due.slice(0, 12))}>
            {due.length ? `Revisar ${Math.min(12, due.length)} questões` : 'Nada para revisar hoje'}
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title"><span className="card-icon red" aria-hidden="true"><IconReview size={22} /></span>Erros anteriores</h2>
        <p className="muted" style={{ marginBottom: 12 }}>{missedEver.length ? `${missedEver.length} questões que você já errou alguma vez.` : 'Você ainda não errou nenhuma questão.'}</p>
        <button className="btn ghost wide" disabled={!missedEver.length} onClick={() => onPractice('Revisão de erros', missedEver.slice(0, 12))}>
          Treinar meus erros
        </button>
      </section>

      <section className="card">
        <h2>Por assunto</h2>
        {report.length === 0 ? (
          <Empty>Faça uma lição para ver seu desempenho por assunto.</Empty>
        ) : (
          <ul className="list">
            {report.map((t) => (
              <li key={t.topic} className="row">
                <span className="grow">
                  <strong>{t.topic}</strong>
                  <br />
                  <span className="muted">{t.seen} respondidas · {Math.round(t.accuracy * 100)}% de acerto</span>
                </span>
                <span className={`pill ${t.status === 'fraco' ? 'fraco' : t.status === 'dominado' ? 'dominado' : 'progresso'}`}>{t.status}</span>
                <button className="btn ghost sm" onClick={() => onPractice(t.topic, topicIds(t.topic))} aria-label={`Treinar ${t.topic}`}>
                  Treinar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

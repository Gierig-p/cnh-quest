import { useCallback, useRef, useState } from 'react';
import { WORLDS } from './content';
import type { Lesson } from './content/types';
import { IconChart, IconClipboard, IconHome, IconReview } from './components/Icons';
import { Lumi } from './components/Lumi';
import { addXp, completeLesson, dueQuestions, lessonFinished, nextLesson, nextRound, practiceRoundIds, type CompletionOutcome } from './engine/progress';
import { startPractice, startSession, summarize, type SessionResult, type SessionState } from './engine/session';
import { CompleteScreen } from './screens/CompleteScreen';
import { ExamScreen } from './screens/ExamScreen';
import { Home } from './screens/Home';
import { LessonPlayer } from './screens/LessonPlayer';
import { Onboarding } from './screens/Onboarding';
import { AchievementsCard, DailyGoalCard, ExamCard, ReviewCard, TopStats, WeakTopicsCard } from './screens/Panels';
import { ProgressScreen } from './screens/ProgressScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { useApp } from './state/AppState';
import { useSound } from './ui/hooks';

type Tab = 'home' | 'review' | 'exam' | 'progress';
type Route =
  | { name: 'tab'; tab: Tab }
  | { name: 'play'; session: SessionState; title: string; lesson?: Lesson; round?: number; back: Tab }
  | { name: 'done'; title: string; result: SessionResult; outcome: CompletionOutcome | null; lesson?: Lesson; round?: number; back: Tab };

const TABS: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: 'home', label: 'Trilha', icon: <IconHome /> },
  { id: 'review', label: 'Revisar', icon: <IconReview /> },
  { id: 'exam', label: 'Simulado', icon: <IconClipboard /> },
  { id: 'progress', label: 'Progresso', icon: <IconChart /> },
];

export default function App() {
  const { progress, update } = useApp();
  const [route, setRoute] = useState<Route>({ name: 'tab', tab: 'home' });
  const [onboarding, setOnboarding] = useState(!progress.onboarded);
  const dueCount = dueQuestions(progress, new Date()).length;
  const play = useSound();
  // referência ao estado mais recente: o resultado da lição é calculado na hora, não dentro do updater
  const latest = useRef(progress);
  latest.current = progress;

  const go = (tab: Tab) => {
    setRoute({ name: 'tab', tab });
    window.scrollTo({ top: 0 });
  };

  /** Abre a lição na rodada indicada (ou na próxima que falta). Rodada 2 em diante: só prática, sem cartões. */
  const startLesson = (lesson: Lesson, back: Tab = 'home', round = nextRound(latest.current, lesson)) => {
    const hearts = { hearts: latest.current.prefs.hearts };
    const session =
      round > 1
        ? startSession({ id: lesson.id, steps: practiceRoundIds(latest.current, lesson).map((questionId) => ({ kind: 'question' as const, questionId })) }, hearts)
        : startSession(lesson, hearts);
    setRoute({ name: 'play', session, title: lesson.title, lesson, round, back });
  };

  const startPracticeSession = (title: string, ids: string[], back: Tab) => {
    if (ids.length) setRoute({ name: 'play', session: startPractice(`pratica:${title}`, ids), title, back });
  };


  const finish = useCallback(
    (s: SessionState, lesson: Lesson | undefined, title: string, back: Tab, round?: number) => {
      const result = summarize(s);
      const now = new Date();
      let outcome: CompletionOutcome;
      if (lesson) outcome = completeLesson(latest.current, lesson, result, now);
      else {
        const gained = result.correctFirstTry * 2;
        const x = addXp(latest.current, gained, now);
        outcome = { state: x.state, xpGained: gained, streakIncreased: x.streakIncreased, goalReachedNow: x.goalReachedNow, newAchievements: [], mastered: result.accuracy >= 0.8, round: 1, rounds: 1, roundsDone: 1 };
      }
      latest.current = outcome.state;
      update(() => outcome.state);
      setRoute({ name: 'done', title, result, outcome, lesson, round, back });
    },
    [update],
  );

  if (onboarding) return <Onboarding onDone={() => setOnboarding(false)} />;

  if (route.name === 'play') {
    return (
      <LessonPlayer
        key={route.session.lessonId + route.title + (route.round ?? '')}
        initial={route.session}
        practice={(route.round ?? 1) > 1}
        onExit={() => go(route.back)}
        onFinish={(s) => finish(s, route.lesson, route.title, route.back, route.round)}
      />
    );
  }

  if (route.name === 'done') {
    const rec = nextLesson(progress, WORLDS);
    const nextIsSame = rec?.lesson.id === route.lesson?.id;
    // falta outra rodada desta mesma lição: o botão principal já leva a ela
    const nextRoundHere = route.lesson && route.result.completed && !lessonFinished(progress, route.lesson) ? nextRound(progress, route.lesson) : 0;
    const nextLabel = nextRoundHere > 1 ? `Fazer a rodada ${nextRoundHere}` : route.lesson && rec && !nextIsSame ? `Próxima: ${rec.lesson.title}` : 'Continuar';
    return (
      <CompleteScreen
        title={route.title}
        result={route.result}
        outcome={route.outcome}
        nextLabel={nextLabel}
        onContinue={() => (nextRoundHere > 1 ? startLesson(route.lesson!) : route.lesson && rec && !nextIsSame ? startLesson(rec.lesson) : go(route.back))}
        onRetry={route.lesson ? () => startLesson(route.lesson!, route.back, route.round) : undefined}
      />
    );
  }

  const tab = route.tab;
  return (
    <div className="app-shell">
      <nav className="sidenav" aria-label="Principal">
        <div className="brand">
          <Lumi size={34} />
          <span className="label">CNH Quest</span>
        </div>
        {TABS.map((t) => (
          <button key={t.id} className={`navlink nav-${t.id}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => { if (tab !== t.id) play('tap'); go(t.id); }}>
            <span className="nav-icon">{t.icon}</span>
            <span className="label">{t.label}</span>
            {t.id === 'review' && dueCount > 0 && <span className="badge" aria-label={`${dueCount} pendentes`}>{dueCount}</span>}
          </button>
        ))}
      </nav>

      <main className="main" id="conteudo">
        <div className="mobile-top mobile-only">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong className="mobile-brand"><Lumi size={22} /> CNH Quest</strong>
            <TopStats />
          </div>
        </div>
        <div className="tab-view" key={tab}>
          {tab === 'home' && <Home onStart={(l) => startLesson(l)} />}
          {tab === 'review' && <ReviewScreen onPractice={(title, ids) => startPracticeSession(title, ids, 'review')} />}
          {tab === 'exam' && <ExamScreen onPracticeWrong={(ids) => startPracticeSession('Erros do simulado', ids, 'exam')} />}
          {tab === 'progress' && <ProgressScreen />}
        </div>
      </main>

      <aside className="aside" aria-label="Resumo">
        <div className="desktop-only"><TopStats /></div>
        {tab === 'home' ? (
          <>
            <DailyGoalCard />
            <ReviewCard onReview={() => startPracticeSession('Revisão do dia', dueQuestions(progress, new Date()).slice(0, 12), 'home')} />
            <WeakTopicsCard />
            <ExamCard onExam={() => go('exam')} />
            <AchievementsCard />
          </>
        ) : (
          <div className="desktop-only"><DailyGoalCard /></div>
        )}
      </aside>

      <nav className="bottomnav" aria-label="Principal (celular)">
        {TABS.map((t) => (
          <button key={t.id} className={`navlink nav-${t.id}`} aria-current={tab === t.id ? 'page' : undefined} onClick={() => { if (tab !== t.id) play('tap'); go(t.id); }}>
            <span className="nav-icon">{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'review' && dueCount > 0 && <span className="badge">{dueCount}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}



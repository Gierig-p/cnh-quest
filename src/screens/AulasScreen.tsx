import { useEffect, useMemo, useRef } from 'react';
import { QUESTION_BY_ID, WORLDS } from '../content';
import { ConceptBlocks } from '../components/ConceptView';
import { IconAula } from '../components/Icons';
import { NarrationButton } from '../components/NarrationButton';
import { aulaCatalog, aulaMatches, aulaPracticeIds, unlockedAulaIds, type Aula } from '../engine/aulas';
import { useApp } from '../state/AppState';
import { Empty } from './ProgressScreen';

const CATALOG = aulaCatalog(WORLDS);

/** Lista das aulas já liberadas, por mundo e lição, com busca (aba Revisar › Aulas). */
export function AulasList({ onOpen, onBack, query, setQuery }: { onOpen: (a: Aula) => void; onBack: () => void; query: string; setQuery: (q: string) => void }) {
  const { progress } = useApp();
  const unlocked = useMemo(() => unlockedAulaIds(progress, CATALOG), [progress]);
  const mine = CATALOG.filter((a) => unlocked.has(a.card.id));
  const shown = mine.filter((a) => aulaMatches(a, query));
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);

  // agrupa por mundo e, dentro dele, por lição (na ordem da trilha)
  const groups: { world: Aula['world']; lessons: { lesson: Aula['lesson']; aulas: Aula[] }[] }[] = [];
  for (const a of shown) {
    let g = groups.find((x) => x.world.id === a.world.id);
    if (!g) groups.push((g = { world: a.world, lessons: [] }));
    let l = g.lessons.find((x) => x.lesson.id === a.lesson.id);
    if (!l) g.lessons.push((l = { lesson: a.lesson, aulas: [] }));
    l.aulas.push(a);
  }

  return (
    <div className="stack aulas">
      <button className="btn ghost sm back-link" onClick={onBack}>‹ Voltar para Revisar</button>
      <h1 className="page-title" ref={titleRef} tabIndex={-1}>Aulas</h1>
      <p className="muted">Reveja os vídeos e os resumos das explicações que você já estudou.</p>
      {mine.length === 0 ? (
        <Empty>Faça a primeira lição da trilha para encontrar suas aulas aqui.</Empty>
      ) : (
        <>
          <input type="search" className="aula-search" placeholder="Buscar uma aula" aria-label="Buscar uma aula" value={query} onChange={(e) => setQuery(e.target.value)} />
          {shown.length === 0 && <Empty>Nenhuma aula com “{query}”.</Empty>}
          {groups.map((g) => (
            <section key={g.world.id} className="card">
              <h2>Mundo {g.world.order}: {g.world.title}</h2>
              {g.lessons.map((l) => (
                <div key={l.lesson.id} className="aula-lesson">
                  <h3 className="muted">{l.lesson.title}</h3>
                  <ul className="list">
                    {l.aulas.map((a) => (
                      <li key={a.card.id}>
                        <button className="aula-item" onClick={() => onOpen(a)}>
                          <span className="card-icon blue" aria-hidden="true"><IconAula size={22} /></span>
                          <span className="grow">
                            <strong>{a.card.title}</strong>
                            <br />
                            <span className="muted">{a.card.video ? 'Vídeo e resumo' : 'Texto e áudio'}</span>
                          </span>
                          <span aria-hidden="true" className="aula-arrow">›</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
          {mine.length < CATALOG.length && !query && <p className="muted center">Outras aulas aparecem conforme você avança na trilha.</p>}
        </>
      )}
    </div>
  );
}

/** Uma aula: vídeo (ou texto e áudio), resumo, palavras novas, "Para guardar" e a prática só dela. */
export function AulaView({ aula, onBack, onPractice }: { aula: Aula; onBack: () => void; onPractice: (title: string, ids: string[]) => void }) {
  const { card, lesson, world } = aula;
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);
  const practice = () => onPractice(`Aula: ${card.title}`, aulaPracticeIds(lesson, card.id, (id) => QUESTION_BY_ID[id]?.objective ?? id));
  const hasQuestions = aulaPracticeIds(lesson, card.id, (id) => id).length > 0;
  return (
    <div className="stack aulas">
      <button className="btn ghost sm back-link" onClick={onBack}>‹ Voltar para Aulas</button>
      <section className="card concept aula-view" aria-labelledby="aula-title">
        <div className="q-tags">
          <div className="q-tag">Mundo {world.order} · {lesson.title}</div>
        </div>
        <h1 id="aula-title" className="q-title" ref={titleRef} tabIndex={-1}>{card.title}</h1>
        {!card.video && <NarrationButton cardId={card.id} />}
        <ConceptBlocks card={card} show={card.video ? ['video', 'resumo', 'terms', 'guardar'] : ['body', 'terms', 'points', 'example']} />
      </section>
      {hasQuestions && (
        <button className="btn blue wide" onClick={practice}>Praticar esta aula</button>
      )}
    </div>
  );
}

import { useEffect } from 'react';
import { WORLDS } from '../content';
import { PLANNED_WORLDS, REFERENCE_MODULES, worldReferenceModules } from '../content/referenceModules';
import type { Lesson, ReferenceModuleId, World } from '../content/types';
import { Burst } from '../components/Fx';
import { IconCheck, IconChest, IconCrown, IconLock, IconRoad, IconShield, IconSign, IconStar, IconTrophy } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { lessonState, nextLesson, worldCompleted, type NodeState } from '../engine/progress';
import { useApp } from '../state/AppState';
import { useSound } from '../ui/hooks';

/** Etiquetas dos módulos de referência (organização pedagógica própria do app). */
function ModuleTags({ ids }: { ids: ReferenceModuleId[] }) {
  return (
    <ul className="module-tags" aria-label="Módulos de referência">
      {ids.map((m) => (
        <li key={m} className="module-tag" title={REFERENCE_MODULES[m].origin}>
          Módulo {m} · {REFERENCE_MODULES[m].title}
        </li>
      ))}
    </ul>
  );
}

/* Geometria da estrada: deslocamento horizontal de cada nó (px) e altura fixa de cada linha. */
const OFFSETS = [0, -48, -72, -48, 0, 48, 72, 48];
const ROW = 112;
const NODE_CY = 38;
const HALF = 110;

/** Lembra o estado de cada nó entre visitas à trilha, para animar desbloqueios e domínios. */
const seenState = new Map<string, NodeState>();

function NodeIcon({ lesson, state }: { lesson: Lesson; state: NodeState }) {
  if (state === 'locked') return <IconLock />;
  if (state === 'mastered') return <IconCrown size={34} />;
  switch (lesson.icon) {
    case 'sign':
      return <IconSign />;
    case 'shield':
      return <IconShield />;
    case 'review':
      return <IconChest />;
    case 'trophy':
      return <IconTrophy />;
    default:
      return <IconStar />;
  }
}

const STATE_LABEL: Record<NodeState, string> = {
  locked: 'bloqueada',
  available: 'disponível',
  completed: 'concluída',
  mastered: 'dominada',
};

/** Caminho suave (curvas de Bézier) passando pelo centro de cada nó. */
function roadPath(points: { x: number; y: number }[]) {
  if (!points.length) return '';
  let d = `M${points[0].x} ${points[0].y - NODE_CY}`;
  d += ` L${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    d += ` C${a.x} ${a.y + ROW / 2} ${b.x} ${b.y - ROW / 2} ${b.x} ${b.y}`;
  }
  return d;
}

function Road({ offsets, traveled }: { offsets: number[]; traveled: number }) {
  const pts = offsets.map((o, i) => ({ x: HALF + o, y: i * ROW + NODE_CY }));
  const full = roadPath(pts);
  const done = traveled > 0 ? roadPath(pts.slice(0, traveled + 1)) : '';
  const h = offsets.length * ROW;
  return (
    <svg className="road" width={HALF * 2} height={h} viewBox={`0 0 ${HALF * 2} ${h}`} aria-hidden="true" focusable="false">
      <path d={full} className="road-base" vectorEffect="non-scaling-stroke" />
      <path d={full} className="road-dots" vectorEffect="non-scaling-stroke" />
      {done && (
        <>
          <path d={done} className="road-paved" vectorEffect="non-scaling-stroke" />
          <path d={done} className="road-lane" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}

function WorldPath({ world, index, prev, onStart }: { world: World; index: number; prev?: World; onStart: (l: Lesson) => void }) {
  const { progress } = useApp();
  const play = useSound();
  const rec = nextLesson(progress, WORLDS);
  const dir = index % 2 === 0 ? 1 : -1;
  const done = world.lessons.filter((l) => progress.lessons[l.id]?.completed).length;
  const states = world.lessons.map((l) => lessonState(progress, world, l, prev));
  const offsets = world.lessons.map((_, i) => OFFSETS[i % OFFSETS.length] * dir);
  const currentIdx = world.lessons.findIndex((l) => l.id === rec?.lesson.id);
  // até onde a estrada já está "asfaltada": o último nó liberado
  const lastOpen = states.reduce((acc, st, i) => (st !== 'locked' ? i : acc), -1);
  const traveled = Math.max(0, currentIdx >= 0 ? currentIdx : lastOpen);
  const pct = Math.round((done / world.lessons.length) * 100);
  const isComplete = worldCompleted(progress, world);
  const locked = states.every((s) => s === 'locked');

  // detecta mudanças de estado desde a última visita (desbloqueio / domínio)
  const changes = world.lessons.map((l, i) => {
    const before = seenState.get(l.id);
    const now = states[i];
    if (!before) return '';
    if (before === 'locked' && now !== 'locked') return 'just-unlocked';
    if (before !== 'mastered' && now === 'mastered') return 'just-mastered';
    return '';
  });
  const anyUnlock = changes.includes('just-unlocked');
  useEffect(() => {
    if (anyUnlock) play('unlock');
    world.lessons.forEach((l, i) => seenState.set(l.id, states[i]));
  });

  // posição do mascote: na curva mais aberta, do lado livre da estrada
  const mascotRow = 2;
  const mascotSide = offsets[mascotRow] < 0 ? 'left' : 'right';

  return (
    <section className={`world ${locked ? 'is-locked' : ''}`} aria-labelledby={`${world.id}-title`} style={{ ['--world-delay' as string]: `${index * 80}ms` }}>
      <header className={`unit-header ${locked ? 'locked' : ''} ${isComplete ? 'complete' : ''}`}>
        <div className="unit-badge" aria-hidden="true">
          {isComplete ? <IconTrophy size={30} /> : <IconRoad size={30} />}
        </div>
        <div className="grow">
          <div className="kicker">Mundo {world.order} · {done}/{world.lessons.length} concluídas</div>
          <h1 id={`${world.id}-title`}>{world.title}</h1>
          <div className="sub">{world.subtitle}</div>
          <ModuleTags ids={worldReferenceModules(world)} />
        </div>
        <div className="unit-progress" role="progressbar" aria-label={`Progresso do mundo ${world.order}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <circle cx="22" cy="22" r="18" className="track" />
            <circle cx="22" cy="22" r="18" className="fill" style={{ strokeDasharray: `${(pct / 100) * 113.1} 113.1` }} />
          </svg>
          <span>{isComplete ? <span aria-label="Mundo concluído"><IconCheck size={20} /></span> : `${pct}%`}</span>
        </div>
      </header>

      <div className="path-wrap" style={{ height: world.lessons.length * ROW }}>
        <Road offsets={offsets} traveled={traveled} />
        <ol className="path">
          {world.lessons.map((l, i) => {
            const st = states[i];
            const current = rec?.lesson.id === l.id;
            const off = offsets[i];
            const best = progress.lessons[l.id]?.bestAccuracy;
            const labelSide = off > 0 ? 'left' : 'right';
            const kind = l.icon === 'review' || l.icon === 'trophy' ? 'special' : 'lesson';
            return (
              <li
                key={l.id}
                className={`path-node ${current ? 'has-tip' : ''} ${changes[i]}`}
                style={{ ['--off' as string]: off, top: i * ROW, animationDelay: `${i * 55}ms` }}
              >
                {current && <span className="node-tip" aria-hidden="true">{st === 'completed' ? 'Refazer' : 'Começar'}</span>}
                <button
                  className={`node-btn ${st} ${current ? 'current' : ''} kind-${kind}`}
                  disabled={st === 'locked'}
                  onClick={() => {
                    play('tap');
                    onStart(l);
                  }}
                  aria-label={`${l.title}, ${STATE_LABEL[st]}, módulo ${l.referenceModule}${best !== undefined ? `, melhor resultado ${Math.round(best * 100)}%` : ''}${current ? ', recomendada agora' : ''}`}
                >
                  <span className="node-face">
                    <NodeIcon lesson={l} state={st} />
                  </span>
                  {st === 'completed' && (
                    <span className="node-check" aria-hidden="true">
                      <IconCheck size={14} />
                    </span>
                  )}
                  {(changes[i] === 'just-unlocked' || changes[i] === 'just-mastered') && <Burst color={st === 'mastered' ? '#ffc83d' : '#22b357'} />}
                </button>
                <span className={`node-label side-${labelSide}`}>
                  <span className="t">{l.title}</span>
                  <span className="node-module" aria-hidden="true">Módulo {l.referenceModule}</span>
                </span>
              </li>
            );
          })}
        </ol>
        {!locked && (
          <div className={`path-mascot side-${mascotSide}`} style={{ top: mascotRow * ROW - 30, ['--off' as string]: offsets[mascotRow] }} aria-hidden="true">
            <Lumi mood={isComplete ? 'cheer' : currentIdx >= 0 ? 'wave' : 'idle'} size={78} />
          </div>
        )}
      </div>
    </section>
  );
}

export function Home({ onStart }: { onStart: (l: Lesson) => void }) {
  return (
    <div className="home">
      {WORLDS.map((w, i) => (
        <WorldPath key={w.id} world={w} index={i} prev={WORLDS[i - 1]} onStart={onStart} />
      ))}
      <div className="finish-line" aria-hidden="true">
        <span className="flag" />
      </div>
      {PLANNED_WORLDS.map((w) => (
        <section key={w.order} className="world planned" aria-label={`Mundo ${w.order}: ${w.title}, em construção`}>
          <header className="unit-header locked">
            <div className="unit-badge" aria-hidden="true">
              <IconLock size={26} />
            </div>
            <div className="grow">
              <div className="kicker">Mundo {w.order} · em construção</div>
              <h1 className="planned-title">{w.title}</h1>
              <ModuleTags ids={w.referenceModules} />
            </div>
          </header>
        </section>
      ))}
      <p className="soon">Os próximos mundos estão sendo escritos e conferidos com as fontes oficiais.</p>
      <aside className="disclaimer" aria-label="Sobre o CNH Quest">
        <p>
          O CNH Quest é um app de estudo independente. O curso teórico oficial e gratuito está no app CNH do Brasil.
        </p>
        <p>
          A divisão das lições pelos 4 módulos é uma organização própria do app, feita a partir dos temas do Banco
          Nacional de Questões. Não é uma classificação oficial.
        </p>
      </aside>
    </div>
  );
}

import { Suspense, useCallback, useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { VIDEOS, type VideoId } from '../content/videos';
import { useReducedMotion } from '../ui/hooks';

/**
 * Vídeo animado de um conceito (piloto de 15/11/2026, cartão c3-lado-direito).
 * Não é MP4: a cena 3D é desenhada no app (motor SVG de scenes/engine.tsx) e anda junto com a narração.
 * O áudio manda no tempo (audio.currentTime); se ele não tocar, um relógio assume.
 * A legenda da fala atual fica sempre embaixo do vídeo.
 */
type VideoComp = ComponentType<{ t: number; id?: string }>;

interface VideoDef {
  C: VideoComp;
  dur: number;
  falaEm: (t: number) => number;
}

interface VideoMod {
  Video: VideoComp;
  DUR: number;
  falaEm: (t: number) => number;
}
const paraDef = (m: VideoMod): VideoDef => ({ C: m.Video, dur: m.DUR, falaEm: m.falaEm });

const carregar: Record<VideoId, () => Promise<VideoDef>> = {
  faixas: () => import('./scenes/VideoFaixas').then(paraDef),
  acostamento: () => import('./scenes/VideoAcostamento').then(paraDef),
  ultrapassar: () => import('./scenes/VideoUltrapassar').then(paraDef),
  'nao-ultrapassar': () => import('./scenes/VideoNaoUltrapassar').then(paraDef),
};

const cache: Partial<Record<VideoId, VideoDef>> = {};

const FPS = 30;

export function videoSrc(id: VideoId): string {
  return `${import.meta.env.BASE_URL}audio/videos/${id}.mp3`;
}

type Estado = 'parado' | 'tocando' | 'pausado' | 'fim';

export function VideoConceito({ id, title }: { id: VideoId; title: string }) {
  const [def, setDef] = useState<VideoDef | null>(cache[id] ?? null);
  const [t, setT] = useState(0);
  const [estado, setEstado] = useState<Estado>('parado');
  const reduced = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const audio = useRef<HTMLAudioElement | null>(null);
  const relogio = useRef<{ base: number; t0: number } | null>(null);
  const tRef = useRef(0);

  useEffect(() => {
    let vivo = true;
    if (!cache[id]) {
      carregar[id]().then((d) => {
        cache[id] = d;
        if (vivo) setDef(d);
      });
    }
    return () => {
      vivo = false;
    };
  }, [id]);

  // para o som ao sair da tela
  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  const dur = def?.dur ?? 1;

  // laço de quadros: lê o tempo do áudio (ou do relógio, se o áudio falhou)
  useEffect(() => {
    if (estado !== 'tocando' || typeof requestAnimationFrame !== 'function') return;
    let raf = 0;
    let ultimo = -1;
    const passo = (agora: number) => {
      const a = audio.current;
      let tt: number;
      if (relogio.current) tt = relogio.current.base + (agora - relogio.current.t0) / 1000;
      else tt = a ? a.currentTime : tRef.current;
      tt = Math.min(dur, tt);
      tRef.current = tt;
      const quadro = Math.floor(tt * FPS);
      if (quadro !== ultimo) {
        ultimo = quadro;
        setT(tt);
      }
      if (tt >= dur || (a && a.ended && !relogio.current)) {
        setT(dur);
        setEstado('fim');
        return;
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [estado, dur]);

  // aba escondida: pausa
  useEffect(() => {
    const oculto = () => {
      if (document.hidden && estado === 'tocando') pausar();
    };
    document.addEventListener('visibilitychange', oculto);
    return () => document.removeEventListener('visibilitychange', oculto);
  });

  const usarRelogio = (de: number) => {
    relogio.current = { base: de, t0: performance.now() };
  };

  const tocar = useCallback(
    (de: number) => {
      if (!def) return;
      tRef.current = de;
      setT(de);
      relogio.current = null;
      let a = audio.current;
      if (!a && typeof Audio !== 'undefined') {
        a = new Audio(videoSrc(id));
        audio.current = a;
      }
      if (a) {
        try {
          a.currentTime = de;
        } catch {
          /* ainda sem metadados */
        }
        const p = a.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            // áudio bloqueado ou ausente: o vídeo segue mudo no relógio
            if (audio.current === a) usarRelogio(tRef.current);
          });
        } else usarRelogio(de);
      } else usarRelogio(de);
      setEstado('tocando');
    },
    [def, id],
  );

  function pausar() {
    audio.current?.pause();
    if (relogio.current) relogio.current = null;
    setEstado('pausado');
  }

  const fala = def ? VIDEOS[id].falas[def.falaEm(t)] : '';
  const pct = Math.round((t / dur) * 100);
  // movimento reduzido: a cena mostra o quadro do meio de cada fala (sem movimento contínuo)
  const tCena = reduced && def ? quadroFixo(t) : t;

  return (
    <figure className="anim-scene video-conceito">
      <div className="anim-scene-art video-tela" role="img" aria-label={title}>
        <Suspense fallback={<div className="anim-scene-wait" />}>
          {def ? <def.C t={tCena} id={`vc${uid}`} /> : <div className="anim-scene-wait" />}
        </Suspense>
        {estado !== 'tocando' && (
          <button
            type="button"
            className="video-play"
            onClick={() => tocar(estado === 'fim' ? 0 : tRef.current)}
            aria-label={estado === 'fim' ? 'Ver de novo' : estado === 'pausado' ? 'Continuar o vídeo' : 'Tocar o vídeo'}
            disabled={!def}
          >
            <span aria-hidden="true">{estado === 'fim' ? '↻' : '▶'}</span>
          </button>
        )}
        {estado === 'tocando' && <button type="button" className="video-toque" onClick={pausar} aria-label="Pausar o vídeo" />}
      </div>
      <div className="video-barra" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>
      <figcaption className="video-legenda" aria-live="polite">
        {estado === 'parado' ? 'Toque no ▶ para ver o vídeo com som.' : fala}
      </figcaption>
      {estado === 'fim' && (
        <button type="button" className="btn ghost video-denovo" onClick={() => tocar(0)}>
          Ver de novo
        </button>
      )}
    </figure>
  );

  function quadroFixo(tt: number): number {
    if (!def) return tt;
    const k = def.falaEm(tt);
    let ini = 0;
    let fim = def.dur;
    for (let s = 0; s <= def.dur; s += 0.25) {
      if (def.falaEm(s) === k) {
        if (ini === 0 && s > 0 && def.falaEm(s - 0.25) !== k) ini = s;
        fim = s;
      }
    }
    return k === 0 ? Math.min(2, fim) : ini + (fim - ini) * 0.75;
  }
}

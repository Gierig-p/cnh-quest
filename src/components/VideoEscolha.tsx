import { useEffect, useRef, useState, type ComponentType } from 'react';
import type { ChoiceQuestion } from '../content/types';
import { ESCOLHAS } from '../content/escolhas';
import { useReducedMotion } from '../ui/hooks';

/**
 * Situação em vídeo de escolha (Mundo 5, piloto da poça w5-rua-1; plano em docs/codex/respostas/10_situacoes_em_video.md).
 * 1) A introdução toca e para em "O que você faz?": só então as alternativas aparecem (sem tempo para responder).
 * 2) Marcar uma alternativa não mostra nada; o "Verificar" confirma e toca o final daquela alternativa (pelo ID).
 * 3) Quando o final termina, avisa `onFim` (o "Continuar" da lição só libera aí). "Ver de novo" não trava de novo.
 * Movimento reduzido, "Ver em quadros e texto" ou falha ao carregar a cena: quadros parados com texto, sem espera.
 * O áudio manda no tempo; se ele não tocar, um relógio assume (igual ao VideoConceito).
 */
interface Tempo {
  dur: number;
  falas: { ini: number; fim: number }[];
}
interface EscolhaMod {
  Cena: ComponentType<{ parte: never; t: number; id?: string }>;
  TEMPOS: Record<string, Tempo>;
  QUADRO: { intro: number; escolha: Record<string, number>; seguro: number };
}

const carregar: Record<string, () => Promise<EscolhaMod>> = {
  'w5-rua-1': () => import('./scenes/EscolhaPoca') as unknown as Promise<EscolhaMod>,
  'w5-rua-4': () => import('./scenes/EscolhaPontoCego') as unknown as Promise<EscolhaMod>,
  'w5-rua-2': () => import('./scenes/EscolhaDistancia') as unknown as Promise<EscolhaMod>,
  'w5-rua-3': () => import('./scenes/EscolhaSono') as unknown as Promise<EscolhaMod>,
  'w5-rua-5': () => import('./scenes/EscolhaNeblina') as unknown as Promise<EscolhaMod>,
};
const cache: Record<string, EscolhaMod> = {};

const FPS = 30;

export function escolhaSrc(questionId: string, parte: string): string {
  return `${import.meta.env.BASE_URL}audio/escolhas/${questionId}/${parte}.mp3`;
}

type Estado = 'parado' | 'tocando' | 'pausado' | 'fim';

interface Props {
  q: ChoiceQuestion;
  /** ID da alternativa confirmada no "Verificar" (null antes disso) */
  picked: string | null;
  /** a introdução chegou na pergunta: as alternativas podem aparecer */
  onPronto: () => void;
  /** o final da escolha terminou (uma vez só) */
  onFim: () => void;
}

export function VideoEscolha({ q, picked, onPronto, onFim }: Props) {
  const def = ESCOLHAS[q.id];
  const reduced = useReducedMotion();
  const [mod, setMod] = useState<EscolhaMod | null>(cache[q.id] ?? null);
  const [falhou, setFalhou] = useState(!carregar[q.id]);
  const [pediuQuadros, setPediuQuadros] = useState(false);
  const quadros = reduced || pediuQuadros || falhou;
  const [parte, setParte] = useState('intro');
  const [estado, setEstado] = useState<Estado>('parado');
  const [t, setT] = useState(0);
  const [lerSituacao, setLerSituacao] = useState(false);
  const [lerFinal, setLerFinal] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const relogio = useRef<{ base: number; t0: number } | null>(null);
  const tRef = useRef(0);
  const avisos = useRef({ onPronto, onFim });
  avisos.current = { onPronto, onFim };
  const feito = useRef({ pronto: false, fim: false });
  const avisaPronto = () => {
    if (feito.current.pronto) return;
    feito.current.pronto = true;
    avisos.current.onPronto();
  };
  const avisaFim = () => {
    if (feito.current.fim) return;
    feito.current.fim = true;
    avisos.current.onFim();
  };

  // carrega a cena (código separado, só quando a questão aparece)
  useEffect(() => {
    let vivo = true;
    const load = carregar[q.id];
    if (!cache[q.id] && load) {
      load()
        .then((m) => {
          cache[q.id] = m;
          if (vivo) setMod(m);
        })
        .catch(() => vivo && setFalhou(true));
    }
    return () => {
      vivo = false;
    };
  }, [q.id]);

  const pararAudio = () => {
    audio.current?.pause();
    audio.current = null;
    relogio.current = null;
  };

  // para o som ao sair da tela
  useEffect(() => pararAudio, []);

  // quadros e texto: nada de espera
  useEffect(() => {
    if (!quadros) return;
    pararAudio();
    setEstado('parado');
    avisaPronto();
    if (picked) avisaFim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quadros, picked]);

  // "Verificar": toca o final da alternativa escolhida
  useEffect(() => {
    if (!picked || quadros) return;
    if (!mod?.TEMPOS[picked]) {
      avisaFim();
      return;
    }
    tocar(picked, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  const dur = mod?.TEMPOS[parte]?.dur ?? 1;

  // laço de quadros: lê o tempo do áudio (ou do relógio, se o áudio falhou)
  useEffect(() => {
    if (estado !== 'tocando' || typeof requestAnimationFrame !== 'function') return;
    let raf = 0;
    let ultimo = -1;
    const passo = () => {
      const a = audio.current;
      let tt: number;
      // o relógio usa a mesma base de tempo em que foi ligado (performance.now)
      if (relogio.current) tt = relogio.current.base + (performance.now() - relogio.current.t0) / 1000;
      else tt = a ? a.currentTime : tRef.current;
      tt = Math.min(dur, tt);
      tRef.current = tt;
      const quadro = Math.floor(tt * FPS);
      if (quadro !== ultimo) {
        ultimo = quadro;
        setT(tt);
      }
      if (tt >= dur || (a && a.ended && !relogio.current)) {
        tRef.current = dur;
        setT(dur);
        setEstado('fim');
        if (parte === 'intro') avisaPronto();
        else avisaFim();
        return;
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, dur, parte]);

  // aba escondida: pausa (e oferece "Retomar o vídeo")
  useEffect(() => {
    const oculto = () => {
      if (document.hidden && estado === 'tocando') pausar();
    };
    document.addEventListener('visibilitychange', oculto);
    return () => document.removeEventListener('visibilitychange', oculto);
  });

  function usarRelogio(de: number) {
    relogio.current = { base: de, t0: performance.now() };
  }

  function tocar(p: string, de: number) {
    if (!mod) return;
    if (p !== parte) {
      pararAudio();
      setParte(p);
    }
    tRef.current = de;
    setT(de);
    relogio.current = null;
    let a = p === parte ? audio.current : null;
    if (!a && typeof Audio !== 'undefined') {
      a = new Audio(escolhaSrc(q.id, p));
      audio.current = a;
    }
    if (a) {
      try {
        a.currentTime = de;
      } catch {
        /* ainda sem metadados */
      }
      let p2: Promise<void> | undefined;
      try {
        p2 = a.play();
      } catch {
        p2 = undefined;
      }
      if (p2 && typeof p2.catch === 'function') {
        p2.catch(() => {
          // áudio bloqueado ou ausente: o vídeo segue mudo no relógio
          if (audio.current === a) usarRelogio(tRef.current);
        });
      } else usarRelogio(de);
    } else usarRelogio(de);
    setEstado('tocando');
  }

  function pausar() {
    audio.current?.pause();
    if (relogio.current) relogio.current = null;
    setEstado('pausado');
  }

  if (!def) return null;

  const tempo = mod?.TEMPOS[parte];
  const falas = parte === 'intro' ? def.intro : (def.ramos[parte] ?? []);
  let k = -1;
  if (tempo) tempo.falas.forEach((f, i) => t >= f.ini - 0.15 && (k = i));
  const legenda = estado === 'parado' && parte === 'intro' ? 'Toque no ▶ para ver a situação com som.' : (falas[k] ?? '');
  const pct = Math.round((t / dur) * 100);
  const errado = picked !== null && picked !== q.correct;
  const decidindo = parte === 'intro' && estado === 'fim' && !picked;
  const acabou = picked !== null && (quadros || (parte === picked && estado === 'fim'));
  const situacao = (q.situation ?? []).map((l) => (l.kind === 'som' ? `[${l.label}]` : l.text));
  const oQueAconteceu = picked ? [def.quadros.escolha[picked], errado ? def.quadros.seguro : ''].filter(Boolean) : [];
  const status = estado === 'pausado'
    ? 'Vídeo pausado.'
    : decidindo
      ? 'Escolha uma resposta abaixo e toque em Verificar.'
      : picked && !acabou
        ? 'Final em andamento. O botão Continuar libera no fim do vídeo.'
        : '';

  return (
    <section className="video-escolha" tabIndex={-1} aria-label="Vídeo da situação">
      {quadros ? (
        <div className="video-quadros">
          {!picked ? (
            <Quadro mod={mod} parte="intro" t={mod?.QUADRO.intro ?? 0} titulo="A situação" texto={def.quadros.intro} />
          ) : (
            <>
              <Quadro mod={mod} parte={picked} t={mod?.QUADRO.escolha[picked] ?? 0} titulo="Sua escolha" texto={def.quadros.escolha[picked] ?? ''} />
              {errado && <Quadro mod={mod} parte={q.correct} t={mod?.QUADRO.seguro ?? 0} titulo="Jeito seguro" texto={def.quadros.seguro} />}
            </>
          )}
        </div>
      ) : (
        <figure className="anim-scene video-conceito">
          <div className="anim-scene-art video-tela" role="img" aria-label={q.visual?.alt ?? 'Situação de trânsito'}>
            {mod ? <mod.Cena parte={parte as never} t={t} id={`ve-${q.id}`} /> : <div className="anim-scene-wait" />}
            {estado === 'parado' && parte === 'intro' && (
              <button type="button" className="video-play" onClick={() => tocar('intro', 0)} aria-label="Tocar o vídeo" disabled={!mod}>
                <span aria-hidden="true">▶</span>
              </button>
            )}
            {estado === 'tocando' && <button type="button" className="video-toque" onClick={pausar} aria-label="Pausar o vídeo" />}
          </div>
          <div className="video-barra" aria-hidden="true">
            <span style={{ width: `${pct}%` }} />
          </div>
          <figcaption className="video-legenda" aria-live="polite">
            {!(estado === 'parado' && parte === 'intro') && <span className="video-som">[{def.som}]</span>}
            {parte !== 'intro' && k <= 0 && def.somRamo?.[parte] && <span className="video-som">[{def.somRamo[parte]}]</span>}
            {legenda}
          </figcaption>
        </figure>
      )}

      {status && <p className="video-status" role="status">{status}</p>}

      <div className="video-controles">
        {estado === 'pausado' && !quadros && (
          <button type="button" className="btn ghost" onClick={() => tocar(parte, tRef.current)}>
            Retomar o vídeo
          </button>
        )}
        {acabou && !quadros && (
          <button type="button" className="btn ghost" onClick={() => tocar(picked!, 0)}>
            Ver de novo
          </button>
        )}
        {!reduced && !falhou && (
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              if (pediuQuadros && picked) {
                // volta ao vídeo já no final escolhido (sem travar de novo)
                setPediuQuadros(false);
                setParte(picked);
                setEstado('fim');
                setT(mod?.TEMPOS[picked]?.dur ?? 0);
              } else if (pediuQuadros) {
                setPediuQuadros(false);
                setParte('intro');
                setT(0);
              } else setPediuQuadros(true);
            }}
          >
            {pediuQuadros ? 'Ver o vídeo' : 'Ver em quadros e texto'}
          </button>
        )}
        {situacao.length > 0 && (
          <button type="button" className="link-btn" aria-expanded={lerSituacao} onClick={() => setLerSituacao((v) => !v)}>
            Ler a situação
          </button>
        )}
        {picked && (
          <button type="button" className="link-btn" aria-expanded={lerFinal} onClick={() => setLerFinal((v) => !v)}>
            Ler o que aconteceu
          </button>
        )}
      </div>

      {lerSituacao && (
        <div className="video-texto">
          {situacao.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      )}
      {lerFinal && picked && (
        <div className="video-texto">
          {oQueAconteceu.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
      )}
      {acabou && (
        <p className="video-guardar">
          <strong>Para guardar:</strong> {q.mnemonic}
        </p>
      )}
    </section>
  );
}

function Quadro({ mod, parte, t, titulo, texto }: { mod: EscolhaMod | null; parte: string; t: number; titulo: string; texto: string }) {
  return (
    <figure className="video-quadro">
      {mod && (
        <div className="anim-scene-art" aria-hidden="true">
          <mod.Cena parte={parte as never} t={t} id={`vq-${parte}-${titulo.length}`} />
        </div>
      )}
      <figcaption>
        <strong>{titulo}</strong>
        <span>{texto}</span>
      </figcaption>
    </figure>
  );
}

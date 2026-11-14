import type { SituationLine } from '../content/types';
import { AudioButton, situationSrc } from './NarrationButton';

/**
 * Situação narrada das lições "Na rua": botão para ouvir (narração + sons) e o texto
 * sempre visível, com os sons entre colchetes, para quem não pode ou não quer ouvir.
 */
export function SituationBox({ questionId, lines }: { questionId: string; lines: SituationLine[] }) {
  return (
    <div className="situation" role="group" aria-label="Situação">
      <AudioButton
        src={situationSrc(questionId)}
        labels={{ idle: 'Ouvir a situação', pause: 'Pausar a situação' }}
        className="situation-btn"
      />
      <p className="situation-text">
        {lines.map((l, i) =>
          l.kind === 'som' ? (
            <span key={i} className="situation-sound">[{l.label}] </span>
          ) : (
            <span key={i}>{l.text} </span>
          ),
        )}
      </p>
    </div>
  );
}

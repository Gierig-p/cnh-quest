import { useState } from 'react';
import { IconBolt, IconFire, IconRoad, IconTarget } from '../components/Icons';
import { Lumi } from '../components/Lumi';
import { DAILY_GOALS } from '../engine/progress';
import { useApp } from '../state/AppState';
import { useSound } from '../ui/hooks';

const GOAL_ICONS = [IconRoad, IconBolt, IconTarget, IconFire];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { update } = useApp();
  const play = useSound();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(20);
  return (
    <div className="onboarding">
      <div className="onb-progress" aria-hidden="true">
        <span style={{ width: step === 0 ? '50%' : '100%' }} />
      </div>
      <div className="onb-inner" key={step}>
        {step === 0 ? (
          <>
            <div className="speaker">
              <Lumi mood="wave" size={150} />
              <div className="speech">
                <h1>Oi! Eu sou a Lumi.</h1>
                <p>Vou te ensinar a <strong>linguagem do trânsito</strong> em lições curtas, para você chegar confiante na prova teórica.</p>
              </div>
            </div>
            <p className="muted onb-note">O conteúdo segue o Código de Trânsito Brasileiro e as normas do CONTRAN e da SENATRAN. As questões são originais — não são as da prova oficial.</p>
            <button
              className="btn wide"
              autoFocus
              onClick={() => {
                play('tap');
                setStep(1);
              }}
            >
              Vamos lá
            </button>
          </>
        ) : (
          <>
            <div className="speaker compact">
              <Lumi mood="think" size={96} />
              <div className="speech">
                <h1>Quanto tempo por dia?</h1>
                <p>Você pode mudar depois, em Progresso.</p>
              </div>
            </div>
            <div className="goal-options" role="radiogroup" aria-label="Meta diária">
              {DAILY_GOALS.map((g, i) => {
                const Icon = GOAL_ICONS[i % GOAL_ICONS.length];
                return (
                  <button
                    key={g.xp}
                    type="button"
                    role="radio"
                    aria-checked={goal === g.xp}
                    className="opt goal-opt"
                    onClick={() => {
                      play('select');
                      setGoal(g.xp);
                    }}
                  >
                    <span className="goal-icon" aria-hidden="true"><Icon size={22} /></span>
                    <span className="grow">{g.minutes} min por dia</span>
                    <span className="muted">{g.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              className="btn wide"
              onClick={() => {
                play('unlock');
                update((p) => ({ ...p, dailyGoal: goal, onboarded: true }));
                onDone();
              }}
            >
              Começar a trilha
            </button>
          </>
        )}
      </div>
    </div>
  );
}
